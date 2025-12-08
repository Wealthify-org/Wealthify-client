"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Asset } from "./Asset/Asset"
import classes from "./Assets.module.css"
import type { TableAsset } from "@/lib/types/table-asset"
import type { ListAssetsResponse } from "@/lib/types/api-assets"
import { mapApiAssetToTableAsset } from "@/lib/assets-to-table-mapper"
import { API_ENDPOINTS } from "@/lib/apiEndpoints"
import { AssetSkeletonRow, SKELETON_ROWS } from "./Asset/AssetSkeletonRow"

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
  | "volume24h"

type SortDirection = "asc" | "desc"

type SortState = {
  key: SortKey
  direction: SortDirection
}

const PAGE_SIZE = 100

// хелпер для запроса страницы активов
async function fetchAssetsPage(offset: number, limit: number): Promise<ListAssetsResponse> {
  const searchParams = new URLSearchParams()
  searchParams.set("limit", String(limit))
  searchParams.set("offset", String(offset))

  const url = `${API_ENDPOINTS.GET_ASSETS_DATA}?${searchParams.toString()}`

  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch assets: ${res.status} ${res.statusText}`)
  }

  return (await res.json()) as ListAssetsResponse
}

export const Assets = () => {
  // все загруженные активы
  const [allAssets, setAllAssets] = useState<TableAsset[]>([])
  const [sortState, setSortState] = useState<SortState>({
    key: "index",
    direction: "asc",
  })

  const [offset, setOffset] = useState(0)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  // ----- сортировка -----
  const sortedAssets = useMemo(() => {
    const copy = [...allAssets]

    copy.sort((a, b) => {
      const { key, direction } = sortState
      const aVal = a[key] as unknown
      const bVal = b[key] as unknown

      if (typeof aVal === "string" && typeof bVal === "string") {
        const res = aVal.localeCompare(bVal)
        return direction === "asc" ? res : -res
      }

      const numA = Number(aVal ?? 0)
      const numB = Number(bVal ?? 0)

      if (numA === numB) return 0
      return direction === "asc" ? numA - numB : numB - numA
    })

    return copy
  }, [allAssets, sortState])

  const handleSort = (key: SortKey) => {
    setSortState((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        }
      }
      return { key, direction: "desc" }
    })
  }

  const renderSortArrow = (key: SortKey) => {
    if (sortState.key !== key) return null

    return (
      <span className={classes.sortIcon}>
        {sortState.direction === "asc" ? "↑" : "↓"}
      </span>
    )
  }

  const ariaSort = (key: SortKey): "ascending" | "descending" | "none" => {
    if (sortState.key !== key) return "none"
    return sortState.direction === "asc" ? "ascending" : "descending"
  }

  // ----- начальная загрузка -----
  useEffect(() => {
    let cancelled = false

    const loadInitial = async () => {
      await new Promise((r) => setTimeout(r, 5000));
      console.log("initial-load", "after artificial delay");
      try {
        const data = await fetchAssetsPage(0, PAGE_SIZE)
      
        if (cancelled) {
          return;
        }

        const mapped = data.items.map(mapApiAssetToTableAsset)

        setAllAssets(mapped)
        setOffset(mapped.length)

        if (mapped.length < PAGE_SIZE || mapped.length >= data.total) {
          setHasMore(false)
        }
      } catch (error) {
        console.error(error)
        if (!cancelled) {
          setHasMore(false)
        }
      } finally {
        if (!cancelled) {
          setIsInitialLoading(false)
        }
      }
    }

    void loadInitial()
    return () => {
      cancelled = true
    }
  }, [])

  
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || isInitialLoading) return

    try {
      setIsLoadingMore(true)

      const data = await fetchAssetsPage(offset, PAGE_SIZE)
      const mapped = data.items.map(mapApiAssetToTableAsset)

      // на всякий случай дедуп по тикеру (если бэк вернёт дубли)
      setAllAssets((prev) => {
        const byTicker = new Map<string, TableAsset>()
        for (const a of prev) byTicker.set(a.ticker, a)
        for (const a of mapped) byTicker.set(a.ticker, a)
        return Array.from(byTicker.values())
      })

      const newOffset = offset + mapped.length
      setOffset(newOffset)

      if (mapped.length < PAGE_SIZE || newOffset >= data.total) {
        setHasMore(false)
      }
    } catch (error) {
      console.error(error)
      setHasMore(false)
    } finally {
      setIsLoadingMore(false)
    }
  }, [offset, isLoadingMore, hasMore])

  useEffect(() => {
    if (!hasMore) return

    const target = loadMoreRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting) {
          void loadMore()
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0.1,
      },
    )

    observer.observe(target)

    return () => {
      observer.disconnect()
    }
  }, [hasMore, loadMore])

  return (
    <section
      className={classes.assetsSection}
      data-assets-scroll-container="1"
    >
      <table className={classes.table} data-assets-table="true">
        <thead className={classes.thead}>
          <tr className={classes.trHead}>
            <th
              className={`${classes.th} ${classes.thIndex}`}
              onClick={() => handleSort("index")}
              data-col="index"
              role="button"
              aria-sort={ariaSort("index")}
            >
              <span className={classes.sortLabel}>
                #
                {renderSortArrow("index")}
              </span>
            </th>

            <th
              className={`${classes.th} ${classes.thName}`}
              onClick={() => handleSort("name")}
              data-col="name"
              role="button"
              aria-sort={ariaSort("name")}
            >
              <span className={classes.sortLabel}>
                Name
                {renderSortArrow("name")}
              </span>
            </th>

            <th
              className={`${classes.th} ${classes.thPrice}`}
              onClick={() => handleSort("price")}
              role="button"
              aria-sort={ariaSort("price")}
            >
              <span className={classes.sortLabel}>
                Price
                {renderSortArrow("price")}
              </span>
            </th>

            <th
              className={`${classes.th} ${classes.thPct}`}
              onClick={() => handleSort("change1h")}
              role="button"
              aria-sort={ariaSort("change1h")}
            >
              <span className={classes.sortLabel}>
                1h %
                {renderSortArrow("change1h")}
              </span>
            </th>

            <th
              className={`${classes.th} ${classes.thPct}`}
              onClick={() => handleSort("change24h")}
              role="button"
              aria-sort={ariaSort("change24h")}
            >
              <span className={classes.sortLabel}>
                24h %
                {renderSortArrow("change24h")}
              </span>
            </th>

            <th
              className={`${classes.th} ${classes.thPct}`}
              onClick={() => handleSort("change7d")}
              role="button"
              aria-sort={ariaSort("change7d")}
            >
              <span className={classes.sortLabel}>
                7d %
                {renderSortArrow("change7d")}
              </span>
            </th>

            <th
              className={`${classes.th} ${classes.thPct}`}
              onClick={() => handleSort("change30d")}
              role="button"
              aria-sort={ariaSort("change30d")}
            >
              <span className={classes.sortLabel}>
                30d %
                {renderSortArrow("change30d")}
              </span>
            </th>

            <th
              className={`${classes.th} ${classes.thPct}`}
              onClick={() => handleSort("change1y")}
              role="button"
              aria-sort={ariaSort("change1y")}
            >
              <span className={classes.sortLabel}>
                1y %
                {renderSortArrow("change1y")}
              </span>
            </th>

            <th
              className={`${classes.th} ${classes.thMCap}`}
              onClick={() => handleSort("marketCap")}
              role="button"
              aria-sort={ariaSort("marketCap")}
            >
              <span className={classes.sortLabel}>
                Market Cap
                {renderSortArrow("marketCap")}
              </span>
            </th>

            <th
              className={`${classes.th} ${classes.thFDV}`}
              onClick={() => handleSort("fdv")}
              role="button"
              aria-sort={ariaSort("fdv")}
            >
              <span className={classes.sortLabel}>
                F.D.V.
                {renderSortArrow("fdv")}
              </span>
            </th>

            <th
              className={`${classes.th} ${classes.thVolume}`}
              onClick={() => handleSort("volume24h")}
              role="button"
              aria-sort={ariaSort("volume24h")}
            >
              <span className={classes.sortLabel}>
                24h Volume
                {renderSortArrow("volume24h")}
              </span>
            </th>

            <th className={`${classes.th} ${classes.chartTh}`}>
              7d Chart
            </th>
          </tr>
        </thead>

        <tbody>
          {isInitialLoading && allAssets.length === 0 ? (
            // показываем n скелетон-строк
            Array.from({ length: SKELETON_ROWS }, (_, i) => (
              <AssetSkeletonRow key={i} />
            ))
          ) : (
            sortedAssets.map((asset) => (
              <Asset
                key={`${asset.ticker}-${asset.index}`}
                {...asset}
              />
            ))
          )}
        </tbody>
      </table>

      <div ref={loadMoreRef} className={classes.loadMoreSentinel}>
        {isInitialLoading && allAssets.length === 0 && (
          <span className={classes.loadMoreLabel}>Loading…</span>
        )}
        {!isInitialLoading && isLoadingMore && hasMore && (
          <span className={classes.loadMoreLabel}>Loading more…</span>
        )}
        {!hasMore && !isInitialLoading && (
          <span className={classes.loadMoreLabel}>No more assets</span>
        )}
      </div>
    </section>
  )
}
