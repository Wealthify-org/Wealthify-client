"use client"

import SignInForm from "@/components/RegistrationForms/SignInForm";
import RegistrationModal from "@/components/UI/registrationModal/RegistrationModal";
import { useRouter } from "next/navigation";

export default function SignInModalPage() {
  const router = useRouter()

  const onClose = () => router.back()

  return (
    <RegistrationModal isOpen onClose={onClose}>
      <SignInForm variant="modal"/>
    </RegistrationModal>
  )
}