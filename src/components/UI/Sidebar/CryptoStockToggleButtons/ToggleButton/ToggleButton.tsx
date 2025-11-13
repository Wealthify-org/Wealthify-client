"use client"

import classes from "./ToggleButton.module.css"

type ToggleButtonProps = {
  isDisabled: boolean;
  selected: boolean;
  onChange: () => void;
  children: React.ReactNode
};

export const ToggleButton = ({isDisabled, selected, onChange, children}: ToggleButtonProps) => {
  return (
    <button 
      className={`${classes.toggleButton} ${selected ? classes.selected : classes.unselected}`} 
      disabled={isDisabled} 
      onClick={() => !isDisabled && onChange()}>
      {children}
    </button>
  )
}