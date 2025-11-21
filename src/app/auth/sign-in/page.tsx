"use client"

import SignInForm from "@/components/RegistrationForms/SignInForm";
import AbstractBackgroundShapes from "@/components/UI/AbstractBackgroundShapes/AbstractBackgroundShapes";
import classes from "../auth.module.css"
import { useState } from "react";
import ErrorNotification from "@/components/UI/ErrorNotification/ErrorNotification";

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