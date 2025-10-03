'use client'
import { usePathname } from 'next/navigation'

export default function AuthLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  const pathname = usePathname()
  return (
    <>
      {/* для того, чтобы переход из модалок работал нормально*/}
      <div key={pathname}>{children}</div>
      {modal}
    </>
  )
}
