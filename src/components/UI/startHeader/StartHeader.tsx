import classes from "./StartHeader.module.css"
import Logo from "../Logo/Logo"
import BorderedLink from "../BorderedLink/BorderedLink"
import Link from "next/link"
import { ROUTES } from "@/lib/routes"
import { UnborderedLink } from "../UnborderenLink/UnborderedLink"

const StartHeader = () => {
  return (
    <header className={`${classes.headerBackground}`}>
      <Logo />
      <div className={classes.headerButtonsContainer}>
        <UnborderedLink href={ROUTES.SIGN_IN}>Sign in</UnborderedLink>
        <BorderedLink href={ROUTES.SIGN_UP}>Sign up</BorderedLink>
      </div>
    </header>
  )
}

export default StartHeader