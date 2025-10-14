export const ROUTES = {
  ROOT: "/",
  HOME: "/home",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  ABOUT: "/about",
  PRIVACY_POLICY: "/privacy-policy",
} as const;

export type Route = typeof ROUTES[keyof typeof ROUTES];