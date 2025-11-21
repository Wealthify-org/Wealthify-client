export const ROUTES = {
  ROOT: "/",
  HOME: "/home",
  SIGN_IN: "/auth/sign-in",
  SIGN_UP: "/auth/sign-up",
  ABOUT: "/about",
  PRIVACY_POLICY: "/privacy-policy",
} as const;

export type Route = typeof ROUTES[keyof typeof ROUTES];