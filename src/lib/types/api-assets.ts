
export type SeriesPoint = [number, number];

export type AssetSparkline7D = {
  prices: number[];
};

export type ApiAsset = {
  id: number;
  ticker: string;
  name: string;
  rank: number | null;

  currentPriceUsd: number | null;
  marketCapUsd: number | null;
  fdvUsd: number | null;
  volume24HUsd: number | null;

  change1HUsdPct: number | null;
  change24HUsdPct: number | null;
  change7DUsdPct: number | null;
  change14DUsdPct: number | null;
  change30DUsdPct: number | null;
  change1YUsdPct: number | null;

  sparkline7D?: AssetSparkline7D | null;

  description?: string | null;
  categories?: string | string[] | null;

  lastUpdatedAt?: string | null;
  logoUrlLocal?: string | null;
  // если есть необработанные поля
  [key: string]: unknown;
};

export type ListAssetsResponse = {
  items: ApiAsset[];
  total: number;
  limit: number;
  offset: number;
};

export type AssetChartsResponse = {
  h24Stats?: SeriesPoint[];
  h24Volumes?: SeriesPoint[];

  d7Stats?: SeriesPoint[];
  d7Volumes?: SeriesPoint[];

  d30Stats?: SeriesPoint[];
  d30Volumes?: SeriesPoint[];

  d90Stats?: SeriesPoint[];
  d90Volumes?: SeriesPoint[];

  d365Stats?: SeriesPoint[];
  d365Volumes?: SeriesPoint[];

  maxStats?: SeriesPoint[];
  maxVolumes?: SeriesPoint[];

  capturedAt?: string;
  [key: string]: unknown;
};

export type CryptoDataWorkerHealth = {
  status?: string;
  // если есть необработанные поля
  [key: string]: unknown;
};