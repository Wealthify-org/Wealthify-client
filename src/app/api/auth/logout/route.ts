import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  COOKIE_PATH,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/auth/auth-cookie-constants";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";

const isProd = process.env.NODE_ENV === "production";

export async function POST() {
  const jar = await cookies();
  const refresh = jar.get(REFRESH_TOKEN_COOKIE)?.value;

  if (refresh) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5_000);
    try {
      await fetch(API_ENDPOINTS.LOGOUT, {
        method: "POST",
        headers: { Cookie: `${REFRESH_TOKEN_COOKIE}=${refresh}` },
        cache: "no-store",
        signal: ctrl.signal,
      });
    } catch {
      // ignore — clear cookie anyway
    } finally {
      clearTimeout(timer);
    }
  }

  const res = NextResponse.json({ message: "ok" });
  res.cookies.set(REFRESH_TOKEN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: COOKIE_PATH,
    maxAge: 0,
  });
  return res;
}
