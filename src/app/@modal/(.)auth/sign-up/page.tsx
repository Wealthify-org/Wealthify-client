"use client"

import SignUpForm from "@/components/RegistrationForms/SignUpForm";
import ErrorNotification from "@/components/UI/ErrorNotification/ErrorNotification";
import RegistrationModal from "@/components/UI/RegistrationModal/RegistrationModal";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Intercepting route: `(.)` — «тот же уровень».
 *
 * Слот `@modal` теперь живёт в корневом layout, поэтому при клике по
 * <Link href="/auth/sign-up"> с ЛЮБОЙ страницы приложения Next.js рендерит
 * этот компонент в @modal-slot вместо полного page-transition'а на
 * `/auth/sign-up`. Реальная страница `/auth/sign-up` остаётся доступна
 * при прямом вводе URL / hard-reload — это стандартный паттерн.
 */
export default function SignUpModalPage() {
  const [errorMessage, setErrorMessage] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();

  const handleClose = () => {
    setIsOpen(false);
    router.back();
  };

  const handleSuccess = () => {
    setIsOpen(false);
    router.back();
    router.refresh();
  };

  return (
    <RegistrationModal isOpen={isOpen} onClose={handleClose}>
      <ErrorNotification message={errorMessage} setErrorMessage={setErrorMessage} />
      <SignUpForm
        variant="modal"
        setErrorMessage={setErrorMessage}
        onSuccess={handleSuccess}
      />
    </RegistrationModal>
  );
}
