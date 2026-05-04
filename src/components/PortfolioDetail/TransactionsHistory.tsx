"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { useTokenStore } from "@/stores/tokenStore/TokenProvider";
import { ConfirmModal } from "@/components/UI/ConfirmModal/ConfirmModal";

import classes from "./TransactionsHistory.module.css";

type TransactionType = "BUY" | "SELL";

type Transaction = {
  id: number;
  portfolioId: number;
  assetId: number;
  type: TransactionType;
  quantity: number;
  pricePerUnit: number;
  date: string;
};

type Props = {
  portfolioId: number | string;
  /** Сопоставление assetId → ticker для отображения (берём из holdings портфеля). */
  tickerByAssetId: Record<number, string>;
  /** Меняется при добавлении/продаже/удалении актива — триггерит refetch транзакций. */
  refreshKey: number;
  /** Колбэк после успешного удаления — родителю надо переподтянуть портфель. */
  onTransactionDeleted: () => void;
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

const formatDate = (raw: string, locale: string): string => {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(locale === "ru" ? "ru-RU" : "en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const TransactionsHistory = ({
  portfolioId,
  tickerByAssetId,
  refreshKey,
  onTransactionDeleted,
}: Props) => {
  const tokenStore = useTokenStore();
  const t = useTranslations("transactions");

  const [items, setItems] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<Transaction | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const headers = useMemo(() => {
    const h: Record<string, string> = {};
    if (tokenStore.token) h.Authorization = `Bearer ${tokenStore.token}`;
    return h;
  }, [tokenStore.token]);

  // ── load ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!tokenStore.token) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          API_ENDPOINTS.TRANSACTIONS_BY_PORTFOLIO(portfolioId),
          {
            method: "GET",
            credentials: "include",
            headers,
            cache: "no-store",
          },
        );
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = (await res.json()) as Transaction[];
        if (cancelled) return;
        // сортируем по дате убыванию — самые свежие сверху
        const sorted = [...data].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        setItems(sorted);
      } catch (e) {
        console.error("[Transactions] load failed", e);
        if (!cancelled) setError(t("loadFailed"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [portfolioId, headers, tokenStore.token, refreshKey, t]);

  const locale = typeof navigator !== "undefined" ? navigator.language : "en";

  // ── delete ────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!confirmDelete) return;
    // Защита от race-window: если хэндлер вызвали повторно ДО того,
    // как setDeletePending дошёл до commit'а в state (например, два
    // быстрых onClick прошли через React batching), второй вызов
    // увидит deletePending=true и просто выйдет.
    if (deletePending) return;
    setDeletePending(true);
    setDeleteError(null);
    try {
      const res = await fetch(API_ENDPOINTS.TRANSACTION_DELETE(confirmDelete.id), {
        method: "DELETE",
        credentials: "include",
        headers,
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.error("[Transactions] delete failed", res.status, body);
        setDeleteError(t("deleteFailed"));
        return;
      }
      // успех — закрываем confirm + триггерим refresh у родителя
      setConfirmDelete(null);
      onTransactionDeleted();
    } catch (e) {
      console.error("[Transactions] delete threw", e);
      setDeleteError(t("deleteFailed"));
    } finally {
      setDeletePending(false);
    }
  };

  return (
    <div className={classes.card}>
      <h3 className={classes.title}>{t("title")}</h3>

      {loading && items.length === 0 ? (
        <div className={classes.loading}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={classes.skeleton} />
          ))}
        </div>
      ) : error ? (
        <p className={classes.empty}>{error}</p>
      ) : items.length === 0 ? (
        <p className={classes.empty}>{t("empty")}</p>
      ) : (
        <div className={classes.scroller}>
          <table className={classes.table}>
            <thead>
              <tr>
                <th>{t("tableHeaders.type")}</th>
                <th>{t("tableHeaders.asset")}</th>
                <th className={classes.numeric}>{t("tableHeaders.quantity")}</th>
                <th className={classes.numeric}>{t("tableHeaders.price")}</th>
                <th className={classes.numeric}>{t("tableHeaders.total")}</th>
                <th>{t("tableHeaders.date")}</th>
                <th className={classes.actionsHead} aria-hidden="true">
                  {t("tableHeaders.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((tx) => {
                const ticker = tickerByAssetId[tx.assetId] ?? `#${tx.assetId}`;
                const total = tx.quantity * tx.pricePerUnit;
                const isBuy = tx.type === "BUY";
                return (
                  <tr key={tx.id} className={classes.row}>
                    <td>
                      <span
                        className={`${classes.typeBadge} ${
                          isBuy ? classes.typeBuy : classes.typeSell
                        }`}
                      >
                        {isBuy ? t("typeBuy") : t("typeSell")}
                      </span>
                    </td>
                    <td className={classes.assetCell}>{ticker}</td>
                    <td className={classes.numeric}>
                      {formatQty(tx.quantity)}
                    </td>
                    <td className={classes.numeric}>
                      {formatUsd(tx.pricePerUnit)}
                    </td>
                    <td className={classes.numeric}>{formatUsd(total)}</td>
                    <td className={classes.dateCell}>
                      {formatDate(tx.date, locale)}
                    </td>
                    <td className={classes.actionsCell}>
                      <button
                        type="button"
                        className={classes.deleteBtn}
                        aria-label={t("deleteAria")}
                        title={t("deleteAria")}
                        onClick={() => setConfirmDelete(tx)}
                      >
                        <TrashIcon />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={confirmDelete !== null}
        title={t("deleteTitle")}
        body={<p>{t("deleteBody")}</p>}
        confirmLabel={t("deleteConfirm")}
        cancelLabel={t("deleteCancel")}
        variant="danger"
        pending={deletePending}
        error={deleteError}
        onCancel={() => {
          if (!deletePending) {
            setConfirmDelete(null);
            setDeleteError(null);
          }
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
};

const TrashIcon = () => (
  <svg
    width="15"
    height="15"
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
