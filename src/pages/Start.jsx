import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RegistrationModal from "../components/UI/registrationModal/RegistrationModal";
import PortfolioCard from '../components/UI/portfolioCard/portfolioCard'
import BorderedButton from "../components/UI/borderedButton/borderedButton";
import Header from '../components/UI/header/header'
import BottomText from "../components/UI/bottomText/bottomText"
import SignInForm from "../components/SignInForm";
import SignUpForm from "../components/SignUpForm";
import { getPathByComponent } from "../router/routes";
import Home from "./Home";
import { animate } from 'animejs';

const Start = () => {
  const [isSignInModalVisible, setSignInModalVisible] = useState(false)
  const [isSignUpModalVisible, setSignUpModalVisible] = useState(false)
  const navigate = useNavigate()

  const handleSignIn = () => {
    navigate(getPathByComponent(Home, false))
  }

  const handleSignUp = () => {
    navigate(getPathByComponent(Home, false))
  }

  useEffect(() => {
    // animate('.card1', {
    //   translateX: [
    //     { to: `${(Math.random() - 0.5) * 2 * 10}px`, ease: 'EaseInOut(3)', duration: 2000 },
    //     { to: `${(Math.random() - 0.5) * 2 * 10}px`, ease: 'EaseInOut(3)', duration: 2000 }
    //   ],
    //   translateY: [
    //     { to: '-10px', ease: 'EaseInOut(3)', duration: 2000 },
    //     { to: '10px', ease: 'EaseInOut(3)', duration: 2000 },
    //     { to: '0', ease: 'EaseInOut(3)', duration: 2000 }
    //   ],
    //   loop: true,
    //   direction: 'alternate'
    // });
  }, [])
  
  return (
    <div className="pageContainer">
      <Header signInOnClick={() => setSignInModalVisible(true)} signUpOnClick={() => setSignUpModalVisible(true)}/>
      <RegistrationModal isVisible={isSignInModalVisible} setIsVisible={setSignInModalVisible}>
        <SignInForm startButtonOnClick={handleSignIn} />
      </RegistrationModal>
      <RegistrationModal isVisible={isSignUpModalVisible} setIsVisible={setSignUpModalVisible}>
        <SignUpForm startButtonOnClick={handleSignUp} />
      </RegistrationModal>
      <div className="mainContentContainer">
        <div>
          <h1 className="hText">
            Manage Your Investments with Ease!
          </h1>
          <p className="pText">
            Monitor your assets in real-time with up-to-date market data and performance insights. Get analytics based on Twitter on your crypto assets
          </p>
        </div>
        <div className="portfolioCards">
          <div className="card1">
            <PortfolioCard
              title="My Investments" 
              category="Crypto" 
              value="5,605" 
              valueChange="561"
            />
          </div>
          <div className="portfolioBottomCards">
            <div className="card2">
              <PortfolioCard 
                title="Savings" 
                category="Stocks" 
                value="54,605" 
                valueChange="534"
              />
            </div>
            <div className="card3">
              <PortfolioCard 
                title="For House" 
                category="Stocks" 
                value="45,605" 
                valueChange="-534"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="btnContainer">
        <button className="trybtn">
          Try Now
        </button>
        <BorderedButton title="Learn More" style={{padding: '0.8rem 2.5rem', fontSize: '1.5rem', margin: '0 0'}} />
      </div>
      <div className="bottomTextContainer">
        <BottomText>
          Create as many portfolios as you want 
        </BottomText>
        <BottomText>
          Search cryptocurrencies by their smart-contracts addresses
        </BottomText>
        <BottomText>
          Get analytics on Twitter activity 
        </BottomText>
      </div>
    </div>
  )
}

export default Start  