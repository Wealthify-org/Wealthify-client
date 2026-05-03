"use client"

import AbstractBackgroundShapes from "@/components/UI/AbstractBackgroundShapes/AbstractBackgroundShapes";
import classes from "../auth.module.css"
import SignUpForm from "@/components/RegistrationForms/SignUpForm";
import { Suspense, useState } from "react";
import ErrorNotification from "@/components/UI/ErrorNotification/ErrorNotification";

function SignUpPageContent() {
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

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpPageContent />
    </Suspense>
  );
}
