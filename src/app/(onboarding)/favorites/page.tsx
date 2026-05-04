import { getTranslations } from "next-intl/server";
import CookieConsentForm from "@/components/UI/CookieConsentForm/CookieConsentForm";
import { HomeHeader } from "@/components/UI/HomeHeader/HomeHeader";
import { Sidebar } from "@/components/UI/Sidebar/Sidebar";

import classes from "./page.module.css"
import { ProfileIconsTab } from "@/components/Tabs/ProfileIconsTab/ProfileIconsTab";
import { FavoritesAssets } from "@/components/UI/Assets/FavoritesAssets/FavoritesAssets";

export default async function FavoritesPage() {
  const t = await getTranslations("favorites");
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
            {t("title")}
          </h1>
          <FavoritesAssets />
        </div>
      </div>
    </div>
  )
}
