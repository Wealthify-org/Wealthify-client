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

    const onScroll = () => {
      const scrolled = window.scrollY > 50 ? "1" : "0";
      if (root.getAttribute("data-scrolled") !== scrolled) {
        root.setAttribute("data-scrolled", scrolled);
      }

      const table = document.querySelector<HTMLElement>('[data-assets-table="true"]');
      if (!table) return; // таблица ещё не в dom — просто выходим

      const tableTop = table.getBoundingClientRect().top + window.scrollY;

      const stuck = window.scrollY >= tableTop - headerHeight ? "1" : "0";

      if (root.getAttribute("data-assets-head-stuck") !== stuck) {
        root.setAttribute("data-assets-head-stuck", stuck);
      }
    };

    onScroll()
    window.addEventListener("scroll", onScroll, {passive: true})
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return null
}