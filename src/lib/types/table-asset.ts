import { AssetSparkline7D } from "./api-assets";

export type TableAsset = {
  index: number;
  name: string;
  ticker: string;
  price: number;
  change1h: number;
  change24h: number;
  change7d: number;
  change30d: number;
  change1y: number;
  marketCap: number;
  fdv: number;
  volume24h: number;
  logoUrlLocal?: string | null;
  sparkline7D?: AssetSparkline7D;
};