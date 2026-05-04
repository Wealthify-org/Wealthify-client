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
import { CategoryFilterProvider } from "@/stores/categoryFilterStore/CategoryFilterProvider";
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

    // 8 секунд — больше чем достаточно для здорового refresh.
    const REFRESH_TIMEOUT_MS = 8_000;

    /**
     * Возвращает true если refresh успешен (токен и user обновлены),
     * false если упал. Различаем 3 кейса:
     *
     * 1. HTTP 401 — refresh-cookie невалиден/устарел → честно разлогиниваем.
     * 2. HTTP 5xx / 503 / network error / timeout — backend временно
     *    недоступен. **НЕ чистим сессию** — текущий access token (если
     *    есть) ещё может быть валиден, и юзер не должен внезапно
     *    разлогиниться из-за щёлкнувшего proxy.
     * 3. Невалидный body (нет Authorization header или нет user в JSON)
     *    — это контрактная поломка backend'а, тоже **не разлогиниваем**.
     */
    const refreshAuth = async (): Promise<boolean> => {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), REFRESH_TIMEOUT_MS);
      try {
        const response = await fetch(NEXT_API.REFRESH, {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
          signal: ctrl.signal,
        });

        // 401 = refresh-cookie невалиден → честный logout
        if (response.status === 401) {
          if (!cancelled) {
            tokenStore.clear();
            currentUserStore.clear();
            favoritesStore.reset();
          }
          return false;
        }

        if (!response.ok) {
          // 5xx / 503 — НЕ чистим сессию, только сообщаем что refresh не
          // удался. Auto-refresh-таймер либо retry-логика повторит попытку.
          console.warn(
            `[AuthBootstrap] refresh transient ${response.status} — keeping session`,
          );
          return false;
        }

        const authHeader =
          response.headers.get("authorization") ??
          response.headers.get("Authorization");

        if (!authHeader) {
          console.warn("[AuthBootstrap] no Authorization header in refresh");
          return false;
        }

        const [scheme, token] = authHeader.split(" ");
        if (scheme !== "Bearer" || !token) {
          console.warn("[AuthBootstrap] invalid Authorization scheme");
          return false;
        }

        const body = (await response
          .json()
          .catch(() => ({}))) as { user?: UserPublic };
        if (!body?.user) {
          console.warn("[AuthBootstrap] refresh body missing user");
          return false;
        }
        const user = body.user;

        if (cancelled) return false;

        tokenStore.setFromLogin(token);
        currentUserStore.setUser(user);

        // favorites — best-effort. Если 401 здесь — у нас just-issued
        // токен невалиден, что ОЧЕНЬ странно (clock skew?). Логируем
        // отдельно, не глотаем, но не валим refresh.
        await favoritesStore.loadIds().catch((e) => {
          console.warn("[AuthBootstrap] loadIds failed after refresh", e);
        });

        return true;
      } catch (error) {
        // Network error / timeout / abort — transient, НЕ logout
        const isAbort = (error as Error)?.name === "AbortError";
        console.warn(
          isAbort
            ? "[AuthBootstrap] refresh timeout — keeping session"
            : "[AuthBootstrap] refresh network error — keeping session",
          error,
        );
        return false;
      } finally {
        clearTimeout(timer);
      }
    };

    // Регистрируем refresher в TokenStore — он сам делает single-flight
    // и переиспользует pendingRefresh при конкурентных вызовах.
    tokenStore.setRefresher(refreshAuth);

    // первичный bootstrap-refresh при mount (через store.refresh()
    // на случай если параллельные ветки уже инициировали refresh)
    void tokenStore.refresh();

    return () => {
      cancelled = true;
    };
  }, [tokenStore, currentUserStore, favoritesStore]);

  return null;
}

export function AppProviders({ children, initialUser }: Props) {
  return (
    <TokenProvider autoRefreshOnMount={false}>
      <CurrentUserProvider initialUser={initialUser}>
        <FavoritesProvider>
          <CategoryFilterProvider>
            <CookiePreferenceProvider>
              <AuthBootstrap />
              {children}
              <ChatBubble />
            </CookiePreferenceProvider>
          </CategoryFilterProvider>
        </FavoritesProvider>
      </CurrentUserProvider>
    </TokenProvider>
  );
}