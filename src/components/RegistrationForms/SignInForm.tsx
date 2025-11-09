"use client"

import {signInSchema, type AuthProps, type SignInSchema } from "@/lib/types/auth-types"
import classes from "./RegistrationForms.module.css"

import RegistrationInput from "../UI/registrationInput/RegistrationInput"
import MeshGradientButton from "../UI/meshGradientButton/MeshGradientButton"
import { signInAction } from "@/actions/auth"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { ROUTES } from "@/lib/routes"
import { useTokenStore } from "@/stores/tokenStore/TokenProvider"
import { useCurrentUserStore } from "@/stores/currentUser/CurrentUserProvider"

export default function SignInForm({variant, setErrorMessage}: AuthProps) {
  const router = useRouter();
  const tokenStore = useTokenStore();
  const currentUserStore = useCurrentUserStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    mode: "onChange",
    reValidateMode: "onChange",
  })

  const handleChangeAuthorizationType = () => {
    console.log(variant)
    if (variant === "modal") {
      router.replace(ROUTES.SIGN_UP)
    } else {
      window.location.assign(ROUTES.SIGN_UP)
    }
  }

  const onSubmit = async (data: SignInSchema) => {
    const actionResponse = await signInAction(data)
    console.log(actionResponse)
    if (!actionResponse.ok) {
      setErrorMessage(actionResponse.error)
      return
    }

    if (actionResponse.accessToken) {
      tokenStore.setFromLogin(actionResponse.accessToken);
    } else {
      await tokenStore.refresh();
    }

    currentUserStore.setUser(actionResponse.user);

    if (actionResponse.ok) {
      router.push(ROUTES.HOME)
    }
  }

  return (
  <form noValidate className={classes.registrationFormContainer} onSubmit={handleSubmit(onSubmit)} aria-labelledby="signin-title">
    <fieldset className={classes.fieldset}>
      <div className={classes.fieldContainer}>
        <label htmlFor="email" className={classes.textFieldName}>E-mail</label>
        <RegistrationInput
          {...register("email")}
          id="email"
          name="email"
          type="email"
          placeholder="name@example.com"
          autoComplete="email"
          inputMode="email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
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
          {...register("password")} 
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          aria-labelledby={errors.password ? "password-error": undefined}
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
      <button type="button" onClick={handleChangeAuthorizationType} className={classes.switchToOtherFormButton}>
        Sign Up
      </button>
    </div>
    <MeshGradientButton disabled={isSubmitting} type="submit" title="Get Started" />
  </form>
  )
}