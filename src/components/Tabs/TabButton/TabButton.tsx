import classes from "./TabButton.module.css"

type TabButtonProps = React.HTMLAttributes<HTMLLIElement> & {
  children: React.ReactNode;
}

export const TabButton = ({children, ...rest}: TabButtonProps) => {
  return (
    <li className={classes.tabButton} {...rest}>
      {children}
    </li>
  )
}