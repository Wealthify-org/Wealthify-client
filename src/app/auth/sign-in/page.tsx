"use client"

import SignInForm from "@/components/RegistrationForms/SignInForm";
import AbstractBackgroundShapes from "@/components/UI/AbstractBackgroundShapes/AbstractBackgroundShapes";
import classes from "../auth.module.css"
import { Suspense, useState } from "react";
import ErrorNotification from "@/components/UI/ErrorNotification/ErrorNotification";

function SignInPageContent() {
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

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInPageContent />
    </Suspense>
  );
}