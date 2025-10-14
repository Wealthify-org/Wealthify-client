"use client"

import SignInForm from "@/components/RegistrationForms/SignInForm";
import AbstractBackgroundShapes from "@/components/UI/abstractBackgroundShapes/AbstractBackgroundShapes";
import classes from "@/app/auth.module.css"
import { useState } from "react";
import ErrorNotification from "@/components/UI/errorNotification/ErrorNotification";

export default function SignInPage() {
  const [errorMessage, setErrorMessage] = useState("")
  return (
    <main className={classes.authPage}>
      <div className={classes.authCard}>
        <ErrorNotification message={errorMessage} setErrorMessage={setErrorMessage} />
        <SignInForm variant="page" setErrorMessage={setErrorMessage} />
      </div>
      <AbstractBackgroundShapes />
    </main>
  )
}