import { useState } from "react"
import StartHeader from "../../components/UI/startHeader/StartHeader"
import { useNavigate } from "react-router-dom"
import AbstractBackgroundShapes from "../../components/UI/abstractBackgroundShapes/AbstractBackgroundShapes"
import RegistrationModal from "../../components/UI/registrationModal/RegistrationModal"
import SignInForm from "../../components/RegistrationForms/SignInForm"
import type { SIStartButtonOnClickArgs, SUStartButtonOnClickArgs } from "../../components/RegistrationForms/types"
import SignUpForm from "../../components/RegistrationForms/SignUpForm"
import classes from './Start.module.css'
import PortfolioCard from "../../components/UI/portfolioCard/PortfolioCard"
import { getPathByComponent } from "../../router/routes"
import Home from "../Home"

const Start = () => {
  const [isSignInModalVisible, setSignInModalVisible] = useState(false)
  const [isSignUpModalVisible, setSignUpModalVisible] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()

  const handleSignIn = async (userData: SIStartButtonOnClickArgs) => {
    try {
      const response = await fetch('http://localhost:5001/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      if (response.ok) {
        const data = await response.json()
        const token = data.token
        localStorage.setItem('token', token)

        navigate(getPathByComponent(Home, false))
      } else {
        const errorData = await response.json()
        setErrorMessage(errorData.message || 'Login failed')
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage(String(error))
      }
    }
  }

  const handleSignUp = async (userData: SUStartButtonOnClickArgs) => {
    try {
      const response = await fetch('http://localhost:5001/auth/registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      if (response.ok) {
        const data = await response.json()
        const token = data.token
        localStorage.setItem('token', token)

        navigate(getPathByComponent(Home, false))
      } else {
        const errorData = await response.json()
        setErrorMessage(errorData.message || 'Registration failed')
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage(String(error))
      }
    }
  }

  const handleChangeAuthorizationType = () => {
    if (isSignInModalVisible) {
      setSignInModalVisible(false)
      setSignUpModalVisible(true)
      return
    }

    setSignInModalVisible(true)
    setSignUpModalVisible(false)
  }
  
  return (
    <>
      <StartHeader 
        signInOnClick={() => setSignInModalVisible(true)} 
        signUpOnClick={() => setSignUpModalVisible(true)} 
      />
      
      <RegistrationModal isVisible={isSignInModalVisible} setIsVisible={setSignInModalVisible} errorMessage={errorMessage} setErrorMessage={setErrorMessage}>
        <SignInForm startButtonOnClick={handleSignIn} handleChangeAuthorizationType={handleChangeAuthorizationType} />
      </RegistrationModal>
      
      <RegistrationModal isVisible={isSignUpModalVisible} setIsVisible={setSignUpModalVisible} errorMessage={errorMessage} setErrorMessage={setErrorMessage}>
        <SignUpForm startButtonOnClick={handleSignUp} handleChangeAuthorizationType={handleChangeAuthorizationType}/>
      </RegistrationModal>

      <main id='main' className={classes.allContentContainer}>
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
                />
              </li>
              <br />
              <li className={classes.card}>
                <PortfolioCard 
                  title="Savings"
                  category="Stocks"
                  value={54605}
                  valueChange={534}
                />
              </li>
              <li className={classes.card}>
                <PortfolioCard 
                  title="For House"
                  category="Bonds"
                  value={45605}
                  valueChange={-534}
                />
              </li>
            </ul>
          </section>
        </section>
        <br className={classes.br} />
        <br className={classes.br} />
        <div className={classes.buttonContainer}>
          <button className={classes.tryButton} onClick={() => setSignUpModalVisible(true)}>
            Try Now
          </button>

          <a className={classes.learnMoreButton} href="/about">
            Learn More
          </a>
        </div>
        <br className={classes.br} />
        <br className={classes.br} />
        <section>
          <ul role="list" className={classes.featuresList}>
            <li className={classes.bottomText}>Create as many portfolios as you want</li>
            <li className={classes.bottomText}>Search cryptocurrencies by their smart-contracts addresses</li>
            <li className={classes.bottomText}>Get analytics on Twitter activity</li>
          </ul>
        </section>
      </main>
      <AbstractBackgroundShapes />
    </>
  )
}

export default Start