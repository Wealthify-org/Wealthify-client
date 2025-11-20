"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Asset } from "./Asset/Asset"
import classes from "./Assets.module.css"
import type { TableAsset } from "@/lib/types/table-asset"
import { ListAssetsResponse } from "@/lib/types/api-assets"
import { mapApiAssetToTableAsset } from "@/lib/assets-to-table-mapper"
import { API_ENDPOINTS } from "@/lib/apiEndpoints"

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

type Props = {
  assets: TableAsset[]
}

const PAGE_SIZE = 100;

export const AssetsTable = ({ assets }: Props) => {
  // все активы, что уже загружены
  const [allAssets, setAllAssets] = useState<TableAsset[]>(assets)
  const [sortState, setSortState] = useState<SortState>({
    key: "index",
    direction: "asc",
  })

  const [offset, setOffset] = useState<number>(assets.length);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const sortedAssets = useMemo(() => {
    const copy = [...allAssets]

    copy.sort((a, b) => {
      const { key, direction } = sortState
      const aVal = a[key] as unknown
      const bVal = b[key] as unknown

      // строки сортируем через localeCompare
      if (typeof aVal === "string" && typeof bVal === "string") {
        const res = aVal.localeCompare(bVal)
        return direction === "asc" ? res : -res
      }

      // всё остальное как числа
      const numA = Number(aVal ?? 0)
      const numB = Number(bVal ?? 0)

      if (numA === numB) return 0

      return direction === "asc" ? numA - numB : numB - numA
    })

    return copy
  }, [allAssets, sortState])

  const handleSort = (key: SortKey) => {
    setSortState((prev) => {
      // если кликаем по той же колонке — переворачиваем направление
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        }
      }

      // если новая колонка — начнём, например, с убывания (топ сначала)
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

  // загрузка следующей страницы
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return

    try {
      setIsLoadingMore(true)

      const searchParams = new URLSearchParams()
      searchParams.set("limit", String(PAGE_SIZE))
      searchParams.set("offset", String(offset))

      const url = `${API_ENDPOINTS.GET_ASSETS_DATA}?${searchParams.toString()}`

      const res = await fetch(url, {
        method: "GET",
        cache: "no-store",
      })

      if (!res.ok) {
        console.error("Failed to fetch more assets", res.status, res.statusText)
        setHasMore(false)
        return
      }

      const data = (await res.json()) as ListAssetsResponse
      console.log(data);
      const mapped = data.items.map(mapApiAssetToTableAsset)

      setAllAssets((prev) => {
        console.log("PENIS", ...prev);
        return [...prev, ...mapped];
      })

      const newOffset = offset + mapped.length
      setOffset(newOffset)

      // если пришло меньше PAGE_SIZE или мы дошли до total — дальше нечего грузить
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

  // IntersectionObserver для бесконечной прокрутки
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
        root: null, // viewport
        rootMargin: "200px", // начинаем грузить чуть раньше
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
          {sortedAssets.map((asset) => (
            <Asset
              key={asset.ticker}
              {...asset}
            />
          ))}
        </tbody>
      </table>
      <div
        ref={loadMoreRef}
        className={classes.loadMoreSentinel}
      >
        {isLoadingMore && hasMore && (
          <span className={classes.loadMoreLabel}>Loading more…</span>
        )}
        {!hasMore && (
          <span className={classes.loadMoreLabel}>No more assets</span>
        )}
      </div>
    </section>
  )
}
