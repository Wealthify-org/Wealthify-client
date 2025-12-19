import { makeAutoObservable, runInAction } from "mobx";
import { getTokenExpiry } from "@/lib/auth/jwt";

export class TokenStore {
  private _access: string | null = null;
  private refreshTimeoutId: number | null = null;

  // задается в AuthBootstrap
  onNeedRefresh?: () => void;

  get hasRefreshCookie(): boolean {
    return !!this.token;
  }

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
    if (!this.token) return;

    const expMs = getTokenExpiry(this.token);
    if (!expMs) return;

    const now = Date.now();
    const skew = 30_000; // обновляемся за 30 секунд до истечения
    const delay = expMs - now - skew;

    if (delay <= 0) {
      this.onNeedRefresh?.();
      return;
    }

    if (this.refreshTimeoutId !== null) {
      window.clearTimeout(this.refreshTimeoutId);
    }

    this.refreshTimeoutId = window.setTimeout(() => {
      this.onNeedRefresh?.();
    }, delay);
  }
}
