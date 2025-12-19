import { makeAutoObservable, observable, runInAction } from "mobx";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";

type ToggleResponse = { ok: boolean; isFavorite: boolean };
type IdsResponse = { ids: number[] };

export class FavoritesStore {
  private readonly getToken: () => string | null;

  // ключевой момент: map вместо set
  private readonly byId = observable.map<number, true>();

  isLoaded = false;
  isLoading = false;

  constructor(getToken: () => string | null) {
    this.getToken = getToken;
    makeAutoObservable(this);
  }
  
  get count(): number {
    return this.byId.size;
  }

  private authHeaders(extra?: Record<string, string>): Record<string, string> {
    const token = this.getToken();
    const headers: Record<string, string> = { ...(extra ?? {}) };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }

  reset() {
    this.byId.clear();
    this.isLoaded = false;
    this.isLoading = false;
  }

  has(assetId: number): boolean {
    return this.byId.has(assetId);
  }

  get isReady(): boolean {
    return this.isLoaded && !this.isLoading;
  }

  async loadIds(): Promise<void> {
    const token = this.getToken();
    if (!token) {
      this.reset();
      return;
    }

    try {
      runInAction(() => {
        this.isLoading = true;
      });

      const res = await fetch(API_ENDPOINTS.FAVORITES_LIST_IDS, {
        method: "GET",
        credentials: "include",
        headers: this.authHeaders(),
      });

      if (!res.ok) throw new Error(`Failed to load favorites ids: ${res.status}`);

      const data = (await res.json()) as IdsResponse;

      runInAction(() => {
        this.byId.clear();
        for (const id of data.ids) this.byId.set(id, true);
        this.isLoaded = true;
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async toggle(assetId: number): Promise<void> {
    const token = this.getToken();
    if (!token) return;

    const wasFav = this.byId.has(assetId);
    const expected = !wasFav;

    // оптимистично
    runInAction(() => {
      if (wasFav) this.byId.delete(assetId);
      else this.byId.set(assetId, true);
    });

    try {
      const res = await fetch(API_ENDPOINTS.FAVORITES_TOGGLE, {
        method: "POST",
        credentials: "include",
        headers: this.authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ assetId }),
      });

      if (!res.ok) throw new Error(`Failed to toggle favorite: ${res.status}`);

      const data = (await res.json()) as ToggleResponse;

      // важно: НЕ делать второе изменение, если и так совпадает
      if (data.isFavorite !== expected) {
        runInAction(() => {
          if (data.isFavorite) this.byId.set(assetId, true);
          else this.byId.delete(assetId);
        });
      }
    } catch (e) {
      // откат
      runInAction(() => {
        if (wasFav) this.byId.set(assetId, true);
        else this.byId.delete(assetId);
      });
      throw e;
    }
  }
}
