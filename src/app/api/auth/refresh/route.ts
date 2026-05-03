import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  COOKIE_PATH,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE_TTL,
} from "@/lib/auth/auth-cookie-constants";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";

const isProd = process.env.NODE_ENV === "production";

const readSetCookieList = (res: Response): string[] => {
  const headers = res.headers as Headers & { getSetCookie?: () => string[] };
  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie();
  }
  const list: string[] = [];
  res.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") list.push(value);
  });
  return list;
};

const extractRefreshFromSetCookie = (setCookieList: string[]): string | null => {
  const re = new RegExp(`(?:^|; )?${REFRESH_TOKEN_COOKIE}=([^;]+)`, "i");
  for (const raw of setCookieList) {
    const m = re.exec(raw.trim());
    if (m) return m[1];
  }
  return null;
};

export async function POST() {
  const jar = await cookies();
  const refresh = jar.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!refresh) {
    return NextResponse.json({ message: "no refresh" }, { status: 401 });
  }

  const upstream = await fetch(API_ENDPOINTS.REFRESH, {
    method: "POST",
    headers: {
      Cookie: `${REFRESH_TOKEN_COOKIE}=${refresh}`,
    },
    cache: "no-store",
  });

  if (!upstream.ok) {
    const body = await upstream.text().catch(() => "");
    const res = NextResponse.json(
      { message: body || "refresh failed" },
      { status: upstream.status },
    );
    if (upstream.status === 401) {
      res.cookies.set(REFRESH_TOKEN_COOKIE, "", {
        httpOnly: true,
        sameSite: "lax",
        secure: isProd,
        path: COOKIE_PATH,
        maxAge: 0,
      });
    }
    return res;
  }

  const body = await upstream.json().catch(() => ({}));
  const authHeader =
    upstream.headers.get("Authorization") ?? upstream.headers.get("authorization");

  const setCookies = readSetCookieList(upstream);
  const newRefresh = extractRefreshFromSetCookie(setCookies);

  const res = NextResponse.json(body);

  if (authHeader) {
    res.headers.set("Authorization", authHeader);
  }

  if (newRefresh) {
    res.cookies.set(REFRESH_TOKEN_COOKIE, newRefresh, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      path: COOKIE_PATH,
      maxAge: REFRESH_TOKEN_COOKIE_TTL,
    });
  }

  return res;
}
