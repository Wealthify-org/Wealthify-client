"use client"

import SignInForm from "@/components/RegistrationForms/SignInForm";
import ErrorNotification from "@/components/UI/ErrorNotification/ErrorNotification";
import RegistrationModal from "@/components/UI/RegistrationModal/RegistrationModal";
import { ROUTES } from "@/lib/routes";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignInModalPage() {
  const [errorMessage, setErrorMessage] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();

  const handleClose = () => {
    setIsOpen(false);
    router.back()
  }

  const handleSuccess = () => {
    setIsOpen(false);
    router.replace(ROUTES.HOME);
  }


  return (
    <RegistrationModal isOpen={isOpen} onClose={handleClose}>
      <ErrorNotification message={errorMessage} setErrorMessage={setErrorMessage} />
      <SignInForm variant="modal" setErrorMessage={setErrorMessage} onSuccess={handleSuccess}/>
    </RegistrationModal>
  )
}