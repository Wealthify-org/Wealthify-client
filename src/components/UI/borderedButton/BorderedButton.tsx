import type React from "react"
import classes from './BorderedButton.module.css'

type BorderedButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode
}
const BorderedButton = ({ children, ...props }: BorderedButtonProps) => {
  return (
    <button className={classes.button} {...props}>
      {children}
    </button>
  )
}

export default BorderedButton