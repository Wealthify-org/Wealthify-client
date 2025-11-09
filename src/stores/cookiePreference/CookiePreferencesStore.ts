import { makeAutoObservable } from "mobx";

export type Preference = "accepted" | "rejected" | "unset";

const COOKIE_NAME = "cookie_consent";
const COOKIE_MAX_AGE_DAYS = 180;

type SameSite = "Lax" | "Strict" | "None";

const readCookie = (name: string): string | null => {
  if (typeof document === "undefined") {
    return null;
  }
  const safe = name.replace(/[-.$?*|{}()\[\]\\/+^]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|; )${safe}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

const writeCookie = (
  name: string,
  value: string,
  opts: {
    days?: number;
    path?: string;
    domain?: string;
    sameSite?: SameSite;
    secure?: boolean;
  } = {}
) => {
  if (typeof document === "undefined") {
    return;
  }

  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (opts.days && opts.days > 0) {
    const maxAge = Math.floor(opts.days * 24 * 60 * 60);
    parts.push(`Max-Age=${maxAge}`);
  }

  parts.push(`Path=${opts.path ?? "/"}`);
  if (opts.domain) parts.push(`Domain=${opts.domain}`);
  
  parts.push(`SameSite=${opts.sameSite ?? "Lax"}`);

  if (opts.secure) parts.push("Secure");

  document.cookie = parts.join("; ");
} 

const deleteCookie = (name: string, path = "/") => {
  if (typeof document === "undefined") {
    return ;
  }
  document.cookie = `${name}=; Path=${path}; Max-Age=0; SameSite=Lax`;
}

export class CookiePreferenceStore {
  preference: Preference = "unset";
  hydrated = false;
  
  constructor() {
    makeAutoObservable(this);
  }

  get isVisible() {
    return this.hydrated && this.preference === "unset";
  }

  hydrateFromCookie() {
    const raw = readCookie(COOKIE_NAME);
    if (raw === "accepted") {
      this.preference = "accepted";
    } else if (raw === "rejected") {
      this.preference = "rejected";
    } else {
      this.preference = "unset";
    }
    this.hydrated = true;
  }

  acceptAll() {
    this.preference = "accepted";
    this.hydrated = true;
    writeCookie(COOKIE_NAME, "accepted", {
      days: COOKIE_MAX_AGE_DAYS,
      path: "/",
      sameSite: "Lax",
      secure: true,
    });
  }

  rejectAll() {
    this.preference = "rejected";
    this.hydrated = true;
    deleteCookie(COOKIE_NAME);
  }
}