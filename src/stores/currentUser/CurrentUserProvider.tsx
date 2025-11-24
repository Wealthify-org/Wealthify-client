"use client"

import { createContext, useContext, useEffect, useRef } from "react";
import { CurrentUserStore } from "./CurrentUserStore";
import { UserPublic } from "@/lib/types/user";

const CurrentUserContext = createContext<CurrentUserStore | null>(null);

type Props = {
  children: React.ReactNode;
  initialUser?: UserPublic | null;
};

export function CurrentUserProvider({ children, initialUser = null }: Props) {
  const ref = useRef<CurrentUserStore | null>(null);

  if (ref.current === null) {
    ref.current = new CurrentUserStore();
  }

  useEffect(() => {
    if (!ref.current?.hydrated && initialUser) {
      ref.current?.hydrate(initialUser);
    }
  }, [initialUser]);

  return (
    <CurrentUserContext.Provider value={ref.current}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUserStore(): CurrentUserStore {
  const store = useContext(CurrentUserContext);
  if (!store) {
    throw new Error("useCurrentUserStore must be used within <CurrentUserProvider>");
  }

  return store;
}

