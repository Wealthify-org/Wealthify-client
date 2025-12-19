"use client";

import { createContext, ReactNode, useContext, useMemo } from "react";
import { FavoritesStore } from "./FavoritesStore";
import { useTokenStore } from "@/stores/tokenStore/TokenProvider";

const FavoritesContext = createContext<FavoritesStore | null>(null);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const tokenStore = useTokenStore();

  const store = useMemo(
    () => new FavoritesStore(() => tokenStore.token ?? null),
    [],
  );

  return (
    <FavoritesContext.Provider value={store}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavoritesStore = (): FavoritesStore => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavoritesStore must be used within FavoritesProvider");
  return ctx;
};
