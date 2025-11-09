import { makeAutoObservable, runInAction } from "mobx";
import { API_ENDPOINTS } from "../../lib/apiEndpoints";

type RefreshResponse = { 
  accessToken: string;
  user?: unknown;
};

export class TokenStore {
  private  _access: string | null = null;
  private _refreshing: Promise<boolean> | null = null;

  hasRefreshCookie = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get token() {
    return this._access;
  }

  get hasToken() {
    return !!this._access;
  }

  setFromLogin(access_token: string) {
    this._access = access_token;
    this.hasRefreshCookie = true;
  }

  clear() {
    this._access = null;
    this.hasRefreshCookie = false;
  }

  async refresh(): Promise<boolean> {
    if (this._refreshing) {
      return this._refreshing;
    }

    this._refreshing = (async () => {
      try {
        const response = await fetch(API_ENDPOINTS.REFRESH, {
          method: "POST",
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          runInAction(() => {
            this._access = null;
            this.hasRefreshCookie = false;
          });
          return false;
        }

        const data = (await response.json()) as RefreshResponse;
        runInAction(() => {
          this._access = data.accessToken;
          this.hasRefreshCookie = true;
        });
        return true;
      } finally {
        this._refreshing = null;
      }
    })();

    return this._refreshing;
  }

  async logout(): Promise<void> {
    await fetch(API_ENDPOINTS.LOGOUT, {
      method: "POST",
      credentials: "include",
    });
    this.clear();
  }
}