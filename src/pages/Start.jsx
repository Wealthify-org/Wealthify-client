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
import axios from 'axios'
import AbstractBackgroundMesh from "../components/UI/abstractBackgroundShapes/abstractBackgroundMesh";

const Start = () => {
  const [isSignInModalVisible, setSignInModalVisible] = useState(false)
  const [isSignUpModalVisible, setSignUpModalVisible] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()

  const handleSignIn = async (userData) => {
    try {
      const response = await axios.post('http://localhost:5001/auth/login', userData)

      if (response.status >= 200 && response.status < 300) {
        console.log('Логин прошел успешно!')
        navigate(getPathByComponent(Home, false))
      }

    } catch (error) {
      setErrorMessage(error.response?.data.message || error.message)
      console.log('Ошибка при логине: ', error.response?.data || error.message)
    }
  }

  const handleSignUp = async (userData) => {
    try {
      const response = await axios.post('http://localhost:5001/auth/registration', userData)

      if (response.status >= 200 && response.status < 300) {
        console.log('Регистрация успешна!');
        navigate(getPathByComponent(Home, false))
      }
    } catch (error) {
      setErrorMessage(error.response?.data.message || error.message)
      console.error('Ошибка при регистрации: ', error.response?.data || error.message) 
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
    <div className="pageContainer">
      <Header signInOnClick={() => setSignInModalVisible(true)} signUpOnClick={() => setSignUpModalVisible(true)}/>
      <RegistrationModal isVisible={isSignInModalVisible} setIsVisible={setSignInModalVisible} errorMessage={errorMessage} setErrorMessage={setErrorMessage}>
        <SignInForm startButtonOnClick={handleSignIn} handleChangeAuthorizationType={handleChangeAuthorizationType}/>
      </RegistrationModal>
      <RegistrationModal isVisible={isSignUpModalVisible} setIsVisible={setSignUpModalVisible} errorMessage={errorMessage} setErrorMessage={setErrorMessage}>
        <SignUpForm startButtonOnClick={handleSignUp} handleChangeAuthorizationType={handleChangeAuthorizationType}/>
      </RegistrationModal>

      <AbstractBackgroundMesh />

      <div className="allContentContainer">
        <div className="mainContentContainer">
          <div className="textsContainer">
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
          <BorderedButton title="Learn More"/>
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
    </div>
  )
}

export default Start  