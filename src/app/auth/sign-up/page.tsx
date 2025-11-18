"use client"

import AbstractBackgroundShapes from "@/components/UI/AbstractBackgroundShapes/AbstractBackgroundShapes";
import classes from "../auth.module.css"
import SignUpForm from "@/components/RegistrationForms/SignUpForm";
import { useState } from "react";
import ErrorNotification from "@/components/UI/ErrorNotification/ErrorNotification";
import { CurrentUserProvider } from "@/stores/currentUser/CurrentUserProvider";
import { TokenProvider } from "@/stores/tokenStore/TokenProvider";

export default function SignUpPage() {
  const [errorMessage, setErrorMessage] = useState("")

  return (
    <main className={classes.authPage}>
      <div className={classes.authCard}>
        <ErrorNotification message={errorMessage} setErrorMessage={setErrorMessage} />
        <CurrentUserProvider>
          <TokenProvider>
            <SignUpForm variant="page" setErrorMessage={setErrorMessage} />
          </TokenProvider>
        </CurrentUserProvider>
      </div>
      <AbstractBackgroundShapes />
    </main>
  )
}