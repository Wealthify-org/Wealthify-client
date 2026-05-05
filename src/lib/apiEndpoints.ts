// Браузер ходит до gateway по публичному адресу (хост:порт). Next-server,
// который крутится внутри контейнера web, должен ходить по внутреннему имени
// docker-сети — иначе localhost укажет на сам web-контейнер, а не на gateway.
// Дефолты подобраны под локальный (без Docker) запуск, где обе среды совпадают.
const PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";
const INTERNAL_API_URL = process.env.INTERNAL_API_URL ?? PUBLIC_API_URL;

export const API =
  typeof window === "undefined" ? INTERNAL_API_URL : PUBLIC_API_URL;

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
  GET_ASSET_DESCRIPTION_RU: (ticker: string) =>
    `${API}/crypto-data-worker/${encodeURIComponent(ticker)}/description-ru`,

  SEARCH_ASSETS: (q: string, limit: number) =>
    `${API}/crypto-data-worker/search?q=${encodeURIComponent(q)}&limit=${limit}`,
  GET_SEARCH_RECENT_ASSETS: `${API}/crypto-data-worker/search/recent`,
  ADD_SEARCH_RECENT_ASSET: `${API}/crypto-data-worker/search/recent`,
  DELETE_RECENT_SEARCH_BY_ID: (id: number | string) =>
    `${API}/crypto-data-worker/search/recent/${id}`,
  DELETE_ALL_RECENT_SEARCHES: `${API}/crypto-data-worker/search/recent`,

  GET_ME: `${API}/auth/me`,

  GET_INDEXES_DASHBOARD: `${API}/indexes-data-worker/dashboard`,

  PORTFOLIOS_BY_USER: `${API}/portfolios/user`,
  PORTFOLIOS_SUMMARY_ME: `${API}/portfolios/summary/me`,
  PORTFOLIO_DETAIL: (id: number | string) => `${API}/portfolios/${id}`,
  PORTFOLIO_RECOMMENDATIONS: (id: number | string) =>
    `${API}/portfolios/${id}/recommendations`,
  PORTFOLIO_VALUE_HISTORY: (id: number | string, period: string) =>
    `${API}/portfolios/${encodeURIComponent(String(id))}/value-history?period=${encodeURIComponent(period)}`,
  PORTFOLIOS_CREATE: `${API}/portfolios`,
  PORTFOLIO_DELETE: (id: number | string) => `${API}/portfolios/${id}`,
  PORTFOLIO_ADD_ASSET: `${API}/portfolio-assets/add-to-portfolio`,
  PORTFOLIO_REMOVE_ASSET: `${API}/portfolio-assets/remove-from-portfolio`,
  PORTFOLIO_SELL_ASSET: `${API}/portfolio-assets`,

  TRANSACTIONS_BY_PORTFOLIO: (portfolioId: number | string) =>
    `${API}/transactions/${portfolioId}`,
  TRANSACTION_DELETE: (id: number | string) =>
    `${API}/transactions/${id}`,

  RISK_PROFILE_QUESTIONS: `${API}/risk-profile/questions`,
  RISK_PROFILE_ME: `${API}/risk-profile/me`,
  RISK_PROFILE_SUBMIT: `${API}/risk-profile/submit`,

  CHAT_COMPLETIONS: `${API}/chat/completions`,
  CHAT_HISTORY: `${API}/chat/history`,

  FAVORITES_LIST_IDS: `${API}/favorites/ids`,
  FAVORITES_TOGGLE: `${API}/favorites/toggle`,
  FAVORITES_ADD: `${API}/favorites`,
  FAVORITES_REMOVE: (assetId: number) => `${API}/favorites/${assetId}`,
  FAVORITES_IS_FAVORITE: (assetId: number) => `${API}/favorites/${assetId}`,

} as const;