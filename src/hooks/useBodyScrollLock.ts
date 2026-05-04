"use client";

import { useEffect } from "react";

/**
 * Блокирует прокрутку body, пока активен флаг `locked`.
 *
 * Зачем нужен:
 *  - Когда модалка открыта поверх скролла, юзер мог колесом прокрутить
 *    фоновую страницу — это рассинхронизирует контекст (модалка про
 *    одну вещь, а под ней уезжает совсем другое).
 *  - На iOS body-scroll прорывался даже сквозь modal-scrim — выглядело
 *    как баг.
 *
 * Реализация: считаем nesting через счётчик в data-attribute, чтобы
 * вложенные/одновременные модалки правильно «накапливали» блокировку.
 * Когда последняя модалка закрылась — восстанавливаем оригинальные
 * значения overflow/paddingRight (`paddingRight` нужен чтобы не было
 * сдвига контента из-за исчезающего скроллбара).
 */
export const useBodyScrollLock = (locked: boolean) => {
  useEffect(() => {
    if (!locked) return;
    if (typeof document === "undefined") return;

    const html = document.documentElement;
    const body = document.body;

    const prevDepth = Number(html.dataset.scrollLockDepth ?? "0") || 0;
    html.dataset.scrollLockDepth = String(prevDepth + 1);

    if (prevDepth === 0) {
      const scrollbarW = window.innerWidth - html.clientWidth;
      // Сохраняем оригинальные значения, чтобы при cleanup восстановить
      // в точности то, что было — кто-то ещё мог их менять.
      html.dataset.scrollLockOverflow = body.style.overflow ?? "";
      html.dataset.scrollLockPaddingRight = body.style.paddingRight ?? "";
      body.style.overflow = "hidden";
      if (scrollbarW > 0) {
        body.style.paddingRight = `${scrollbarW}px`;
      }
    }

    return () => {
      const curDepth = Number(html.dataset.scrollLockDepth ?? "0") || 0;
      const next = Math.max(0, curDepth - 1);
      html.dataset.scrollLockDepth = String(next);
      if (next === 0) {
        body.style.overflow = html.dataset.scrollLockOverflow ?? "";
        body.style.paddingRight = html.dataset.scrollLockPaddingRight ?? "";
        delete html.dataset.scrollLockOverflow;
        delete html.dataset.scrollLockPaddingRight;
      }
    };
  }, [locked]);
};
