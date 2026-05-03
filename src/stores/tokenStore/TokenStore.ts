import { makeAutoObservable } from "mobx";
import { getTokenExpiry } from "@/lib/auth/jwt";

export class TokenStore {
  private _access: string | null = null;
  private refreshTimeoutId: number | null = null;

  // задается в AuthBootstrap
  onNeedRefresh?: () => void;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get token(): string | null {
    return this._access;
  }

  get hasToken(): boolean {
    return !!this._access;
  }

  setFromLogin(accessToken: string) {
    this._access = accessToken;
    this.setupAutoRefresh();
  }

  clear() {
    this._access = null;
    if (this.refreshTimeoutId !== null) {
      window.clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }
  }

  private setupAutoRefresh() {
    if (typeof window === "undefined") return;
    if (!this.token) return;

    const expMs = getTokenExpiry(this.token);
    if (!expMs) return;

    const now = Date.now();
    const skew = 30_000; // обновляемся за 30 секунд до истечения
    const delay = Math.max(0, expMs - now - skew);

    if (this.refreshTimeoutId !== null) {
      window.clearTimeout(this.refreshTimeoutId);
    }

    this.refreshTimeoutId = window.setTimeout(() => {
      this.refreshTimeoutId = null;
      this.onNeedRefresh?.();
    }, delay);
  }
}
