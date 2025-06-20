import React from "react";
import classes from "./meshGradientButton.module.css"

const MeshGradientButton = ({title, props}) => {
  return (
    <button className={classes.meshGradientButton} {...props}>
      <span className={classes.text}>{title}</span>
      <span className={classes.blob}></span>
      <span className={classes.blob}></span>
      <span className={classes.blob}></span>
    </button>
  )
} 

export default MeshGradientButton