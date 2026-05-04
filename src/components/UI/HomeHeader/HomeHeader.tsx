"use client"

import { useTranslations } from "next-intl";

import classes from "./HomeHeader.module.css"
import { ProfileIcons } from "./ProfileIcons/ProfileIcons"
import { AssetsSearch } from "../AssetSearch/AssetSearch"
import { LanguageSwitcher } from "../LanguageSwitcher/LanguageSwitcher"

export const HomeHeader = () => {
  const t = useTranslations("header");

  const toggleSidebar = () => {
    const root = document.documentElement;
    const isOpen = root.getAttribute("data-sidebar-open") === "1";
    root.setAttribute("data-sidebar-open", isOpen ? "0" : "1");
  };

  return (
    <header className={classes.header} data-home-header="1">
      <div className={classes.searchBarContainer}>
        <button
          type="button"
          className={classes.sidebarToggle}
          onClick={toggleSidebar}
          aria-label={t("openSidebarAriaLabel")}
        >
          <span className={classes.burgerLine} />
          <span className={classes.burgerLine} />
          <span className={classes.burgerLine} />
        </button>
        <AssetsSearch />
      </div>
      <div className={classes.profileIconsWrapper}>
        <LanguageSwitcher />
        <ProfileIcons/>
      </div>
    </header>
  )
}
