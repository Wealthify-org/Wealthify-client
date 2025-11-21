import classes from "./UnborderedLink.module.css"
import Link from "next/link";

type Props = React.HTMLAttributes<HTMLAnchorElement> & {
  children: React.ReactNode;
  href: string;
  classNames?: string
}

export const UnborderedLink = ({ children, href, classNames="", ...rest }: Props) => {
  return (
    <Link 
      href={href} 
      className={`${classes.unborderedButton} ${classNames}`}
      {...rest}
    >
      {children}
      </Link>
  )
}