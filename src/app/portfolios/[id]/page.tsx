import AbstractBackgroundShapes from "@/components/UI/AbstractBackgroundShapes/AbstractBackgroundShapes";
import { HomeHeader } from "@/components/UI/HomeHeader/HomeHeader";
import { Sidebar } from "@/components/UI/Sidebar/Sidebar";
import { ProfileIconsTab } from "@/components/Tabs/ProfileIconsTab/ProfileIconsTab";
import { PortfolioDetail } from "@/components/PortfolioDetail/PortfolioDetail";

import classes from "./page.module.css";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PortfolioDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className={classes.layout}>
      <Sidebar>
        <ProfileIconsTab />
      </Sidebar>
      <div className={classes.mainColumn}>
        <HomeHeader />
        <div className={classes.content}>
          <PortfolioDetail portfolioId={id} />
        </div>
      </div>
      <AbstractBackgroundShapes />
    </div>
  );
}
