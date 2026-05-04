"use client";

import { useTranslations, useLocale } from "next-intl";
import { RiskBucket, RiskProfileResult } from "./types";
import classes from "./RiskResultCard.module.css";

type Props = {
  profile: RiskProfileResult;
  variant?: "standalone" | "inline";
};

const BUCKET_GRADIENT: Record<RiskBucket, string> = {
  Conservative:
    "linear-gradient(135deg, #6BCFAA 0%, #54A8A4 100%)",
  Moderate:
    "linear-gradient(135deg, #5DA8FF 0%, #5C7CFA 100%)",
  Aggressive:
    "linear-gradient(135deg, #FFB454 0%, #F97676 100%)",
  Speculative:
    "linear-gradient(135deg, #B26BFF 0%, #FF4DA8 100%)",
};

const SLICE_COLORS: Record<"stables" | "btc" | "eth" | "largeAlts" | "smallAlts", string> = {
  stables: "#7AC74F",
  btc: "#FF9F43",
  eth: "#5C7CFA",
  largeAlts: "#37BDB6",
  smallAlts: "#FF77B7",
};

type SliceKey = "stables" | "btc" | "eth" | "largeAlts" | "smallAlts";
const SLICE_LABEL_KEYS: Record<SliceKey, SliceKey> = {
  stables: "stables",
  btc: "btc",
  eth: "eth",
  largeAlts: "largeAlts",
  smallAlts: "smallAlts",
};

export const RiskResultCard = ({ profile, variant = "standalone" }: Props) => {
  const t = useTranslations("riskProfile.result");
  const tBuckets = useTranslations("riskProfile.buckets");
  const tCategories = useTranslations("riskProfile.result.categoryLabels");
  const locale = useLocale();
  const sliceLabel = (key: keyof typeof SLICE_LABEL_KEYS): string =>
    tCategories(SLICE_LABEL_KEYS[key]);
  const allSlices: Array<{ key: keyof typeof SLICE_LABEL_KEYS; pct: number }> = [
    { key: "stables", pct: profile.targetAllocation.stables },
    { key: "btc", pct: profile.targetAllocation.btc },
    { key: "eth", pct: profile.targetAllocation.eth },
    { key: "largeAlts", pct: profile.targetAllocation.largeAlts },
    { key: "smallAlts", pct: profile.targetAllocation.smallAlts },
  ];
  const slices = allSlices.filter((s) => s.pct > 0);

  // защита от мусорного profile.completedAt — раньше при кривой строке
  // получали "Invalid Date" в карточке.
  const completed = (() => {
    if (!profile.completedAt) return null;
    const d = new Date(profile.completedAt);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString(locale === "ru" ? "ru-RU" : "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  })();

  // Translate bucket title/description by bucket key when available
  let bucketTitle = profile.bucketTitle;
  let bucketDescription = profile.bucketDescription;
  try {
    bucketTitle = tBuckets(`${profile.bucket}.title` as never);
  } catch { /* keep server-provided */ }
  try {
    bucketDescription = tBuckets(`${profile.bucket}.description` as never);
  } catch { /* keep server-provided */ }

  return (
    <article
      className={`${classes.card} ${
        variant === "inline" ? classes.cardInline : ""
      }`}
    >
      <header
        className={classes.bucketBanner}
        style={{ background: BUCKET_GRADIENT[profile.bucket] }}
      >
        <span className={classes.bucketLabel}>{t("yourProfileLabel")}</span>
        <span className={classes.bucketTitle}>{bucketTitle}</span>
        <span className={classes.bucketScore}>
          {t("scoreOf10", { score: profile.score.toFixed(1) })}
        </span>
      </header>

      <div className={classes.body}>
        <p className={classes.description}>{bucketDescription}</p>

        <div className={classes.metaRow}>
          <div>
            <span className={classes.metaLabel}>{t("acceptableDrawdown")}</span>
            <span className={classes.metaValue}>
              ~{profile.acceptableDrawdownPct}%
            </span>
          </div>
          {completed && (
            <div>
              <span className={classes.metaLabel}>{t("completedAt")}</span>
              <span className={classes.metaValue}>{completed}</span>
            </div>
          )}
        </div>

        <div className={classes.allocation}>
          <h4 className={classes.allocationTitle}>
            {t("targetAllocationTitle")}
          </h4>

          <div className={classes.allocationBar}>
            {slices.map((s) => (
              <div
                key={s.key}
                className={classes.allocationSegment}
                style={{
                  width: `${s.pct}%`,
                  background: SLICE_COLORS[s.key],
                }}
                title={`${sliceLabel(s.key)} — ${s.pct}%`}
              />
            ))}
          </div>

          <ul className={classes.allocationLegend}>
            {slices.map((s) => (
              <li key={s.key}>
                <span
                  className={classes.allocationSwatch}
                  style={{ background: SLICE_COLORS[s.key] }}
                />
                <span className={classes.allocationName}>
                  {sliceLabel(s.key)}
                </span>
                <span className={classes.allocationPct}>{s.pct}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
};
