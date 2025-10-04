import type React from "react"
import classes from './RegistrationInput.module.css'

type RegistrationInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  id: string
}

const RegistrationInput = ({id, ...props}: RegistrationInputProps) => {
  return (
    <input 
      id={id} 
      className={classes.registrationInput} 
      {...props} />
  )
}

export default RegistrationInput