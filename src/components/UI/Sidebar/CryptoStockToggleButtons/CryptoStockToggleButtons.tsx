"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import classes from "./CryptoStockToggleButtons.module.css"

type Tab = "crypto" | "stocks"

export const CryptoToggleButtons = () => {
  const t = useTranslations("sidebar")
  const tCommon = useTranslations("common")
  const [active, setActive] = useState<Tab>("crypto")

  const setIfEnabled = (tab: Tab, enabled: boolean) => {
    if (enabled) setActive(tab)
  }

  return (
    <div
      className={classes.segment}
      role="tablist"
      aria-label="Asset class"
    >
      {/* плавающий «slider» подсветки */}
      <div
        className={`${classes.slider} ${active === "stocks" ? classes.sliderRight : ""}`}
        aria-hidden="true"
      />

      <button
        type="button"
        role="tab"
        aria-selected={active === "crypto"}
        className={`${classes.tab} ${active === "crypto" ? classes.tabActive : ""}`}
        onClick={() => setIfEnabled("crypto", true)}
      >
        {t("cryptoToggle")}
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={active === "stocks"}
        aria-disabled="true"
        title={t("stocksTooltip")}
        className={`${classes.tab} ${classes.tabDisabled}`}
        onClick={(e) => e.preventDefault()}
      >
        <span className={classes.tabLabel}>{t("stocksToggle")}</span>
        <span className={classes.soonBadge}>{tCommon("soon")}</span>
      </button>
    </div>
  )
}
