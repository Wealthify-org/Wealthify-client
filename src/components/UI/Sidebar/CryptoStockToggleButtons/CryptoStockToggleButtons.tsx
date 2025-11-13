"use client"

import { useState } from "react"
import classes from "./CryptoStockToggleButtons.module.css"
import { ToggleButton } from "./ToggleButton/ToggleButton"

type Tab = "crypto" | "stocks"

export const CryptoToggleButtons = () => {
  const [active, setActive] = useState<Tab>("crypto")

  return (
    <div className={classes.toggleButtonsContainer}>
      <ToggleButton 
        isDisabled={false}
        selected={active === "crypto"}
        onChange={() => setActive("crypto")} 
      >
        Crypto
      </ToggleButton>
      <div className={classes.divider} />
      <ToggleButton
        isDisabled={true}
        selected={active === "stocks"}
        onChange={() => setActive("stocks")}
      >
        Stocks
      </ToggleButton>
    </div>
  )
}