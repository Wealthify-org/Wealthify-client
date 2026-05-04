"use client";

import { useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useTranslations } from "next-intl";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as PieTooltip,
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as LineTooltip,
} from "recharts";

import { API, API_ENDPOINTS } from "@/lib/apiEndpoints";
import { useTokenStore } from "@/stores/tokenStore/TokenProvider";
import { useCurrentUserStore } from "@/stores/currentUser/CurrentUserProvider";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";

import { PortfolioRecommendations } from "@/components/PortfolioRecommendations/PortfolioRecommendations";
import { useCategoryFilterStore } from "@/stores/categoryFilterStore/CategoryFilterProvider";

import classes from "./PortfolioDetail.module.css";

type AssetEntry = {
  assetId: number;
  ticker: string;
  name: string;
  type: "Crypto" | "Stocks" | "Bonds" | "Fiat";
  quantity: number;
  averageBuyPrice: number;
  currentPriceUsd: number;
  change24HUsdPct: number;
  valueUsd: number;
  investedUsd: number;
  profitUsd: number;
  profitPct: number;
  change24hAbsUsd: number;
  logoUrlLocal: string | null;
  /** id наших категорий — для client-side фильтра */
  categoryIds?: string[] | null;
};

type PortfolioDetailResponse = {
  id: number;
  name: string;
  type: AssetEntry["type"];
  userId: number;
  totalValueUsd: number;
  totalInvestedUsd: number;
  change24hAbsUsd: number;
  change24hPct: number;
  totalProfitUsd: number;
  totalProfitPct: number;
  assets: AssetEntry[];
};

type Period = "24h" | "7d" | "30d" | "90d" | "1y" | "max";

const PERIODS: { id: Period; labelKey: "h24" | "d7" | "d30" | "d90" | "d365" | "max" }[] = [
  { id: "24h", labelKey: "h24" },
  { id: "7d", labelKey: "d7" },
  { id: "30d", labelKey: "d30" },
  { id: "90d", labelKey: "d90" },
  { id: "1y", labelKey: "d365" },
  { id: "max", labelKey: "max" },
];

const seriesKeyFor = (period: Period): string => {
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

/**
 * Кураторская палитра под общий вид сайта (tailwind-500/600 ряды) — не яркие
 * Figma-цвета, но с тем же ритмом: 6 различимых оттенков + нейтральный для
 * категории "Others".
 */
const SLICE_COLORS = [
  "#6366F1", // indigo (совпадает с accent)
  "#10B981", // emerald
  "#F59E0B", // amber
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#A855F7", // violet
];

const OTHERS_COLOR = "#94A3B8"; // slate-400 — нейтральный

const MAX_VISIBLE_SLICES = 5; // верхние 5 + "Others"
const MIN_LABEL_PCT = 4; // не подписываем сегменты < 4%, чтобы не накладывались

const formatUsd = (v: number | null | undefined): string => {
  if (v == null || !Number.isFinite(v)) return "$0.00";
  return v.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatBigUsd = (v: number | null | undefined): string => {
  if (v == null || !Number.isFinite(v)) return "—";
  const abs = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(2)}K`;
  return `${sign}$${abs.toFixed(2)}`;
};

const formatPct = (v: number | null | undefined): string => {
  if (v == null || !Number.isFinite(v)) return "—";
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}%`;
};

type Props = { portfolioId: string };

export const PortfolioDetail = observer(({ portfolioId }: Props) => {
  const tokenStore = useTokenStore();
  const currentUser = useCurrentUserStore();
  const router = useRouter();
  const t = useTranslations("portfolioDetail");
  const tPeriod = useTranslations("assetDetail.periodLabels");
  const tSidebar = useTranslations("sidebar");
  const categoryStore = useCategoryFilterStore();
  const category = categoryStore.selected;

  const [data, setData] = useState<PortfolioDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>("1y");
  const [chartSeries, setChartSeries] = useState<{ ts: number; value: number }[]>([]);
  const [chartLoading, setChartLoading] = useState(false);

  const headers = useMemo(() => {
    const h: Record<string, string> = {};
    if (tokenStore.token) h.Authorization = `Bearer ${tokenStore.token}`;
    return h;
  }, [tokenStore.token]);

  useEffect(() => {
    if (currentUser.hydrated && !currentUser.isAuthenticated) {
      router.replace(`${ROUTES.SIGN_IN}?from=${encodeURIComponent(`/portfolios/${portfolioId}`)}`);
    }
  }, [currentUser.hydrated, currentUser.isAuthenticated, portfolioId, router]);

  useEffect(() => {
    if (!tokenStore.token) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(API_ENDPOINTS.PORTFOLIO_DETAIL(portfolioId), {
          method: "GET",
          credentials: "include",
          headers,
        });
        if (res.status === 404) {
          if (!cancelled) setError("notFound");
          return;
        }
        if (res.status === 403) {
          if (!cancelled) setError("forbidden");
          return;
        }
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const body = (await res.json()) as PortfolioDetailResponse;
        if (!cancelled) setData(body);
      } catch (e) {
        console.error("[PortfolioDetail]", e);
        if (!cancelled) setError("loadFailed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [portfolioId, headers, tokenStore.token]);

  // загружаем агрегированный chart портфеля как взвешенную сумму по графикам активов
  useEffect(() => {
    if (!data) return;
    let cancelled = false;
    const load = async () => {
      setChartLoading(true);
      try {
        const positions = data.assets.filter((a) => a.quantity > 0);
        if (!positions.length) {
          if (!cancelled) setChartSeries([]);
          return;
        }
        const responses = await Promise.all(
          positions.map(async (a) => {
            const res = await fetch(API_ENDPOINTS.GET_ASSET_CHARTS(a.ticker), {
              method: "GET",
              cache: "no-store",
            });
            if (!res.ok) return null;
            const json = (await res.json()) as Record<string, [number, number][] | undefined>;
            return { quantity: a.quantity, points: json[seriesKeyFor(period)] ?? [] };
          }),
        );

        if (cancelled) return;

        const buckets = new Map<number, number>();
        for (const r of responses) {
          if (!r) continue;
          for (const [ts, price] of r.points) {
            const bucket = Math.floor(ts / 3600_000) * 3600_000;
            buckets.set(bucket, (buckets.get(bucket) ?? 0) + price * r.quantity);
          }
        }
        const merged = Array.from(buckets.entries())
          .sort(([a], [b]) => a - b)
          .map(([ts, value]) => ({ ts, value }));
        setChartSeries(merged);
      } catch (e) {
        console.error("[PortfolioDetail] chart", e);
        if (!cancelled) setChartSeries([]);
      } finally {
        if (!cancelled) setChartLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [data, period]);

  if (loading) {
    return (
      <section className={classes.skeletonContainer} aria-hidden="true">
        <div className={classes.skeletonHeader} />
        <div className={classes.skeletonSplit}>
          <div className={classes.skeletonLeft} />
          <div className={classes.skeletonRight} />
        </div>
      </section>
    );
  }

  if (error || !data) {
    const errorMsg =
      error === "forbidden"
        ? t("errorForbidden")
        : error === "loadFailed"
        ? t("errorLoadFailed")
        : t("errorNotFound");
    return (
      <section className={classes.errorContainer}>
        <h2 className={classes.errorTitle}>{errorMsg}</h2>
      </section>
    );
  }

  const totalValue = data.totalValueUsd;
  const isLossDay = data.change24hAbsUsd < 0;
  const isLossTotal = data.totalProfitUsd < 0;

  const positions = data.assets.filter((a) => a.quantity > 0 && a.valueUsd > 0);

  // ── donut: топ-5 + Others ──────────────────────────────────────────────
  const sortedPositions = [...positions].sort((a, b) => b.valueUsd - a.valueUsd);
  const totalForWeights = sortedPositions.reduce((s, a) => s + a.valueUsd, 0);

  type Slice = { name: string; value: number; color: string };
  let sliceData: Slice[];
  if (sortedPositions.length <= MAX_VISIBLE_SLICES + 1) {
    sliceData = sortedPositions.map((a, i) => ({
      name: a.ticker,
      value: a.valueUsd,
      color: SLICE_COLORS[i % SLICE_COLORS.length],
    }));
  } else {
    const top = sortedPositions.slice(0, MAX_VISIBLE_SLICES);
    const rest = sortedPositions.slice(MAX_VISIBLE_SLICES);
    const restSum = rest.reduce((s, a) => s + a.valueUsd, 0);
    sliceData = [
      ...top.map((a, i) => ({
        name: a.ticker,
        value: a.valueUsd,
        color: SLICE_COLORS[i % SLICE_COLORS.length],
      })),
      { name: "OTHERS", value: restSum, color: OTHERS_COLOR },
    ];
  }

  const sortedByPct = [...positions].sort((a, b) => b.profitPct - a.profitPct);
  const topPerformer = sortedByPct[0];
  const worstPerformer = sortedByPct[sortedByPct.length - 1];

  // ── donut label: позиционируем "%" поверх сегментов в виде маленькой плашки ─
  const renderSliceLabel = (props: {
    cx?: number | string;
    cy?: number | string;
    midAngle?: number;
    innerRadius?: number | string;
    outerRadius?: number | string;
    percent?: number;
  }) => {
    const toNum = (v: number | string | undefined): number =>
      typeof v === "number" ? v : v ? Number(v) || 0 : 0;
    const cx = toNum(props.cx);
    const cy = toNum(props.cy);
    const midAngle = props.midAngle ?? 0;
    const innerRadius = toNum(props.innerRadius);
    const outerRadius = toNum(props.outerRadius);
    const percent = props.percent ?? 0;
    const pct = percent * 100;
    if (pct < MIN_LABEL_PCT) return null;
    const RAD = Math.PI / 180;
    // позиция — в середине толщины ринга
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + r * Math.cos(-midAngle * RAD);
    const y = cy + r * Math.sin(-midAngle * RAD);

    const label = `${Math.round(pct)}%`;
    const w = 36;
    const h = 18;

    return (
      <g pointerEvents="none">
        <rect
          x={x - w / 2}
          y={y - h / 2}
          width={w}
          height={h}
          rx={5}
          ry={5}
          strokeWidth={1}
          style={{
            fill: "var(--donut-label-bg)",
            stroke: "var(--donut-label-border)",
          }}
        />
        <text
          x={x}
          y={y + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={11}
          fontWeight={600}
          letterSpacing="0.04em"
          style={{ fill: "var(--donut-label-text)" }}
        >
          {label}
        </text>
      </g>
    );
  };

  return (
    <section className={classes.root}>
      <div className={classes.layoutGrid}>
        {/* ─────────── LEFT column ─────────── */}
        <aside className={classes.leftCol}>
          <header className={classes.headerCard}>
            <h1 className={classes.headerTitle}>
              {t("portfolio")}: <span className={classes.headerName}>&quot;{data.name}&quot;</span>
            </h1>
            <p className={classes.headerCategory}>
              {t("category")}: <span>{data.type}</span>
            </p>
          </header>

          <div className={classes.balanceCard}>
            <div className={classes.balanceCardHeader}>
              <span>{t("currentBalance")}:</span>
              <span className={classes.balanceCardPeriod}>24h</span>
            </div>
            <p className={classes.balanceValue}>{formatUsd(totalValue)}</p>
            <div className={classes.balanceChangeRow}>
              <span
                className={`${classes.balancePct} ${
                  isLossDay ? classes.negative : classes.positive
                }`}
              >
                {formatPct(data.change24hPct)}
              </span>
              <span
                className={`${classes.balanceAbs} ${
                  isLossDay ? classes.textNegative : classes.textPositive
                }`}
              >
                {data.change24hAbsUsd >= 0 ? "+" : "-"}
                {formatUsd(Math.abs(data.change24hAbsUsd))}
              </span>
            </div>

            <dl className={classes.balanceMeta}>
              <div className={classes.balanceMetaRow}>
                <dt>{t("currentProfit")}:</dt>
                <dd className={isLossTotal ? classes.textNegative : classes.textPositive}>
                  {data.totalProfitUsd >= 0 ? "+" : "-"}
                  {formatUsd(Math.abs(data.totalProfitUsd))} ({formatPct(data.totalProfitPct)})
                </dd>
              </div>
              <div className={classes.balanceMetaRow}>
                <dt>{t("totalInvested")}:</dt>
                <dd>{formatUsd(data.totalInvestedUsd)}</dd>
              </div>
            </dl>
          </div>

          <div className={classes.weightsCard}>
            <h3 className={classes.weightsTitle}>{t("assetsWeights")}:</h3>
            {sliceData.length === 0 ? (
              <p className={classes.empty}>{t("addAssetsHint")}</p>
            ) : (
              <>
                <div className={classes.weightsChartWrapper}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sliceData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius="60%"
                        outerRadius="92%"
                        paddingAngle={2}
                        stroke="none"
                        startAngle={90}
                        endAngle={-270}
                        label={renderSliceLabel}
                        labelLine={false}
                      >
                        {sliceData.map((s) => (
                          <Cell key={s.name} fill={s.color} />
                        ))}
                      </Pie>
                      <PieTooltip
                        contentStyle={{
                          background: "var(--background-elevated)",
                          borderRadius: 8,
                          border: "1px solid var(--border-subtle)",
                          color: "var(--main-text)",
                          fontSize: 12,
                          padding: "6px 10px",
                          boxShadow: "var(--shadow-md)",
                        }}
                        formatter={(value, name) => [
                          `${(((value as number) / totalForWeights) * 100).toFixed(2)}% • ${formatUsd(
                            value as number,
                          )}`,
                          name as string,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className={classes.weightsLegend}>
                  {sliceData.map((s) => (
                    <li key={s.name} className={classes.weightsLegendItem}>
                      <span
                        className={classes.weightsSwatch}
                        style={{ backgroundColor: s.color }}
                      />
                      <span className={classes.weightsLegendName}>{s.name}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className={classes.performersCard}>
            <h3 className={classes.performersTitle}>{t("bestAndWorst")}</h3>
            {!topPerformer ? (
              <p className={classes.empty}>{t("needPositions")}</p>
            ) : (
              <div className={classes.performersBody}>
                <PerformerRow
                  kind="top"
                  kindLabel={t("topPerformer")}
                  name={topPerformer.name}
                  ticker={topPerformer.ticker}
                  logo={topPerformer.logoUrlLocal}
                  profitUsd={topPerformer.profitUsd}
                  profitPct={topPerformer.profitPct}
                />
                {worstPerformer && worstPerformer.assetId !== topPerformer.assetId && (
                  <PerformerRow
                    kind="worst"
                    kindLabel={t("worstPerformer")}
                    name={worstPerformer.name}
                    ticker={worstPerformer.ticker}
                    logo={worstPerformer.logoUrlLocal}
                    profitUsd={worstPerformer.profitUsd}
                    profitPct={worstPerformer.profitPct}
                  />
                )}
              </div>
            )}
          </div>
        </aside>

        {/* ─────────── RIGHT column ─────────── */}
        <div className={classes.rightCol}>
          <div className={classes.chartCard}>
            <div className={classes.chartCardHeader}>
              <h2 className={classes.chartCardTitle}>{t("portfolioChart")}</h2>
              <div className={classes.periodPicker}>
                {PERIODS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`${classes.periodButton} ${
                      p.id === period ? classes.periodButtonActive : ""
                    }`}
                    onClick={() => setPeriod(p.id)}
                  >
                    {tPeriod(p.labelKey)}
                  </button>
                ))}
              </div>
            </div>
            <div className={classes.chartCardBody}>
              {chartLoading ? (
                <div className={classes.chartLoading}>{t("loading")}</div>
              ) : chartSeries.length === 0 ? (
                <div className={classes.chartLoading}>{t("needPositions")}</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartSeries}
                    margin={{ top: 12, right: 12, bottom: 0, left: 0 }}
                  >
                    <defs>
                      <linearGradient id="portfolioFill" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor={isLossDay ? "var(--red-color)" : "var(--green-color)"}
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor={isLossDay ? "var(--red-color)" : "var(--green-color)"}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      stroke="var(--table-horizontal-divider-color)"
                      strokeDasharray="3 3"
                    />
                    <XAxis
                      dataKey="ts"
                      tick={{ fontSize: 11 }}
                      stroke="var(--gray-text-color)"
                      tickFormatter={(t) =>
                        new Date(t).toLocaleString("en-US", { month: "short", day: "numeric" })
                      }
                      minTickGap={40}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      stroke="var(--gray-text-color)"
                      domain={["dataMin", "dataMax"]}
                      tickFormatter={(v) => formatBigUsd(v)}
                      width={60}
                    />
                    <LineTooltip
                      contentStyle={{
                        background: "var(--background-elevated)",
                        borderRadius: 8,
                        border: "1px solid var(--border-subtle)",
                        color: "var(--main-text)",
                        fontSize: 12,
                        padding: "6px 10px",
                        boxShadow: "var(--shadow-md)",
                      }}
                      formatter={(v) => [formatUsd(v as number), "Value"]}
                      labelFormatter={(t) => new Date(t as number).toLocaleString("en-US")}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={isLossDay ? "var(--red-color)" : "var(--green-color)"}
                      strokeWidth={2}
                      fill="url(#portfolioFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <PortfolioRecommendations portfolioId={portfolioId} />

          <div className={classes.tableCard}>
            <h3 className={classes.tableTitle}>{t("holdings")}</h3>
            {(() => {
              // фильтр по категории действует только если он активен
              const visiblePositions = category
                ? positions.filter((a) =>
                    (a.categoryIds ?? []).includes(category),
                  )
                : positions;

              if (positions.length === 0) {
                return <p className={classes.empty}>{t("noPositions")}</p>;
              }

              if (visiblePositions.length === 0) {
                // в портфеле есть активы, но фильтр всё отсёк
                return (
                  <div className={classes.holdingsFilterEmpty}>
                    <p className={classes.holdingsFilterEmptyText}>
                      {tSidebar("filterEmpty", {
                        category: tSidebar(
                          `categoryTags.${category}` as never,
                        ),
                      })}
                    </p>
                    <button
                      type="button"
                      className={classes.holdingsFilterResetBtn}
                      onClick={() => categoryStore.clear()}
                    >
                      {tSidebar("filterReset")}
                    </button>
                  </div>
                );
              }

              return (
              <div className={classes.tableScroller}>
                <table className={classes.table}>
                  <thead>
                    <tr>
                      <th>{t("tableHeaders.name")}</th>
                      <th>{t("tableHeaders.priceAnd24h")}</th>
                      <th>{t("tableHeaders.profit24h")}</th>
                      <th>{t("tableHeaders.avgBuyPrice")}</th>
                      <th>{t("tableHeaders.totalProfit")}</th>
                      <th>{t("tableHeaders.amount")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visiblePositions.map((a) => (
                      <tr
                        key={a.assetId}
                        className={classes.tableRow}
                        onClick={() => router.push(ROUTES.ASSET(a.ticker))}
                      >
                        <td>
                          <div className={classes.assetCell}>
                            {a.logoUrlLocal ? (
                              <img
                                src={`${API}${a.logoUrlLocal}`}
                                alt={`${a.name} logo`}
                                className={classes.assetLogo}
                              />
                            ) : (
                              <span className={classes.assetLogoPlaceholder} />
                            )}
                            <span className={classes.assetNameText}>{a.name}</span>
                            <span className={classes.assetTickerText}>{a.ticker}</span>
                          </div>
                        </td>
                        <td>
                          <div>{formatUsd(a.currentPriceUsd)}</div>
                          <div
                            className={
                              a.change24HUsdPct < 0 ? classes.textNegative : classes.textPositive
                            }
                          >
                            {formatPct(a.change24HUsdPct)}
                          </div>
                        </td>
                        <td
                          className={
                            a.change24hAbsUsd < 0 ? classes.textNegative : classes.textPositive
                          }
                        >
                          {a.change24hAbsUsd >= 0 ? "+" : "-"}
                          {formatUsd(Math.abs(a.change24hAbsUsd))}
                        </td>
                        <td>{formatUsd(a.averageBuyPrice)}</td>
                        <td>
                          <div className={a.profitUsd < 0 ? classes.textNegative : classes.textPositive}>
                            {a.profitUsd >= 0 ? "+" : "-"}
                            {formatUsd(Math.abs(a.profitUsd))}
                          </div>
                          <div className={a.profitPct < 0 ? classes.textNegative : classes.textPositive}>
                            {formatPct(a.profitPct)}
                          </div>
                        </td>
                        <td>
                          <div>{formatUsd(a.valueUsd)}</div>
                          <div className={classes.amountQty}>
                            {a.quantity.toLocaleString("en-US", {
                              maximumFractionDigits: 8,
                            })}{" "}
                            {a.ticker}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              );
            })()}
          </div>
        </div>
      </div>
    </section>
  );
});

type PerformerProps = {
  kind: "top" | "worst";
  kindLabel: string;
  name: string;
  ticker: string;
  logo: string | null;
  profitUsd: number;
  profitPct: number;
};

const PerformerRow = ({
  kind,
  kindLabel,
  ticker,
  logo,
  profitUsd,
  profitPct,
}: PerformerProps) => {
  const isWorst = kind === "worst";
  return (
    <div className={classes.performerRow}>
      {logo ? (
        <img
          src={`${API}${logo}`}
          alt={`${ticker} logo`}
          className={classes.performerLogo}
        />
      ) : (
        <span className={classes.performerLogoPlaceholder} />
      )}
      <div className={classes.performerText}>
        <span className={classes.performerKind}>{kindLabel}</span>
        <span className={classes.performerName}>{ticker}</span>
      </div>
      <div className={classes.performerValues}>
        <span className={isWorst ? classes.textNegative : classes.textPositive}>
          {profitUsd >= 0 ? "+" : "-"}
          {formatUsd(Math.abs(profitUsd))}
        </span>
        <span
          className={`${classes.performerPct} ${
            isWorst ? classes.negative : classes.positive
          }`}
        >
          {formatPct(profitPct)}
        </span>
      </div>
    </div>
  );
};
