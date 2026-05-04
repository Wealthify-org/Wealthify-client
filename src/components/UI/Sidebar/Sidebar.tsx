"use client"

import { useTranslations } from "next-intl"
import { AssetsByCategoriesTab } from "@/components/Tabs/AssetsByCategories/AssetsByCategoriesTab"
import Logo from "../Logo/Logo"
import { CryptoToggleButtons } from "./CryptoStockToggleButtons/CryptoStockToggleButtons"
import classes from "./Sidebar.module.css"

type Props = {
  children?: React.ReactNode;
}

export const Sidebar = ({children}: Props) => {
  const t = useTranslations("sidebar")
  return (
    <aside className={classes.sidebar}>
      <div className={classes.sidebarHeader}>
        <Logo />
        <CryptoToggleButtons />
      </div>
      <section className={classes.sidebarContent}>
        <h3 className={classes.featuredTabsText}>
          {t("featuredTabs")}
        </h3>
        <div className={classes.tabs}>
          <AssetsByCategoriesTab />
          {children}
        </div>
      </section>
    </aside>
  )
}
