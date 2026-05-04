"use client"

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import PortfolioCard, { PortfolioCardProps } from "../UI/PortfolioCard/PortfolioCard";
import classes from "./UserPortfolios.module.css";
import { useCurrentUserStore } from "@/stores/currentUser/CurrentUserProvider";
import { useTokenStore } from "@/stores/tokenStore/TokenProvider";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { CreatePortfolioModal } from "@/components/CreatePortfolioModal/CreatePortfolioModal";

type PortfolioDto = {
  id: number;
  name: string;
  type: "Stocks" | "Crypto" | "Bonds" | "Fiat";
};

type PortfoliosApiResponse = {
  portfolios: PortfolioDto[];
  valuesUsd: number[];
  change24hAbsUsd: number[];
  change24hPct: number[];
  /** Агрегированный sparkline (7d) для каждого портфеля — sum(price × qty) */
  sparklines7d?: number[][];
};

type CardWithId = PortfolioCardProps & { id: number };

const mapToCardProps = (
  p: PortfolioDto,
  index: number,
  data: PortfoliosApiResponse,
): CardWithId => ({
  id: p.id,
  title: p.name,
  category: p.type,
  value: data.valuesUsd[index] ?? 0,
  valueChange: data.change24hAbsUsd[index] ?? 0,
  isDecorative: false,
  // Реальный sparkline по всем активам портфеля. Если бэкенд ещё не отдал
  // (старая версия / нет sparkline7D у активов) — карточка скроет график.
  portfolioValueChangeData: data.sparklines7d?.[index] ?? [],
});

export const UserPortfolios = observer(() => {
  const currentUser = useCurrentUserStore();
  const tokenStore = useTokenStore();
  const router = useRouter();
  const t = useTranslations("portfolios");

  const [portfolios, setPortfolios] = useState<CardWithId[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (!currentUser.hydrated) {
      return;
    }

    if (!currentUser.isAuthenticated || !currentUser.user) {
      setPortfolios([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const url = API_ENDPOINTS.PORTFOLIOS_BY_USER;

        const res = await fetch(url, {
          method: "GET",
          credentials: "include",
          headers: tokenStore.token
            ? { Authorization: `Bearer ${tokenStore.token}` }
            : {},
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch portfolios: ${res.status}`);
        }

        const data: PortfoliosApiResponse = await res.json();
        if (cancelled) return;

        // null-guard: если бэкенд вернул `{}` или `{portfolios: null}`
        // (частичный отказ), `.map` упадёт. Лучше показать пустой список.
        const list = Array.isArray(data?.portfolios) ? data.portfolios : [];
        const mapped = list.map((p, index) =>
          mapToCardProps(p, index, data),
        );

        setPortfolios(mapped);
      } catch (error) {
        console.error("[UserPortfolios] failed to load portfolios", error);
        if (!cancelled) {
          setPortfolios([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [
    currentUser.hydrated,
    currentUser.isAuthenticated,
    tokenStore.hasToken,
    refreshKey,
  ])

  const handleCreated = (id: number) => {
    setCreateOpen(false);
    if (id) {
      // только что создан — сразу уходим на детали портфеля
      router.push(ROUTES.PORTFOLIO(id));
    } else {
      // на всякий случай, если бэк не вернул id — просто refresh списка
      setRefreshKey((k) => k + 1);
    }
  };

  return (
    <>
      <div className={classes.toolbar}>
        <button
          type="button"
          className={classes.createBtn}
          onClick={() => setCreateOpen(true)}
        >
          <PlusIcon />
          <span>{t("createButton")}</span>
        </button>
      </div>

      <section className={classes.portfoliosSection}>
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) =>
            <div
              key={index}
              className={classes.skeletonCard}
              aria-hidden="true"
            >
              <div className={classes.skeletonCardHeader} />
              <div className={classes.skeletonCardFooter} />
            </div>
          )
          : portfolios && portfolios.length > 0
            ? portfolios.map((portfolio) => (
                <Link
                  key={portfolio.id}
                  href={ROUTES.PORTFOLIO(portfolio.id)}
                  className={classes.cardLink}
                >
                  <PortfolioCard
                    {...portfolio}
                    cardGreenClasses={classes.cardGreen}
                    cardRedClasses={classes.cardRed}
                  />
                </Link>
              ))
            : (
                <p className={classes.emptyState}>
                  {t("empty")}
                </p>
              )
        }
      </section>

      <CreatePortfolioModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />
    </>
  )
})

const PlusIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
