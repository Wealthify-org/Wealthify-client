"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { observer } from "mobx-react-lite";

import type { TableAsset } from "@/lib/types/table-asset";
import type { ListAssetsResponse } from "@/lib/types/api-assets";
import { mapApiAssetToTableAsset } from "@/lib/assets-to-table-mapper";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";

import { Asset } from "../Asset/Asset";
import { AssetSkeletonRow, SKELETON_ROWS } from "../Asset/AssetSkeletonRow";

import tableClasses from "../Assets.module.css";
import classes from "./FavoritesAssets.module.css";

import { useFavoritesStore } from "@/stores/favoritesStore/FavoritesProvider";

type SortKey =
  | "index"
  | "name"
  | "price"
  | "change1h"
  | "change24h"
  | "change7d"
  | "change30d"
  | "change1y"
  | "marketCap"
  | "fdv"
  | "volume24h";

type SortDirection = "asc" | "desc";

type SortState = {
  key: SortKey;
  direction: SortDirection;
};

const PAGE_SIZE = 100;

async function fetchAssetsPage(offset: number, limit: number): Promise<ListAssetsResponse> {
  const searchParams = new URLSearchParams();
  searchParams.set("limit", String(limit));
  searchParams.set("offset", String(offset));

  const url = `${API_ENDPOINTS.GET_ASSETS_DATA}?${searchParams.toString()}`;

  const res = await fetch(url, { method: "GET", cache: "no-store" });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Failed to fetch assets: ${res.status} ${res.statusText}. Body: ${body}`);
  }

  return (await res.json()) as ListAssetsResponse;
}

export const FavoritesAssets = observer(() => {
  const favoritesStore = useFavoritesStore();

  // храним только “найденные” избранные активы
  const [favoriteAssets, setFavoriteAssets] = useState<TableAsset[]>([]);
  const [sortState, setSortState] = useState<SortState>({ key: "index", direction: "asc" });

  const [offset, setOffset] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const foundIdsRef = useRef<Set<number>>(new Set());
  const totalRef = useRef<number>(Infinity);

  const favCount = favoritesStore.count; // mobx set size

  // ----- сортировка -----
  const sortedAssets = useMemo(() => {
    const copy = [...favoriteAssets];

    copy.sort((a, b) => {
      const { key, direction } = sortState;
      const aVal = a[key] as unknown;
      const bVal = b[key] as unknown;

      if (typeof aVal === "string" && typeof bVal === "string") {
        const res = aVal.localeCompare(bVal);
        return direction === "asc" ? res : -res;
      }

      const numA = Number(aVal ?? 0);
      const numB = Number(bVal ?? 0);

      if (numA === numB) return 0;
      return direction === "asc" ? numA - numB : numB - numA;
    });

    return copy;
  }, [favoriteAssets, sortState]);

  const handleSort = (key: SortKey) => {
    setSortState((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "desc" };
    });
  };

  const renderSortArrow = (key: SortKey) => {
    if (sortState.key !== key) return null;
    return <span className={tableClasses.sortIcon}>{sortState.direction === "asc" ? "↑" : "↓"}</span>;
  };

  const ariaSort = (key: SortKey): "ascending" | "descending" | "none" => {
    if (sortState.key !== key) return "none";
    return sortState.direction === "asc" ? "ascending" : "descending";
  };

  // ----- начальная загрузка (сканируем страницы и вытаскиваем только избранное) -----
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      // пока ids не готовы/пустые — не грузим
      if (!favoritesStore.isReady) return;

      if (favCount === 0) {
        setFavoriteAssets([]);
        setOffset(0);
        setHasMore(false);
        setIsInitialLoading(false);
        return;
      }

      // reset
      foundIdsRef.current = new Set();
      totalRef.current = Infinity;
      setFavoriteAssets([]);
      setOffset(0);
      setHasMore(true);
      setIsInitialLoading(true);

      try {
        const data = await fetchAssetsPage(0, PAGE_SIZE);
        if (cancelled) return;

        totalRef.current = data.total;

        const mapped = data.items.map(mapApiAssetToTableAsset);

        // предполагается, что TableAsset содержит id (assetId)
        const onlyFavs = mapped.filter((a) => favoritesStore.has(a.assetId));

        for (const a of onlyFavs) foundIdsRef.current.add(a.assetId);

        setFavoriteAssets(onlyFavs);
        setOffset(mapped.length);

        const foundAll = foundIdsRef.current.size >= favCount;
        const noMorePages = mapped.length < PAGE_SIZE || mapped.length >= data.total;

        setHasMore(!foundAll && !noMorePages);
      } catch (e) {
        console.error(e);
        if (!cancelled) setHasMore(false);
      } finally {
        if (!cancelled) setIsInitialLoading(false);
      }
    };

    void init();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favoritesStore.isReady, favCount]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || isInitialLoading) return;

    // если внезапно избранное стало пустым — стоп
    if (favCount === 0) {
      setHasMore(false);
      return;
    }

    try {
      setIsLoadingMore(true);

      const data = await fetchAssetsPage(offset, PAGE_SIZE);
      totalRef.current = data.total;

      const mapped = data.items.map(mapApiAssetToTableAsset);
      const onlyFavs = mapped.filter((a) => favoritesStore.has(a.assetId));

      setFavoriteAssets((prev) => {
        const byId = new Map<number, TableAsset>();
        for (const a of prev) byId.set(a.assetId, a);
        for (const a of onlyFavs) byId.set(a.assetId, a);
        return Array.from(byId.values());
      });

      for (const a of onlyFavs) foundIdsRef.current.add(a.assetId);

      const newOffset = offset + mapped.length;
      setOffset(newOffset);

      const foundAll = foundIdsRef.current.size >= favCount;
      const noMorePages = mapped.length < PAGE_SIZE || newOffset >= data.total;

      setHasMore(!foundAll && !noMorePages);
    } catch (e) {
      console.error(e);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [offset, isLoadingMore, hasMore, isInitialLoading, favCount, favoritesStore]);

  useEffect(() => {
    if (!hasMore) return;

    const target = loadMoreRef.current;
    if (!target) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { root: null, rootMargin: "200px", threshold: 0.1 },
    );

    io.observe(target);

    return () => {
      io.disconnect();
    };
  }, [hasMore, loadMore]);

  const showEmpty = favoritesStore.isReady && favCount === 0;

  return (
    <section className={`${classes.favoritesSection}`} data-assets-scroll-container="1">
      {showEmpty ? (
        <div className={classes.emptyState}>
          <span className={tableClasses.loadMoreLabel}>No favorite assets yet</span>
        </div>
      ) : (
        <>
          <table className={tableClasses.table} data-assets-table="true">
            <thead className={tableClasses.thead}>
              <tr className={tableClasses.trHead}>
                <th
                  className={`${tableClasses.th} ${tableClasses.thIndex}`}
                  onClick={() => handleSort("index")}
                  data-col="index"
                  role="button"
                  aria-sort={ariaSort("index")}
                >
                  <span className={tableClasses.sortLabel}>
                    # {renderSortArrow("index")}
                  </span>
                </th>

                <th
                  className={`${tableClasses.th} ${tableClasses.thName}`}
                  onClick={() => handleSort("name")}
                  data-col="name"
                  role="button"
                  aria-sort={ariaSort("name")}
                >
                  <span className={tableClasses.sortLabel}>
                    Name {renderSortArrow("name")}
                  </span>
                </th>

                <th
                  className={`${tableClasses.th} ${tableClasses.thPrice}`}
                  onClick={() => handleSort("price")}
                  role="button"
                  aria-sort={ariaSort("price")}
                >
                  <span className={tableClasses.sortLabel}>
                    Price {renderSortArrow("price")}
                  </span>
                </th>

                <th className={`${tableClasses.th} ${tableClasses.thPct}`} onClick={() => handleSort("change1h")} role="button" aria-sort={ariaSort("change1h")}>
                  <span className={tableClasses.sortLabel}>1h % {renderSortArrow("change1h")}</span>
                </th>

                <th className={`${tableClasses.th} ${tableClasses.thPct}`} onClick={() => handleSort("change24h")} role="button" aria-sort={ariaSort("change24h")}>
                  <span className={tableClasses.sortLabel}>24h % {renderSortArrow("change24h")}</span>
                </th>

                <th className={`${tableClasses.th} ${tableClasses.thPct}`} onClick={() => handleSort("change7d")} role="button" aria-sort={ariaSort("change7d")}>
                  <span className={tableClasses.sortLabel}>7d % {renderSortArrow("change7d")}</span>
                </th>

                <th className={`${tableClasses.th} ${tableClasses.thPct}`} onClick={() => handleSort("change30d")} role="button" aria-sort={ariaSort("change30d")}>
                  <span className={tableClasses.sortLabel}>30d % {renderSortArrow("change30d")}</span>
                </th>

                <th className={`${tableClasses.th} ${tableClasses.thPct}`} onClick={() => handleSort("change1y")} role="button" aria-sort={ariaSort("change1y")}>
                  <span className={tableClasses.sortLabel}>1y % {renderSortArrow("change1y")}</span>
                </th>

                <th className={`${tableClasses.th} ${tableClasses.thMCap}`} onClick={() => handleSort("marketCap")} role="button" aria-sort={ariaSort("marketCap")}>
                  <span className={tableClasses.sortLabel}>Market Cap {renderSortArrow("marketCap")}</span>
                </th>

                <th className={`${tableClasses.th} ${tableClasses.thFDV}`} onClick={() => handleSort("fdv")} role="button" aria-sort={ariaSort("fdv")}>
                  <span className={tableClasses.sortLabel}>F.D.V. {renderSortArrow("fdv")}</span>
                </th>

                <th className={`${tableClasses.th} ${tableClasses.thVolume}`} onClick={() => handleSort("volume24h")} role="button" aria-sort={ariaSort("volume24h")}>
                  <span className={tableClasses.sortLabel}>24h Volume {renderSortArrow("volume24h")}</span>
                </th>

                <th className={`${tableClasses.th} ${tableClasses.chartTh}`}>7d Chart</th>
              </tr>
            </thead>

            <tbody>
              {isInitialLoading && favoriteAssets.length === 0 ? (
                Array.from({ length: SKELETON_ROWS }, (_, i) => <AssetSkeletonRow key={i} />)
              ) : (
                sortedAssets
                  // на всякий случай: если в фоне id удалили из избранного, строка пропадёт
                  .filter((a) => favoritesStore.has(a.assetId))
                  .map((asset) => (
                    <Asset key={`${asset.ticker}-${asset.index}`} {...asset} />
                  ))
              )}
            </tbody>
          </table>
        </>
      )}

      <div ref={loadMoreRef} className={tableClasses.loadMoreSentinel}>
        {isInitialLoading && favoriteAssets.length === 0 && (
          <span className={tableClasses.loadMoreLabel}>Loading…</span>
        )}
        {!isInitialLoading && isLoadingMore && hasMore && (
          <span className={tableClasses.loadMoreLabel}>Loading more…</span>
        )}
        {!hasMore && !isInitialLoading && favoriteAssets.length > 0 && (
          <span className={tableClasses.loadMoreLabel}>No more assets</span>
        )}
      </div>
    </section>
  );
});
