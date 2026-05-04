type JwtPayload = {
  exp?: number;
  [key: string]: unknown;
}

export const getTokenExpiry = (token: string): number | null => {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    if (!payload) return null;

    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const data = JSON.parse(json) as JwtPayload;

    if (!data.exp || typeof data.exp !== "number" || !Number.isFinite(data.exp)) {
      return null;
    }

    return data.exp * 1000;
  } catch (e) {
    // раньше ошибка глоталась молча → autoRefresh не настраивался и не
    // было видно почему. Лог в warn — без шума, но с диагностикой.
    if (typeof console !== "undefined") {
      console.warn("[jwt] failed to decode access token", e);
    }
    return null;
  }
};

