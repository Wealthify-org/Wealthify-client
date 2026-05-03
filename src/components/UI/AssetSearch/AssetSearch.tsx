import { MouseEvent, useEffect, useRef, useState } from "react";
import classes from "./AssetSearch.module.css"
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { SearchAssetsHttpResponse, SearchItem, SearchMode, SearchModeStates } from "@/lib/types/search";
import { API, API_ENDPOINTS } from "@/lib/apiEndpoints";
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

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 250);

  const [items, setItems] = useState<SearchItem[]>([]);
  const [mode, setMode] = useState<SearchMode>("recent");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wrapperRef = useRef<HTMLDivElement | null>(null);

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

    if (!trimmed) {
      setMode(SearchModeStates.RECENT)
      void loadRecent();
      return;
    }

    setMode(SearchModeStates.SEARCH);
    void loadSearch(trimmed);
  }, [debouncedQuery, isOpen])

  const loadRecent = async () => {
    console.log("LOADED RECENT");
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(API_ENDPOINTS.GET_SEARCH_RECENT_ASSETS, {
        method: "GET",
        credentials: "include",
        headers: tokenStore.token
            ? { Authorization: `Bearer ${tokenStore.token}` }
            : {},
      });

      if (!res.ok) {
        throw new Error(`Failed to load recent: ${res.status}`);
      }

      const data = (await res.json()) as SearchAssetsHttpResponse;
      setItems(data.items);
    } catch (err) {
      console.error("[AssetsSearch] loadRecent error", err);
      setError("Failed to load recent searches");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  const loadSearch = async (q: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const url = API_ENDPOINTS.SEARCH_ASSETS(q, LIMIT);
      
      const res = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: tokenStore.token
            ? { Authorization: `Bearer ${tokenStore.token}` }
            : {},
      });

      if (!res.ok) {
        throw new Error(`Failed to search: ${res.status}`);
      }

      const data = (await res.json()) as SearchAssetsHttpResponse;
      setItems(data.items);
    } catch (err) {
      console.error("[AssetsSearch] loadSearch error", err);
      setError("Search failed");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = (value: string) => {
    // TODO: При сабмите переводить на страницу наиболее подходящего по поиску актива

    console.log(`search - ${value}`);
  }

  const handleFocus = () => {
    console.log("IS IN FOCUS");
    setIsOpen(true);
  };

  const handleSelect = (item: SearchItem) => {
    // setQuery(item.ticker);
    setIsOpen(false);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (tokenStore.token) {
      headers.Authorization = `Bearer ${tokenStore.token}`;
    }
    console.log(`ITEM ID - ${item.id}`)
    void fetch(API_ENDPOINTS.ADD_SEARCH_RECENT_ASSET, {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify({ assetId: item.id }),
    }).catch((err) => {
      console.error("[AssetsSearch] failed to add recent", err);
    })

    // TODO: Сделать навигацию на страницу с активом
  }

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

    // TODO: на бэке сделать так, чтобы апишка отдавала еще и айди запроса и тогда посылать запрос удаления конкретного поиска

    setItems((prev) => prev.filter((i) => i.id !== assetId));
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
        placeholder="Search stock, crypto or smart contract"
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
          <div className={classes.dropdownStatus}>Loading...</div>
        )}

        {isOpen && !loading && error && (
          <div className={classes.dropdownStatusError}>{error}</div>
        )}

        {isOpen && !loading && !error && items.length === 0 && (
          <div className={classes.dropdownStatus}>
            {debouncedQuery.trim()
              ? "No assets found"
              : "No recent searches yet"}
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
                  Searched asset
                </span>
                <span className={classes.tableHeaderPrice}>
                  Price/24h %
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
                        {item.currentPriceUsd && (
                          <span className={classes.itemPrice}>
                            ${item.currentPriceUsd.toFixed(2)}
                          </span>
                        )}
                        {item.change24HUsdPct && (
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
                  <span>Recent searches:</span>
                </div>

                <button
                  type="button"
                  className={classes.recentClear}
                  onClick={handleClearRecent}
                >
                  Clear
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
                          {item.currentPriceUsd && (
                            <span className={classes.itemPriceRecent}>
                              ${item.currentPriceUsd.toFixed(2)}
                            </span>
                          )}
                          {item.change24HUsdPct && (
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