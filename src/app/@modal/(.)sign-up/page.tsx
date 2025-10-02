'use client'

import SignUpForm from "@/components/RegistrationForms/SignUpForm";
import RegistrationModal from "@/components/UI/registrationModal/RegistrationModal";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignUpModalPage() {
  const router = useRouter()

  const onClose = () => router.back()

  return (
    <RegistrationModal isOpen onClose={onClose}>
      <SignUpForm />
    </RegistrationModal>
  )
}