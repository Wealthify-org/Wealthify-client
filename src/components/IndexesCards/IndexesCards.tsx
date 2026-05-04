"use client"

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AltSeason } from "./Contents/Altseason/AltSeason";
import { Dominance } from "./Contents/Dominance/Dominance";
import { FearAndGreed } from "./Contents/FearAndGreed/FearAndGreed";
import { MainIndexes } from "./Contents/MainIndexes/MainIndexes";
import { IndexCard } from "./IndexCard/IndexCard";
import classes from "./IndexesCards.module.css";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";

type IndexSnapshotDto = {
  id: number;
  capturedAt: string;

  fearGreedValue: number;
  fearGreedClassification: string;

  btcDominancePct: number;
  ethDominancePct: number;

  totalMarketCapUsd: number;
  total2MarketCapUsd: number;
  total3MarketCapUsd: number;
  totalMcapChange24hPct: number;

  altseasonScore: number;
  altseasonLabel: string;

  sp500Value: number;
  sp500Change24hPct: number;
  goldValue: number;
  goldChange24hPct: number;
};

export const IndexesCards = () => {
  const t = useTranslations("home.indexes");
  const [data, setData] = useState<IndexSnapshotDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.GET_INDEXES_DASHBOARD, {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`Indexes dashboard fetch failed: ${res.status}`);
        }

        const json = (await res.json()) as IndexSnapshotDto | null;
        if (cancelled) return;

        // если воркер ещё не успел снять первый снэпшот — json может быть null
        if (json) setData(json);
      } catch (e) {
        console.error("[IndexesCards] failed to load dashboard", e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className={classes.mainIndexesContainer}>
      <ul role="list" className={classes.indexesCardsList}>
        <IndexCard title={t("fearAndGreed")} isLoading={isLoading}>
          {!isLoading && data && (
            <FearAndGreed
              indexNumberValue={data.fearGreedValue}
              indexStringValue={data.fearGreedClassification}
            />
          )}
        </IndexCard>

        <IndexCard title={t("dominance")} isLoading={isLoading}>
          {!isLoading && data && (
            <Dominance
              btcDominance={data.btcDominancePct}
              ethDominance={data.ethDominancePct}
            />
          )}
        </IndexCard>

        <IndexCard
          title={t("altseasonIndex")}
          isLoading={isLoading}
          className={classes.altseasonCard}
        >
          {!isLoading && data && (
            <AltSeason
              indexNumberValue={data.altseasonScore}
              indexStringValue={data.altseasonLabel}
            />
          )}
        </IndexCard>

        <IndexCard
          title={t("indexes")}
          isLoading={isLoading}
          className={isLoading ? classes.allIndexesCardSkeleton : classes.allIndexesCard}
        >
          {!isLoading && data && (
            <MainIndexes
              sp500IndexValue={data.sp500Value}
              sp500IndexValueChangePct={data.sp500Change24hPct}
              goldPriceValue={data.goldValue}
              goldPriceValueChangePct={data.goldChange24hPct}
              totalCryptoMarketCapValue={data.totalMarketCapUsd}
              totalCryptoMarketCapValueChangePct={data.totalMcapChange24hPct}
              total2MarketCapValue={data.total2MarketCapUsd}
              total2MarketCapValueChangePct={data.totalMcapChange24hPct}
              total3MarketCapValue={data.total3MarketCapUsd}
              total3MarketCapValueChangePct={data.totalMcapChange24hPct}
            />
          )}
        </IndexCard>
      </ul>
    </section>
  )
}
