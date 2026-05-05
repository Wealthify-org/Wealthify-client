"use client";

import { useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useLocale, useTranslations } from "next-intl";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { API, API_ENDPOINTS } from "@/lib/apiEndpoints";
import { ApiAsset, AssetChartsResponse, SeriesPoint } from "@/lib/types/api-assets";
import { useFavoritesStore } from "@/stores/favoritesStore/FavoritesProvider";
import { useCurrentUserStore } from "@/stores/currentUser/CurrentUserProvider";
import { ROUTES } from "@/lib/routes";
import { usePathname, useRouter } from "next/navigation";
import { AddToPortfolioModal } from "../AddToPortfolio/AddToPortfolioModal";

import classes from "./AssetDetail.module.css";

type Period = "24h" | "7d" | "30d" | "90d" | "1y" | "max";

const PERIODS: { id: Period; labelKey: "h24" | "d7" | "d30" | "d90" | "d365" | "max" }[] = [
  { id: "24h", labelKey: "h24" },
  { id: "7d", labelKey: "d7" },
  { id: "30d", labelKey: "d30" },
  { id: "90d", labelKey: "d90" },
  { id: "1y", labelKey: "d365" },
  { id: "max", labelKey: "max" },
];

const seriesKeyFor = (period: Period): keyof AssetChartsResponse => {
  switch (period) {
    case "24h":
      return "h24Stats";
    case "7d":
      return "d7Stats";
    case "30d":
      return "d30Stats";
    case "90d":
      return "d90Stats";
    case "1y":
      return "d365Stats";
    case "max":
      return "maxStats";
  }
};

const formatPrice = (v: number | null | undefined): string => {
  if (v == null || !Number.isFinite(v)) return "—";
  if (Math.abs(v) >= 1) {
    return v.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return `$${v.toPrecision(4)}`;
};

const formatBigNumber = (v: number | null | undefined): string => {
  if (v == null || !Number.isFinite(v)) return "—";
  const abs = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(2)}K`;
  return `${sign}$${abs.toFixed(2)}`;
};

const formatBigNumberPlain = (v: number | null | undefined, suffix = ""): string => {
  if (v == null || !Number.isFinite(v)) return "—";
  const abs = Math.abs(v);
  if (abs >= 1e12) return `${(abs / 1e12).toFixed(2)}T${suffix}`;
  if (abs >= 1e9) return `${(abs / 1e9).toFixed(2)}B${suffix}`;
  if (abs >= 1e6) return `${(abs / 1e6).toFixed(2)}M${suffix}`;
  if (abs >= 1e3) return `${(abs / 1e3).toFixed(2)}K${suffix}`;
  return `${abs.toFixed(2)}${suffix}`;
};

const formatPct = (v: number | null | undefined): string => {
  if (v == null || !Number.isFinite(v)) return "—";
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}%`;
};

// Безопасное форматирование таймстампа: если в чанке данных ts оказался не
// числом (бэкенд иногда отдаёт null для пропусков), Date.toLocaleString
// напечатает "Invalid Date" в подписи оси/тултипа — лучше вернуть прочерк.
const formatChartDate = (
  raw: unknown,
  opts?: Intl.DateTimeFormatOptions,
): string => {
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n)) return "—";
  const d = new Date(n);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", opts);
};

type Props = {
  ticker: string;
};

export const AssetDetail = observer(({ ticker }: Props) => {
  const favoritesStore = useFavoritesStore();
  const currentUser = useCurrentUserStore();
  const router = useRouter();
  // usePathname() — SSR-friendly способ получить текущий путь.
  // Раньше использовали глобальный `location.pathname` в onClick'ах —
  // в самих handler'ах работало (event фаерится только в браузере),
  // но логика чище и безопаснее на следующих рефакторах.
  const pathname = usePathname() ?? "";
  const t = useTranslations("assetDetail");
  const locale = useLocale();

  const [asset, setAsset] = useState<ApiAsset | null>(null);
  const [charts, setCharts] = useState<AssetChartsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("24h");
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  // Русский перевод описания. Хранится отдельно от asset.description —
  // при locale=ru показываем `descriptionRu` (если уже загружен) ИЛИ
  // skeleton (пока грузится). При locale=en всегда оригинал.
  const [descriptionRu, setDescriptionRu] = useState<string | null>(null);
  const [descriptionTranslating, setDescriptionTranslating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Сбрасываем прошлые данные ДО загрузки нового тикера. Раньше при
    // навигации BTC → ETH старый asset оставался в state, пока загружался
    // новый — пользователь видел заголовок «Ethereum» с метриками BTC до
    // секунды. Очищаем сразу — пусть будет skeleton.
    setAsset(null);

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(API_ENDPOINTS.GET_SINGLE_ASSET_DATA(ticker), {
          method: "GET",
          cache: "no-store",
        });
        if (res.status === 404) {
          if (!cancelled) {
            setAsset(null);
            setError("notFound");
          }
          return;
        }
        if (!res.ok) throw new Error(`Failed to fetch asset: ${res.status}`);
        const data = (await res.json()) as ApiAsset;
        if (!cancelled) setAsset(data);
      } catch (e) {
        console.error("[AssetDetail] load error", e);
        if (!cancelled) setError("loadFailed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [ticker]);

  // Загрузка русского перевода описания.
  // Срабатывает только если locale=ru И есть оригинальное description
  // у актива. Endpoint медленный на первый запрос (1-30 секунд — LLM
  // переводит через OpenRouter), но кеширует в БД — следующие запросы
  // мгновенные. На странице показываем skeleton пока грузится.
  useEffect(() => {
    if (locale !== "ru") {
      setDescriptionRu(null);
      setDescriptionTranslating(false);
      return;
    }
    if (!asset?.description) {
      setDescriptionRu(null);
      setDescriptionTranslating(false);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    const load = async () => {
      setDescriptionTranslating(true);
      try {
        const res = await fetch(
          API_ENDPOINTS.GET_ASSET_DESCRIPTION_RU(ticker),
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          },
        );
        if (!res.ok) throw new Error(`description-ru fetch failed: ${res.status}`);
        const body = (await res.json()) as { description: string | null };
        if (!cancelled) {
          setDescriptionRu(body.description ?? null);
        }
      } catch (e) {
        if ((e as Error)?.name === "AbortError") return;
        console.warn("[AssetDetail] description-ru load failed", e);
        // не обнуляем — fallback ниже сам покажет английский
      } finally {
        if (!cancelled) setDescriptionTranslating(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [ticker, locale, asset?.description]);

  useEffect(() => {
    let cancelled = false;

    // Сбрасываем прошлый chart-набор сразу — иначе при навигации между
    // активами recharts на долю секунды отрисует ETH с точками BTC.
    setCharts(null);

    const loadCharts = async () => {
      setChartsLoading(true);
      try {
        const res = await fetch(API_ENDPOINTS.GET_ASSET_CHARTS(ticker), {
          method: "GET",
          cache: "no-store",
        });
        if (res.status === 404) {
          if (!cancelled) setCharts(null);
          return;
        }
        if (!res.ok) throw new Error(`Failed to fetch charts: ${res.status}`);
        const data = (await res.json()) as AssetChartsResponse | null;
        if (!cancelled) setCharts(data);
      } catch (e) {
        console.error("[AssetDetail] charts load error", e);
        if (!cancelled) setCharts(null);
      } finally {
        if (!cancelled) setChartsLoading(false);
      }
    };

    void loadCharts();
    return () => {
      cancelled = true;
    };
  }, [ticker]);

  const series = useMemo(() => {
    if (!charts) return [] as { ts: number; price: number }[];
    const raw = charts[seriesKeyFor(period)] as SeriesPoint[] | undefined;
    if (!Array.isArray(raw) || raw.length === 0) return [];
    // Бывают NaN/null в массивах (пропуски ленты); чищем их, чтобы
    // recharts не рисовал «обрывы» и Math.min/max не схлопывались в NaN.
    return raw
      .filter(
        (pair): pair is [number, number] =>
          Array.isArray(pair) &&
          pair.length === 2 &&
          Number.isFinite(pair[0]) &&
          Number.isFinite(pair[1]),
      )
      .map(([ts, value]) => ({ ts, price: value }));
  }, [charts, period]);

  // Звезда «избранное» не должна моргать в transitional-состояниях:
  //  - до загрузки asset → false (пустой)
  //  - после загрузки asset, но до загрузки favorites store
  //    (`favoritesStore.isReady === false`) — тоже false (нейтральная иконка),
  //    чтобы не показать «не в избранном» когда мы ещё не знаем правды.
  // После того как стор станет ready, MobX автоматически дёрнет ре-рендер.
  const isFavorite =
    asset && favoritesStore.isReady ? favoritesStore.has(asset.id) : false;
  const change24 = asset?.change24HUsdPct ?? null;
  const isNegative24 = (change24 ?? 0) < 0;

  if (loading) {
    return (
      <section className={classes.skeletonContainer} aria-hidden="true">
        <div className={classes.skeletonHeader} />
        <div className={classes.skeletonChart} />
        <div className={classes.skeletonStats} />
      </section>
    );
  }

  if (error || !asset) {
    return (
      <section className={classes.errorContainer}>
        <h2 className={classes.errorTitle}>{t("notFound")}</h2>
        <p className={classes.errorHint}>
          {t("notFoundHint", { ticker })}
        </p>
      </section>
    );
  }

  const handleStarClick = () => {
    if (!currentUser.isAuthenticated) {
      router.push(`${ROUTES.SIGN_IN}?from=${encodeURIComponent(pathname)}`);
      return;
    }
    // Раньше ошибки тогл'а молча гасились через `.catch(() => {})` —
    // если запрос падал (401/500), юзер видел оптимистический rollback
    // и не понимал что ничего не сохранилось. Теперь FavoritesStore
    // сохраняет lastError, который мы логируем в консоль (для дебага).
    // Само состояние UI откатится через MobX reaction.
    void favoritesStore.toggle(asset.id).catch((e) => {
      console.warn("[AssetDetail] favorite toggle failed", e);
    });
  };

  const handleAddToPortfolio = () => {
    if (!currentUser.isAuthenticated) {
      router.push(`${ROUTES.SIGN_IN}?from=${encodeURIComponent(pathname)}`);
      return;
    }
    setShowAddModal(true);
  };

  const categories = (() => {
    const c = asset.categories;
    if (!c) return [] as string[];
    const list = Array.isArray(c) ? c : c.split(/[;,]/);
    return list.map((s) => s.trim()).filter(Boolean);
  })();

  const enhancedDescription = (() => {
    // Если это русская локаль и перевод уже загрузился — берём его.
    // Иначе оригинальный английский (включая случай когда descriptionRu
    // ещё грузится: но тогда мы рендерим skeleton, а не сам блок).
    const rawHtml = locale === "ru" && descriptionRu
      ? descriptionRu
      : asset.description;
    if (!rawHtml) return null;
    let html = rawHtml;
    // strip dangerous tags entirely (incl. content)
    html = html.replace(
      /<\s*(script|style|iframe|object|embed|form|input|link|meta)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi,
      "",
    );
    html = html.replace(
      /<\s*(script|style|iframe|object|embed|form|input|link|meta)\b[^>]*\/?>/gi,
      "",
    );
    // strip all on* event handlers (onload, onclick, etc.)
    html = html.replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, "");
    html = html.replace(/\son[a-z]+\s*=\s*'[^']*'/gi, "");
    html = html.replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, "");
    // neutralize javascript:/data: URLs in href/src
    html = html.replace(
      /\b(href|src)\s*=\s*"(?:javascript|data|vbscript):[^"]*"/gi,
      '$1="#"',
    );
    html = html.replace(
      /\b(href|src)\s*=\s*'(?:javascript|data|vbscript):[^']*'/gi,
      "$1='#'",
    );
    // open external links safely
    html = html.replace(
      /<a\b(?![^>]*\btarget=)/gi,
      '<a target="_blank" rel="noopener noreferrer"',
    );
    // wrap consecutive orphan <li>...</li> blocks in <ul>
    html = html.replace(
      /(?:\s*<li>[\s\S]*?<\/li>)+/gi,
      (match) => `<ul>${match.trim()}</ul>`,
    );

    // нормализуем &nbsp; чтоб был обычный пробел при автопереносе
    // (но оставляем сами &nbsp; внутри уже типографских контекстов)

    // оборачиваем «голый» текст между блоками в <p>
    // нарезаем по блочным тегам (ul/ol/blockquote/h*/p), оборачиваем хвосты
    const blockTags = "(ul|ol|blockquote|h[1-6]|p|div|hr)";
    const parts = html.split(
      new RegExp(`(<\\s*${blockTags}[\\s\\S]*?<\\s*\\/\\s*\\3\\s*>)`, "gi"),
    );

    const splitTextIntoParagraphs = (text: string): string => {
      const trimmed = text.trim();
      if (!trimmed) return "";

      // 1) если есть двойные переводы — это "официальные" границы абзацев
      const explicit = trimmed.split(/\n\s*\n+/).map((p) => p.trim()).filter(Boolean);
      if (explicit.length > 1) {
        return explicit.map((p) => `<p>${p}</p>`).join("");
      }

      // 2) иначе режем на предложения и группируем по 3-4 в абзац
      // эвристика: «.»/«!»/«?» + пробел + Заглавная или цифра
      const sentences = trimmed.split(/(?<=[.!?])\s+(?=[A-ZА-ЯЁ0-9])/);
      if (sentences.length <= 3) {
        return `<p>${trimmed}</p>`;
      }

      const groupSize = 3;
      const paragraphs: string[] = [];
      for (let i = 0; i < sentences.length; i += groupSize) {
        paragraphs.push(sentences.slice(i, i + groupSize).join(" ").trim());
      }
      return paragraphs.filter(Boolean).map((p) => `<p>${p}</p>`).join("");
    };

    // у split с двумя капчами цикл 3: [text, block, tagName, text, block, tagName, ...]
    html = parts
      .map((chunk, i) => {
        const cycle = i % 3;
        if (cycle === 0) return splitTextIntoParagraphs(chunk ?? "");
        if (cycle === 1) return chunk ?? "";
        return ""; // tagName — отбрасываем
      })
      .join("");

    return html;
  })();

  const lowHigh = (() => {
    if (!series.length) return null;
    const prices = series.map((p) => p.price);
    return { low: Math.min(...prices), high: Math.max(...prices) };
  })();

  return (
    <section className={classes.root}>
      <header className={classes.header}>
        <div className={classes.identity}>
          {asset.logoUrlLocal ? (
            <img
              src={`${API}${asset.logoUrlLocal}`}
              alt={`${asset.name} logo`}
              className={classes.logo}
            />
          ) : (
            <div className={classes.logoPlaceholder} />
          )}
          <div className={classes.identityText}>
            <h1 className={classes.title}>
              {asset.name}{" "}
              <span className={classes.titleTicker}>{asset.ticker}</span>
            </h1>
            <div className={classes.meta}>
              {asset.rank ? <span className={classes.rank}>#{asset.rank}</span> : null}
              {categories.length > 0 && (
                <ul className={classes.categoryList} role="list">
                  {categories.map((cat) => (
                    <li key={cat} className={classes.categoryBadge}>
                      {cat}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className={classes.headerActions}>
          <button
            type="button"
            onClick={handleStarClick}
            className={`${classes.starButton} ${isFavorite ? classes.starActive : ""}`}
            aria-label={isFavorite ? t("removeFromFavorites") : t("addToFavorites")}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path
                d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                fill={isFavorite ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={1.5}
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleAddToPortfolio}
            className={classes.addToPortfolioButton}
          >
            {t("addToPortfolio")}
          </button>
        </div>
      </header>

      <div className={classes.priceRow}>
        <div className={classes.priceMain}>
          <p className={classes.priceLabel}>{t("priceLabel", { ticker: asset.ticker })}</p>
          <p className={classes.price}>{formatPrice(asset.currentPriceUsd)}</p>
          <p
            className={`${classes.priceChange} ${
              isNegative24 ? classes.priceChangeNegative : classes.priceChangePositive
            }`}
          >
            {formatPct(change24)}
          </p>
          {lowHigh && (
            <div className={classes.lowHigh}>
              <span>{t("stats.low")} {formatPrice(lowHigh.low)}</span>
              <span className={classes.lowHighSeparator} />
              <span>{t("stats.high")} {formatPrice(lowHigh.high)}</span>
            </div>
          )}
        </div>

        <div className={classes.statsGrid}>
          <div className={classes.statCard}>
            <span className={classes.statLabel}>{t("stats.marketCap")}</span>
            <span className={classes.statValue}>
              {formatBigNumber(asset.marketCapUsd)}
            </span>
          </div>
          <div className={classes.statCard}>
            <span className={classes.statLabel}>{t("stats.fdv")}</span>
            <span className={classes.statValue}>
              {formatBigNumber(asset.fdvUsd)}
            </span>
          </div>
          <div className={classes.statCard}>
            <span className={classes.statLabel}>{t("stats.volume24h")}</span>
            <span className={classes.statValue}>
              {formatBigNumber(asset.volume24HUsd)}
            </span>
          </div>
          <div className={classes.statCard}>
            <span className={classes.statLabel}>{t("stats.volMcapRatio")}</span>
            <span className={classes.statValue}>
              {asset.volume24HUsd && asset.marketCapUsd
                ? `${((asset.volume24HUsd / asset.marketCapUsd) * 100).toFixed(2)}%`
                : "—"}
            </span>
          </div>
          <div className={classes.statCard}>
            <span className={classes.statLabel}>{t("stats.change1h7d")}</span>
            <span
              className={`${classes.statValue} ${
                (asset.change1HUsdPct ?? 0) < 0
                  ? classes.statValueNegative
                  : classes.statValuePositive
              }`}
            >
              {formatPct(asset.change1HUsdPct)} / {formatPct(asset.change7DUsdPct)}
            </span>
          </div>
          <div className={classes.statCard}>
            <span className={classes.statLabel}>{t("stats.change30d1y")}</span>
            <span
              className={`${classes.statValue} ${
                (asset.change30DUsdPct ?? 0) < 0
                  ? classes.statValueNegative
                  : classes.statValuePositive
              }`}
            >
              {formatPct(asset.change30DUsdPct)} / {formatPct(asset.change1YUsdPct)}
            </span>
          </div>
        </div>
      </div>

      <div className={classes.chartSection}>
        <div className={classes.chartHeader}>
          <h2 className={classes.chartTitle}>{t("chartTitle")}</h2>
          <div className={classes.periodPicker} role="tablist">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                role="tab"
                aria-selected={p.id === period}
                className={`${classes.periodButton} ${
                  p.id === period ? classes.periodButtonActive : ""
                }`}
                onClick={() => setPeriod(p.id)}
                type="button"
              >
                {t(`periodLabels.${p.labelKey}`)}
              </button>
            ))}
          </div>
        </div>
        <div className={classes.chartBody}>
          {chartsLoading ? (
            <div className={classes.chartSkeleton} />
          ) : series.length === 0 ? (
            <div className={classes.chartEmpty}>
              {t("chartEmpty")}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 12, right: 12, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={isNegative24 ? "var(--red-color)" : "var(--green-color)"}
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor={isNegative24 ? "var(--red-color)" : "var(--green-color)"}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--table-horizontal-divider-color)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="ts"
                  tickFormatter={(t) =>
                    formatChartDate(t, { month: "short", day: "numeric" })
                  }
                  stroke="var(--gray-text-color)"
                  tick={{ fontSize: 11 }}
                  minTickGap={40}
                />
                <YAxis
                  stroke="var(--gray-text-color)"
                  tick={{ fontSize: 11 }}
                  domain={["dataMin", "dataMax"]}
                  tickFormatter={(v) => formatBigNumberPlain(v)}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--background-light-tinted-color)",
                    borderRadius: 6,
                    border: "1px solid var(--secondary-color)",
                    color: "var(--main-text)",
                  }}
                  labelFormatter={(t) => formatChartDate(t)}
                  formatter={(value) => [formatPrice(value as number), "Price"]}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={isNegative24 ? "var(--red-color)" : "var(--green-color)"}
                  strokeWidth={2}
                  fill="url(#priceFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Блок «О монете». Три состояния:
          1. Идёт перевод на ru (описание в исходнике есть, но переводчик
             ещё не вернул) → скелетон строк.
          2. Перевод готов либо мы на en-локали → отрендеренный HTML.
          3. У актива нет описания вовсе → блок не показываем. */}
      {(() => {
        const showSkeleton =
          asset.description &&
          locale === "ru" &&
          descriptionTranslating &&
          !descriptionRu;

        if (showSkeleton) {
          return (
            <div className={classes.aboutSection}>
              <h3 className={classes.aboutTitle}>{t("aboutTitle", { name: asset.name })}</h3>
              <div
                className={classes.aboutSkeleton}
                aria-busy="true"
                aria-live="polite"
              >
                <span className={`${classes.aboutSkelLine} ${classes.aboutSkelLine100}`} />
                <span className={`${classes.aboutSkelLine} ${classes.aboutSkelLine95}`} />
                <span className={`${classes.aboutSkelLine} ${classes.aboutSkelLine90}`} />
                <span className={`${classes.aboutSkelLine} ${classes.aboutSkelLine100}`} />
                <span className={`${classes.aboutSkelLine} ${classes.aboutSkelLine80}`} />
              </div>
            </div>
          );
        }

        if (!enhancedDescription) return null;

        return (
          <div className={classes.aboutSection}>
            <h3 className={classes.aboutTitle}>
              {t("aboutTitle", { name: asset.name })}
            </h3>
            <div
              className={classes.aboutText}
              dangerouslySetInnerHTML={{ __html: enhancedDescription }}
            />
          </div>
        );
      })()}

      {showAddModal && (
        <AddToPortfolioModal
          ticker={asset.ticker}
          assetName={asset.name}
          currentPrice={asset.currentPriceUsd ?? undefined}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </section>
  );
});
