"use client";

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

const SLICE_COLORS = {
  stables: "#7AC74F",
  btc: "#FF9F43",
  eth: "#5C7CFA",
  largeAlts: "#37BDB6",
  smallAlts: "#FF77B7",
};

const SLICE_LABELS = {
  stables: "Стейблкоины",
  btc: "Bitcoin",
  eth: "Ethereum",
  largeAlts: "Крупные альты",
  smallAlts: "Мелкие альты",
};

export const RiskResultCard = ({ profile, variant = "standalone" }: Props) => {
  const allSlices: Array<{ key: keyof typeof SLICE_LABELS; pct: number }> = [
    { key: "stables", pct: profile.targetAllocation.stables },
    { key: "btc", pct: profile.targetAllocation.btc },
    { key: "eth", pct: profile.targetAllocation.eth },
    { key: "largeAlts", pct: profile.targetAllocation.largeAlts },
    { key: "smallAlts", pct: profile.targetAllocation.smallAlts },
  ];
  const slices = allSlices.filter((s) => s.pct > 0);

  const completed = profile.completedAt
    ? new Date(profile.completedAt).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

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
        <span className={classes.bucketLabel}>Ваш профиль</span>
        <span className={classes.bucketTitle}>{profile.bucketTitle}</span>
        <span className={classes.bucketScore}>
          Балл: {profile.score.toFixed(1)} / 10
        </span>
      </header>

      <div className={classes.body}>
        <p className={classes.description}>{profile.bucketDescription}</p>

        <div className={classes.metaRow}>
          <div>
            <span className={classes.metaLabel}>Допустимая просадка</span>
            <span className={classes.metaValue}>
              ~{profile.acceptableDrawdownPct}%
            </span>
          </div>
          {completed && (
            <div>
              <span className={classes.metaLabel}>Пройден</span>
              <span className={classes.metaValue}>{completed}</span>
            </div>
          )}
        </div>

        <div className={classes.allocation}>
          <h4 className={classes.allocationTitle}>
            Целевая структура портфеля
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
                title={`${SLICE_LABELS[s.key]} — ${s.pct}%`}
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
                  {SLICE_LABELS[s.key]}
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
