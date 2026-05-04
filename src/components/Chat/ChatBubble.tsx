"use client";

import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { useCurrentUserStore } from "@/stores/currentUser/CurrentUserProvider";
import { ChatDrawer } from "./ChatDrawer";

import classes from "./ChatBubble.module.css";

/**
 * Плавающая кнопка-чат внизу справа. Видна только авторизованным пользователям.
 * При клике раскрывает ChatDrawer с диалогом.
 *
 * Если открыта на странице /portfolios/[id] — автоматически передаёт
 * contextPortfolioId в backend для подгрузки деталей этого портфеля в контекст.
 */
export const ChatBubble = observer(() => {
  const currentUser = useCurrentUserStore();
  const pathname = usePathname();
  const params = useParams<{ id?: string }>();
  const [open, setOpen] = useState(false);
  const t = useTranslations("chat");

  // ESC закрывает чат
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // не показываем чат на лендинге и страницах авторизации
  if (!currentUser.isAuthenticated) return null;
  if (
    pathname === "/" ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/about")
  ) {
    return null;
  }

  // если страница портфеля /portfolios/[id] — берём id для контекста
  const contextPortfolioId =
    pathname.startsWith("/portfolios/") && params?.id ? params.id : undefined;

  return (
    <>
      <button
        type="button"
        className={`${classes.bubble} ${open ? classes.bubbleOpen : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t("closeAriaLabel") : t("openAriaLabel")}
        aria-expanded={open}
      >
        {open ? <CloseIcon /> : <ChatIcon />}
        {!open && <span className={classes.bubblePulse} aria-hidden="true" />}
      </button>

      <ChatDrawer
        open={open}
        onClose={() => setOpen(false)}
        contextPortfolioId={contextPortfolioId}
      />
    </>
  );
});

const ChatIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="22"
    height="22"
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
