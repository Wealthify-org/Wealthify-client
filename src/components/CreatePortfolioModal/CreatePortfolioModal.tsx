"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { extractApiError } from "@/lib/apiError";
import { useTokenStore } from "@/stores/tokenStore/TokenProvider";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

import classes from "./CreatePortfolioModal.module.css";

type PortfolioType = "Crypto" | "Stock" | "Bond";

const TYPE_OPTIONS: PortfolioType[] = ["Crypto", "Stock", "Bond"];

type Props = {
  open: boolean;
  onClose: () => void;
  /** Возвращает id созданного портфеля, чтобы родитель мог обновить список / навигировать. */
  onCreated?: (id: number) => void;
};

export const CreatePortfolioModal = ({ open, onClose, onCreated }: Props) => {
  const tokenStore = useTokenStore();
  const t = useTranslations("portfolioActions");
  const tApi = useTranslations("apiErrors");

  useBodyScrollLock(open);

  const [name, setName] = useState("");
  const [type, setType] = useState<PortfolioType>("Crypto");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  // авто-фокус + reset при открытии
  useEffect(() => {
    if (!open) return;
    setName("");
    setType("Crypto");
    setError(null);
    const id = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => window.clearTimeout(id);
  }, [open]);

  // ESC закрывает (если не submitting)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, submitting, onClose]);

  const headers = useMemo(() => {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (tokenStore.token) h.Authorization = `Bearer ${tokenStore.token}`;
    return h;
  }, [tokenStore.token]);

  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t("errorNameRequired"));
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(API_ENDPOINTS.PORTFOLIOS_CREATE, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify({ name: trimmed, type }),
      });
      if (!res.ok) {
        const msg = await extractApiError(res, tApi, t("errorCreateFailed"));
        console.error("[CreatePortfolio] failed", res.status, msg);
        setError(msg);
        return;
      }
      const created = await res.json().catch(() => null);
      onCreated?.(created?.id ?? 0);
      onClose();
    } catch (e) {
      console.error("[CreatePortfolio] threw", e);
      setError(t("errorCreateFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className={classes.scrim}
      role="presentation"
      onClick={() => {
        if (!submitting) onClose();
      }}
    >
      <form
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-portfolio-title"
        className={classes.dialog}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={classes.header}>
          <h2 id="create-portfolio-title" className={classes.title}>
            {t("createTitle")}
          </h2>
          <p className={classes.subtitle}>{t("createSubtitle")}</p>
        </header>

        <label className={classes.field}>
          <span className={classes.label}>{t("nameLabel")}</span>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("namePlaceholder")}
            className={classes.input}
            maxLength={120}
            disabled={submitting}
          />
        </label>

        <fieldset className={classes.field}>
          <legend className={classes.label}>{t("typeLabel")}</legend>
          <div className={classes.typeRow}>
            {TYPE_OPTIONS.map((opt) => (
              <label
                key={opt}
                className={`${classes.typeChip} ${
                  type === opt ? classes.typeChipActive : ""
                }`}
              >
                <input
                  type="radio"
                  name="portfolioType"
                  value={opt}
                  checked={type === opt}
                  onChange={() => setType(opt)}
                  disabled={submitting}
                  className={classes.typeRadio}
                />
                <span>{t(`types.${opt}` as const)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {error && <p className={classes.error}>{error}</p>}

        <div className={classes.actions}>
          <button
            type="button"
            className={classes.cancelBtn}
            onClick={onClose}
            disabled={submitting}
          >
            {t("createCancel")}
          </button>
          <button
            type="submit"
            className={classes.confirmBtn}
            disabled={submitting || !name.trim()}
          >
            {submitting ? t("createSubmitting") : t("createSubmit")}
          </button>
        </div>
      </form>
    </div>
  );
};
