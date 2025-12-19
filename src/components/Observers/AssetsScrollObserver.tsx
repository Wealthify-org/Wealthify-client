"use client";

import { useEffect } from "react";

export const AssetsScrollObserver = () => {
  useEffect(() => {
    const container = document.querySelector<HTMLElement>(
      '[data-assets-scroll-container="1"]'
    );

    if (!container) return;

    const isNarrow = () => window.innerWidth < 600;

    const updateStickyOffset = () => {
      if (isNarrow()) return;

      const indexHeader = container.querySelector<HTMLElement>('th[data-col="index"]');
      if (!indexHeader) return;

      const width = indexHeader.getBoundingClientRect().width;
      // точный отступ для второй колонки
      container.style.setProperty("--left-cell-inset", `${width}px`);
    };

    const updateScrollState = () => {
      if (isNarrow()) {
        container.setAttribute("data-scroll-x", "0");
        return;
      }
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

    const init = () => {
      updateStickyOffset();
      updateScrollState();
    };

    init();

    const handleScroll = () => {
      updateScrollState();
    };

    const handleResize = () => {
      init(); 
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return null;
};
