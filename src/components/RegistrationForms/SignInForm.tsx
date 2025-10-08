'use client'

import {signInSchema, type AuthProps, type SignInSchema } from "./types"
import classes from './RegistrationForms.module.css'

import RegistrationInput from "../UI/registrationInput/RegistrationInput"
import MeshGradientButton from "../UI/meshGradientButton/MeshGradientButton"
import { signInAction } from "@/actions/auth"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

export default function SignInForm({variant}: AuthProps) {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    // setError,
  } = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema)
  })

  const handleChangeAuthorizationType = () => {
    if (variant === 'modal') {
      router.replace('/sign-up')
    } else {
      router.push('/sign-up')
    }
  }

  const onSubmit = async (data: SignInSchema) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await signInAction(data)
    } catch {
      
    } finally {
    }
  }

  return (
  <form noValidate className={classes.signInFormContainer} onSubmit={handleSubmit(onSubmit)} aria-labelledby="signin-title">
    <fieldset className={classes.fieldset}>
      <div className={classes.fieldContainer}>
        <label htmlFor="email" className={classes.textFieldName}>E-mail</label>
        <RegistrationInput
          {...register('email')}
          id="email"
          name="email"
          type="email"
          placeholder="name@example.com"
          autoComplete="email"
          inputMode="email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {
        errors.email && (
          <p id="email-error" role="alert" className={classes.fieldError}>
            {errors.email.message}
          </p>
        )}
      </div>
      <br className={classes.br}/>
      <div className={classes.fieldContainer}>
        <label htmlFor="password" className={classes.textFieldName}>Password</label>
        <RegistrationInput
          {...register('password')} 
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          aria-labelledby={errors.password ? 'password-error': undefined}
        />
        {
        errors.password && (
          <p id="password-error" role="alert" className={classes.fieldError}>
            {errors.password.message}
          </p>
        )}
      </div>
    </fieldset>
    <div className={classes.switchRegTypeContainer}>
      <p className={classes.noAccountText}>
        don&apos;t have an account?
      </p>
      <button type='button' onClick={handleChangeAuthorizationType} className={classes.switchToOtherFormButton}>
        Sign Up
      </button>
    </div>
    <MeshGradientButton disabled={isSubmitting} type="submit" title='Get Started' />
  </form>
  )
}