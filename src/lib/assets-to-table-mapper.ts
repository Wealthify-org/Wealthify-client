import { ApiAsset } from "./types/api-assets";
import { TableAsset } from "./types/table-asset";

// маппим данные апи под формат таблицы
export function mapApiAssetToTableAsset(asset: ApiAsset): TableAsset {
  return {
    assetId: asset.id,
    index: asset.rank ?? 0,
    name: asset.name,
    ticker: asset.ticker,
    price: asset.currentPriceUsd ?? 0,
    change1h: asset.change1HUsdPct ?? 0,
    change24h: asset.change24HUsdPct ?? 0,
    change7d: asset.change7DUsdPct ?? 0,
    change30d: asset.change30DUsdPct ?? 0,
    change1y: asset.change1YUsdPct ?? 0,
    marketCap: asset.marketCapUsd ?? 0,
    fdv: asset.fdvUsd ?? 0,
    logoUrlLocal: asset.logoUrlLocal,
    volume24h: asset.volume24HUsd ?? 0,
    sparkline7D: asset.sparkline7D ?? undefined,
  };
}