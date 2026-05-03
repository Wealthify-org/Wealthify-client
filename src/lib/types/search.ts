export type SearchItem = {
  id: number;
  name: string;
  ticker: string;
  logoUrlLocal: string | null;
  rank: number | null;
  currentPriceUsd: number | null;
  change24HUsdPct: number | null;
  categories: string | null;
  contractAddress: string | null;
};

export type SearchAssetsHttpResponse = {
  items: SearchItem[];
}

export const SearchModeStates = {
  RECENT: "recent",
  SEARCH: "search",
} as const;

export type SearchMode = (typeof SearchModeStates)[keyof typeof SearchModeStates];