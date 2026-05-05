"use client";

import { MouseEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import classes from "./AssetSearch.module.css"
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { SearchAssetsHttpResponse, SearchItem, SearchMode, SearchModeStates } from "@/lib/types/search";
import { API, API_ENDPOINTS } from "@/lib/apiEndpoints";
import { ROUTES } from "@/lib/routes";
import { SearchBar } from "./SearchBar/SearchBar";
import { SvgButton } from "../SvgButton/SvgButton";
import { clockPath } from "../SvgButton/Paths/clockPaths";
import { observer } from "mobx-react-lite";
import { useTokenStore } from "@/stores/tokenStore/TokenProvider";
import { starFilledPath, starOutlinedPath } from "../SvgButton/Paths/starPaths";
import { crossPath } from "../SvgButton/Paths/crossPaths";
import { useFavoritesStore } from "@/stores/favoritesStore/FavoritesProvider";

const LIMIT = 8;

export const AssetsSearch = observer(() => {
  const tokenStore = useTokenStore()
  const favoritesStore = useFavoritesStore();
  const router = useRouter();
  const t = useTranslations("search");

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 250);

  const [items, setItems] = useState<SearchItem[]>([]);
  const [mode, setMode] = useState<SearchMode>("recent");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  // AbortController для in-flight fetch — без него пользователь, быстро
  // печатающий "a"→"ab"→"abc", иногда видел результат для "a", т.к.
  // ответы могли приходить не в порядке отправки.
  const fetchCtrlRef = useRef<AbortController | null>(null);

  // закрытие по клике вне
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current) {
        return;
      }
      if (wrapperRef.current.contains(event.target as Node)) {
        return;
      }

      setIsOpen(false);
    }

    window.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
    }
  }, [])

  // загрузка недавних поисков
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const trimmed = debouncedQuery.trim();

    // отменяем прошлый in-flight запрос — его ответ теперь нерелевантен
    fetchCtrlRef.current?.abort();
    const controller = new AbortController();
    fetchCtrlRef.current = controller;

    if (!trimmed) {
      setMode(SearchModeStates.RECENT)
      void loadRecent(controller.signal);
      return;
    }

    setMode(SearchModeStates.SEARCH);
    void loadSearch(trimmed, controller.signal);

    return () => {
      controller.abort();
    };
  }, [debouncedQuery, isOpen])

  const loadRecent = async (signal: AbortSignal) => {
    // Локальный helper: 401 → refresh → retry один раз. Раньше при
    // протухшем access-токене юзер видел ошибку «Failed to load recent
    // 401», хотя refresh-cookie ещё валидный. Теперь — тихо обновляем
    // токен и повторяем запрос.
    const doFetch = async (): Promise<Response> =>
      fetch(API_ENDPOINTS.GET_SEARCH_RECENT_ASSETS, {
        method: "GET",
        credentials: "include",
        signal,
        headers: tokenStore.token
          ? { Authorization: `Bearer ${tokenStore.token}` }
          : {},
      });

    try {
      setLoading(true);
      setError(null);

      let res = await doFetch();

      if (res.status === 401) {
        const ok = await tokenStore.refresh();
        if (signal.aborted) return;
        if (ok) {
          res = await doFetch();
        }
      }

      // Не залогинен (или refresh не прошёл) — просто пустой список.
      // Recents — серверная штука, для гостя их нет, и это не ошибка.
      if (res.status === 401) {
        if (!signal.aborted) setItems([]);
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to load recent: ${res.status}`);
      }

      const data = (await res.json()) as SearchAssetsHttpResponse;
      if (signal.aborted) return;
      setItems(data.items ?? []);
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return;
      console.error("[AssetsSearch] loadRecent error", err);
      setError("Failed to load recent searches");
      setItems([]);
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }

  const loadSearch = async (q: string, signal: AbortSignal) => {
    // Сам search-эндпоинт публичный, но если бэкенд решит поменять
    // правило (или мидлваре подмешает ownership-check), ловим 401 и
    // делаем то же refresh+retry, что и в loadRecent.
    const url = API_ENDPOINTS.SEARCH_ASSETS(q, LIMIT);
    const doFetch = async (): Promise<Response> =>
      fetch(url, {
        method: "GET",
        credentials: "include",
        signal,
        headers: tokenStore.token
          ? { Authorization: `Bearer ${tokenStore.token}` }
          : {},
      });

    try {
      setLoading(true);
      setError(null);

      let res = await doFetch();

      if (res.status === 401) {
        const ok = await tokenStore.refresh();
        if (signal.aborted) return;
        if (ok) {
          res = await doFetch();
        }
      }

      if (!res.ok) {
        throw new Error(`Failed to search: ${res.status}`);
      }

      const data = (await res.json()) as SearchAssetsHttpResponse;
      if (signal.aborted) return;
      setItems(data.items ?? []);
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return;
      console.error("[AssetsSearch] loadSearch error", err);
      setError("Search failed");
      setItems([]);
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }

  const handleSubmit = (_value: string) => {
    // На сабмит — берём первый item из результата (он отсортирован по
    // релевантности на бэке) и переходим на страницу этого актива.
    const top = items[0];
    if (top) {
      navigateToAsset(top);
      return;
    }
    // Результатов нет: гарантируем что dropdown открыт — там уже есть
    // сообщение "noResults"/"noRecent". Без этого юзер мог нажать
    // Enter с закрытым dropdown'ом и видеть полное молчание UI.
    setIsOpen(true);
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  const navigateToAsset = (item: SearchItem) => {
    setIsOpen(false);
    setQuery("");

    // Сохраняем в "недавние", не блокируя навигацию
    if (tokenStore.token) {
      void fetch(API_ENDPOINTS.ADD_SEARCH_RECENT_ASSET, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenStore.token}`,
        },
        body: JSON.stringify({ assetId: item.id }),
      }).catch((err) => {
        console.error("[AssetsSearch] failed to add recent", err);
      });
    }

    router.push(ROUTES.ASSET(item.ticker));
  };

  const handleSelect = (item: SearchItem) => {
    navigateToAsset(item);
  };

  const handleClearRecent = async () => {
    try {
      await fetch(API_ENDPOINTS.DELETE_ALL_RECENT_SEARCHES, {
        method: "DELETE",
        credentials: "include",
        headers: tokenStore.token
          ? { Authorization: `Bearer ${tokenStore.token}` }
          : {},
      });
      setItems([]);
    } catch (err) {
      console.error("[AssetsSearch] clear recent error", err);
    }
  };

  const handleRemoveRecent = async (
    e: MouseEvent<HTMLButtonElement>,
    assetId: number,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic-update: убираем сразу из UI, в фоне делаем DELETE.
    // Раньше backend-зов вообще не делался → запись возвращалась
    // при следующем открытии dropdown (cм. handleClearRecent).
    const prevItems = items;
    setItems((prev) => prev.filter((i) => i.id !== assetId));

    // Если пользователь не авторизован — нечего удалять, локального
    // удаления достаточно (recents живут серверно для залогиненных).
    if (!tokenStore.token) return;

    try {
      const res = await fetch(
        API_ENDPOINTS.DELETE_RECENT_SEARCH_BY_ID(assetId),
        {
          method: "DELETE",
          credentials: "include",
          headers: { Authorization: `Bearer ${tokenStore.token}` },
        },
      );
      if (!res.ok && res.status !== 404) {
        throw new Error(`DELETE recent failed: ${res.status}`);
      }
    } catch (err) {
      console.error("[AssetsSearch] remove recent error", err);
      // Откат UI — раз backend не подтвердил удаление, пусть пользователь
      // увидит запись как была. Лучше «не удалось» чем подделка.
      setItems(prevItems);
    }
  }

  const handleToggleFavorite = (e: MouseEvent, assetId: number) => {
    e.preventDefault();
    e.stopPropagation();

    void favoritesStore.toggle(assetId).catch((err) => {
      console.error("[AssetsSearch] toggle favorite error", err);
    });
    // TODO: реализовать логику добавления актива в избранные
  }

  const isSearchMode = mode === SearchModeStates.SEARCH;

  return (
    <div className={classes.wrapper} ref={wrapperRef}>
      <SearchBar
        value={query}
        onChange={setQuery}
        onSubmit={handleSubmit}
        placeholder={t("placeholder")}
        onFocus={handleFocus}
        isSearchResultsOpen={isOpen}
      />

      <div
        className={`${classes.dropdown} ${isOpen ? classes.dropdownVisible : ""}`}
        role="listbox"
        aria-label={
          debouncedQuery.trim()
            ? "Search results"
            : "Recent asset searches"
        }
      >
        {isOpen && loading && (
          <div className={classes.dropdownStatus}>{t("loading")}</div>
        )}

        {isOpen && !loading && error && (
          <div className={classes.dropdownStatusError}>{error}</div>
        )}

        {isOpen && !loading && !error && items.length === 0 && (
          <div className={classes.dropdownStatus}>
            {debouncedQuery.trim()
              ? t("noResults")
              : t("noRecent")}
          </div>
        )}

        {isOpen &&
          !loading &&
          !error &&
          items.length > 0 &&
          (isSearchMode ? (
            <>
              <div className={classes.tableHeader}>
                <span className={classes.tableHeaderAsset}>
                  {t("headers.asset")}
                </span>
                <span className={classes.tableHeaderPrice}>
                  {t("headers.price")}
                </span>
              </div>

              <div className={classes.tableBody}>
                {items.map((item) => {
                  const isFav = favoritesStore.has(item.id);

                  return (
                    <div
                      key={item.id}
                      className={classes.tableRow}
                      onClick={() => handleSelect(item)}
                    >
                      <div className={classes.rowLeft}>
                        <SvgButton
                          buttonClassNames={[
                            classes.favoritesButtonRecent,
                            isFav ? classes.favActive : "",
                          ].join(" ")}
                          viewBox="0 0 110 110"
                          svgClassNames={classes.favoritesImage}
                          outlinedPath={starOutlinedPath}
                          outlinedClassNames={classes.starOutlined}
                          filledPath={starFilledPath}
                          filledClassNames={classes.starFilled}
                          onClick={(e) => handleToggleFavorite(e, item.id)}
                        />
                        {item.logoUrlLocal && (
                          <img 
                            src={`${API}${item.logoUrlLocal}`}
                            height={40}
                            alt={`${item.name} logo`}
                            className={classes.assetIcon}
                          />
                        )}

                        <div className={classes.assetText}>
                          <div className={classes.assetNameRow}>
                            <span className={classes.assetName}>
                              {item.name}
                            </span>
                            <span className={classes.assetRank}>
                              {item.rank}
                            </span>
                          </div>
                          <span className={classes.itemTicker}>
                            {item.ticker}
                          </span>
                        </div>
                      </div>

                      <div className={classes.rowRight}>
                        {item.currentPriceUsd != null && (
                          <span className={classes.itemPrice}>
                            ${item.currentPriceUsd.toFixed(2)}
                          </span>
                        )}
                        {item.change24HUsdPct != null && (
                          <span 
                            className={[
                              classes.itemChange, 
                              item.change24HUsdPct >= 0
                              ? classes.positive
                              : classes.negative
                            ].join(" ")}
                          >
                            {item.change24HUsdPct >= 0 ? "+" : ""}
                            {item.change24HUsdPct.toFixed(2)}%
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              {/* недавние поиски */}
              <div className={classes.recentHeader}>
                <div className={classes.recentHeaderLeft}>
                  <SvgButton
                    buttonClassNames={classes.clock}
                    viewBox="0 0 105 105"
                    svgClassNames={classes.clockImage}
                    filledPath={clockPath}
                    filledClassNames={classes.clockFilled}
                  />
                  <span>{t("recentTitle")}</span>
                </div>

                <button
                  type="button"
                  className={classes.recentClear}
                  onClick={handleClearRecent}
                >
                  {t("clearRecent")}
                </button>
              </div>

              <div className={classes.recentCardsContainer}>
                {items.map((item) => {
                  const isFav = favoritesStore.has(item.id);
                  return (
                    <div
                      key={item.id}
                      className={classes.recentCard}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelect(item)}
                    >
                      <div className={classes.rowLeftRecent}>
                        {item.logoUrlLocal && (
                          <img 
                            src={`${API}${item.logoUrlLocal}`}
                            height={32}
                            alt={`${item.name} logo`}
                            className={classes.assetIcon}
                          />
                        )}

                        <div className={classes.assetTextRecent}>
                          <span className={classes.itemNameRecent}>
                            {item.name}
                          </span>
                          <span className={classes.itemTickerRecent}>
                            {item.ticker}
                          </span>
                        </div>
                      </div>
                      <div className={classes.rowRightRecent}>
                        <div className={classes.recentControlButtonsContainer}>
                          <SvgButton
                            buttonClassNames={[
                              classes.favoritesButtonRecent,
                              isFav ? classes.favActive : "",
                            ].join(" ")}
                            viewBox="0 0 110 110"
                            svgClassNames={classes.favoritesImage}
                            outlinedPath={starOutlinedPath}
                            outlinedClassNames={classes.starOutlined}
                            filledPath={starFilledPath}
                            filledClassNames={classes.starFilled}
                            onClick={(e) => handleToggleFavorite(e, item.id)}
                          />
                          <SvgButton
                            buttonClassNames={classes.recentRemove}
                            viewBox="0 0 20 20"
                            svgClassNames={classes.crossIcon}
                            filledPath={crossPath}
                            filledClassNames={classes.crossFilled}
                            onClick={(e) => handleRemoveRecent(e as unknown as React.MouseEvent<HTMLButtonElement>, item.id)}
                          />
                        </div>
                        <div className={classes.assetInfoRecent}>
                          {item.currentPriceUsd != null && (
                            <span className={classes.itemPriceRecent}>
                              ${item.currentPriceUsd.toFixed(2)}
                            </span>
                          )}
                          {item.change24HUsdPct != null && (
                            <span
                              className={[
                                classes.itemChangeRecent,
                                item.change24HUsdPct >= 0
                                  ? classes.positive
                                  : classes.negative,
                              ].join(" ")}
                            >
                              {item.change24HUsdPct >= 0 ? "+" : ""}
                              {item.change24HUsdPct.toFixed(2)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ))
        }
      </div>
    </div>
  )
})