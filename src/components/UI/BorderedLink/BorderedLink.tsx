import type React from "react"
import classes from "./BorderedLink.module.css"
import Link from "next/link"

type BorderedButtonProps = React.ButtonHTMLAttributes<HTMLAnchorElement> & {
  children: React.ReactNode;
  href: string;
  classNames?: string;
}
const BorderedLink = ({ children, href, classNames="", ...rest }: BorderedButtonProps) => {
  return (
    <Link 
      href={href} 
      className={`${classes.button} ${classNames}`} 
      {...rest}
    >
      {children}
    </Link>
  )
}

export default BorderedLink