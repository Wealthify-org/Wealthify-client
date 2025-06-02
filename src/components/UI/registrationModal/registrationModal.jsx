import React from "react";
import classes from './registrationModal.module.css'
import { motion, AnimatePresence } from 'framer-motion'

const RegistrationModal = ({children, isVisible, setIsVisible}) => {
  return (
    <AnimatePresence onExitComplete={() => setIsVisible(false)}>
      {isVisible && (
        <motion.div 
          className={`${classes.modal} ${isVisible ? classes.active : ''}`} 
          onClick={() => setIsVisible(false)}
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -25 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          <motion.div 
            className={classes.modalContent} 
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default RegistrationModal