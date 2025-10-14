"use client"

import SignInForm from "@/components/RegistrationForms/SignInForm";
import ErrorNotification from "@/components/UI/errorNotification/ErrorNotification";
import RegistrationModal from "@/components/UI/registrationModal/RegistrationModal";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignInModalPage() {
  const [errorMessage, setErrorMessage] = useState("")
  const router = useRouter()

  const onClose = () => router.back()

  return (
    <RegistrationModal isOpen onClose={onClose}>
      <ErrorNotification message={errorMessage} setErrorMessage={setErrorMessage} />
      <SignInForm variant="modal" setErrorMessage={setErrorMessage}/>
    </RegistrationModal>
  )
}