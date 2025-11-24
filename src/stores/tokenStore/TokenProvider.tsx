"use client"

import { createContext, useContext, useEffect, useRef } from "react";
import { TokenStore } from "./TokenStore";

const TokenContext = createContext<TokenStore | null>(null);

type TokenProviderProps = {
  children: React.ReactNode;
  autoRefreshOnMount?: boolean;
}

export function TokenProvider({ children, autoRefreshOnMount = true }: TokenProviderProps) {
  const ref = useRef<TokenStore | null>(null);

  if (ref.current === null) {
    ref.current = new TokenStore();
  }

  return (
    <TokenContext.Provider value={ref.current}>
      {children}
    </TokenContext.Provider>
  );
}

export function useTokenStore(): TokenStore {
  const store = useContext(TokenContext);
  if (!store) {
    throw new Error("useTokenStore must be used within <TokenProvider>");
  }
  return store;
}
