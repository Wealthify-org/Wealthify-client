import { ROUTES } from "@/lib/routes"
import BorderedLink from "../../BorderedLink/BorderedLink"
import classes from "./ProfileIcons.module.css"
import { UnborderedLink } from "../../UnborderenLink/UnborderedLink"

type Props = {
  isUserAuthorized: boolean
}

export const ProfileIcons = ({isUserAuthorized}: Props) => {
  
  return (
    <div className={`${classes.iconsContainer} ${isUserAuthorized ? "" : classes.condensed}`}>
      {isUserAuthorized ? 
        (<>
          <button 
            className={classes.portfolioBalanceButton}
          >
            <p className={classes.portfolioBalance}>
              $5.09k
            </p>
            <p className={classes.portfolioChangePct}>
              +4.24%
            </p>
          </button>
          <button 
            className={classes.favoritesButton} 
          />

          <button
            className={classes.profileButton}
          />
        </>) : 
        (<>
          <UnborderedLink href={ROUTES.SIGN_IN} classNames={classes.signIn}>
            Sign in
          </UnborderedLink>
          <BorderedLink href={ROUTES.SIGN_UP} classNames={classes.signUp}>
            Sign up
          </BorderedLink>
          <button 
            className={classes.settingsButton}
          />
        </>)
      }
    </div>
  )
}