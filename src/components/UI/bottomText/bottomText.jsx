import React from "react";
import classes from './bottomText.module.css'

const BottomText = ({children}) => {
  return (
    <p className={classes.bottomText}>
      {children}
    </p>
  )
}

export default BottomText