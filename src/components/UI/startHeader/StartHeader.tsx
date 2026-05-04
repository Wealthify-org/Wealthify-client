"use client"

import { useTranslations } from "next-intl";

import classes from "./StartHeader.module.css"
import Logo from "../Logo/Logo"
import BorderedLink from "../BorderedLink/BorderedLink"
import { ROUTES } from "@/lib/routes"
import { UnborderedLink } from "../UnborderenLink/UnborderedLink"
import { observer } from "mobx-react-lite"
import { useCurrentUserStore } from "@/stores/currentUser/CurrentUserProvider"
import { LanguageSwitcher } from "../LanguageSwitcher/LanguageSwitcher"

const StartHeader = observer(() => {
  const currentUserStore = useCurrentUserStore();
  const t = useTranslations("auth.buttons");

  return (
    <header className={`${classes.headerBackground}`}>
      <Logo />

      <div className={classes.headerButtonsContainer}>
        {currentUserStore.isAuthenticated ? (
          <BorderedLink href={ROUTES.HOME}>Home</BorderedLink>
        ) : (
          <>
            <UnborderedLink href={ROUTES.SIGN_IN}>{t("signIn")}</UnborderedLink>
            <BorderedLink href={ROUTES.SIGN_UP}>{t("signUp")}</BorderedLink>
          </>
        )}
        <LanguageSwitcher />
      </div>
    </header>
  )
})

export default StartHeader
