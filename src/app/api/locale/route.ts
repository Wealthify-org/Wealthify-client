import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  isSupportedLocale,
  LOCALE_COOKIE,
  LOCALE_COOKIE_TTL,
} from "@/i18n/locales";

const isProd = process.env.NODE_ENV === "production";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { message: "invalid json body" },
      { status: 400 },
    );
  }

  const locale =
    body && typeof body === "object" && body !== null && "locale" in body
      ? (body as { locale: unknown }).locale
      : undefined;

  if (!isSupportedLocale(locale)) {
    return NextResponse.json(
      { message: "unsupported locale" },
      { status: 400 },
    );
  }

  const jar = await cookies();
  jar.set(LOCALE_COOKIE, locale, {
    httpOnly: false, // фронт может читать чтобы highlight'ить активный
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: LOCALE_COOKIE_TTL,
  });

  return NextResponse.json({ ok: true, locale });
}
