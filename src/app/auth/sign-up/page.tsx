"use client"

import AbstractBackgroundShapes from "@/components/UI/AbstractBackgroundShapes/AbstractBackgroundShapes";
import classes from "../auth.module.css"
import SignUpForm from "@/components/RegistrationForms/SignUpForm";
import { useState } from "react";
import ErrorNotification from "@/components/UI/ErrorNotification/ErrorNotification";

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