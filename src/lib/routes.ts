export const ROUTES = {
  ROOT: "/",
  HOME: "/home",
  FAVORITES: "/favorites",
  SIGN_IN: "/auth/sign-in",
  SIGN_UP: "/auth/sign-up",
  ABOUT: "/about",
  PRIVACY_POLICY: "/privacy-policy",
  PORTFOLIOS: "/portfolios",
} as const;

export type Route = typeof ROUTES[keyof typeof ROUTES];