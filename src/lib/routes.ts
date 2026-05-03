export const ROUTES = {
  ROOT: "/",
  HOME: "/home",
  FAVORITES: "/favorites",
  SIGN_IN: "/auth/sign-in",
  SIGN_UP: "/auth/sign-up",
  ABOUT: "/about",
  PRIVACY_POLICY: "/privacy-policy",
  PORTFOLIOS: "/portfolios",
  ASSET: (ticker: string) => `/assets/${encodeURIComponent(ticker)}`,
  PORTFOLIO: (id: number | string) => `/portfolios/${id}`,
} as const;

export type Route = string;