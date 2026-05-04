"use client";

import { useTranslations } from "next-intl";
import classes from "./GoalsSection.module.css";

type GoalItem = {
  title: string;
  description: string;
};

/**
 * 6 фич/целей проекта. Каждая получает иконку из набора ниже —
 * имена иконок захардкожены позиционно по индексу из messages.json.
 */
const ICON_KEYS = [
  "shield",
  "sparkles",
  "chat",
  "chart",
  "filter",
  "layers",
] as const;

export const GoalsSection = () => {
  const t = useTranslations("goalsSection");
  const items = t.raw("items") as GoalItem[];

  return (
    <section id="goals" className={classes.section}>
      <div className={classes.inner}>
        <p className={classes.eyebrow}>{t("eyebrow")}</p>
        <h2 className={classes.heading}>{t("title")}</h2>
        <p className={classes.subtitle}>{t("subtitle")}</p>

        <ul className={classes.grid}>
          {items.map((item, i) => {
            const iconKey = ICON_KEYS[i] ?? "sparkles";
            return (
              <li key={i} className={classes.card}>
                <div className={classes.iconWrap}>
                  <Icon name={iconKey} />
                </div>
                <h3 className={classes.cardTitle}>{item.title}</h3>
                <p className={classes.cardDescription}>{item.description}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

/* ── Inline icon set (stroke-based, наследует currentColor) ───── */

const Icon = ({ name }: { name: (typeof ICON_KEYS)[number] }) => {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 4 6v6c0 4.5 3.2 8.4 8 9 4.8-.6 8-4.5 8-9V6l-8-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "sparkles":
      return (
        <svg {...common}>
          <path d="M12 3 13.5 8.5 19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z" />
          <path d="M19 14v4M17 16h4M5 17v3M3.5 18.5h3" />
        </svg>
      );
    case "chat":
      return (
        <svg {...common}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <line x1="8" y1="10" x2="16" y2="10" />
          <line x1="8" y1="14" x2="13" y2="14" />
        </svg>
      );
    case "chart":
      return (
        <svg {...common}>
          <line x1="3" y1="20" x2="21" y2="20" />
          <polyline points="4 16 9 11 13 14 20 6" />
          <circle cx="20" cy="6" r="1.6" fill="currentColor" stroke="none" />
        </svg>
      );
    case "filter":
      return (
        <svg {...common}>
          <polygon points="3 4 21 4 14 13 14 20 10 18 10 13 3 4" />
        </svg>
      );
    case "layers":
      return (
        <svg {...common}>
          <polygon points="12 2 22 7 12 12 2 7 12 2" />
          <polyline points="2 12 12 17 22 12" />
          <polyline points="2 17 12 22 22 17" />
        </svg>
      );
  }
};
