"use client"

import { useState } from "react"
import { SearchBar } from "../SearchBar/SearchBar"
import classes from "./HomeHeader.module.css"

export const HomeHeader = () => {
  const [searchValue, setSearchValue] = useState("");

  const handleSubmit = (value: string) => {
    // TODO: сделать поиск выпадающим окном, как на dropstab

    console.log(`search - ${value}`);
  }

  return (
    <header className={classes.header}>
      <SearchBar
        value={searchValue}
        onChange={setSearchValue}
        onSubmit={handleSubmit}
        placeholder="Search stock, crypto or smart contract"
      />

      <div>
        ICONS
      </div>
    </header>
  )
}