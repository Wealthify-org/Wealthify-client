"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { extractApiError } from "@/lib/apiError";
import { useTokenStore } from "@/stores/tokenStore/TokenProvider";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

import classes from "./SellAssetModal.module.css";

type Props = {
  open: boolean;
  portfolioId: number;
  ticker: string;
  /** Сколько актива у пользователя сейчас в портфеле — лимит для quantity. */
  available: number;
  /** Текущая рыночная цена за единицу — пред-заполняется в поле цены. */
  currentPrice: number;
  onClose: () => void;
  onSold?: () => void;
};

const formatUsd = (v: number): string =>
  v.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatQty = (v: number): string =>
  v.toLocaleString("en-US", { maximumFractionDigits: 8 });

export const SellAssetModal = ({
  open,
  portfolioId,
  ticker,
  available,
  currentPrice,
  onClose,
  onSold,
}: Props) => {
  const tokenStore = useTokenStore();
  const t = useTranslations("portfolioActions");
  const tApi = useTranslations("apiErrors");

  useBodyScrollLock(open);

  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [convertToUsd, setConvertToUsd] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const qtyInputRef = useRef<HTMLInputElement | null>(null);

  // ── reset + auto-focus при открытии ─────────────────────────────────
  useEffect(() => {
    if (!open) return;
    setQuantity("");
    // currentPrice может прийти NaN/Infinity (например если у актива
    // ни разу не было успешного парса). Без явного isFinite-чека
    // toFixed(2) может вернуть "NaN" в input — поле сразу
    // невалидное.
    const safePrice = Number.isFinite(currentPrice) && currentPrice > 0
      ? currentPrice.toFixed(2)
      : "";
    setPrice(safePrice);
    setConvertToUsd(true);
    setError(null);
    const id = window.setTimeout(() => qtyInputRef.current?.focus(), 60);
    return () => window.clearTimeout(id);
  }, [open, currentPrice]);

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

  const qtyNum = Number(quantity);
  const priceNum = Number(price);
  const isQtyValid = Number.isFinite(qtyNum) && qtyNum > 0 && qtyNum <= available;
  const isPriceValid = Number.isFinite(priceNum) && priceNum > 0;
  const total = isQtyValid && isPriceValid ? qtyNum * priceNum : 0;

  const submit = async (e?: FormEvent) => {
    e?.preventDefault();

    if (!Number.isFinite(qtyNum) || qtyNum <= 0) {
      setError(t("errorQtyMin"));
      return;
    }
    if (qtyNum > available) {
      setError(t("errorQtyMax"));
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setError(t("errorPriceMin"));
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(API_ENDPOINTS.PORTFOLIO_SELL_ASSET, {
        method: "PATCH",
        credentials: "include",
        headers,
        body: JSON.stringify({
          portfolioId,
          assetTicker: ticker,
          quantity: qtyNum,
          pricePerUnit: priceNum,
          convertToUsd,
        }),
      });
      if (!res.ok) {
        const msg = await extractApiError(res, tApi, t("errorSellFailed"));
        console.error("[Sell] failed", res.status, msg);
        setError(msg);
        return;
      }
      onSold?.();
      onClose();
    } catch (err) {
      console.error("[Sell] threw", err);
      setError(t("errorSellFailed"));
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
        aria-labelledby="sell-modal-title"
        className={classes.dialog}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={classes.header}>
          <h2 id="sell-modal-title" className={classes.title}>
            {t("sellTitle", { ticker })}
          </h2>
          <p className={classes.subtitle}>
            {t("sellSubtitle", {
              ticker,
              qty: formatQty(available),
            })}
          </p>
        </header>

        <label className={classes.field}>
          <span className={classes.label}>{t("sellQuantityLabel")}</span>
          <div className={classes.qtyRow}>
            <input
              ref={qtyInputRef}
              type="number"
              inputMode="decimal"
              step="any"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className={classes.input}
              disabled={submitting}
            />
            <button
              type="button"
              className={classes.maxBtn}
              onClick={() => setQuantity(String(available))}
              disabled={submitting}
            >
              {t("sellMaxButton")}
            </button>
          </div>
        </label>

        <label className={classes.field}>
          <span className={classes.label}>{t("sellPriceLabel")}</span>
          <input
            type="number"
            inputMode="decimal"
            step="any"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={classes.input}
            disabled={submitting}
          />
        </label>

        <div className={classes.totalRow}>
          {t("sellTotalLabel", { amount: formatUsd(total) })}
        </div>

        <label className={classes.checkboxRow}>
          <input
            type="checkbox"
            checked={convertToUsd}
            onChange={(e) => setConvertToUsd(e.target.checked)}
            disabled={submitting}
            className={classes.checkbox}
          />
          <span className={classes.checkboxLabel}>{t("sellConvertLabel")}</span>
        </label>

        {error && <p className={classes.error}>{error}</p>}

        <div className={classes.actions}>
          <button
            type="button"
            className={classes.cancelBtn}
            onClick={onClose}
            disabled={submitting}
          >
            {t("sellCancel")}
          </button>
          <button
            type="submit"
            className={classes.confirmBtn}
            disabled={submitting || !isQtyValid || !isPriceValid}
          >
            {submitting ? t("sellSubmitting") : t("sellSubmit")}
          </button>
        </div>
      </form>
    </div>
  );
};
