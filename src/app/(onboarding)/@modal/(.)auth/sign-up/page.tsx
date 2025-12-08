"use client"

import SignUpForm from "@/components/RegistrationForms/SignUpForm";
import ErrorNotification from "@/components/UI/ErrorNotification/ErrorNotification";
import RegistrationModal from "@/components/UI/RegistrationModal/RegistrationModal";
import { ROUTES } from "@/lib/routes";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignUpModalPage() {
  const [errorMessage, setErrorMessage] = useState("")
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter()

  const handleClose = () => {
    setIsOpen(false);
    router.back()
  }

  const handleSuccess = () => {
    setIsOpen(false);
    router.replace(ROUTES.HOME);
  }

  
  return (
    <RegistrationModal isOpen onClose={handleClose}>
      <ErrorNotification message={errorMessage} setErrorMessage={setErrorMessage} />
      <SignUpForm variant="modal" setErrorMessage={setErrorMessage} onSuccess={handleSuccess}/>
    </RegistrationModal>
  )
}