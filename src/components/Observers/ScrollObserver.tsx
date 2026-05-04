"use client"

import { useEffect } from "react"

export default function ScrollObserver() {
  useEffect(() => {
    const root = document.documentElement;

    const getHeaderHeight = () => {
      const value = getComputedStyle(root)
        .getPropertyValue("--home-header-height")
        .trim();
      const parsed = parseFloat(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }

    const headerHeight = getHeaderHeight();

    // Раньше onScroll стрелял по 60 раз/сек на каждом скролле и каждый
    // раз делал getBoundingClientRect — это форсирует layout reflow.
    // Через requestAnimationFrame группируем все события в один кадр.
    let rafId = 0;
    let pending = false;

    const computeAndApply = () => {
      pending = false;
      rafId = 0;

      const scrolled = window.scrollY > 50 ? "1" : "0";
      if (root.getAttribute("data-scrolled") !== scrolled) {
        root.setAttribute("data-scrolled", scrolled);
      }

      const table = document.querySelector<HTMLElement>('[data-assets-table="true"]');
      if (!table) return;

      const tableTop = table.getBoundingClientRect().top + window.scrollY;
      const stuck = window.scrollY >= tableTop - headerHeight ? "1" : "0";

      if (root.getAttribute("data-assets-head-stuck") !== stuck) {
        root.setAttribute("data-assets-head-stuck", stuck);
      }
    };

    const onScroll = () => {
      if (pending) return;
      pending = true;
      rafId = window.requestAnimationFrame(computeAndApply);
    };

    computeAndApply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [])

  return null
}