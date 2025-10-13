"use client"

import { createContext, useContext, useEffect, useRef } from "react"
import { CookiePreferenceStore } from "./cookiePreferences"

const CookiePreferenceContext = createContext<CookiePreferenceStore | null>(null)

export function CookiePreferenceProvider({ children }: { children: React.ReactNode}) {
  const ref = useRef<CookiePreferenceStore | null>(null);
  
  if (ref.current === null) {
    ref.current = new CookiePreferenceStore();
  }

  useEffect(() => {
    ref.current!.hydrateFromCookie();
  })

  return (
    <CookiePreferenceContext.Provider value={ref.current}>
      {children}
    </CookiePreferenceContext.Provider>
  );
}

export function useCookiePreferenceStore() {
  const store = useContext(CookiePreferenceContext);
  if (!store) throw new Error("useCookiePreferenceStore must be used within <CookiePreferenceProvider>");
  return store;
}