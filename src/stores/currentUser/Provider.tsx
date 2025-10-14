"use client";

import { createContext, useContext, useRef } from "react";
import { CurrentUserStore } from "./CurrentUserStore";
import type { UserPublic } from "@/lib/types/user";

const CurrentUserContext = createContext<CurrentUserStore | null>(null);

export function CurrentUserProvider({
  children,
  initialUser,
}:  {
  children: React.ReactNode;
  initialUser?: UserPublic | null;
}) {
  const ref = useRef<CurrentUserStore | null>(null);
  if (!ref.current) {
    ref.current = new CurrentUserStore();
    ref.current.hydrate(initialUser ?? null);
  }

  return (
    <CurrentUserContext.Provider value={ref.current}>
      {children}
    </CurrentUserContext.Provider>
  )
}

export function useCurrentUser() {
  const store = useContext(CurrentUserContext);
  if (!store) {
    throw new Error("useCurrentUser must be used within <CurrentUserProvider>");
  }
  return store;
}