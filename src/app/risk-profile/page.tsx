import AbstractBackgroundShapes from "@/components/UI/AbstractBackgroundShapes/AbstractBackgroundShapes";
import { HomeHeader } from "@/components/UI/HomeHeader/HomeHeader";
import { Sidebar } from "@/components/UI/Sidebar/Sidebar";
import { ProfileIconsTab } from "@/components/Tabs/ProfileIconsTab/ProfileIconsTab";
import { RiskProfileTest } from "@/components/RiskProfile/RiskProfileTest";

import classes from "./page.module.css";

export default function RiskProfilePage() {
  return (
    <div className={classes.layout}>
      <Sidebar>
        <ProfileIconsTab />
      </Sidebar>
      <div className={classes.mainColumn}>
        <HomeHeader />
        <div className={classes.content}>
          <RiskProfileTest />
        </div>
      </div>
      <AbstractBackgroundShapes />
    </div>
  );
}
