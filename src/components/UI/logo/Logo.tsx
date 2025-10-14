import classes from "./Logo.module.css"

const Logo = () => {
  return (
    <a href="/start" className={classes.logoContainer} aria-label="Wealthify (beta)">
      <span className={classes.logo}>WEALTHIFY</span>
      <span className={classes.beta} aria-hidden="true">beta</span>
    </a>
  )
}

export default Logo