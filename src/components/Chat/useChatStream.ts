"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTokenStore } from "@/stores/tokenStore/TokenProvider";
import { useCurrentUserStore } from "@/stores/currentUser/CurrentUserProvider";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

interface BackendHistoryResponse {
  messages: Array<{
    id: number;
    role: "user" | "assistant";
    content: string;
    createdAt: string;
  }>;
}

const genId = () =>
  `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

interface UseChatStreamOptions {
  /** Если задан — backend подгружает детали этого портфеля в контекст. */
  contextPortfolioId?: number | string;
  /** Если false — хук не загружает историю автоматически (например когда чат закрыт). */
  enabled?: boolean;
}

export function useChatStream({
  contextPortfolioId,
  enabled = true,
}: UseChatStreamOptions) {
  const tokenStore = useTokenStore();
  const currentUser = useCurrentUserStore();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  // ref для актуального messages внутри send (без пересоздания callback'а)
  const messagesRef = useRef<ChatMessage[]>(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const authHeaders = useMemo(() => {
    const h: Record<string, string> = {};
    if (tokenStore.token) h.Authorization = `Bearer ${tokenStore.token}`;
    return h;
  }, [tokenStore.token]);

  // ── загрузка истории с бэка при mount / при логине ─────────────────────
  useEffect(() => {
    if (!enabled) return;
    if (!tokenStore.token || !currentUser.isAuthenticated) {
      setMessages([]);
      return;
    }

    let cancelled = false;
    setHistoryLoading(true);
    setError(null);

    fetch(API_ENDPOINTS.CHAT_HISTORY + "?limit=60", {
      method: "GET",
      credentials: "include",
      headers: authHeaders,
      cache: "no-store",
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`History HTTP ${res.status}`);
        return res.json() as Promise<BackendHistoryResponse>;
      })
      .then((body) => {
        if (cancelled) return;
        const incoming: ChatMessage[] = (body.messages ?? []).map((m) => ({
          id: `srv_${m.id}`,
          role: m.role,
          content: m.content,
        }));
        setMessages(incoming);
      })
      .catch((e) => {
        if (cancelled) return;
        console.warn("[chat] failed to load history", e);
        setMessages([]);
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, authHeaders, tokenStore.token, currentUser.isAuthenticated]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setPending(false);
  }, []);

  const clear = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setPending(false);
    setError(null);
    // оптимистично очистим UI
    setMessages([]);
    try {
      await fetch(API_ENDPOINTS.CHAT_HISTORY, {
        method: "DELETE",
        credentials: "include",
        headers: authHeaders,
        cache: "no-store",
      });
    } catch (e) {
      console.warn("[chat] failed to clear history on backend", e);
    }
  }, [authHeaders]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || pending) return;

      const userMsg: ChatMessage = {
        id: genId(),
        role: "user",
        content: trimmed,
      };
      const assistantMsg: ChatMessage = {
        id: genId(),
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setPending(true);
      setError(null);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(API_ENDPOINTS.CHAT_COMPLETIONS, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
            ...authHeaders,
          },
          body: JSON.stringify({
            messages: [...messagesRef.current, userMsg].map(
              ({ role, content }) => ({ role, content }),
            ),
            ...(contextPortfolioId
              ? { contextPortfolioId: Number(contextPortfolioId) }
              : {}),
          }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          throw new Error(`Chat HTTP ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          let separatorIdx: number;
          while ((separatorIdx = buffer.indexOf("\n\n")) >= 0) {
            const rawEvent = buffer.slice(0, separatorIdx);
            buffer = buffer.slice(separatorIdx + 2);
            if (!rawEvent.trim() || rawEvent.startsWith(":")) continue;

            for (const line of rawEvent.split("\n")) {
              const ln = line.trim();
              if (!ln.startsWith("data:")) continue;
              const payload = ln.slice(5).trim();
              if (payload === "[DONE]" || !payload) continue;

              try {
                const parsed = JSON.parse(payload) as {
                  d?: string;
                  error?: string;
                };
                if (parsed.error) throw new Error(parsed.error);
                if (parsed.d) {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMsg.id
                        ? { ...m, content: m.content + parsed.d }
                        : m,
                    ),
                  );
                }
              } catch (parseErr) {
                if ((parseErr as Error).message?.startsWith("Chat HTTP")) {
                  throw parseErr;
                }
                // ignore malformed single line
              }
            }
          }
        }
      } catch (e) {
        if ((e as Error).name === "AbortError") {
          // отмена — оставляем что успело прийти
        } else {
          const msg = e instanceof Error ? e.message : "Ошибка";
          setError(msg);
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.id === assistantMsg.id && last.content === "") {
              return prev.slice(0, -1);
            }
            return prev;
          });
        }
      } finally {
        setPending(false);
        abortRef.current = null;
      }
    },
    [pending, authHeaders, contextPortfolioId],
  );

  return { messages, send, cancel, clear, pending, error, historyLoading };
}
