'use client'

import { useEffect } from "react"

export default function ScrollObserver() {
  useEffect(() => {
    const root = document.documentElement

    const onScroll = () => {
      const scrolled = window.scrollY > 50 ? '1' : '0' 
      if (root.getAttribute('data-scrolled') !== scrolled) {
        root.setAttribute('data-scrolled', scrolled)
      }
    }

    onScroll()
    window.addEventListener('scroll', onScroll, {passive: true})
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return null
}