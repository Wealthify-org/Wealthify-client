import React from "react";
import classes from "./abstractBackgroundMesh.module.css"
import { motion } from "framer-motion";

const AbstractBackgroundMesh = () => {
  return (
    <div>
      <motion.div 
        className={`${classes.abstractShape} ${classes.shape1}`}
        animate={{ x: [0, 500, 100], y: [0, -150, 150], rotate: [10, 70, 0]}}
        transition={{
          duration: 30,
          ease: [0.2, 0, 0.8, 1],
          repeat: Infinity,
          repeatType: 'reverse'
        }}
      />
      <motion.div 
        className={`${classes.abstractShape} ${classes.shape2}`}
        animate={{ x: [0, -400, 600], y: [0, -200, 350], rotate: [77, -60, 20] }}
        transition={{
          duration: 30,
          ease: [0.2, 0, 0.5, 1],
          repeat: Infinity,
          repeatType: 'reverse'
        }}
      />
      <motion.div 
        className={`${classes.abstractShape} ${classes.shape3}`}
        animate={{ x: [0, -600, 300], y: [0, -250, 150], rotate: [165, 60, -20]}}
        transition={{
          duration: 30,
          ease: [0.2, 0, 0.5, 1],
          repeat: Infinity,
          repeatType: 'reverse'
        }}
      />
    </div>
  )
}

export default AbstractBackgroundMesh