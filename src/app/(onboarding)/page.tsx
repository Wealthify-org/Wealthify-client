"use client"

import { useTranslations } from "next-intl"

import StartHeader from "@/components/UI/StartHeader/StartHeader"
import PortfolioCard from "@/components/UI/PortfolioCard/PortfolioCard"
import classes from "./page.module.css"
import CookieConsentForm from "@/components/UI/CookieConsentForm/CookieConsentForm"
import { ROUTES } from "@/lib/routes"

export default function StartPage() {
  const t = useTranslations("landing");

  return (
    <div className={classes.page}>
      <StartHeader />
      <CookieConsentForm />
      <main id="main" className={classes.allContentContainer}>
        <section className={classes.mainContentContainer} aria-labelledby="hero-title">
          <div className={classes.textsContainer}>
            <h1 id="hero-title" className={classes.hText}>
              {t("heroTitle")}
            </h1>
            <br className={classes.br} />
            <p className={classes.pText} id="hero-desc">
              {t("heroSubtitle")}
            </p>
          </div>
          <section>
            <ul className={classes.portfolioCardsList} role="list">
              <li className={classes.card}>
                <PortfolioCard
                  title="My Investments"
                  category="Crypto"
                  value={5605}
                  valueChange={561}
                  isDecorative={true}
                />
              </li>
              <br />
              <li className={classes.card}>
                <PortfolioCard
                  title="Savings"
                  category="Stocks"
                  value={54605}
                  valueChange={534}
                  isDecorative={true}
                />
              </li>
              <li className={classes.card}>
                <PortfolioCard
                  title="For House"
                  category="Bonds"
                  value={45605}
                  valueChange={-534}
                  isDecorative={true}
                />
              </li>
            </ul>
          </section>
        </section>
        <br className={classes.br} />
        <br className={classes.br} />
        <div className={classes.buttonContainer}>
          <button className={classes.tryButton}>
            {t("tryNow")}
          </button>

          <a className={classes.learnMoreButton} href={ROUTES.ABOUT}>
            {t("learnMore")}
          </a>
        </div>
        <br className={classes.br} />
        <br className={classes.br} />
      </main>
      <footer className={classes.footer}>
          <ul role="list" className={classes.featuresList}>
            <li className={classes.featureItem}>
              <h3>{t("feature1Title")}</h3>
              <p>{t("feature1Description")}</p>
            </li>
            <li className={classes.featureItem}>
              <h3>{t("feature2Title")}</h3>
              <p>{t("feature2Description")}</p>
            </li>
            <li className={classes.featureItem}>
              <h3>{t("feature3Title")}</h3>
              <p>{t("feature3Description")}</p>
            </li>
          </ul>
        </footer>
    </div>
  )
}
