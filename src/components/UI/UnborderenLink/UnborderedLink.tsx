import classes from "./UnborderedLink.module.css"
import Link from "next/link";

type NextLinkProps = React.ComponentProps<typeof Link>;

type Props = Omit<NextLinkProps, "href" | "className" | "children"> & {
  href: NextLinkProps["href"];      // string | UrlObject
  classNames?: string;
  children: React.ReactNode;
};

export const UnborderedLink = ({ children, classNames="", href, ...rest }: Props) => {
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