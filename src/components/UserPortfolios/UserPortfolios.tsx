"use client"

import { useEffect, useState } from "react";
import PortfolioCard, { PortfolioCardProps } from "../UI/PortfolioCard/PortfolioCard";
import classes from "./UserPortfolios.module.css";
import { useCurrentUserStore } from "@/stores/currentUser/CurrentUserProvider";
import { useTokenStore } from "@/stores/tokenStore/TokenProvider";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";

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
};

const mapToCardProps = (
  p: PortfolioDto,
  index: number,
  data: PortfoliosApiResponse,
): PortfolioCardProps => ({
  title: p.name,
  category: p.type,
  value: data.valuesUsd[index] ?? 0,
  valueChange: data.change24hAbsUsd[index] ?? 0,
  isDecorative: false,
});

export const UserPortfolios = () => {
  const currentUser = useCurrentUserStore();
  const tokenStore = useTokenStore();

  const [portfolios, setPortfolios] = useState<PortfolioCardProps[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

        const mapped = data.portfolios.map((p, index) =>
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
    currentUser.user?.id,
    tokenStore.token,
  ])
  
  return (
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
        : portfolios?.map((portfolio) => (
          <PortfolioCard
            key={portfolio.title}
            {...portfolio}
            cardGreenClasses={classes.cardGreen}
            cardRedClasses={classes.cardRed}
          />
        ))
      }
    </section>
  )
}