import React from "react";
import classes from './registrationModal.module.css'
import { motion, AnimatePresence } from 'framer-motion'
import ErrorNotification from "../errorNotification/errorNotification";

const RegistrationModal = ({children, isVisible, setIsVisible, errorMessage, setErrorMessage}) => {
  return (
    <AnimatePresence onExitComplete={() => setIsVisible(false)}>
      {isVisible && (
        <motion.div 
          className={`${classes.modal} ${isVisible ? classes.active : ''}`} 
          onClick={() => setIsVisible(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          <div className={classes.modalWrapper}>
            <ErrorNotification message={errorMessage} setErrorMessage={setErrorMessage} />
            <motion.div 
            className={classes.modalContent} 
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -25 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {children}
          </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default RegistrationModal