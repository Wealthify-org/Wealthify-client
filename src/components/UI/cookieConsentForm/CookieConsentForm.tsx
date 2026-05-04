"use client"

import { observer } from "mobx-react-lite"
import { useTranslations } from "next-intl"
import { useCookiePreferenceStore } from "@/stores/cookiePreference/CookiePreferenceProvider"
import classes from "./CookieConsentForm.module.css"
import { ROUTES } from "@/lib/routes";

const CookieConsentForm = observer(() => {
  const store = useCookiePreferenceStore();
  const t = useTranslations("cookieConsent");

  if (!store.isVisible) return null;

  const handleReject = () => {
    store.rejectAll();
  }

  const handleAccept = () => {
    store.acceptAll();
  }

  return (
    <form className={classes.form} role="dialog" aria-label={t("ariaLabel")} aria-live="polite">
      <h1 className={classes.h}>
        {t("manageTitle")}
      </h1>
      <p className={classes.p}>
        {t("manageDescription")}&nbsp;
        <a className={classes.link} href={ROUTES.PRIVACY_POLICY} target="_blank" rel="noopener noreferrer">
          {t("privacyPolicy")}
        </a>
      </p>
      <div className={classes.buttonContainer}>
        <button type="button" className={classes.buttonReject} onClick={handleReject}>
          {t("rejectAll")}
        </button>
        <button type="button" className={classes.buttonAccept} onClick={handleAccept}>
          {t("acceptAll")}
        </button>
      </div>
    </form>
  )
});

export default CookieConsentForm
