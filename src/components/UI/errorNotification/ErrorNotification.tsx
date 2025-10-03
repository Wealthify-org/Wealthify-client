'use client'

import { useEffect, useState } from "react"
import classes from './ErrorNotification.module.css'

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
    }, 5000)

    return () => clearTimeout(timer)
  }, [message, setErrorMessage])

  const handleAnimationComplete = () => {
    if (!isVisible && message !== '') {
      setErrorMessage('')
    }
  }

  return (
    <div
      className={`${classes.error} ${isVisible ? classes.shown : ''}`}
      onTransitionEnd={handleAnimationComplete}
      role="status"
      aria-live="polite"
      aria-hidden={!isVisible}
    >
      {message}
    </div>
  )
}

export default ErrorNotification