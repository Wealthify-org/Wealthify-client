"use client"

import { useState } from "react"
import { SearchBar } from "../SearchBar/SearchBar"
import classes from "./HomeHeader.module.css"
import { ProfileIcons } from "./ProfileIcons/ProfileIcons"

export const HomeHeader = () => {
  const [searchValue, setSearchValue] = useState("");

  const handleSubmit = (value: string) => {
    // TODO: сделать поиск выпадающим окном, как на dropstab

    console.log(`search - ${value}`);
  }

  const toggleSidebar = () => {
    const root = document.documentElement;
    const isOpen = root.getAttribute("data-sidebar-open") === "1";
    console.log(isOpen)
    root.setAttribute("data-sidebar-open", isOpen ? "0" : "1");
  };

  return (
    <header className={classes.header} data-home-header="1">
      <div className={classes.searchBarContainer}>
        <button
          type="button"
          className={classes.sidebarToggle}
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <span className={classes.burgerLine} />
          <span className={classes.burgerLine} />
          <span className={classes.burgerLine} />
        </button>
        <SearchBar
          value={searchValue}
          onChange={setSearchValue}
          onSubmit={handleSubmit}
          placeholder="Search stock, crypto or smart contract"
        />
      </div>
      <div className={classes.profileIconsWrapper}>
        <ProfileIcons isUserAuthorized={false}/>
      </div>
    </header>
  )
}