import AbstractBackgroundShapes from "@/components/UI/AbstractBackgroundShapes/AbstractBackgroundShapes";
import CookieConsentForm from "@/components/UI/CookieConsentForm/CookieConsentForm";
import { HomeHeader } from "@/components/UI/HomeHeader/HomeHeader";
import { Sidebar } from "@/components/UI/Sidebar/Sidebar";

import classes from "./page.module.css"
import { ProfileIconsTab } from "@/components/Tabs/ProfileIconsTab/ProfileIconsTab";
import { FavoritesAssets } from "@/components/UI/Assets/FavoritesAssets/FavoritesAssets";

export default function FavoritesPage() {
  return (
    <div className={classes.layout}>
      <CookieConsentForm />
      <Sidebar>
        <ProfileIconsTab />
      </Sidebar>
      <div className={classes.mainColumn}>
        <HomeHeader />
        <div className={classes.content}>
          <h1 className={classes.pageTitle}>
            Favorites
          </h1>
          <FavoritesAssets />
        </div>
      </div>
      <AbstractBackgroundShapes />
    </div>
  )
}