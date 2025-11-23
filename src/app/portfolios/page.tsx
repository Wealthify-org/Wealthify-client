import CookieConsentForm from "@/components/UI/CookieConsentForm/CookieConsentForm"
import classes from "./page.module.css"
import AbstractBackgroundShapes from "@/components/UI/AbstractBackgroundShapes/AbstractBackgroundShapes"
import { Sidebar } from "@/components/UI/Sidebar/Sidebar"
import { HomeHeader } from "@/components/UI/HomeHeader/HomeHeader"
import { UserPortfolios } from "@/components/UserPortfolios/UserPortfolios"

export default function PortfoliosPage() {
  return (
    <div className={classes.layout}>
      <CookieConsentForm />
      <Sidebar />
      <div className={classes.mainColumn}>
        <HomeHeader />
        <div className={classes.content}>
          <h1 className={classes.pageTitle}>
            Portfolios
          </h1>
          <UserPortfolios />
        </div>
      </div>
      <AbstractBackgroundShapes />
    </div>
  )
}