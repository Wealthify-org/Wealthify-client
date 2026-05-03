import classes from "../Contents.module.css";
import { IndexBadge } from "../../IndexBadge/IndexBadge";

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

const formatPct = (value: number): string => {
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
};

const formatBigUsd = (value: number): string => {
  if (!Number.isFinite(value)) return "$0";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(2)}K`;
  return `${sign}$${abs.toFixed(2)}`;
};

const formatPlainUsd = (value: number): string => {
  if (!Number.isFinite(value)) return "$0";
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

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
  total3MarketCapValueChangePct,
}: Props) => {
  const changeClass = (value: number): string => {
    return value >= 0 ? classes.positiveChange : classes.negativeChange;
  };

  return (
    <div className={`${classes.mainIndexesContainer}`}>
      <div className={classes.contentsFlex}>
        <span className={classes.contentsIcon}>
          <IndexBadge variant="sp500" ariaLabel="S&P 500" />
        </span>
        <p className={`${classes.contentsText} ${classes.dominanceContentsText}`}>
          {formatPlainUsd(sp500IndexValue)}
        </p>
        <p className={`${classes.pctChange} ${changeClass(sp500IndexValueChangePct)}`}>
          {formatPct(sp500IndexValueChangePct)}
        </p>
      </div>

      <div className={classes.contentsFlex}>
        <span className={classes.contentsIcon}>
          <IndexBadge variant="gold" ariaLabel="Gold" />
        </span>
        <p className={`${classes.contentsText} ${classes.dominanceContentsText}`}>
          {formatPlainUsd(goldPriceValue)}
        </p>
        <p className={`${classes.pctChange} ${changeClass(goldPriceValueChangePct)}`}>
          {formatPct(goldPriceValueChangePct)}
        </p>
      </div>

      <div className={classes.contentsFlex}>
        <span className={classes.contentsIcon}>
          <IndexBadge variant="total" ariaLabel="Total crypto market cap" />
        </span>
        <p className={`${classes.contentsText} ${classes.dominanceContentsText}`}>
          {formatBigUsd(totalCryptoMarketCapValue)}
        </p>
        <p className={`${classes.pctChange} ${changeClass(totalCryptoMarketCapValueChangePct)}`}>
          {formatPct(totalCryptoMarketCapValueChangePct)}
        </p>
      </div>

      <div className={classes.contentsFlex}>
        <span className={classes.contentsIcon}>
          <IndexBadge variant="total2" ariaLabel="TOTAL2 market cap" />
        </span>
        <p className={`${classes.contentsText} ${classes.dominanceContentsText}`}>
          {formatBigUsd(total2MarketCapValue)}
        </p>
        <p className={`${classes.pctChange} ${changeClass(total2MarketCapValueChangePct)}`}>
          {formatPct(total2MarketCapValueChangePct)}
        </p>
      </div>

      <div className={classes.contentsFlex}>
        <span className={classes.contentsIcon}>
          <IndexBadge variant="total3" ariaLabel="TOTAL3 market cap" />
        </span>
        <p className={`${classes.contentsText} ${classes.dominanceContentsText}`}>
          {formatBigUsd(total3MarketCapValue)}
        </p>
        <p className={`${classes.pctChange} ${changeClass(total3MarketCapValueChangePct)}`}>
          {formatPct(total3MarketCapValueChangePct)}
        </p>
      </div>
    </div>
  );
};
