import { AssetsByCategoriesTab } from "@/components/Tabs/AssetsByCategories/AssetsByCategoriesTab"
import Logo from "../Logo/Logo"
import { CryptoToggleButtons } from "./CryptoStockToggleButtons/CryptoStockToggleButtons"
import classes from "./Sidebar.module.css"

export const Sidebar = () => {
  return (
    <aside className={classes.sidebar}>
      <div className={classes.sidebarHeader}>
        <Logo />
        <CryptoToggleButtons />
      </div>
      <section className={classes.sidebarContent}>
        <h3 className={classes.featuredTabsText}>
          Featured tabs
        </h3>
        <AssetsByCategoriesTab />
      </section>
    </aside>
  )
}