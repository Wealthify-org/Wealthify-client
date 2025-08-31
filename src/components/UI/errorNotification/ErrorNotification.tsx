import { useEffect, useState } from "react"
import classes from './ErrorNotification.module.css'
import { motion, AnimatePresence } from "framer-motion";

type ErrorNotificationProps = {
  message: string
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>
}

const ErrorNotification = ({ message, setErrorMessage }: ErrorNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!message) return

    setIsVisible(true)

    const timer = setTimeout(() => {
      setIsVisible(false)
      setErrorMessage('')
    }, 5000)

    return () => clearTimeout(timer)
  }, [message, setErrorMessage])

  const handleAnimationComplete = () => {
    if (!isVisible) {
      setErrorMessage('')
    }
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
        onAnimationComplete={handleAnimationComplete}
      >
        {message}
      </motion.div>
      )}   
    </AnimatePresence>
  )
}

export default ErrorNotification