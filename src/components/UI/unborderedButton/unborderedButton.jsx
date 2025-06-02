import React from "react";
import classes from './unborderedButton.module.css'

const UnborderedButton = ({title, ...props}) => {
  return (
    <button className={classes.btn} {...props}>
      {title}
    </button>
  )
}

export default UnborderedButton