"use client"

import { UserPublic } from "@/lib/types/user";
import { CookiePreferenceProvider } from "@/stores/cookiePreference/CookiePreferenceProvider";
import { CurrentUserProvider } from "@/stores/currentUser/CurrentUserProvider";
import { TokenProvider } from "@/stores/tokenStore/TokenProvider";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  initialUser?: UserPublic | null;
};

export function AppProviders({ children, initialUser }: Props) {
  return (
    <TokenProvider>
      <CurrentUserProvider initialUser={initialUser}>
        <CookiePreferenceProvider>
          {children}
        </CookiePreferenceProvider>
      </CurrentUserProvider>
    </TokenProvider>
  )
}