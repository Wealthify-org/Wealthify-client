import { AltSeason } from "./Contents/Altseason/AltSeason";
import { Dominance } from "./Contents/Dominance/Dominance";
import { FearAndGreed } from "./Contents/FearAndGreed/FearAndGreed";
import { MainIndexes } from "./Contents/MainIndexes/MainIndexes";
import { IndexCard } from "./IndexCard/IndexCard";
import classes from "./IndexesCards.module.css";

export const IndexesCards = () => {
  return (
    <section className={classes.mainIndexesContainer}>
      <ul role="list" className={classes.indexesCardsList}>
        <IndexCard title="Fear & Greed">
          <FearAndGreed indexNumberValue={51} indexStringValue="Neautral"/>
        </IndexCard>
        
        <IndexCard title="Dominance">
          <Dominance btcDominance={60.89} ethDominance={10.06}/>
        </IndexCard>

        <IndexCard title="Altseason Index">
          <AltSeason indexNumberValue={30} indexStringValue="Not Altseason" />
        </IndexCard>

        <IndexCard title="Indexes" className={classes.allIndexesCard}>
          <MainIndexes 
            sp500IndexValue={6114}
            sp500IndexValueChangePct={1.54} 
            goldPriceValue={2925} 
            goldPriceValueChangePct={-0.45}
            totalCryptoMarketCapValue={3.19}
            totalCryptoMarketCapValueChangePct={0.35}
            total2MarketCapValue={1.25}
            total2MarketCapValueChangePct={0.47}
            total3MarketCapValue={0.92}
            total3MarketCapValueChangePct={0.81}
          />
        </IndexCard>
      </ul>
    </section>
  )
}