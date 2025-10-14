import classes from "./StartHeader.module.css"
import Logo from "../logo/Logo"
import BorderedLink from "../borderedButton/BorderedButton"
import Link from "next/link"
import { ROUTES } from "@/lib/routes"

const StartHeader = () => {
  return (
    <header className={`${classes.headerBackground}`}>
      <Logo />
      <div className={classes.headerButtonsContainer}>
        <Link href={ROUTES.SIGN_IN} className={classes.unborderedButton}>Sign in</Link>
        <BorderedLink href={ROUTES.SIGN_UP}>Sign up</BorderedLink>
      </div>
    </header>
  )
}

export default StartHeader