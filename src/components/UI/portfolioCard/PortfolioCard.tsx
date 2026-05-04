"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from "recharts";

import classes from "./PortfolioCard.module.css";

export type PortfolioCardProps = {
  title: string;
  category: "Stocks" | "Crypto" | "Bonds" | "Fiat";
  value: number;
  valueChange: number;
  /**
   * Декоративный режим — используется в hero-секции лендинга.
   * Не пытается строить реальный график, не показывает интерактивность.
   */
  isDecorative: boolean;
  /**
   * Sparkline-серия портфеля. Готовый массив суммарных стоимостей по точкам
   * времени (бэкенд `getAllPortfolios` отдаёт `sparklines7d[index]`).
   * Если массив пустой / undefined — график не показывается, карточка
   * остаётся в "пустом" виде с примечанием.
   */
  portfolioValueChangeData?: number[];
  cardClassNames?: string;
  /** Сохранены для обратной совместимости — больше не используются. */
  cardGreenClasses?: string;
  cardRedClasses?: string;
};

const formatUsd = (n: number): string => {
  if (!Number.isFinite(n)) return "$0.00";
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatPct = (n: number): string => {
  if (!Number.isFinite(n)) return "0.00%";
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${Math.abs(n).toFixed(2)}%`;
};

const PortfolioCard = ({
  title,
  category,
  value,
  valueChange,
  portfolioValueChangeData = [],
  isDecorative = true,
  cardClassNames = "",
}: PortfolioCardProps) => {
  const isNegative = valueChange < 0;
  const rawPercentChange = value === 0 ? 0 : (valueChange / value) * 100;

  // Нормализуем sparkline для recharts: array<number> → [{ v: number }, ...]
  // Также обрезаем "пустые" нули в начале (если бэкенд расширил массив до
  // длины самого длинного актива, но кто-то из активов был короче).
  const chartData = useMemo(() => {
    if (!portfolioValueChangeData || portfolioValueChangeData.length === 0) {
      return null;
    }
    return portfolioValueChangeData.map((v) => ({ v }));
  }, [portfolioValueChangeData]);

  const hasChart = chartData !== null && chartData.length >= 2;
  // Литеральные hex'ы — самый надёжный путь. CSS-переменные и `currentColor`
  // не резолвятся внутри SVG `<stop stop-color>` в Recharts, отсюда был
  // серый fill под линией. Цвета подобраны нейтральными для обеих тем
  // (emerald-500 / rose-500), визуально совпадают с --green-color/--red-color.
  const sparkHex = isNegative ? "#F43F5E" : "#10B981";
  const gradId = `spark-${title.replace(/\s+/g, "_")}-${isNegative ? "n" : "p"}`;

  return (
    <article
      aria-labelledby={`${title}-h`}
      className={`${classes.card} ${cardClassNames}`}
      data-decorative={isDecorative ? "1" : undefined}
    >
      {/* ─── Хедер карточки ─────────────────────────────────────────── */}
      <header className={classes.header}>
        <div className={classes.headerTexts}>
          <h3 id={`${title}-h`} className={classes.title}>
            {title}
          </h3>
          <span className={classes.categoryChip} data-category={category}>
            {category}
          </span>
        </div>
      </header>

      {/* ─── Тело: цена + delta + chart ─────────────────────────────── */}
      <div className={classes.body}>
        <div className={classes.valueColumn}>
          <p className={classes.value}>{formatUsd(value)}</p>
          <div className={classes.deltaRow}>
            <span
              className={`${classes.pct} ${
                isNegative ? classes.pctNegative : classes.pctPositive
              }`}
            >
              {formatPct(rawPercentChange)}
            </span>
            <span
              className={
                isNegative ? classes.deltaAbsNegative : classes.deltaAbsPositive
              }
            >
              {valueChange >= 0 ? "+" : "−"}
              {formatUsd(Math.abs(valueChange)).replace(/^[-]/, "")}
            </span>
          </div>
          <p className={classes.deltaLabel}>24h change</p>
        </div>

        <figure className={classes.chartWrap} aria-hidden="true">
          {hasChart ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData!}
                margin={{ top: 6, right: 0, bottom: 4, left: 0 }}
              >
                <defs>
                  <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={sparkHex} stopOpacity={0.34} />
                    <stop offset="100%" stopColor={sparkHex} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <YAxis hide domain={["dataMin", "dataMax"]} />
                {!isDecorative && (
                  <Tooltip
                    cursor={{ stroke: sparkHex, strokeOpacity: 0.4 }}
                    contentStyle={{
                      background: "var(--background-elevated)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "8px",
                      padding: "4px 8px",
                      fontSize: "11px",
                    }}
                    labelFormatter={() => ""}
                    formatter={(v) => [formatUsd(v as number), ""]}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={sparkHex}
                  strokeWidth={1.8}
                  fill={`url(#${gradId})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            // Карточка без активов / без sparkline — рисуем тонкую тире-линию
            <div className={classes.chartPlaceholder} aria-hidden>
              <span />
            </div>
          )}
        </figure>
      </div>
    </article>
  );
};

export default PortfolioCard;
