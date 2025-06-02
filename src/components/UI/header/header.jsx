import React, {useState, useEffect } from "react";
import classes from './header.module.css'
import Logo from '../logo/logo'
import BorderedButton from "../borderedButton/borderedButton";
import UnborderedButton from "../unborderedButton/unborderedButton";

const Header = ({signInOnClick, signUpOnClick}) => {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className={`${classes.headerBackground} ${isScrolled ? classes.scrolled : '' }`}>
      <Logo />
      <div className={classes.headerButtonsContainer}>
        <UnborderedButton title="Sign in" onClick={signInOnClick}/>
        <BorderedButton title="Sign up" onClick={signUpOnClick}/>
      </div>
    </div>
  )
}

export default Header