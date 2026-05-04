"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"

import StartHeader from "@/components/UI/StartHeader/StartHeader"
import PortfolioCard from "@/components/UI/PortfolioCard/PortfolioCard"
import CookieConsentForm from "@/components/UI/CookieConsentForm/CookieConsentForm"
import { GoalsSection } from "@/components/Landing/GoalsSection/GoalsSection"
import { PricingSection } from "@/components/Landing/PricingSection/PricingSection"
import { Footer } from "@/components/UI/Footer/Footer"

import { ROUTES } from "@/lib/routes"
import classes from "./page.module.css"

export default function StartPage() {
  const t = useTranslations("landing")

  return (
    <div className={classes.page}>
      <StartHeader />
      <CookieConsentForm />

      <main id="main" className={classes.allContentContainer}>
        {/* Hero — оставляем как было, но «Try Now» / «Learn More» теперь
            ведут на регистрацию и якорь #goals соответственно. */}
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
                  portfolioValueChangeData={[
                    4900, 4980, 5050, 5120, 5050, 5240, 5310, 5380, 5410, 5500, 5605,
                  ]}
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
                  portfolioValueChangeData={[
                    53800, 53900, 54100, 54050, 54200, 54380, 54420, 54500, 54620, 54605,
                  ]}
                />
              </li>
              <li className={classes.card}>
                <PortfolioCard
                  title="For House"
                  category="Bonds"
                  value={45605}
                  valueChange={-534}
                  isDecorative={true}
                  portfolioValueChangeData={[
                    46300, 46220, 46150, 46050, 45980, 45900, 45820, 45740, 45660, 45605,
                  ]}
                />
              </li>
            </ul>
          </section>
        </section>

        <div className={classes.buttonContainer}>
          <Link href={ROUTES.SIGN_UP} className={classes.tryButton}>
            {t("tryNow")}
          </Link>
          <a href="#goals" className={classes.learnMoreButton}>
            {t("learnMore")}
          </a>
        </div>

        <GoalsSection />

        <PricingSection />
      </main>

      <Footer />
    </div>
  )
}
