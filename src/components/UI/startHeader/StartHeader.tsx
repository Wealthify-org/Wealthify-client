import classes from './StartHeader.module.css'
import Logo from "../logo/Logo"
import BorderedLink from "../borderedButton/BorderedButton"
import Link from 'next/link'

const StartHeader = () => {
  return (
    <header className={`${classes.headerBackground}`}>
      <Logo />
      <div className={classes.headerButtonsContainer}>
        <Link href='/sign-in' className={classes.unborderedButton}>Sign in</Link>
        <BorderedLink href='/sign-up'>Sign up</BorderedLink>
      </div>
    </header>
  )
}

export default StartHeader