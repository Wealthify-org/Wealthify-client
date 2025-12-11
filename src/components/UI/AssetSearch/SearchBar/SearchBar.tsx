"use client"

import classes from "./SearchBar.module.css"
import { FocusEventHandler, FormEvent } from "react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (v: string) => void;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  isSearchResultsOpen: boolean;
  placeholder: string;
}

export const SearchBar = ({
  value, 
  onChange,
  onSubmit,
  onFocus,
  isSearchResultsOpen,
  placeholder = "Search stock crypto or smart contract"
}: SearchBarProps) => {
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(value.trim());
  }
  
  return (
    <form 
      role="search" 
      aria-label="Global search" 
      onSubmit={submit} 
      className={`${classes.searchBarContainer} ${isSearchResultsOpen ? classes.searchResultsOpen : ""}`}
    >
      <label htmlFor="searchBar" className={classes.searchBar} hidden>
        Search for Asset
      </label>

      <span aria-hidden className={classes.maginfyingGlassIcon} />

      <input 
        id="searchBar"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        enterKeyHint="search"
        className={classes.input}
        onFocus={onFocus}
      />

      <button 
        type="button"
        aria-label="Clear search"
        className={`${classes.clear} ${value ? classes.clearVisible : ""}`}
        onClick={() => onChange("")}
      />
    </form>
  )
}