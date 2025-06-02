import React from "react";
import classes from './registrationInput.module.css'

const RegistrationInput = ({...props}) => {
  return (
    <div>
      <input className={classes.regInput} required {...props} />
    </div>
  )
}

export default RegistrationInput