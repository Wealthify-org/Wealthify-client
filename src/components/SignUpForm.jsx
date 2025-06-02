import React from "react";
import { useState } from "react";
import RegistrationInput from "./UI/registrationInput/RegistrationInput";

const SignUpForm = ({startButtonOnClick}) => {
  const [emailValue, setEmailValue] = useState('')
  const [passwordValue, setPasswordValue] = useState('')
  const [nicknameValue, setNicknameValue] = useState('')
  const [errors, setErrors] = useState('')

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailPattern.test(email)
  }

  const validatePassword = (password) => {
    return password.length >= 6
  }

  const handleSubmit = (err) => {
    err.preventDefault()
    let newErrors = {}

    if(!nicknameValue.trim()) {
      newErrors.nicknameValue = "Enter nickname"
      setNicknameValue('')
    }

    if(!emailValue.trim()) {
      newErrors.emailValue = "Enter e-mail"
      setEmailValue('')
    } else if (!validateEmail(emailValue)) {
      newErrors.emailValue = "Incorrect e-mail"
      setEmailValue('')
    }

    if (!passwordValue.trim()) {
      newErrors.passwordValue = 'Enter password'
      setPasswordValue('')
    } else if (!validatePassword(passwordValue)) {
      newErrors.passwordValue = 'Password should not be shorter than 6 symbols'
      setPasswordValue('')
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    startButtonOnClick()
  }

  const handleNicknameChange = (newValue) => {
    setNicknameValue(newValue)
    if (newValue.trim()) {
      setErrors((prev) => ({...prev, nicknameValue: undefined}))
    }
  }

  const handleEmailChange = (newValue) => {
    setEmailValue(newValue)
    if (newValue.trim() && validateEmail(newValue)) {
      setErrors((prev) => ({...prev, emailValue: undefined}))
    }
  }

  const handlePasswordChange = (newValue) => {
    setPasswordValue(newValue)
    if (newValue.trim() && validatePassword(newValue)) {
      setErrors((prev) => ({...prev, passwordValue: undefined}))
    }
  }

  return (
    <form className="signInFormContainer">
      <div className="textFieldContainer1">
        <p className="textFieldName">
          username
        </p>
        {errors.nicknameValue && <p className="textFieldName" style={{color: "var(--error_color)", fontWeight: 500}}>{errors.nicknameValue}</p>}
        <RegistrationInput 
          type='text' 
          placeholder='Enter your username' 
          onChange={(e) => handleNicknameChange(e.target.value)}
          style={{
            boxShadow: errors.nicknameValue 
            ? "0 0.5rem 1rem var(--error_shadow)" 
            : "",
          color: errors.nicknameValue ? "var(--error_color)" : "var(--secondary_color)"
          }}
        />
      </div>

      <div className="textFieldContainer1">
        <p className="textFieldName">
          e-mail
        </p>
        {errors.emailValue && <p className="textFieldName" style={{color: "var(--error_color)", fontWeight: 500}}>{errors.emailValue}</p>}
        <RegistrationInput 
          type='email' 
          placeholder='Enter your e-mail'
          onChange={(e) => handleEmailChange(e.target.value)}
          style={{
            boxShadow: errors.emailValue 
              ? "0 0.5rem 1rem var(--error_shadow)" 
              : "",
            color: errors.emailValue ? "var(--error_color)" : "var(--secondary_color)",
          }}
        />
      </div>

      <div className="textFieldContainer2">
        <p className="textFieldName">
          password
        </p>
        {errors.passwordValue && <p className="textFieldName" style={{color: "var(--error_color)", fontWeight: 500}}>{errors.passwordValue}</p>}
        <RegistrationInput 
          type='password' 
          placeholder='Enter your password'
          onChange={(e) => handlePasswordChange(e.target.value)}
          style={{
            boxShadow: errors.emailValue 
              ? "0 0.5rem 1rem var(--error_shadow)" 
              : "",
            color: errors.emailValue ? "var(--error_color)" : "var(--secondary_color)",
          }}
        />
      </div>
      <div className="switchRegTypeContainer">
        <p className="noAccountText">
          already have an account?
        </p>
        <button type="button" className="switchToSignUpButton">
          Sign In
        </button>
      </div>
      <button type="submit" className="startButton" onClick={handleSubmit}>
        Get Started
      </button>
    </form>
  )
}

export default SignUpForm
