export const API = "http://localhost:5001"

// клиент использует Next-проксированные эндпоинты для refresh/logout,
// чтобы refresh-cookie сидела на домене Next и доходила до сервера
export const NEXT_API = {
  REFRESH: "/api/auth/refresh",
  LOGOUT: "/api/auth/logout",
} as const;

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

  GET_INDEXES_DASHBOARD: `${API}/indexes-data-worker/dashboard`,

  PORTFOLIOS_BY_USER: `${API}/portfolios/user`,
  PORTFOLIOS_SUMMARY_ME: `${API}/portfolios/summary/me`,
  PORTFOLIO_DETAIL: (id: number | string) => `${API}/portfolios/${id}`,
  PORTFOLIOS_CREATE: `${API}/portfolios`,
  PORTFOLIO_ADD_ASSET: `${API}/portfolio-assets/add-to-portfolio`,
  PORTFOLIO_REMOVE_ASSET: `${API}/portfolio-assets/remove-from-portfolio`,
  PORTFOLIO_SELL_ASSET: `${API}/portfolio-assets`,

  RISK_PROFILE_QUESTIONS: `${API}/risk-profile/questions`,
  RISK_PROFILE_ME: `${API}/risk-profile/me`,
  RISK_PROFILE_SUBMIT: `${API}/risk-profile/submit`,

  FAVORITES_LIST_IDS: `${API}/favorites/ids`,
  FAVORITES_TOGGLE: `${API}/favorites/toggle`,
  FAVORITES_ADD: `${API}/favorites`,
  FAVORITES_REMOVE: (assetId: number) => `${API}/favorites/${assetId}`,
  FAVORITES_IS_FAVORITE: (assetId: number) => `${API}/favorites/${assetId}`,

} as const;