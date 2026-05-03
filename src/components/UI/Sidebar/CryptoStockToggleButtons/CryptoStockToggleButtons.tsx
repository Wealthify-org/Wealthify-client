"use client"

import { useState } from "react"
import classes from "./CryptoStockToggleButtons.module.css"

type Tab = "crypto" | "stocks"

export const CryptoToggleButtons = () => {
  const [active, setActive] = useState<Tab>("crypto")

  const setIfEnabled = (tab: Tab, enabled: boolean) => {
    if (enabled) setActive(tab)
  }

  return (
    <div
      className={classes.segment}
      role="tablist"
      aria-label="Класс активов"
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
        Crypto
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={active === "stocks"}
        aria-disabled="true"
        title="Раздел акций пока не реализован"
        className={`${classes.tab} ${classes.tabDisabled}`}
        onClick={(e) => e.preventDefault()}
      >
        <span className={classes.tabLabel}>Stocks</span>
        <span className={classes.soonBadge}>soon</span>
      </button>
    </div>
  )
}
