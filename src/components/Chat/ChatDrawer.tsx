"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { useChatStream } from "./useChatStream";
import { Markdown } from "@/components/UI/Markdown/Markdown";
import classes from "./ChatDrawer.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
  contextPortfolioId?: number | string;
};

export const ChatDrawer = ({ open, onClose, contextPortfolioId }: Props) => {
  const t = useTranslations("chat");
  const { messages, send, cancel, clear, pending, error } = useChatStream({
    contextPortfolioId,
  });

  const [draft, setDraft] = useState("");
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // mount/unmount управление для exit-анимации
  const [mounted, setMounted] = useState(open);
  useEffect(() => {
    if (open) {
      setMounted(true);
    } else if (mounted) {
      const t = window.setTimeout(() => setMounted(false), 280);
      return () => window.clearTimeout(t);
    }
  }, [open, mounted]);

  // автоскролл вниз при новых сообщениях
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  // авто-фокус инпута при открытии
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => textareaRef.current?.focus(), 280);
    return () => clearTimeout(t);
  }, [open]);

  // авторесайз textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [draft]);

  if (!mounted) return null;

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    const text = draft.trim();
    if (!text || pending) return;
    setDraft("");
    void send(text);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div
      className={`${classes.scrim} ${open ? classes.scrimOpen : classes.scrimClosing}`}
      onClick={onClose}
      role="presentation"
    >
      <aside
        className={`${classes.drawer} ${open ? classes.drawerOpen : classes.drawerClosing}`}
        role="dialog"
        aria-modal="true"
        aria-label={t("title")}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={classes.header}>
          <div className={classes.headerLeft}>
            <span className={classes.botBadge} aria-hidden="true">
              <SparkIcon />
            </span>
            <div>
              <p className={classes.headerTitle}>{t("title")}</p>
              <p className={classes.headerSub}>
                {pending ? t("subtitlePending") : t("subtitleIdle")}
              </p>
            </div>
          </div>
          <div className={classes.headerActions}>
            {messages.length > 0 && (
              <button
                type="button"
                className={classes.iconBtn}
                onClick={clear}
                aria-label={t("clearAriaLabel")}
                title={t("clearTitle")}
              >
                <TrashIcon />
              </button>
            )}
            <button
              type="button"
              className={classes.iconBtn}
              onClick={onClose}
              aria-label={t("closeAriaLabel")}
            >
              <CloseIcon />
            </button>
          </div>
        </header>

        <div className={classes.scroller} ref={scrollerRef}>
          {messages.length === 0 ? (
            <EmptyState
              onPick={(s) => {
                setDraft(s);
                setTimeout(() => textareaRef.current?.focus(), 0);
              }}
            />
          ) : (
            <ul className={classes.messageList}>
              {messages.map((m) => (
                <li
                  key={m.id}
                  className={`${classes.message} ${
                    m.role === "user" ? classes.messageUser : classes.messageAssistant
                  }`}
                >
                  {m.role === "assistant" && !m.content && pending ? (
                    <TypingIndicator />
                  ) : m.role === "assistant" ? (
                    <div className={classes.messageText}>
                      <Markdown variant="chat">{m.content}</Markdown>
                      {pending && m.content && (
                        <span className={classes.cursor} aria-hidden="true" />
                      )}
                    </div>
                  ) : (
                    <p className={classes.messageText}>{m.content}</p>
                  )}
                </li>
              ))}
            </ul>
          )}

          {error && (
            <div className={classes.errorBanner}>
              <span>{error}</span>
            </div>
          )}
        </div>

        <form className={classes.composer} onSubmit={submit}>
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t("inputPlaceholder")}
            rows={1}
            disabled={pending}
            className={classes.input}
            maxLength={4000}
          />

          {pending ? (
            <button
              type="button"
              className={`${classes.sendBtn} ${classes.cancelBtn}`}
              onClick={cancel}
              aria-label={t("stop")}
            >
              <StopIcon />
            </button>
          ) : (
            <button
              type="submit"
              className={classes.sendBtn}
              disabled={!draft.trim()}
              aria-label={t("send")}
            >
              <SendIcon />
            </button>
          )}
        </form>

        <p className={classes.disclaimer}>
          {t("disclaimer")}
        </p>
      </aside>
    </div>
  );
};

// ── empty state ───────────────────────────────────────────────────────────

const EmptyState = ({ onPick }: { onPick: (s: string) => void }) => {
  const t = useTranslations("chat");
  const suggestions = t.raw("suggestions") as string[];
  return (
    <div className={classes.empty}>
      <div className={classes.emptyHero}>
        <span className={classes.emptyHeroIcon}>
          <SparkIcon size={26} />
        </span>
        <h3 className={classes.emptyTitle}>{t("emptyTitle")}</h3>
        <p className={classes.emptySub}>
          {t("emptySubtitle")}
        </p>
      </div>

      <div className={classes.suggestionsLabel}>{t("tryLabel")}</div>
      <ul className={classes.suggestions}>
        {suggestions.map((s) => (
          <li key={s}>
            <button
              type="button"
              className={classes.suggestionBtn}
              onClick={() => onPick(s)}
            >
              {s}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

// ── icons ─────────────────────────────────────────────────────────────────

const SparkIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.7}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 3 13.5 8.5 19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z" />
    <path d="M19 14v4M17 16h4M5 17v3M3.5 18.5h3" />
  </svg>
);

const SendIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const StopIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
);

const TrashIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6 17.5 20a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2L5 6m5 0V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2" />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="6" y1="18" x2="18" y2="6" />
  </svg>
);

const TypingIndicator = () => (
  <span className={classes.typing} aria-label="typing">
    <span />
    <span />
    <span />
  </span>
);
