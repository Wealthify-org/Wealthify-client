"use client"

import classes from "./StartHeader.module.css"
import Logo from "../Logo/Logo"
import BorderedLink from "../BorderedLink/BorderedLink"
import { ROUTES } from "@/lib/routes"
import { UnborderedLink } from "../UnborderenLink/UnborderedLink"
import { observer } from "mobx-react-lite"
import { useCurrentUserStore } from "@/stores/currentUser/CurrentUserProvider"
import { ProfileIcons } from "../HomeHeader/ProfileIcons/ProfileIcons"

const StartHeader = observer(() => {
  const currentUserStore = useCurrentUserStore();

  return (
    <header className={`${classes.headerBackground}`}>
      <Logo />

      { currentUserStore.isAuthenticated ? (
        <div className={classes.headerButtonsContainer}>
          <BorderedLink href={ROUTES.HOME}>Home</BorderedLink>
        </div>
      ) 
      : (
        <div className={classes.headerButtonsContainer}>
          <UnborderedLink href={ROUTES.SIGN_IN}>Sign in</UnborderedLink>
          <BorderedLink href={ROUTES.SIGN_UP}>Sign up</BorderedLink>
        </div>
      )}
    </header>
  )
})

export default StartHeader