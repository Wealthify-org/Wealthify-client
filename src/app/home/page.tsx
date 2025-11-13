import AbstractBackgroundShapes from "@/components/UI/AbstractBackgroundShapes/AbstractBackgroundShapes";
import CookieConsentForm from "@/components/UI/CookieConsentForm/CookieConsentForm";
import { HomeHeader } from "@/components/UI/HomeHeader/HomeHeader";
import { Sidebar } from "@/components/UI/Sidebar/Sidebar";
import { CookiePreferenceProvider } from "@/stores/cookiePreference/CookiePreferenceProvider";

import classes from "./page.module.css"

export default function HomePage() {
  return (
    <div className={classes.layout}>
      <CookiePreferenceProvider>
        <CookieConsentForm />
      </CookiePreferenceProvider>
      <Sidebar />
      <div className={classes.mainContent}>
        <HomeHeader />
      </div>
      <AbstractBackgroundShapes />
    </div>
  )
}