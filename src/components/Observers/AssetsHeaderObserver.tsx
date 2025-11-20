"use client";

import { useEffect } from "react";

export const AssetsHeaderObserver = () => {
  useEffect(() => {
    const headerEl = document.querySelector<HTMLElement>('[data-home-header="1"]');
    if (!headerEl) return;

    const table = document.querySelector<HTMLTableElement>('[data-assets-table="true"]');
    if (!table) return;

    const headRow = table.querySelector<HTMLTableRowElement>("thead tr");
    if (!headRow) return;

    let rowOffset = headRow.offsetTop;

    const recalcOffsets = () => {
      rowOffset = headRow.offsetTop;
      handleScroll(); // сразу пересчитать после ресайза
    };

    const handleScroll = () => {
      const headerRect = headerEl.getBoundingClientRect();
      const headerBottom = headerRect.bottom;

      const tableRect = table.getBoundingClientRect();
      const tableTop = tableRect.top;
      const tableBottom = tableRect.bottom;
      const tableHeight = tableRect.height;

      const headHeight = headRow.getBoundingClientRect().height;

      const rowTopWithoutOffset = tableTop + rowOffset;
      const rowBottomWithoutOffset = rowTopWithoutOffset + headHeight;

      // 1) строка ещё ниже хедера — не двигаем
      if (rowTopWithoutOffset >= headerBottom) {
        headRow.style.transform = "translate3d(0, 0, 0)";
        return;
      }

      // максимальное смещение, чтобы строка не выехала ниже таблицы
      const maxOffset = Math.max(tableHeight - headHeight - rowOffset, 0);

      // 2) таблица почти закончилась — фиксируем строку у нижнего края таблицы
      if (tableBottom <= headerBottom + headHeight) {
        headRow.style.transform = `translate3d(0, ${maxOffset}px, 0)`;
        return;
      }

      // 3) нормальный кейс: прижимаем ВЕРХ строки ровно к НИЗУ хедера
      const rawOffset = headerBottom - rowTopWithoutOffset;
      const offset = Math.max(0, Math.min(rawOffset, maxOffset));

      headRow.style.transform = `translate3d(0, ${offset}px, 0)`;
    };

    recalcOffsets();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", recalcOffsets);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", recalcOffsets);
    };
  }, []);

  return null;
};
