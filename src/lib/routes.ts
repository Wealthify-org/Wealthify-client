export const ROUTES = {
  ROOT: "/",
  HOME: "/home",
  FAVORITES: "/favorites",
  SIGN_IN: "/auth/sign-in",
  SIGN_UP: "/auth/sign-up",
  ABOUT: "/about",
  PRIVACY: "/privacy",
  TERMS: "/terms",
  REFUND: "/refund",
  // legacy alias — старая ссылка из CookieConsent
  PRIVACY_POLICY: "/privacy",
  PORTFOLIOS: "/portfolios",
  ASSET: (ticker: string) => `/assets/${encodeURIComponent(ticker)}`,
  PORTFOLIO: (id: number | string) => `/portfolios/${id}`,
  RISK_PROFILE: "/risk-profile",
  PRICING: "/#pricing",
  GOALS: "/#goals",
} as const;

export type Route = string;
