"use server"

import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { mapApiAssetToTableAsset } from "@/lib/assets-to-table-mapper";
import { ApiAsset, AssetChartsResponse, CryptoDataWorkerHealth, ListAssetsResponse } from "@/lib/types/api-assets";
import { TableAsset } from "@/lib/types/table-asset";

export async function listAssetsAction(params?: {
  limit?: number;
  offset?: number;
}): Promise<ListAssetsResponse> {
  const searchParams = new URLSearchParams();

  if (params?.limit) {
    searchParams.set("limit", String(params.limit));
  } 
  if (params?.offset) {
    searchParams.set("offset", String(params.offset));
  }

  const query = searchParams.toString();
  const url = query
    ? `${API_ENDPOINTS.GET_ASSETS_DATA}?${query}`
    : API_ENDPOINTS.GET_ASSETS_DATA;
  
  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch assets: ${res.status} ${res.statusText}`,
    )
  }

  

  const data = (await res.json()) as ListAssetsResponse;
  return data;
}

export async function getAssetByTickerAction(
  ticker: string,
): Promise<ApiAsset | null> {
  const trimmed = ticker.trim();

  if (!trimmed) {
    throw new Error("Ticker is required");
  }

  const url = API_ENDPOINTS.GET_SINGLE_ASSET_DATA(trimmed);

  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(
      `Failed to fetch asset ${trimmed}: ${res.status} ${res.statusText}`,
    )
  }

  const data = (await res.json()) as ApiAsset;
  return data;
}

export async function getAssetChartsAction(
  ticker: string
): Promise<AssetChartsResponse | null> {
  const trimmed = ticker.trim();

  if (!trimmed) {
    throw new Error("Ticker is required");
  }

  const url = API_ENDPOINTS.GET_ASSET_CHARTS(trimmed);

  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(
      `Failed to fetch charts for ${trimmed}: ${res.status} ${res.statusText}`,
    );
  }

  const data = (await res.json()) as AssetChartsResponse | null;
  return data;
}

export async function getCryptoDataWorkerHealthAction(): Promise<CryptoDataWorkerHealth> {
  const res = await fetch(API_ENDPOINTS.GET_CRYPTO_DATA_WORKER_HEALTH, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(
      `Crypto data worker is not healthy: ${res.status} ${res.statusText}`,
    );
  }

  const data = (await res.json()) as CryptoDataWorkerHealth;
  return data;
}

// экшн, который сразу возвращает данные в формате таблицы
export async function listAssetsForTableAction(params?: {
  limit?: number;
  offset?: number;
}): Promise<TableAsset[]> {
  const { items } = await listAssetsAction(params);
  return items.map(mapApiAssetToTableAsset);
}