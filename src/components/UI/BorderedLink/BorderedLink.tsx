import type React from "react"
import classes from "./BorderedLink.module.css"
import Link from "next/link"

type NextLinkProps = React.ComponentProps<typeof Link>;

type Props = Omit<NextLinkProps, "href" | "className" | "children"> & {
  href: NextLinkProps["href"];
  classNames?: string;
  children: React.ReactNode;
};

const BorderedLink = ({ children, classNames="", href, ...rest }: Props) => {
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