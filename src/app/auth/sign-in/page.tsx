"use client"

import SignInForm from "@/components/RegistrationForms/SignInForm";
import AbstractBackgroundShapes from "@/components/UI/AbstractBackgroundShapes/AbstractBackgroundShapes";
import classes from "../auth.module.css"
import { useState } from "react";
import ErrorNotification from "@/components/UI/ErrorNotification/ErrorNotification";
import { CurrentUserProvider } from "@/stores/currentUser/CurrentUserProvider";
import { TokenProvider } from "@/stores/tokenStore/TokenProvider";

export default function SignInPage() {
  const [errorMessage, setErrorMessage] = useState("")
  return (
    <main className={classes.authPage}>
      <div className={classes.authCard}>
        <ErrorNotification message={errorMessage} setErrorMessage={setErrorMessage} />
        <CurrentUserProvider>
          <TokenProvider>
            <SignInForm variant="page" setErrorMessage={setErrorMessage} />
          </TokenProvider>
        </CurrentUserProvider>
      </div>
      <AbstractBackgroundShapes />
    </main>
  )
}