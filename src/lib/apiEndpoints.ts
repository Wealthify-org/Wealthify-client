const API = "http://localhost:5001"

export const API_ENDPOINTS = {
  SIGN_IN: `${API}/auth/login`,
  SIGN_UP: `${API}/auth/registration`,
  REFRESH: `${API}/auth/refresh`,
  LOGOUT: `${API}/auth/logout`,
} as const;