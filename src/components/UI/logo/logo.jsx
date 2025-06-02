import React from "react";
import classes from './logo.module.css'

const Logo = () => {
  return (
    <div className={classes.logoContainer}>
      <p className={classes.logo}>WEALTHIFY</p>
      <p className={classes.beta}>beta</p>
    </div>
  )
}

export default Logo