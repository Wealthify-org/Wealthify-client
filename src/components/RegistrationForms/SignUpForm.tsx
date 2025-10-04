'use client'

import { signUpSchema, type AuthProps, type SignUpSchema } from "./types"
import classes from './RegistrationForms.module.css'

import RegistrationInput from "../UI/registrationInput/RegistrationInput"
import MeshGradientButton from "../UI/meshGradientButton/MeshGradientButton"
import { signUpAction } from "@/actions/auth"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

export default function SignUpForm({variant}: AuthProps) {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema)
  })

  const handleChangeAuthorizationType = () => {
    if (variant === 'modal') {
      router.replace('/sign-in')
    } else {
      router.push('/sign-in')
    }
  }

  const onSubmit = async (data: SignUpSchema) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // await signInAction(userData)
    } catch (err: any) {
    
    } finally {

    }
  }

  return (
    <form noValidate className={classes.registrationFormContainer} onSubmit={handleSubmit(onSubmit)} aria-labelledby="signin-title">
      <fieldset className={classes.fieldset}>
        <div className={classes.fieldContainer}>
          <label htmlFor="username" className={classes.textFieldName}>username</label>
          <RegistrationInput
            {...register('username')}
            id="username"
            name="username"
            type="text"
            placeholder="Enter your username"
            autoComplete="username"
            aria-invalid={Boolean(errors.username)}
            aria-describedby={errors.username ? 'username-error' : undefined}
          />
          {
          errors.username && (
            <p id="username-error" role="alert" className={classes.fieldError}>
              {errors.username.message}
            </p>
          )}
        </div>
        <br className={classes.br}/>
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
        <p className={classes.alreadyHaveAccount}>
          already have an account?
        </p>
        <button type='button' onClick={handleChangeAuthorizationType} className={classes.switchToOtherFormButton}>
          Sign In
        </button>
      </div>
      <MeshGradientButton disabled={isSubmitting} type="submit" title='Get Started' />
    </form>
  )
}