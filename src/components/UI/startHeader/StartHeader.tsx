import { useEffect, useState } from "react"
import classes from './StartHeader.module.css'
import Logo from "../logo/Logo"
import BorderedButton from "../borderedButton/BorderedButton"

type Props = {
  signInOnClick: () => void
  signUpOnClick: () => void
}

const StartHeader = ({signInOnClick, signUpOnClick}: Props) => {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`${classes.headerBackground} ${isScrolled ? classes.scrolled : ''}`}>
      <Logo />
      <div className={classes.headerButtonsContainer}>
        <button className={classes.unborderedButton} onClick={signInOnClick}>Sign in</button>
        <BorderedButton onClick={signUpOnClick}>Sign up</BorderedButton>
      </div>
    </header>
  )
}

export default StartHeader