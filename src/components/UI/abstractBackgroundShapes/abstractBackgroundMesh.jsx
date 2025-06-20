import React from "react";
import classes from "./abstractBackgroundMesh.module.css"

const AbstractBackgroundMesh = () => {
  return (
    <div>
      <div className={`${classes.abstractShape} ${classes.shape1}`}></div>
      <div className={`${classes.abstractShape} ${classes.shape2}`}></div>
      <div className={`${classes.abstractShape} ${classes.shape3}`}></div>
    </div>
  )
}

export default AbstractBackgroundMesh