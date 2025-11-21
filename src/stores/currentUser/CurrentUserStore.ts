import { makeAutoObservable } from "mobx";
import type { UserPublic } from "@/lib/types/user";

export class CurrentUserStore {
  user: UserPublic | null = null;

  hydrated = false; 
  loading = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isAuthenticated() {
    console.log("SPIDOZ - ", this.user);
    return !!this.user;
  }

  hydrate(initial?: UserPublic | null) {
    this.user = initial ?? null;
    this.hydrated = true;
  }

  setUser(next: UserPublic | null) {
    this.user = next;
    this.hydrated = true;
    console.log("SETTED USER")
  }

  async refreshFromServer(endpoint: string) {
    this.loading = true;
    try {
      const res = await fetch(endpoint, { credentials: "include", cache: "no-store"});
      if (res.ok) {
        const data = (await res.json()) as UserPublic | null;
        this.user = data;
      } else {
        this.user = null;
      }
    } finally {
      this.loading = false;
      this.hydrated = true;
    }
  }

  clear() {
    this.user = null;
    this.hydrated = true;
  }
}