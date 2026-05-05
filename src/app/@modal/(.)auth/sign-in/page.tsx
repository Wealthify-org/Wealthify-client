"use client"

import SignInForm from "@/components/RegistrationForms/SignInForm";
import ErrorNotification from "@/components/UI/ErrorNotification/ErrorNotification";
import RegistrationModal from "@/components/UI/RegistrationModal/RegistrationModal";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Intercepting route: `(.)` — «тот же уровень».
 *
 * Слот `@modal` теперь живёт в корневом layout, поэтому при клике по
 * <Link href="/auth/sign-in"> с ЛЮБОЙ страницы приложения Next.js рендерит
 * этот компонент в @modal-slot вместо полного page-transition'а на
 * `/auth/sign-in`. Реальная страница `/auth/sign-in` остаётся доступна
 * при прямом вводе URL / hard-reload — это стандартный паттерн.
 */
export default function SignInModalPage() {
  const [errorMessage, setErrorMessage] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();

  const handleClose = () => {
    setIsOpen(false);
    // Возвращаемся к странице, с которой открыли модалку.
    // RegistrationModal внутри сначала запустит exit-анимацию (~250ms),
    // и только потом снимет себя из DOM — навигация после router.back()
    // успевает произойти раньше, поэтому видим плавное исчезновение.
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
      <SignInForm
        variant="modal"
        setErrorMessage={setErrorMessage}
        onSuccess={handleSuccess}
      />
    </RegistrationModal>
  );
}
