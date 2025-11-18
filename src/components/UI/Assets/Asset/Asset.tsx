import classes from "../Assets.module.css"
import { FavoriteButton } from "./FavoriteButton";
import { Sparkline } from "./Sparkline";
import { starFilledPath, starOutlinedPath } from "./starPaths";

export type Sparkline7D = {
  prices: number[];
}

export type AssetProps = {
  index: number;
  name: string;
  ticker: string;
  price: number;
  change1h: number;
  change4h: number;
  change24h: number;
  change7d: number;
  marketCap: number;
  fdv: number;
  volume24h: number;
  sparkline7D?: Sparkline7D;
}

export const Asset = ({
  index,
  name,
  ticker,
  price,
  change1h,
  change4h,
  change24h,
  change7d,
  marketCap,
  fdv,
  volume24h,
  sparkline7D
}: AssetProps) => {
  const formatPct = (value: number): string => {
    return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
  }

  const formatValue = (value: number): string => {
    if (!Number.isFinite(value)) return "$0";

    const abs = Math.abs(value);
    let num = abs;
    let suffix = "";

    if (abs >= 1e12) {
      num = abs / 1e12;
      suffix = " T";
    } else if (abs >= 1e9) {
      num = abs / 1e9;
      suffix = " B";
    } else if (abs >= 1e6) {
      num = abs / 1e6;
      suffix = " M";
    } else if (abs >= 1e3) {
      num = abs / 1e3;
      suffix = " K";
    } else {
      const formattedSmall = abs % 1 === 0 ? abs.toFixed(0) : abs.toFixed(2);
      return `${value < 0 ? "-" : ""}$${formattedSmall}`;
    }

    const formatted = num.toFixed(2);

    return `${value < 0 ? "-" : ""}$${formatted}${suffix}`;
  };
  
  const changeClass = (value: number): string => {
    return value >= 0 ? classes.positive : classes.negative;
  }

  return (
    <tr className={classes.row}>
      <td className={`${classes.td} ${classes.cellIndex}`}>
        <div className={classes.cellIndexInner}>
          <FavoriteButton />
          <span>
            {index}
          </span>
        </div>
      </td>

      <td className={`${classes.td} ${classes.cellName}`}>
        <div className={classes.assetInfo}>
          <div className={classes.assetIcon} />
          <div className={classes.assetInfoFlex}>
            <div className={classes.assetName}>
              {name}
            </div>
            <div className={classes.assetTicker}>
              {ticker}
            </div>
          </div>
        </div>
      </td>

      <td className={`${classes.td} ${classes.cellNumeric}`}>${price}</td>
      <td className={`${classes.td} ${classes.cellNumeric} ${changeClass(change1h)}`}>
        {formatPct(change1h)}  
      </td> 
      <td className={`${classes.td} ${classes.cellNumeric} ${changeClass(change4h)}`}>
        {formatPct(change4h)}
      </td>
      <td className={`${classes.td} ${classes.cellNumeric} ${changeClass(change24h)}`}>
        {formatPct(change24h)}
      </td>
      <td className={`${classes.td} ${classes.cellNumeric} ${changeClass(change7d)}`}>
        {formatPct(change7d)}
      </td>
      <td className={`${classes.td} ${classes.cellNumeric}`}>{formatValue(marketCap)}</td>
      <td className={`${classes.td} ${classes.cellNumeric}`}>{formatValue(fdv)}</td>
      <td className={`${classes.td} ${classes.cellNumeric}`}>{formatValue(volume24h)}</td>

      <td className={`${classes.td} ${classes.cellChart}`}>
        {sparkline7D && <Sparkline prices={sparkline7D.prices} />}
      </td>
    </tr>
  )
}