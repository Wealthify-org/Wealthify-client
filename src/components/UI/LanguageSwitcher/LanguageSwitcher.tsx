"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import classes from "./LanguageSwitcher.module.css";

type SupportedLocale = "en" | "ru";

interface LocaleOption {
  code: SupportedLocale;
  flag: string; // эмоджи-флаг
  /** Показывается в кнопке (компактно). */
  short: string;
  /** Локализованное имя (берётся из messages по ключу). */
  labelKey: "english" | "russian";
}

const OPTIONS: LocaleOption[] = [
  { code: "en", flag: "🇬🇧", short: "EN", labelKey: "english" },
  { code: "ru", flag: "🇷🇺", short: "RU", labelKey: "russian" },
];

export const LanguageSwitcher = () => {
  const router = useRouter();
  const locale = useLocale() as SupportedLocale;
  const t = useTranslations("languageSwitcher");

  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!wrapperRef.current) return;
      if (wrapperRef.current.contains(e.target as Node)) return;
      setOpen(false);
    };
    window.addEventListener("pointerdown", onPointer);
    return () => window.removeEventListener("pointerdown", onPointer);
  }, [open]);

  // close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const onPick = async (next: SupportedLocale) => {
    if (next === locale || pending) {
      setOpen(false);
      return;
    }
    setPending(true);
    try {
      await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: next }),
      });
      setOpen(false);
      // refresh — next-intl перечитает cookie на сервере и подгрузит messages
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  const current = OPTIONS.find((o) => o.code === locale) ?? OPTIONS[0];

  return (
    <div className={classes.wrapper} ref={wrapperRef}>
      <button
        type="button"
        className={`${classes.trigger} ${open ? classes.triggerOpen : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={t("ariaLabel")}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={t("tooltipChangeLanguage")}
      >
        <GlobeIcon />
        <span className={classes.triggerText}>{current.short}</span>
      </button>

      {open && (
        <div className={classes.menu} role="listbox">
          {OPTIONS.map((opt) => {
            const active = opt.code === locale;
            return (
              <button
                key={opt.code}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => onPick(opt.code)}
                disabled={pending}
                className={`${classes.menuItem} ${active ? classes.menuItemActive : ""}`}
              >
                <span className={classes.flag} aria-hidden="true">
                  {opt.flag}
                </span>
                <span className={classes.menuItemLabel}>
                  {t(opt.labelKey)}
                </span>
                {active && <CheckIcon className={classes.checkIcon} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const GlobeIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.7}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
