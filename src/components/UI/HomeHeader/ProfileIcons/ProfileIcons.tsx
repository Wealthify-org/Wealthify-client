"use client"

import { ROUTES } from "@/lib/routes"
import BorderedLink from "../../BorderedLink/BorderedLink"
import { UnborderedLink } from "../../UnborderenLink/UnborderedLink";
import classes from "./ProfileIcons.module.css"
import { SvgButton } from "../../SvgButton/SvgButton"
import { starOutlinedPath } from "../../SvgButton/Paths/starPaths"
import { starFilledPath } from "../../Assets/Asset/starPaths"
import { personCircleOutlinedPath } from "../../SvgButton/Paths/personCirclePaths"
import { gearFilledPath } from "../../SvgButton/Paths/gearPaths"
import { useCurrentUserStore } from "@/stores/currentUser/CurrentUserProvider";
import { observer } from "mobx-react-lite";

export const ProfileIcons = observer(() => {
  const currentUser = useCurrentUserStore();
  
  return (
    <div className={`${classes.iconsContainer} ${currentUser.isAuthenticated ? "" : classes.condensed}`}>
      {currentUser.isAuthenticated ? 
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
          />
        </>) : 
        (<>
          <UnborderedLink 
            href={{
              pathname: ROUTES.SIGN_IN,
              query: { from: ROUTES.HOME },
            }} 
            classNames={classes.signIn}
          >
            Sign in
          </UnborderedLink>
          <BorderedLink 
            href={{
              pathname: ROUTES.SIGN_UP,
              query: { from: ROUTES.HOME },
            }} 
            classNames={classes.signUp}
          >
            Sign up
          </BorderedLink>
          <SvgButton 
            buttonClassNames={classes.settingsButton}
            viewBox="-5 -5 115 115"
            svgClassNames={classes.settingsImage}
            filledPath={gearFilledPath}
            filledClassNames={classes.filledSettingsImage}
          />
        </>)
      }
    </div>
  )
})