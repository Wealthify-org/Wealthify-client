"use client"

import { observer } from "mobx-react-lite"
import { useCookiePreferenceStore } from "@/stores/cookiePreference/CookiePreferenceProvider"
import classes from "./CookieConsentForm.module.css"
import { ROUTES } from "@/lib/routes";

const CookieConsentForm = observer(() => {
  const store = useCookiePreferenceStore();

  if (!store.isVisible) return null;
  
  const handleReject = () => {
    store.rejectAll();
  }

  const handleAccept = () => {
    store.acceptAll();
  }

  return (
    <form className={classes.form} role="dialog" aria-label="Cookie consent" aria-live="polite">
      <h1 className={classes.h}>
        Manage Cookies
      </h1>
      <p className={classes.p}>
        We use cookies to porvide and secure our websites, as well as to analyze the usage of our websites, in order to offer you a great user experience. To learn more aboue our use of cookies see our &nbsp;
        <a className={classes.link} href={ROUTES.PRIVACY_POLICY} target="_blank" rel="noopener noreferrer"> 
          Privacy Policy
        </a>
      </p>
      <div className={classes.buttonContainer}>
        <button type="button" className={classes.buttonReject} onClick={handleReject}>
          Reject All
        </button>
        <button type="button" className={classes.buttonAccept} onClick={handleAccept}>
          Accept All
        </button>
      </div>
    </form>
  )
});

export default CookieConsentForm