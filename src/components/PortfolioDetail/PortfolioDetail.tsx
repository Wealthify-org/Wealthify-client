"use client";

import { useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
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

const PERIODS: { id: Period; label: string }[] = [
  { id: "24h", label: "24h" },
  { id: "7d", label: "7d" },
  { id: "30d", label: "1m" },
  { id: "90d", label: "3m" },
  { id: "1y", label: "1y" },
  { id: "max", label: "All" },
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

const SLICE_COLORS = [
  "#5C7CFA",
  "#FFB454",
  "#F97676",
  "#FFD43B",
  "#7AC74F",
  "#7E8DFF",
  "#FF77B7",
  "#37BDB6",
  "#9B7BD9",
  "#FF9F43",
];

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
          if (!cancelled) setError("Portfolio not found");
          return;
        }
        if (res.status === 403) {
          if (!cancelled) setError("This portfolio doesn't belong to you");
          return;
        }
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const body = (await res.json()) as PortfolioDetailResponse;
        if (!cancelled) setData(body);
      } catch (e) {
        console.error("[PortfolioDetail]", e);
        if (!cancelled) setError("Failed to load portfolio");
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
    return (
      <section className={classes.errorContainer}>
        <h2 className={classes.errorTitle}>{error ?? "Portfolio not found"}</h2>
      </section>
    );
  }

  const totalValue = data.totalValueUsd;
  const isLossDay = data.change24hAbsUsd < 0;
  const isLossTotal = data.totalProfitUsd < 0;

  const positions = data.assets.filter((a) => a.quantity > 0 && a.valueUsd > 0);
  const sliceData = positions.map((a, i) => ({
    name: a.ticker,
    value: a.valueUsd,
    color: SLICE_COLORS[i % SLICE_COLORS.length],
  }));

  const totalForWeights = sliceData.reduce((s, d) => s + d.value, 0);

  const sortedByPct = [...positions].sort((a, b) => b.profitPct - a.profitPct);
  const topPerformer = sortedByPct[0];
  const worstPerformer = sortedByPct[sortedByPct.length - 1];

  return (
    <section className={classes.root}>
      <header className={classes.header}>
        <h1 className={classes.title}>Portfolio: &quot;{data.name}&quot;</h1>
        <p className={classes.subtitle}>Category: {data.type}</p>
      </header>

      <div className={classes.gridTop}>
        <div className={classes.balanceCard}>
          <div className={classes.balanceCardHeader}>
            <span>Current balance:</span>
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
              <dt>Current profit:</dt>
              <dd className={isLossTotal ? classes.textNegative : classes.textPositive}>
                {data.totalProfitUsd >= 0 ? "+" : "-"}
                {formatUsd(Math.abs(data.totalProfitUsd))} ({formatPct(data.totalProfitPct)})
              </dd>
            </div>
            <div className={classes.balanceMetaRow}>
              <dt>Total invested:</dt>
              <dd>{formatUsd(data.totalInvestedUsd)}</dd>
            </div>
          </dl>
        </div>

        <div className={classes.chartCard}>
          <div className={classes.chartCardHeader}>
            <h2 className={classes.chartCardTitle}>Portfolio chart</h2>
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
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className={classes.chartCardBody}>
            {chartLoading ? (
              <div className={classes.chartLoading}>Loading…</div>
            ) : chartSeries.length === 0 ? (
              <div className={classes.chartLoading}>
                Not enough data for this period
              </div>
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
                      background: "var(--background-light-tinted-color)",
                      borderRadius: 6,
                      border: "1px solid var(--secondary-color)",
                      color: "var(--main-text)",
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
      </div>

      <div className={classes.gridBottom}>
        <div className={classes.weightsCard}>
          <h3 className={classes.weightsTitle}>Assets weights chart:</h3>
          {sliceData.length === 0 ? (
            <p className={classes.empty}>Add assets to this portfolio to see weights.</p>
          ) : (
            <div className={classes.weightsBody}>
              <div className={classes.weightsChartWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sliceData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="60%"
                      outerRadius="90%"
                      paddingAngle={2}
                      stroke="none"
                    >
                      {sliceData.map((s, i) => (
                        <Cell key={s.name} fill={s.color} />
                      ))}
                    </Pie>
                    <PieTooltip
                      contentStyle={{
                        background: "var(--background-light-tinted-color)",
                        borderRadius: 6,
                        border: "1px solid var(--secondary-color)",
                        color: "var(--main-text)",
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
                    <span className={classes.weightsLegendValue}>
                      {((s.value / totalForWeights) * 100).toFixed(1)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className={classes.performersCard}>
          <h3 className={classes.performersTitle}>Best and worst performers</h3>
          {!topPerformer ? (
            <p className={classes.empty}>Need positions to compare.</p>
          ) : (
            <div className={classes.performersBody}>
              <PerformerRow
                kind="top"
                name={topPerformer.name}
                ticker={topPerformer.ticker}
                logo={topPerformer.logoUrlLocal}
                profitUsd={topPerformer.profitUsd}
                profitPct={topPerformer.profitPct}
              />
              {worstPerformer && worstPerformer.assetId !== topPerformer.assetId && (
                <PerformerRow
                  kind="worst"
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
      </div>

      <div className={classes.tableCard}>
        <h3 className={classes.tableTitle}>Holdings</h3>
        {positions.length === 0 ? (
          <p className={classes.empty}>No positions in this portfolio yet.</p>
        ) : (
          <div className={classes.tableScroller}>
            <table className={classes.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price / 24h%</th>
                  <th>24h profit</th>
                  <th>Avg buy price</th>
                  <th>Total profit / %</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((a) => (
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
        )}
      </div>
    </section>
  );
});

// formatUsd / formatPct are defined above and shared by PerformerRow

type PerformerProps = {
  kind: "top" | "worst";
  name: string;
  ticker: string;
  logo: string | null;
  profitUsd: number;
  profitPct: number;
};

const PerformerRow = ({
  kind,
  name,
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
          alt={`${name} logo`}
          className={classes.performerLogo}
        />
      ) : (
        <span className={classes.performerLogoPlaceholder} />
      )}
      <div className={classes.performerText}>
        <span className={classes.performerKind}>
          {isWorst ? "Worst performer" : "Top performer"}
        </span>
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
