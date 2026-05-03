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
import { NEXT_API } from "@/lib/apiEndpoints";
import { FavoritesProvider, useFavoritesStore } from "@/stores/favoritesStore/FavoritesProvider";
import { ChatBubble } from "@/components/Chat/ChatBubble";

type Props = {
  children: ReactNode;
  initialUser?: UserPublic | null;
};

function AuthBootstrap() {
  const tokenStore = useTokenStore();
  const currentUserStore = useCurrentUserStore();
  const favoritesStore = useFavoritesStore();

  useEffect(() => {
    let cancelled = false;

    const refreshAuth = async () => {
      try {
        const response = await fetch(NEXT_API.REFRESH, {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
        });

        if (response.status === 401) {
          tokenStore.clear();
          currentUserStore.clear();
          favoritesStore.reset();
          return;
        }

        if (!response.ok) {
          throw new Error(
            `Refresh request failed - ${response.status}: ${response.statusText}`,
          );
        }

        const authHeader =
          response.headers.get("authorization") ??
          response.headers.get("Authorization");

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

        await favoritesStore.loadIds().catch(() => {});
      } catch (error) {
        console.error("[AuthBootstrap] refresh failed", error);

        if (cancelled) return;

        tokenStore.clear();
        currentUserStore.clear();
        favoritesStore.reset();
      }
    };

    tokenStore.onNeedRefresh = () => {
      if (cancelled) return;
      void refreshAuth();
    };

    void refreshAuth();

    return () => {
      cancelled = true;
      tokenStore.onNeedRefresh = undefined;
    };
  }, [tokenStore, currentUserStore, favoritesStore]);

  return null;
}

export function AppProviders({ children, initialUser }: Props) {
  return (
    <TokenProvider autoRefreshOnMount={false}>
      <CurrentUserProvider initialUser={initialUser}>
        <FavoritesProvider>
          <CookiePreferenceProvider>
            <AuthBootstrap />
            {children}
            <ChatBubble />
          </CookiePreferenceProvider>
        </FavoritesProvider>
      </CurrentUserProvider>
    </TokenProvider>
  );
}