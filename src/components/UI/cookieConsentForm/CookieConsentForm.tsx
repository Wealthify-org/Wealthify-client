"use client"
import { useCookiePreferenceStore } from "@/stores/cookiePreference/Provider"
import classes from "./CookieConsentForm.module.css"
import { useState } from "react"

const CookieConsentForm = () => {
  const [isVisible, setIsVisible] = useState(true);
  const store = useCookiePreferenceStore();

  if (!store.isVisible) return null;

  const handleReject = () => {
    store.rejectAll();
    setIsVisible(false);
  }

  const handleAccept = () => {
    store.acceptAll();
    setIsVisible(false);
  }

  return isVisible && (
    <form className={classes.form} role="dialog" aria-label="Cookie consent" aria-live="polite">
      <h1 className={classes.h}>
        Manage Cookies
      </h1>
      <p className={classes.p}>
        We use cookies to porvide and secure our websites, as well as to analyze the usage of our websites, in order to offer you a great user experience. To learn more aboue our use of cookies see our &nbsp;
        <a className={classes.link} href="/privacy-policy" target="_blank" rel="noopener noreferrer"> 
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
}

export default CookieConsentForm