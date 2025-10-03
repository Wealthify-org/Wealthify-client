import type React from "react"
import classes from './BorderedButton.module.css'
import Link from "next/link"

type BorderedButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode
  href: string
}
const BorderedLink = ({ children, href }: BorderedButtonProps) => {
  return (
    <Link href={href} className={classes.button}>
      {children}
    </Link>
  )
}

export default BorderedLink