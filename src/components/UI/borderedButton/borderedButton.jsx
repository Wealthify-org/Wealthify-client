import React from "react";
import classes from './borderedButton.module.css'

const BorderedButton = ({title, ...props}) => {
  return (
    <button className={classes.btn} {...props}>
      {title}
    </button>
  )
}

export default BorderedButton