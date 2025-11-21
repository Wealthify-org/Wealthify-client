import AbstractBackgroundShapes from "@/components/UI/AbstractBackgroundShapes/AbstractBackgroundShapes";
import CookieConsentForm from "@/components/UI/CookieConsentForm/CookieConsentForm";
import { HomeHeader } from "@/components/UI/HomeHeader/HomeHeader";
import { Sidebar } from "@/components/UI/Sidebar/Sidebar";

import classes from "./page.module.css"
import { IndexesCards } from "@/components/IndexesCards/IndexesCards";
import { Assets } from "@/components/UI/Assets/Assets";

export default function HomePage() {
  return (
    <div className={classes.layout}>
      <CookieConsentForm />
      <Sidebar />
      <div className={classes.mainColumn}>
        <HomeHeader />
        <div className={classes.content}>
          <h1 className={classes.pageTitle}>
            Cryptocurrencies
          </h1>
          <IndexesCards />
          <Assets />
        </div>
      </div>
      <AbstractBackgroundShapes />
    </div>
  )
}