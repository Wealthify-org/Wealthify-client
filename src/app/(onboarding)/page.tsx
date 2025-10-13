import StartHeader from "@/components/UI/startHeader/StartHeader"
import AbstractBackgroundShapes from "@/components/UI/abstractBackgroundShapes/AbstractBackgroundShapes"
import PortfolioCard from "@/components/UI/portfolioCard/PortfolioCard"
import classes from "./page.module.css"
import CookieConsentForm from "@/components/UI/cookieConsentForm/CookieConsentForm"

export default function StartPage() {

  return (
    <div className={classes.page}>
      <StartHeader />
      <CookieConsentForm />
      <main id="main" className={classes.allContentContainer}>
        <section className={classes.mainContentContainer} aria-labelledby="hero-title">
          <div className={classes.textsContainer}>
            <h1 id="hero-title" className={classes.hText}>
              Manage Your Investments with Ease!
            </h1>
            <br className={classes.br} />
            <p className={classes.pText} id="hero-desc">
              Monitor your assets in real-time with up-to-date market data and performance insights. Get analytics based on Twitter on your crypto assets
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
            Try Now
          </button>

          <a className={classes.learnMoreButton} href="/about">
            Learn More
          </a>
        </div>
        <br className={classes.br} />
        <br className={classes.br} />
      </main>
      <footer className={classes.footer}>
          <ul role="list" className={classes.featuresList}>
            <li className={classes.featureItem}>
              <h3>Create as many portfolios as you want</h3>
              <p>Build unlimited portfolios across stocks, bonds, and crypto. 
         Compare and customize strategies in one dashboard.</p>
            </li>
            <li className={classes.featureItem}>
              <h3>Search cryptocurrencies by their smart-contracts addresses</h3>
              <p>Track tokens directly via contract addresses for accurate data on prices, 
         volumes, and on-chain activity.</p>
            </li>
            <li className={classes.featureItem}>
              <h3>Get analytics on Twitter activity</h3>
              <p>Monitor sentiment and trends from Twitter in real time to anticipate 
         market shifts earlier.</p>
            </li>
          </ul>
        </footer>
      <AbstractBackgroundShapes />
    </div>
  )
}