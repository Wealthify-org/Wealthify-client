export const API = "http://localhost:5001"

export const API_ENDPOINTS = {
  SIGN_IN: `${API}/auth/login`,
  SIGN_UP: `${API}/auth/registration`,
  REFRESH: `${API}/auth/refresh`,
  LOGOUT: `${API}/auth/logout`,

  GET_ASSETS_DATA: `${API}/crypto-data-worker`,
  GET_SINGLE_ASSET_DATA: (ticker: string) =>
    `${API}/crypto-data-worker/${encodeURIComponent(ticker)}`,
  GET_CRYPTO_DATA_WORKER_HEALTH: `${API}/crypto-data-worker/health`,
  GET_ASSET_CHARTS: (ticker: string) =>
    `${API}/crypto-data-worker/${encodeURIComponent(ticker)}/charts`,

  SEARCH_ASSETS: (q: string, limit: number) =>
    `${API}/crypto-data-worker/search?q=${q}&limit=${limit}`,
  GET_SEARCH_RECENT_ASSETS: `${API}/crypto-data-worker/search/recent`,
  ADD_SEARCH_RECENT_ASSET: `${API}/search/recent`,
  DELETE_RECENT_SEARCH_BY_ID: (id: number) =>
    `${API}/crypto-data-worker/search/recent/:${id}`,
  DELETE_ALL_RECENT_SEARCHES: `${API}/search/recent`,

  GET_ME: `${API}/auth/me`,

  PORTFOLIOS_BY_USER: `${API}/portfolios/user`,
  PORTFOLIOS_SUMMARY_ME: `${API}/portfolios/summary/me`,

} as const;