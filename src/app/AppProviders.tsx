"use client";

import { useEffect, ReactNode } from "react";
import { UserPublic } from "@/lib/types/user";
import { CookiePreferenceProvider } from "@/stores/cookiePreference/CookiePreferenceProvider";
import {
  CurrentUserProvider,
  useCurrentUserStore,
} from "@/stores/currentUser/CurrentUserProvider";
import {
  TokenProvider,
  useTokenStore,
} from "@/stores/tokenStore/TokenProvider";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";

type Props = {
  children: ReactNode;
  initialUser?: UserPublic | null;
};

function AuthBootstrap() {
  console.log("[AuthBootstrap] render");

  const tokenStore = useTokenStore();
  const currentUserStore = useCurrentUserStore();

useEffect(() => {
    let cancelled = false;
    const refreshAuth = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.REFRESH, {
          method: "POST",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Refresh request failed - `);
        }

        const authHeader =
          response.headers.get("authorization") ??
          response.headers.get("Authorization");

        console.log(response);
        if (!authHeader) {
          throw new Error("No Authorization header in refresh response");
        }

        const [scheme, token] = authHeader.split(" ");

        if (scheme !== "Bearer" || !token) {
          throw new Error("Invalid Authorization header format");
        }

        const { user }: { user: UserPublic } = await response.json();

        if (cancelled) return;

        tokenStore.setFromLogin(token);
        currentUserStore.setUser(user);
      } catch (error) {
        console.error("[AuthBootstrap] refresh failed", error);

        if (cancelled) return;

        // eсли refresh не удался — считаем, что пользователь не авторизован
        tokenStore.clear();
        currentUserStore.clear();
      }
    };

    tokenStore.onNeedRefresh = () => {
      if (!cancelled) {
        void refreshAuth();
      }
    };

    void refreshAuth();

    return () => {
      cancelled = true;
      tokenStore.onNeedRefresh = undefined;
    };
  }, [tokenStore, currentUserStore]);

  return null;
}

export function AppProviders({ children, initialUser }: Props) {
  return (
    <TokenProvider autoRefreshOnMount={false}>
      <CurrentUserProvider initialUser={initialUser}>
        <CookiePreferenceProvider>
          <AuthBootstrap />
          {children}
        </CookiePreferenceProvider>
      </CurrentUserProvider>
    </TokenProvider>
  );
}