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

/**
 * StartHeader рендерится в трёх состояниях:
 *  1. `hydrated === false` — `AppProviders` ещё не сделал /auth/refresh, мы не
 *     знаем авторизован ли юзер. Чтобы не фликать между «Sign in / Sign up»
 *     и «Home», показываем скелетон-плашки той же ширины.
 *  2. `hydrated && isAuthenticated` — один Home-button (без дубля).
 *  3. `hydrated && !isAuthenticated` — Home-link + Sign in + Sign up.
 *
 * LanguageSwitcher и Logo показываются всегда — они не зависят от состояния.
 */
const StartHeader = observer(() => {
  const currentUserStore = useCurrentUserStore();
  const t = useTranslations("auth.buttons");
  const tFooter = useTranslations("footer");

  return (
    <header className={`${classes.headerBackground}`}>
      <Logo />

      <div className={classes.headerButtonsContainer}>
        {!currentUserStore.hydrated ? (
          // Skeleton показываем под РЕАЛЬНЫЙ layout гостя:
          // Home + Sign in + Sign up + LanguageSwitcher.
          // Все 4 плашки одной высоты (36px), вид у scrim'а одинаковый —
          // не «прыгает» когда состояние догрузится.
          <div className={classes.skeletonGroup} aria-hidden>
            <span className={`${classes.skeleton} ${classes.skeletonNav}`} />
            <span className={`${classes.skeleton} ${classes.skeletonBtn}`} />
            <span className={`${classes.skeleton} ${classes.skeletonBtn}`} />
            <span className={`${classes.skeleton} ${classes.skeletonChip}`} />
          </div>
        ) : currentUserStore.isAuthenticated ? (
          // ── Авторизован: один Home-button, без дублей ──
          <>
            <BorderedLink href={ROUTES.HOME}>
              {tFooter("links.home")}
            </BorderedLink>
            <LanguageSwitcher />
          </>
        ) : (
          // ── Гость: Home (текст) + Sign in + Sign up ──
          <>
            <UnborderedLink
              href={ROUTES.HOME}
              classNames={classes.headerNavLink}
            >
              {tFooter("links.home")}
            </UnborderedLink>
            <UnborderedLink href={ROUTES.SIGN_IN}>{t("signIn")}</UnborderedLink>
            <BorderedLink href={ROUTES.SIGN_UP}>{t("signUp")}</BorderedLink>
            <LanguageSwitcher />
          </>
        )}
      </div>
    </header>
  )
})

export default StartHeader
