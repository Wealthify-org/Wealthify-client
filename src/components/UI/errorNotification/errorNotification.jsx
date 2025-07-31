import React, { useEffect, useState } from "react";
import classes from './errorNotification.module.css'
import { motion, AnimatePresence } from "framer-motion";


const ErrorNotification = ({ message, setErrorMessage }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!message) return;

    setIsVisible(true)

    const timer = setTimeout(() => {
      setIsVisible(false)
      setErrorMessage(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [message, setErrorMessage])

  const handleAnimationCompete = () => {
    if (!isVisible)
      setErrorMessage('')
  }

  return (
    <AnimatePresence>
      {isVisible && (
      <motion.div
        className={classes.error}
        initial={{opacity: 0, y: 0}}
        animate={{opacity: 1, y: -70}}
        exit={{opacity: 0, y: 0}}
        transition={{ duration: 0.65, ease: 'easeInOut' }}
        onAnimationComplete={handleAnimationCompete}
      >
        {message}
      </motion.div>
      )}   
    </AnimatePresence>
  )
}

export default ErrorNotification