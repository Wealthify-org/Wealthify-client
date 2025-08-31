import { useState } from "react"
import { validateEmail, validatePassword } from "./validation"
import type { AuthFormProps, SUErrorState, SUStartButtonOnClickArgs } from "./types"
import classes from './RegistrationForms.module.css'

import RegistrationInput from "../UI/registrationInput/RegistrationInput"
import MeshGradientButton from "../UI/meshGradientButton/MeshGradientButton"

const SignUpForm = ({startButtonOnClick, handleChangeAuthorizationType}: AuthFormProps<SUStartButtonOnClickArgs>) => {
  const [emailValue, setEmailValue] = useState('')
  const [passwordValue, setPasswordValue] = useState('')
  const [usernameValue, setUsernameValue] = useState('')
  const [errors, setErrors] = useState<SUErrorState>()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    let newErrors: SUErrorState = {}

    if (!usernameValue.trim()) {
      newErrors.usernameValue = 'Enter username'
    }

    if (!emailValue.trim()) {
      newErrors.emailValue = 'Enter e-mail'
    } else if (!validateEmail(emailValue)) {
      newErrors.emailValue = 'Incorrect e-mail'
    }

    if (!passwordValue.trim()) {
      newErrors.passwordValue = 'Enter password'
    } else if (!validatePassword(passwordValue)) {
      newErrors.passwordValue = 'Password should not be sorter than 6 symbols'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const userData = {
      email: emailValue,
      password: passwordValue,
      username: usernameValue
    }

    startButtonOnClick(userData)
  }

  const handleUsernameChange = (newValue: string) => {
    setUsernameValue(newValue)
    if (newValue.trim()) {
      setErrors((prev) => ({...prev, usernameValue: undefined}))
    }
  }

  const handleEmailChange = (newValue: string) => {
    setEmailValue(newValue) 
    if (newValue.trim() && validateEmail(newValue)) {
      setErrors((prev) => ({...prev, emailValue: undefined}))
    }
  }

  const handlePasswordChange = (newValue: string) => {
    setPasswordValue(newValue)
    if (newValue.trim() && validatePassword(newValue)) {
      setErrors((prev) => ({...prev, passwordValue: undefined}))
    }
  }

  return (
    <form className={classes.registrationFormContainer} onSubmit={handleSubmit} noValidate aria-labelledby="signin-title">
      <fieldset className={classes.fieldset}>
        <div className={classes.fieldContainer}>
          <label htmlFor="username" className={classes.textFieldName}>username</label>
          {errors?.usernameValue && (
            <p id="username-error" role="alert" className={classes.fieldError}>
              {errors.usernameValue}
            </p>
          )}

          <RegistrationInput
            id="username"
            name="username"
            type="text"
            value={usernameValue}
            required
            onChange={(e) => handleUsernameChange(e.target.value)}
            placeholder="Enter your username"
            autoComplete="username"
            aria-invalid={Boolean(errors?.usernameValue)}
            aria-describedby={errors?.usernameValue ? 'username-error' : undefined}
          />
        </div>
        <br className={classes.br}/>
        <div className={classes.fieldContainer}>
          <label htmlFor="email" className={classes.textFieldName}>E-mail</label>
          {errors?.emailValue && (
            <p id="email-error" role="alert" className={classes.fieldError}>
              {errors.emailValue}
            </p>
          )}

          <RegistrationInput
            id="email"
            name="email"
            type="email"
            value={emailValue}
            required
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder="name@example.com"
            autoComplete="email"
            inputMode="email"
            aria-invalid={Boolean(errors?.emailValue)}
            aria-describedby={errors?.emailValue ? 'email-error' : undefined}
          />
        </div>
        <br className={classes.br}/>
        <div className={classes.fieldContainer}>
          <label htmlFor="password" className={classes.textFieldName}>Password</label>
          {errors?.passwordValue && (
            <p id="password-error" role="alert" className={classes.fieldError}>
              {errors.passwordValue}
            </p>
          )}

          <RegistrationInput 
            id="password"
            name="password"
            type="password"
            value={passwordValue}
            required
            onChange={(e) => handlePasswordChange(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors?.passwordValue)}
            aria-labelledby={errors?.passwordValue ? 'password-error': undefined}
          />
        </div>
      </fieldset>
      <div className={classes.switchRegTypeContainer}>
        <p className={classes.alreadyHaveAccount}>
          already have an account?
        </p>
        <button type="button" className={classes.switchToOtherFormButton} onClick={handleChangeAuthorizationType}>
          Sign In
        </button>
      </div>
      <MeshGradientButton type="submit" title='Get Started' />
    </form>
  )
}

export default SignUpForm