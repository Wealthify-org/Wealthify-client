"use client";

import { ReactNode, useEffect } from "react";
import classes from "./ConfirmModal.module.css";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

type Props = {
  open: boolean;
  title: string;
  body: ReactNode;
  /** Текст кнопки подтверждения. */
  confirmLabel: string;
  /** Текст кнопки отмены. */
  cancelLabel: string;
  /** "danger" — красная primary-кнопка (для удаления, закрытия позиции и т. д.). */
  variant?: "danger" | "primary";
  /** В работе ли запрос — показывает loading-состояние и блокирует кнопку. */
  pending?: boolean;
  /** Опциональная ошибка после неудачного подтверждения. */
  error?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export const ConfirmModal = ({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel,
  variant = "danger",
  pending,
  error,
  onCancel,
  onConfirm,
}: Props) => {
  useBodyScrollLock(open);

  // ESC закрывает модалку (если запрос не в работе)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pending, onCancel]);

  if (!open) return null;

  return (
    <div
      className={classes.scrim}
      role="presentation"
      onClick={() => {
        if (!pending) onCancel();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className={classes.dialog}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-title" className={classes.title}>
          {title}
        </h2>

        <div className={classes.body}>{body}</div>

        {error && <p className={classes.error}>{error}</p>}

        <div className={classes.actions}>
          <button
            type="button"
            className={classes.cancelBtn}
            onClick={onCancel}
            disabled={pending}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`${classes.confirmBtn} ${
              variant === "danger" ? classes.confirmDanger : classes.confirmPrimary
            }`}
            onClick={onConfirm}
            disabled={pending}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
