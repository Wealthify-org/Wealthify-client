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
    // requestAnimationFrame-throttle: scroll пушит обновление в ближайший
    // кадр; без этого handleScroll стрелял ~60 раз/сек, и каждый раз
    // вызывал три getBoundingClientRect — каждый из них форсит reflow.
    let rafId = 0;
    let pending = false;

    const compute = () => {
      pending = false;
      rafId = 0;
      const headerRect = headerEl.getBoundingClientRect();
      const headerBottom = headerRect.bottom;

      const tableRect = table.getBoundingClientRect();
      const tableTop = tableRect.top;
      const tableBottom = tableRect.bottom;
      const tableHeight = tableRect.height;

      const headHeight = headRow.getBoundingClientRect().height;

      const rowTopWithoutOffset = tableTop + rowOffset;

      if (rowTopWithoutOffset >= headerBottom) {
        headRow.style.transform = "translate3d(0, 0, 0)";
        return;
      }

      const maxOffset = Math.max(tableHeight - headHeight - rowOffset, 0);

      if (tableBottom <= headerBottom + headHeight) {
        headRow.style.transform = `translate3d(0, ${maxOffset}px, 0)`;
        return;
      }

      const rawOffset = headerBottom - rowTopWithoutOffset;
      const offset = Math.max(0, Math.min(rawOffset, maxOffset));
      headRow.style.transform = `translate3d(0, ${offset}px, 0)`;
    };

    const handleScroll = () => {
      if (pending) return;
      pending = true;
      rafId = window.requestAnimationFrame(compute);
    };

    const recalcOffsets = () => {
      // на ресайзе offsetTop мог измениться (поменялась плотность вёрстки)
      rowOffset = headRow.offsetTop;
      handleScroll();
    };

    compute();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", recalcOffsets);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", recalcOffsets);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return null;
};
