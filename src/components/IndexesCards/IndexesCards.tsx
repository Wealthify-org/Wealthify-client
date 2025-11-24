"use client"

import { useEffect, useState } from "react";
import { AltSeason } from "./Contents/Altseason/AltSeason";
import { Dominance } from "./Contents/Dominance/Dominance";
import { FearAndGreed } from "./Contents/FearAndGreed/FearAndGreed";
import { MainIndexes } from "./Contents/MainIndexes/MainIndexes";
import { IndexCard } from "./IndexCard/IndexCard";
import classes from "./IndexesCards.module.css";

type IndexesData = {
  fearAndGreed: { value: number; label: string };
  dominance: { btc: number; eth: number };
  altseason: { value: number; label: string };
  main: {
    sp500IndexValue: number;
    sp500IndexValueChangePct: number;
    goldPriceValue: number;
    goldPriceValueChangePct: number;
    totalCryptoMarketCapValue: number;
    totalCryptoMarketCapValueChangePct: number;
    total2MarketCapValue: number;
    total2MarketCapValueChangePct: number;
    total3MarketCapValue: number;
    total3MarketCapValueChangePct: number;
  };
};

export const IndexesCards = () => {
  const [data, setData] = useState<IndexesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const mock: IndexesData = {
          fearAndGreed: { value: 51, label: "Neutral" },
          dominance: { btc: 60.89, eth: 10.06 },
          altseason: { value: 30, label: "Not Altseason" },
          main: {
            sp500IndexValue: 6114,
            sp500IndexValueChangePct: 1.54,
            goldPriceValue: 2925,
            goldPriceValueChangePct: -0.45,
            totalCryptoMarketCapValue: 3.19,
            totalCryptoMarketCapValueChangePct: 0.35,
            total2MarketCapValue: 1.25,
            total2MarketCapValueChangePct: 0.47,
            total3MarketCapValue: 0.92,
            total3MarketCapValueChangePct: 0.81,
          },
        };
        
        await new Promise((r) => setTimeout(r, 5000));

        if (!cancelled) {
          setData(mock);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }
    
    void load();

    return () => {
      cancelled = true;
    };
  }, [])
  return (
    <section className={classes.mainIndexesContainer}>
      <ul role="list" className={classes.indexesCardsList}>
        <IndexCard title="Fear & Greed" isLoading={isLoading}>
          {!isLoading && data && (
            <FearAndGreed
              indexNumberValue={data.fearAndGreed.value}
              indexStringValue={data.fearAndGreed.label}
            />
          )}
        </IndexCard>
        
        <IndexCard title="Dominance" isLoading={isLoading}>
          {!isLoading && data && (
            <Dominance
              btcDominance={data.dominance.btc}
              ethDominance={data.dominance.eth}
            />
          )}
        </IndexCard>

        <IndexCard title="Altseason Index" isLoading={isLoading}>
          {!isLoading && data && (
            <AltSeason
              indexNumberValue={data.altseason.value}
              indexStringValue={data.altseason.label}
            />
          )}
        </IndexCard>

        <IndexCard title="Indexes" isLoading={isLoading}  className={isLoading ? classes.allIndexesCardSkeleton : classes.allIndexesCard}>
          {!isLoading && data && (
            <MainIndexes
              sp500IndexValue={data.main.sp500IndexValue}
              sp500IndexValueChangePct={data.main.sp500IndexValueChangePct}
              goldPriceValue={data.main.goldPriceValue}
              goldPriceValueChangePct={data.main.goldPriceValueChangePct}
              totalCryptoMarketCapValue={data.main.totalCryptoMarketCapValue}
              totalCryptoMarketCapValueChangePct={data.main.totalCryptoMarketCapValueChangePct}
              total2MarketCapValue={data.main.total2MarketCapValue}
              total2MarketCapValueChangePct={data.main.total2MarketCapValueChangePct}
              total3MarketCapValue={data.main.total3MarketCapValue}
              total3MarketCapValueChangePct={data.main.total3MarketCapValueChangePct}
            />
          )}
        </IndexCard>
      </ul>
    </section>
  )
}