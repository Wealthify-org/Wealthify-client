"use client";

import { useTranslations } from "next-intl";
import classes from "../Contents.module.css";

type Props = {
  indexNumberValue: number;
  indexStringValue: string;
}

const FG_KEY_MAP: Record<string, "extremeFear" | "fear" | "neutral" | "greed" | "extremeGreed"> = {
  "Extreme Fear": "extremeFear",
  "Fear": "fear",
  "Neutral": "neutral",
  "Greed": "greed",
  "Extreme Greed": "extremeGreed",
};

export const FearAndGreed = ({indexNumberValue, indexStringValue}: Props) => {
  const t = useTranslations("home.indexes.fearGreedLabels");
  const key = FG_KEY_MAP[indexStringValue];
  const label = key ? t(key) : indexStringValue;

  // Защита от мусора в API: индекс должен быть в диапазоне 0..100. Без
  // зажима 150 или -5 рендерились как есть и ломали визуальный нарратив
  // («-5 — паническая жадность»). NaN превращаем в —.
  const display = Number.isFinite(indexNumberValue)
    ? Math.max(0, Math.min(100, Math.round(indexNumberValue)))
    : null;

  return (
    <>
      <div
        className={`${classes.indexValue} ${classes.fearAndGreedIndex}`}
        data-index-value
      >
        {display ?? "—"}
      </div>
      <p className={classes.footerText}>{label}</p>
    </>
  )
}
