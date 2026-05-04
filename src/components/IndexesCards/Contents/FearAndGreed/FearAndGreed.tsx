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

  return (
    <>
      <div
        className={`${classes.indexValue} ${classes.fearAndGreedIndex}`}
        data-index-value
      >
        {indexNumberValue}
      </div>
      <p className={classes.footerText}>{label}</p>
    </>
  )
}
