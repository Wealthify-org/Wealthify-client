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
    return !!this.user;
  }

  hydrate(initial?: UserPublic | null) {
    this.user = initial ?? null;
    this.hydrated = true;
  }

  setUser(next: UserPublic | null) {
    this.user = next;
    this.hydrated = true;
  }

  clear() {
    this.user = null;
    this.hydrated = true;
  }
}
