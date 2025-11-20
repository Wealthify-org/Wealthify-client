const API = "http://localhost:5001"

export const API_ENDPOINTS = {
  SIGN_IN: `${API}/auth/login`,
  SIGN_UP: `${API}/auth/registration`,
  REFRESH: `${API}/auth/refresh`,
  LOGOUT: `${API}/auth/logout`,
  GET_ASSETS_DATA: `${API}/crypto-data-worker`,
  GET_SINGLE_ASSET_DATA: `${API}/crypto-data-worker/`,
  GET_CRYPTO_DATA_WORKER_HEALTH: `${API}/crypto-data-worker/health`,
  GET_ASSETS_CHARTS: `${API}/`,
} as const;