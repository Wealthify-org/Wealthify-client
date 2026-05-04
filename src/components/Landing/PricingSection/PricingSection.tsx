"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { ROUTES } from "@/lib/routes";
import classes from "./PricingSection.module.css";

interface PlanConfig {
  key: "free" | "premium" | "ultimate";
  featureKeys: string[];
  highlight?: boolean;
  hasBadge?: boolean;
}

const PLAN_CONFIGS: PlanConfig[] = [
  { key: "free", featureKeys: ["f1", "f2", "f3", "f4"] },
  {
    key: "premium",
    featureKeys: ["f1", "f2", "f3", "f4", "f5"],
    highlight: true,
    hasBadge: true,
  },
  // Раньше тут было 4 пункта, включая «Оповещения о ценовых уровнях»
  // и «Доступ к программному API» — этих фич у нас пока нет, поэтому
  // не обещаем. Заменили на расширенные ИИ-лимиты — это реально
  // отличает Ultimate от Premium.
  { key: "ultimate", featureKeys: ["f1", "f2", "f3"] },
];

export const PricingSection = () => {
  const t = useTranslations("pricing");

  return (
    <section id="pricing" className={classes.section}>
      <div className={classes.inner}>
        <p className={classes.eyebrow}>{t("eyebrow")}</p>
        <h2 className={classes.heading}>{t("title")}</h2>
        <p className={classes.subtitle}>{t("subtitle")}</p>

        <div className={classes.trust}>
          <span className={classes.trustItem}>
            <DotIcon /> {t("trustNoCard")}
          </span>
          <span className={classes.trustDot} aria-hidden />
          <span className={classes.trustItem}>
            <DotIcon /> {t("trustCancel")}
          </span>
        </div>

        <div className={classes.grid}>
          {PLAN_CONFIGS.map((plan) => {
            const name = t(`${plan.key}.name`);
            const price = t(`${plan.key}.price`);
            const period = t(`${plan.key}.period`);
            const description = t(`${plan.key}.description`);
            const cta = t(`${plan.key}.cta`);
            const badge = plan.hasBadge ? t(`${plan.key}.badge`) : null;

            return (
              <div
                key={plan.key}
                data-tier={plan.key}
                className={`${classes.card} ${plan.highlight ? classes.cardHighlight : ""}`}
              >
                <div className={classes.cardInner}>
                  <div aria-hidden className={classes.cardGlow} />

                  <div className={classes.cardHeader}>
                    <div className={classes.nameRow}>
                      <span className={classes.planName}>{name}</span>
                      {badge && <span className={classes.badge}>{badge}</span>}
                    </div>

                    <div className={classes.priceRow}>
                      <span className={classes.price}>{price}</span>
                      {period && <span className={classes.period}>{period}</span>}
                    </div>

                    <p className={classes.description}>{description}</p>
                  </div>

                  <div className={classes.ctaWrap}>
                    <Link
                      href={ROUTES.SIGN_UP}
                      className={`${classes.cta} ${plan.highlight ? classes.ctaHighlight : ""}`}
                    >
                      {cta}
                    </Link>
                  </div>

                  <div className={classes.divider} />

                  <ul className={classes.features}>
                    {plan.featureKeys.map((fKey) => (
                      <li key={fKey} className={classes.featureItem}>
                        <CheckIcon />
                        <span>{t(`${plan.key}.${fKey}`)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const CheckIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    className={classes.checkIcon}
    aria-hidden
  >
    <path
      d="M4 9.5L7.5 13L14 5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DotIcon = () => (
  <svg width="6" height="6" viewBox="0 0 6 6" aria-hidden>
    <circle cx="3" cy="3" r="3" fill="currentColor" />
  </svg>
);
