'use client'

import { useEffect, useState } from 'react'
import classes from './RegistrationModal.module.css'

type RegistrationModalProps = {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void 
}

const DURATION = 250

const RegistrationModal = ({children, isOpen, onClose}: RegistrationModalProps) => {
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const id = requestAnimationFrame(() => setActive(true))
    return () => cancelAnimationFrame(id)
  }, [isOpen])


  const close = () => {
    setActive(false)
    setTimeout(() => { 
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