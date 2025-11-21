import classes from "../Contents.module.css";

type Props = {
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
}

export const MainIndexes = ({
  sp500IndexValue,
  sp500IndexValueChangePct,
  goldPriceValue,
  goldPriceValueChangePct,
  totalCryptoMarketCapValue, 
  totalCryptoMarketCapValueChangePct,
  total2MarketCapValue, 
  total2MarketCapValueChangePct,
  total3MarketCapValue,
  total3MarketCapValueChangePct
}: Props) => {
  const formatPct = (value: number): string => {
    return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
  }

  const changeClass = (value: number): string => {
    return value >= 0 ? classes.positiveChange : classes.negativeChange;
  }

  return (
    <div className={`${classes.mainIndexesContainer}`}>
      <div className={classes.contentsFlex}>
        <img 
          src="/index-icons/sp-500.svg"
          className={classes.contentsIcon}
          alt="Bitcoin logo"
        />
        <p className={`${classes.contentsText} ${classes.dominanceContentsText}`}>
          ${sp500IndexValue}
        </p>
        <p className={`${classes.pctChange} ${changeClass(sp500IndexValueChangePct)}`}>
          {formatPct(sp500IndexValueChangePct)}
        </p>
      </div>
      <div className={classes.contentsFlex}>
        <img 
          src="/index-icons/gold.svg"
          className={classes.contentsIcon}
          alt="Bitcoin logo"
        />
        <p className={`${classes.contentsText} ${classes.dominanceContentsText}`}>
          ${goldPriceValue}
        </p>
        <p className={`${classes.pctChange} ${changeClass(goldPriceValueChangePct)}`}>
          {formatPct(goldPriceValueChangePct)}
        </p>
      </div>
        <div className={classes.contentsFlex}>
        <img 
          src="/index-icons/total.svg"
          className={classes.contentsIcon}
          alt="Bitcoin logo"
        />
        <p className={`${classes.contentsText} ${classes.dominanceContentsText}`}>
          ${totalCryptoMarketCapValue}
        </p>
        <p className={`${classes.pctChange} ${changeClass(totalCryptoMarketCapValueChangePct)}`}>
          {formatPct(totalCryptoMarketCapValueChangePct)}
        </p>
      </div>
      <div className={classes.contentsFlex}>
      <img 
        src="/index-icons/total-2.svg"
        className={classes.contentsIcon}
        alt="Bitcoin logo"
      />
      <p className={`${classes.contentsText} ${classes.dominanceContentsText}`}>
        ${total2MarketCapValue}
      </p>
      <p  className={`${classes.pctChange} ${changeClass(total2MarketCapValueChangePct)}`}>
        {formatPct(total2MarketCapValueChangePct)}
      </p>
    </div>
    <div className={classes.contentsFlex}>
      <img 
        src="/index-icons/total-3.svg"
        className={classes.contentsIcon}
        alt="Bitcoin logo"
      />
      <p className={`${classes.contentsText} ${classes.dominanceContentsText}`}>
        ${total3MarketCapValue}
      </p>
      <p className={`${classes.pctChange} ${changeClass(total3MarketCapValueChangePct)}`}>
        {formatPct(total3MarketCapValueChangePct)}
      </p>
    </div>
  </div>  
  )
}