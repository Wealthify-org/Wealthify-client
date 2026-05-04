"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { ROUTES } from "@/lib/routes";
import { useTokenStore } from "@/stores/tokenStore/TokenProvider";
import { Markdown } from "@/components/UI/Markdown/Markdown";

import classes from "./PortfolioRecommendations.module.css";

type Level = "warning" | "info" | "positive";

type Recommendation = {
  level: Level;
  title: string;
  description: string;
  action?: string;
};

type RecommendationsResult = {
  portfolioId: number;
  riskBucket: string | null;
  source: "llm" | "rules-fallback";
  recommendations: Recommendation[];
  generatedAt: string;
};

type Props = { portfolioId: string | number };

export const PortfolioRecommendations = ({ portfolioId }: Props) => {
  const tokenStore = useTokenStore();
  const t = useTranslations("recommendations");
  const locale = useLocale();
  const lang: "en" | "ru" = locale === "en" ? "en" : "ru";

  const [data, setData] = useState<RecommendationsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  const headers = useMemo(() => {
    const h: Record<string, string> = {};
    if (tokenStore.token) h.Authorization = `Bearer ${tokenStore.token}`;
    return h;
  }, [tokenStore.token]);

  useEffect(() => {
    if (!tokenStore.token) return;
    // Защищаемся от мусорного portfolioId — раньше при подсунутой строке
    // вроде "abc" GET'ом улетал «/portfolios/abc/recommendations» и
    // бэкенд молча 400-ил, фронт показывал loadError.
    const idStr = String(portfolioId);
    if (!/^\d+$/.test(idStr)) {
      setError(t("loadError"));
      setLoading(false);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${API_ENDPOINTS.PORTFOLIO_RECOMMENDATIONS(idStr)}?lang=${lang}`,
          {
            method: "GET",
            credentials: "include",
            headers,
            cache: "no-store",
            signal: controller.signal,
          },
        );
        if (!res.ok) {
          throw new Error(`Recommendations fetch failed: ${res.status}`);
        }
        const body = (await res.json()) as RecommendationsResult;
        if (!cancelled) setData(body);
      } catch (e) {
        if ((e as Error)?.name === "AbortError") return;
        console.error("[Recommendations] load error", e);
        if (!cancelled) setError(t("loadError"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [portfolioId, headers, tokenStore.token, reloadTick, lang, t]);

  return (
    <section className={classes.root}>
      <header className={classes.header}>
        <div>
          <h2 className={classes.title}>{t("title")}</h2>
          <p className={classes.subtitle}>
            {data?.riskBucket
              ? t("subtitleWithProfile", { bucket: data.riskBucket })
              : t("subtitleNoProfile")}
          </p>
        </div>
        <div className={classes.headerActions}>
          {data && (
            <span
              className={`${classes.sourceBadge} ${
                data.source === "llm" ? classes.sourceLlm : classes.sourceRules
              }`}
            >
              {data.source === "llm" ? t("sourceLlm") : t("sourceRules")}
            </span>
          )}
          <button
            type="button"
            className={classes.refreshButton}
            onClick={() => setReloadTick((tick) => tick + 1)}
            disabled={loading}
            aria-label={t("refresh")}
          >
            <RefreshIcon spinning={loading} />
          </button>
        </div>
      </header>

      {!data?.riskBucket && !loading && (
        <Link href={ROUTES.RISK_PROFILE} className={classes.cta}>
          <ShieldCheckIcon />
          <span>
            <strong>{t("ctaTakeTest")}</strong>
            <span className={classes.ctaSub}>
              {t("ctaSub")}
            </span>
          </span>
          <span className={classes.ctaArrow}>→</span>
        </Link>
      )}

      {loading && (
        <ul className={classes.list}>
          {[0, 1, 2].map((i) => (
            <li key={i} className={classes.skeleton} />
          ))}
        </ul>
      )}

      {error && !loading && (
        <p className={classes.errorBanner}>{error}</p>
      )}

      {!loading && !error && data && data.recommendations.length > 0 && (
        <ul className={classes.list}>
          {data.recommendations.map((r, idx) => (
            <li
              key={idx}
              className={`${classes.card} ${classes[`level_${r.level}`]}`}
            >
              <div className={classes.cardHeader}>
                <LevelIcon level={r.level} />
                <span className={classes.cardLevel}>
                  {t(`levels.${r.level}`)}
                </span>
              </div>
              <h3 className={classes.cardTitle}>{r.title}</h3>
              <div className={classes.cardDescription}>
                <Markdown variant="card">{r.description}</Markdown>
              </div>
              {r.action && (
                <div className={classes.cardAction}>
                  <span className={classes.cardActionLabel}>{t("actionLabel")}</span>
                  <div className={classes.cardActionBody}>
                    <Markdown variant="card">{r.action}</Markdown>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

// ── inline icons ───────────────────────────────────────────────────────────

const LevelIcon = ({ level }: { level: Level }) => {
  if (level === "warning") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    );
  }
  if (level === "positive") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
};

const ShieldCheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3 4 6v6c0 4.5 3.2 8.4 8 9 4.8-.6 8-4.5 8-9V6l-8-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const RefreshIcon = ({ spinning }: { spinning?: boolean }) => (
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
    style={spinning ? { animation: "spin 0.9s linear infinite" } : undefined}
  >
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    <style>{`
      @keyframes spin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
    `}</style>
  </svg>
);
