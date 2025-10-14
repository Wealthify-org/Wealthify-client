"use client"

import AbstractBackgroundShapes from "@/components/UI/abstractBackgroundShapes/AbstractBackgroundShapes";
import classes from "@/app/auth.module.css"
import SignUpForm from "@/components/RegistrationForms/SignUpForm";
import { useState } from "react";
import ErrorNotification from "@/components/UI/errorNotification/ErrorNotification";

export default function SignUpPage() {
  const [errorMessage, setErrorMessage] = useState("")

  return (
    <main className={classes.authPage}>
      <div className={classes.authCard}>
        <ErrorNotification message={errorMessage} setErrorMessage={setErrorMessage} />
        <SignUpForm variant="page" setErrorMessage={setErrorMessage} />
      </div>
      <AbstractBackgroundShapes />
    </main>
  )
}