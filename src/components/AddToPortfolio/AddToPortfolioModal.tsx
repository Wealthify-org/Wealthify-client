"use client";

import { useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useTranslations } from "next-intl";
import RegistrationModal from "@/components/UI/RegistrationModal/RegistrationModal";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { useTokenStore } from "@/stores/tokenStore/TokenProvider";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";

import classes from "./AddToPortfolioModal.module.css";

type Portfolio = {
  id: number;
  name: string;
  type: "Crypto" | "Stock" | "Bond";
};

type PortfolioListResponse = {
  portfolios: Portfolio[];
};

type Props = {
  ticker: string;
  assetName?: string;
  currentPrice?: number;
  onClose: () => void;
  onSuccess?: () => void;
};

export const AddToPortfolioModal = observer(
  ({ ticker, assetName, currentPrice, onClose, onSuccess }: Props) => {
    const tokenStore = useTokenStore();
    const router = useRouter();
    const t = useTranslations("addToPortfolioModal");

    const [portfolios, setPortfolios] = useState<Portfolio[] | null>(null);
    const [loadingPortfolios, setLoadingPortfolios] = useState(true);
    const [selectedPortfolio, setSelectedPortfolio] = useState<number | "new">(
      "new",
    );
    const [newName, setNewName] = useState("My Portfolio");
    const [newType, setNewType] = useState<Portfolio["type"]>("Crypto");
    const [quantity, setQuantity] = useState("");
    const [purchasePrice, setPurchasePrice] = useState(
      currentPrice ? currentPrice.toFixed(2) : "",
    );
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // отдельная ошибка для загрузки списка портфелей. Раньше при сбое
    // запроса GET /portfolios/user мы тихо ставили `portfolios = []` —
    // юзер видел "у меня нет портфелей" и создавал новый, хотя на
    // самом деле у него были. Лучше явно показать "не удалось загрузить".
    const [portfoliosError, setPortfoliosError] = useState<string | null>(null);

    const headers = useMemo(() => {
      const h: Record<string, string> = { "Content-Type": "application/json" };
      if (tokenStore.token) h.Authorization = `Bearer ${tokenStore.token}`;
      return h;
    }, [tokenStore.token]);

    useEffect(() => {
      let cancelled = false;
      const controller = new AbortController();
      const load = async () => {
        try {
          setLoadingPortfolios(true);
          setPortfoliosError(null);
          const res = await fetch(API_ENDPOINTS.PORTFOLIOS_BY_USER, {
            method: "GET",
            credentials: "include",
            headers,
            signal: controller.signal,
          });
          if (!res.ok) throw new Error(`Failed: ${res.status}`);
          const data = (await res.json()) as PortfolioListResponse;
          if (cancelled) return;
          const list = Array.isArray(data?.portfolios) ? data.portfolios : [];
          setPortfolios(list);
          if (list.length > 0) {
            setSelectedPortfolio(list[0].id);
          }
        } catch (e) {
          if ((e as Error)?.name === "AbortError") return;
          console.error("[AddToPortfolio] load portfolios", e);
          if (!cancelled) {
            setPortfolios([]);
            setPortfoliosError(t("errors.loadPortfoliosFailed"));
          }
        } finally {
          if (!cancelled) setLoadingPortfolios(false);
        }
      };
      void load();
      return () => {
        cancelled = true;
        controller.abort();
      };
    }, [headers, t]);

    const submit = async () => {
      setError(null);
      const qty = Number(quantity);
      const price = Number(purchasePrice);
      if (!Number.isFinite(qty) || qty <= 0) {
        setError(t("errors.qtyRequired"));
        return;
      }
      if (!Number.isFinite(price) || price <= 0) {
        setError(t("errors.priceRequired"));
        return;
      }

      setSubmitting(true);
      try {
        let portfolioId: number;
        if (selectedPortfolio === "new") {
          const trimmed = newName.trim();
          if (!trimmed) {
            setError(t("errors.nameRequired"));
            setSubmitting(false);
            return;
          }
          const res = await fetch(API_ENDPOINTS.PORTFOLIOS_CREATE, {
            method: "POST",
            credentials: "include",
            headers,
            body: JSON.stringify({ name: trimmed, type: newType }),
          });
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body?.message ?? `Create portfolio failed: ${res.status}`);
          }
          const created = (await res.json()) as Portfolio;
          portfolioId = created.id;
        } else {
          portfolioId = Number(selectedPortfolio);
        }

        const addRes = await fetch(API_ENDPOINTS.PORTFOLIO_ADD_ASSET, {
          method: "POST",
          credentials: "include",
          headers,
          body: JSON.stringify({
            portfolioId,
            assetTicker: ticker,
            quantity: qty,
            purchasePrice: price,
          }),
        });

        if (!addRes.ok) {
          const body = await addRes.json().catch(() => ({}));
          throw new Error(body?.message ?? `Failed: ${addRes.status}`);
        }

        // Закрываем модалку ПЕРЕД навигацией — иначе оверлей видно во
        // время перехода (jank-эффект). router.refresh() двигаем тоже
        // до push'а, чтобы целевая страница уже знала про новый актив.
        onSuccess?.();
        onClose();
        router.refresh();
        router.push(ROUTES.PORTFOLIO(portfolioId));
      } catch (e) {
        const msg = e instanceof Error ? e.message : t("errors.addFailed");
        setError(msg);
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <RegistrationModal isOpen onClose={onClose}>
        <div className={classes.container}>
          <h2 className={classes.title}>
            {t("title", { asset: assetName ?? ticker })}
          </h2>

          <div className={classes.fieldGroup}>
            <label className={classes.label} htmlFor="portfolioSelect">
              {t("selectPortfolio")}
            </label>
            <select
              id="portfolioSelect"
              className={classes.input}
              value={selectedPortfolio}
              onChange={(e) =>
                setSelectedPortfolio(
                  e.target.value === "new" ? "new" : Number(e.target.value),
                )
              }
              disabled={loadingPortfolios}
            >
              {(portfolios ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.type})
                </option>
              ))}
              <option value="new">{t("createNew")}</option>
            </select>
            {portfoliosError && (
              <p className={classes.error}>{portfoliosError}</p>
            )}
          </div>

          {selectedPortfolio === "new" && (
            <>
              <div className={classes.fieldGroup}>
                <label className={classes.label} htmlFor="newName">
                  {t("newPortfolioName")}
                </label>
                <input
                  id="newName"
                  className={classes.input}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={t("newPortfolioNamePlaceholder")}
                />
              </div>
              <div className={classes.fieldGroup}>
                <label className={classes.label} htmlFor="newType">
                  {t("portfolioType")}
                </label>
                <select
                  id="newType"
                  className={classes.input}
                  value={newType}
                  onChange={(e) =>
                    setNewType(e.target.value as Portfolio["type"])
                  }
                >
                  <option value="Crypto">{t("types.crypto")}</option>
                  <option value="Stock">{t("types.stock")}</option>
                  <option value="Bond">{t("types.bond")}</option>
                </select>
              </div>
            </>
          )}

          <div className={classes.row}>
            <div className={classes.fieldGroup}>
              <label className={classes.label} htmlFor="qty">
                {t("quantity")}
              </label>
              <input
                id="qty"
                type="number"
                step="any"
                min="0"
                className={classes.input}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className={classes.fieldGroup}>
              <label className={classes.label} htmlFor="price">
                {t("buyPrice")}
              </label>
              <input
                id="price"
                type="number"
                step="any"
                min="0"
                className={classes.input}
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          {(() => {
            const qty = Number(quantity);
            const price = Number(purchasePrice);
            if (Number.isFinite(qty) && Number.isFinite(price) && qty > 0 && price > 0) {
              return (
                <p className={classes.totalLine}>
                  {t("totalCost", { amount: `$${(qty * price).toFixed(2)}` })}
                </p>
              );
            }
            return null;
          })()}

          {error && <p className={classes.error}>{error}</p>}

          <div className={classes.actions}>
            <button
              type="button"
              onClick={onClose}
              className={`${classes.button} ${classes.buttonGhost}`}
              disabled={submitting}
            >
              {t("buttons.cancel")}
            </button>
            <button
              type="button"
              onClick={submit}
              className={`${classes.button} ${classes.buttonPrimary}`}
              disabled={submitting}
            >
              {submitting ? t("buttons.adding") : t("buttons.add")}
            </button>
          </div>
        </div>
      </RegistrationModal>
    );
  },
);
