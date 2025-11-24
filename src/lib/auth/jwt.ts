type JwtPayload = {
  exp?: number;
  [key: string]: unknown;
}

export const getTokenExpiry = (token: string): number | null => {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;

    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const data = JSON.parse(json) as JwtPayload;

    if (!data.exp) return null;

    return data.exp * 1000;
  } catch {
    return null;
  }
};

