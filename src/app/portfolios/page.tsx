import { getTranslations } from "next-intl/server";
import CookieConsentForm from "@/components/UI/CookieConsentForm/CookieConsentForm"
import classes from "./page.module.css"
import { Sidebar } from "@/components/UI/Sidebar/Sidebar"
import { HomeHeader } from "@/components/UI/HomeHeader/HomeHeader"
import { UserPortfolios } from "@/components/UserPortfolios/UserPortfolios"

export default async function PortfoliosPage() {
  const t = await getTranslations("portfolios");
  return (
    <div className={classes.layout}>
      <CookieConsentForm />
      <Sidebar />
      <div className={classes.mainColumn}>
        <HomeHeader />
        <div className={classes.content}>
          <h1 className={classes.pageTitle}>
            {t("title")}
          </h1>
          <UserPortfolios />
        </div>
      </div>
    </div>
  )
}
