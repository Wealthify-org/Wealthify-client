"use client";

import { useTranslations } from "next-intl";
import classes from "../Contents.module.css";

type Props = {
  indexNumberValue: number;
  indexStringValue: string;
}

const ALTSEASON_KEY_MAP: Record<string, "altseason" | "notAltseason" | "bitcoinSeason"> = {
  "Altseason": "altseason",
  "Not Altseason": "notAltseason",
  "Bitcoin Season": "bitcoinSeason",
};

export const AltSeason = ({indexNumberValue, indexStringValue}: Props) => {
  const t = useTranslations("home.indexes.altseasonLabels");
  const key = ALTSEASON_KEY_MAP[indexStringValue];
  const label = key ? t(key) : indexStringValue;

  return (
    <>
      <div
        className={`${classes.indexValue} ${classes.altSeasonIndex}`}
        data-index-value
      >
        {indexNumberValue}
      </div>
      <p className={classes.footerText}>{label}</p>
    </>
  )
}
