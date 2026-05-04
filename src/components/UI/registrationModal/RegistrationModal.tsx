"use client"

import { useEffect, useState } from "react"
import classes from "./RegistrationModal.module.css"
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock"

type RegistrationModalProps = {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
}

const DURATION = 250

const RegistrationModal = ({children, isOpen, onClose}: RegistrationModalProps) => {
  const [active, setActive] = useState(false)

  // Блокируем скролл body пока открыта модалка — иначе колёсико
  // прокручивает страницу под scrim'ом.
  useBodyScrollLock(isOpen)

  useEffect(() => {
    if (!isOpen) {
      setActive(false);
      return
    }
    const id = requestAnimationFrame(() => setActive(true))
    return () => cancelAnimationFrame(id)
  }, [isOpen])

  // ESC закрывает модалку — раньше у RegistrationModal не было ESC-handler'а
  // в отличие от Sell/Confirm/CreatePortfolio модалок.
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])


  if (!isOpen && !active) {
    // полностью убираем модалку из DOM
    return null
  }

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
        active ? classes.active : "",
      ].join(" ")}
      role="dialog"
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