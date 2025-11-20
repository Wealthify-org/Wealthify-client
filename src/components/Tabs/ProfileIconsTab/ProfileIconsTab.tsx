import { ProfileIcons } from "@/components/UI/HomeHeader/ProfileIcons/ProfileIcons"
import classes from "../../UI/HomeHeader/ProfileIcons/ProfileIcons.module.css"

export const ProfileIconsTab = () => {
  return (
    <div className={classes.profileIconsTab}>
      <h4 className={classes.legend}>
        Profile
      </h4>
      <ProfileIcons isUserAuthorized={false} />
    </div>
  )
}