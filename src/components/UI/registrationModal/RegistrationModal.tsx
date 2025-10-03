'use client'

import { useEffect, useRef, useState } from 'react'
// import ErrorNotification from "../errorNotification/ErrorNotification"
import classes from './RegistrationModal.module.css'

type RegistrationModalProps = {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void 
}

const DURATION = 250

const RegistrationModal = ({children, isOpen, onClose}: RegistrationModalProps) => {
  const [mounted, setMounted] = useState(false)
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setMounted(true)
    const id = requestAnimationFrame(() => setActive(true))
    return () => cancelAnimationFrame(id)
  }, [isOpen])


  const close = () => {
    setActive(false)
    setTimeout(() => {
      setMounted(false) 
      onClose()         
    }, DURATION )
  }

  return (
    <div 
      className={[
        classes.modal,
        classes.visible,
        active ? classes.active : '',
      ].join(' ')}
      role='dialog'
      aria-modal="true"
      onClick={close}
    >
      <div className={classes.modalWrapper}>
        {/* <ErrorNotification message={errorMessage} setErrorMessage={setErrorMessage} /> */}
        <div 
          className={classes.modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>     
    </div>
  )
}

export default RegistrationModal