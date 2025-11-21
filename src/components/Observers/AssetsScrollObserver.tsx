"use client";

import { useEffect } from "react";

export const AssetsScrollObserver = () => {
  useEffect(() => {
    const container = document.querySelector<HTMLElement>(
      '[data-assets-scroll-container="1"]'
    );

    if (!container) return;

    const updateScrollState = () => {
      // есть ли вообще горизонтальный скролл
      const hasOverflowX = container.scrollWidth > container.clientWidth;

      // если нет переполнения по x - сбрасываем флаг
      if (!hasOverflowX) {
        container.setAttribute("data-scroll-x", "0");
        return;
      }

      // если проскроллили по x хоть чуть-чуть - ставим флаг
      const scrolled = container.scrollLeft > 0 ? "1" : "0";
      if (container.getAttribute("data-scroll-x") !== scrolled) {
        container.setAttribute("data-scroll-x", scrolled);
      }
    };

    // начальное состояние
    updateScrollState();

    const onScroll = () => {
      updateScrollState();
    };

    const onResize = () => {
      updateScrollState();
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      container.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return null;
};
