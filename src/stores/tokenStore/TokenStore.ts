import { makeAutoObservable, runInAction } from "mobx";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";

export class TokenStore {
  private _access: string | null = null;
  private _refreshing: Promise<boolean> | null = null;

  hasRefreshCookie = false;

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
    this.hasRefreshCookie = true;
  }

  clear() {
    this._access = null;
    this.hasRefreshCookie = false;
  }

  async logout(): Promise<void> {
    try {
      await fetch(API_ENDPOINTS.LOGOUT, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      this.clear();
    }
  }
}
