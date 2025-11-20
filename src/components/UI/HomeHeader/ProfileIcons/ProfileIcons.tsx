import { ROUTES } from "@/lib/routes"
import BorderedLink from "../../BorderedLink/BorderedLink"
import { UnborderedLink } from "../../UnborderenLink/UnborderedLink";
import classes from "./ProfileIcons.module.css"
import { SvgButton } from "../../SvgButton/SvgButton"
import { starOutlinedPath } from "../../SvgButton/Paths/starPaths"
import { starFilledPath } from "../../Assets/Asset/starPaths"
import { personCircleFilledPath, personCircleOutlinedPath } from "../../SvgButton/Paths/personCirclePaths"
import { gearFilledPath, gearOutlinedPath } from "../../SvgButton/Paths/gearPaths"

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
          <SvgButton 
            buttonClassNames={classes.favoritesButton}
            viewBox="0 0 110 110"
            svgClassNames={classes.favoritesImage}
            outlinedPath={starOutlinedPath}
            outlinedClassNames={classes.outlinedFavoritesImage}
            filledPath={starFilledPath}
            filledClassNames={classes.filledFavoritesImage}
          /> 

          <SvgButton 
            buttonClassNames={classes.profileButton}
            viewBox="0 0 102 103"
            svgClassNames={classes.profileImage}
            outlinedPath={personCircleOutlinedPath}
            outlinedClassNames={classes.outlinedPersonImage}
            // filledPath={personCircleFilledPath}
            // filledClassNames={classes.filledPersonImage}
          />
        </>) : 
        (<>
          <UnborderedLink href={ROUTES.SIGN_IN} classNames={classes.signIn}>
            Sign in
          </UnborderedLink>
          <BorderedLink href={ROUTES.SIGN_UP} classNames={classes.signUp}>
            Sign up
          </BorderedLink>
          <SvgButton 
            buttonClassNames={classes.settingsButton}
            viewBox="-5 -5 115 115"
            svgClassNames={classes.settingsImage}
            // outlinedPath={gearOutlinedPath}
            // outlinedClassNames={classes.outlinedSettingsImage}
            filledPath={gearFilledPath}
            filledClassNames={classes.filledSettingsImage}
          />
        </>)
      }
    </div>
  )
}