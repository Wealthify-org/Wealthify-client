import { useEffect, useRef, useState } from "react";
import classes from "./AssetSearch.module.css"
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { SearchAssetsHttpResponse, SearchItem, SearchMode, SearchModeStates } from "@/lib/types/search";
import { API, API_ENDPOINTS } from "@/lib/apiEndpoints";
import { SearchBar } from "./SearchBar/SearchBar";

const LIMIT = 8;

export const AssetsSearch = () => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 250);

  const [items, setItems] = useState<SearchItem[]>([]);
  const [mode, setMode] = useState<SearchMode>("recent");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wrapperRef = useRef<HTMLDivElement | null>(null);

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
    // TODO: сделать поиск выпадающим окном, как на dropstab

    console.log(`search - ${value}`);
  }

  const handleFocus = () => {
    console.log("IS IN FOCUS");
    setIsOpen(true);
  };

  const handleSelect = (item: SearchItem) => {
    setQuery(item.ticker);
    setIsOpen(false);

    void fetch(API_ENDPOINTS.ADD_SEARCH_RECENT_ASSET, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ assetId: item.id }),
    }).catch((err) => {
      console.error("[AssetsSearch] failed to add recent", err);
    })

    // TODO: Сделать навигацию на страницу с активом
  }

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

        {isOpen && !loading && 
          !error &&
          items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={classes.dropdownItem}
              onClick={() => handleSelect(item)}
            >
              {item.logoUrlLocal && (
                <img 
                  src={`${API}${item.logoUrlLocal}`}
                  width={24}
                  height={24}
                  alt={`${name} logo`}
                  className={classes.assetIcon}
                  aria-hidden
                />
              )}

              <span className={classes.itemMain}>
                <span className={classes.itemName}>{item.name}</span>
                <span className={classes.itemTicker}>
                  {item.ticker}
                  {item.rank != null && (
                    <span className={classes.itemRank}> · #{item.rank}</span>
                  )}
                </span>
              </span>

              <span className={classes.itemRight}>
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
                        : classes.negative,
                    ].join(" ")}
                  >
                    {item.change24HUsdPct >= 0 ? "+" : ""}
                    {item.change24HUsdPct.toFixed(2)}%
                  </span>
                )}
              </span>
            </button>
          ))
        }
      </div>
    </div>
  )
}