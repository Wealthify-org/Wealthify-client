import AbstractBackgroundShapes from "@/components/UI/AbstractBackgroundShapes/AbstractBackgroundShapes";
import { HomeHeader } from "@/components/UI/HomeHeader/HomeHeader";
import { Sidebar } from "@/components/UI/Sidebar/Sidebar";
import { ProfileIconsTab } from "@/components/Tabs/ProfileIconsTab/ProfileIconsTab";
import { AssetDetail } from "@/components/AssetDetail/AssetDetail";

import classes from "./page.module.css";

type Props = {
  params: Promise<{ ticker: string }>;
};

export default async function AssetPage({ params }: Props) {
  const { ticker } = await params;
  return (
    <div className={classes.layout}>
      <Sidebar>
        <ProfileIconsTab />
      </Sidebar>
      <div className={classes.mainColumn}>
        <HomeHeader />
        <div className={classes.content}>
          <AssetDetail ticker={decodeURIComponent(ticker)} />
        </div>
      </div>
      <AbstractBackgroundShapes />
    </div>
  );
}
