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
import { useRouter } from "next/navigation";
import { useTokenStore } from "@/stores/tokenStore/TokenProvider";
import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";

type PortfoliosSummaryResponse = {
  totalValueUsd: number;
  change24hAbsUsd: number;
  change24hPct: number;
};

const formatUsd = (value: number): string => {
  if (!Number.isFinite(value)) return "$0.00";

  return (
    "$" +
    value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
};

const formatPct = (value: number): string => {
  if (!Number.isFinite(value)) return "0.00%";

  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
};

export const ProfileIcons = observer(() => {
  const currentUser = useCurrentUserStore();
  const tokenStore = useTokenStore();
  const router = useRouter();

  const [summary, setSummary] = useState<PortfoliosSummaryResponse | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  useEffect(() => {
    // пока не знаем состояние пользователя – просто ждём (скелетон ниже)
    if (!currentUser.hydrated) {
      return;
    }

    // пользователь не авторизован – не делаем запрос вообще
    if (!currentUser.isAuthenticated) {
      setSummary(null);
      setIsSummaryLoading(false);
      return;
    }

    let cancelled = false;

    const loadSummary = async () => {
      setIsSummaryLoading(true);
      try {
        const res = await fetch(API_ENDPOINTS.PORTFOLIOS_SUMMARY_ME, {
          method: "GET",
          credentials: "include",
          headers: tokenStore.token
            ? { Authorization: `Bearer ${tokenStore.token}` }
            : {},
        });

        if (!res.ok) {
          throw new Error(
            `[ProfileIcons] failed to fetch summary: ${res.status}`,
          );
        }

        const data: PortfoliosSummaryResponse = await res.json();
        if (cancelled) return;

        setSummary(data);
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setSummary(null);
        }
      } finally {
        if (!cancelled) {
          setIsSummaryLoading(false);
        }
      }
    };

    void loadSummary();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!currentUser.hydrated) {
    return (
      <div className={`${classes.iconsContainer} ${classes.iconsSkeletonContainer}`}>
        <div className={`${classes.skeletonBlock} ${classes.portfolioBalanceSkeleton}`} />
        <div className={`${classes.skeletonBlock} ${classes.iconSkeleton}`}/>
        <div className={`${classes.skeletonBlock} ${classes.iconSkeleton}`}/>
      </div>
    );
  }

  const portfoliosButtonOnClick = () => {
    router.push(ROUTES.PORTFOLIOS);
  }

  return (
    <div className={`${classes.iconsContainer} ${currentUser.isAuthenticated ? "" : classes.condensed}`}>
      {currentUser.isAuthenticated ? 
        (<>
          <button 
            onClick={portfoliosButtonOnClick}
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