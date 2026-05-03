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
import { useEffect, useRef, useState } from "react";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { useFavoritesStore } from "@/stores/favoritesStore/FavoritesProvider";
import { logoutClient } from "@/lib/auth/client/logout";

type PortfoliosSummaryResponse = {
  totalValueUsd: number;
  change24hAbsUsd: number;
  change24hPct: number;
};

type RiskProfileSummary = {
  bucket: "Conservative" | "Moderate" | "Aggressive" | "Speculative";
  bucketTitle: string;
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
  const favoritesStore = useFavoritesStore();
  const router = useRouter();

  const [summary, setSummary] = useState<PortfoliosSummaryResponse | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [riskProfile, setRiskProfile] = useState<RiskProfileSummary | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // менеджмент жизненного цикла меню для exit-анимации:
  // при open — мгновенно mount; при close — держим ещё ~220ms чтобы exit отыграл
  useEffect(() => {
    if (menuOpen) {
      setMenuMounted(true);
      return;
    }
    if (menuMounted) {
      const t = window.setTimeout(() => setMenuMounted(false), 200);
      return () => window.clearTimeout(t);
    }
  }, [menuOpen, menuMounted]);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (e: PointerEvent) => {
      if (!menuRef.current) return;
      if (menuRef.current.contains(e.target as Node)) return;
      setMenuOpen(false);
    };
    window.addEventListener("pointerdown", onPointer);
    return () => window.removeEventListener("pointerdown", onPointer);
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logoutClient();
    tokenStore.clear();
    currentUser.clear();
    favoritesStore.reset();
    setRiskProfile(null);
    router.replace(ROUTES.ROOT);
    router.refresh();
  };

  useEffect(() => {
    if (!tokenStore.token) {
      return;
    }
    
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

    const authHeaders: Record<string, string> = tokenStore.token
      ? { Authorization: `Bearer ${tokenStore.token}` }
      : {};

    const loadAll = async () => {
      setIsSummaryLoading(true);
      try {
        const [summaryRes, riskRes] = await Promise.all([
          fetch(API_ENDPOINTS.PORTFOLIOS_SUMMARY_ME, {
            method: "GET",
            credentials: "include",
            headers: authHeaders,
          }),
          fetch(API_ENDPOINTS.RISK_PROFILE_ME, {
            method: "GET",
            credentials: "include",
            headers: authHeaders,
          }),
        ]);

        if (summaryRes.ok) {
          const data: PortfoliosSummaryResponse = await summaryRes.json();
          if (!cancelled) setSummary(data);
        }

        if (riskRes.ok) {
          const text = await riskRes.text();
          let body: unknown = null;
          if (text.trim()) {
            try { body = JSON.parse(text); } catch { body = null; }
          }
          if (
            !cancelled &&
            body &&
            typeof body === "object" &&
            "bucket" in (body as Record<string, unknown>)
          ) {
            const b = body as { bucket: RiskProfileSummary["bucket"]; bucketTitle: string };
            setRiskProfile({ bucket: b.bucket, bucketTitle: b.bucketTitle });
          } else if (!cancelled) {
            setRiskProfile(null);
          }
        }
      } catch (error) {
        console.error("[ProfileIcons] load failed", error);
      } finally {
        if (!cancelled) {
          setIsSummaryLoading(false);
        }
      }
    };

    void loadAll();

    return () => {
      cancelled = true;
    };
  }, [currentUser.hydrated, currentUser.isAuthenticated, tokenStore.hasToken]);

  if (!currentUser.hydrated || isSummaryLoading) {
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

  const favoritesButtonOnClick = () => {
    // если не авторизован — можно редиректить на sign-in (не обязательно, но удобно)
    if (!currentUser.isAuthenticated) {
      router.push(`${ROUTES.SIGN_IN}?from=${encodeURIComponent(ROUTES.HOME)}`);
      return;
    }

    router.push(ROUTES.FAVORITES);
  };

  const changePct = summary?.change24hPct ?? 0;

  const changePctClassName = [
    classes.portfolioChangePct,
    changePct > 0 ? classes.green : "",
    changePct < 0 ? classes.red : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`${classes.iconsContainer} ${currentUser.isAuthenticated ? "" : classes.condensed}`}>
      {currentUser.isAuthenticated ? 
        (<>
          <button 
            onClick={portfoliosButtonOnClick}
            className={classes.portfolioBalanceButton}
          >
            <p className={classes.portfolioBalance}>
              {formatUsd(summary?.totalValueUsd ?? 0)}
            </p>
            <p className={changePctClassName}>
              {formatPct(changePct)}
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
            onClick={favoritesButtonOnClick}
          /> 

          <div className={classes.profileMenuWrapper} ref={menuRef}>
            <SvgButton
              buttonClassNames={classes.profileButton}
              viewBox="0 0 102 103"
              svgClassNames={classes.profileImage}
              outlinedPath={personCircleOutlinedPath}
              outlinedClassNames={classes.outlinedPersonImage}
              onClick={() => setMenuOpen((v) => !v)}
            />
            {menuMounted && (
              <div
                className={classes.profileMenu}
                role="menu"
                data-state={menuOpen ? "open" : "closing"}
              >
                <div className={classes.profileMenuEmail}>
                  {currentUser.user?.email}
                </div>

                <button
                  type="button"
                  className={classes.profileMenuItem}
                  onClick={() => {
                    setMenuOpen(false);
                    router.push(ROUTES.RISK_PROFILE);
                  }}
                  role="menuitem"
                >
                  <span className={classes.profileMenuItemLabel}>
                    <ShieldCheckIcon className={classes.profileMenuIcon} />
                    Риск-профиль
                  </span>
                  {riskProfile ? (
                    <span
                      className={`${classes.bucketBadge} ${classes[`bucket_${riskProfile.bucket}`] ?? ""}`}
                    >
                      {riskProfile.bucketTitle}
                    </span>
                  ) : (
                    <span className={classes.bucketCta}>Пройти тест</span>
                  )}
                </button>

                <button
                  type="button"
                  className={`${classes.profileMenuItem} ${classes.profileMenuItemDanger}`}
                  onClick={handleLogout}
                  role="menuitem"
                >
                  <span className={classes.profileMenuItemLabel}>
                    <LogoutIcon className={classes.profileMenuIcon} />
                    Logout
                  </span>
                </button>
              </div>
            )}
          </div>
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

// ── inline-иконки для пунктов меню ─────────────────────────────────────────

type IconProps = { className?: string };

const ShieldCheckIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 3 4 6v6c0 4.5 3.2 8.4 8 9 4.8-.6 8-4.5 8-9V6l-8-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const LogoutIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);