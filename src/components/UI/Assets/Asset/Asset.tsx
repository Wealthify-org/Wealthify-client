import { observer } from "mobx-react-lite";
import classes from "../Assets.module.css"
import { FavoriteButton } from "./FavoriteButton";
import { Sparkline } from "./Sparkline";
import { API } from "@/lib/apiEndpoints";
import { useFavoritesStore } from "@/stores/favoritesStore/FavoritesProvider";

export type Sparkline7D = {
  prices: number[];
}

export type AssetProps = {
  assetId: number;
  index: number;
  name: string;
  ticker: string;
  price: number;
  change1h: number;
  change24h: number;
  change7d: number;
  change30d: number;
  change1y: number;
  marketCap: number;
  fdv: number;
  volume24h: number;
  logoUrlLocal?: string | null;
  sparkline7D?: Sparkline7D;
}

export const Asset = observer(({
  assetId,
  index,
  name,
  ticker,
  price,
  change1h,
  change24h,
  change7d,
  change30d,
  change1y,
  marketCap,
  fdv,
  logoUrlLocal,
  volume24h,
  
  sparkline7D
}: AssetProps) => {
  const favoritesStore = useFavoritesStore();
  const isFavorite = favoritesStore.has(assetId);

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
  
  const formatPrice = (value: number): string => {
    if (!Number.isFinite(value)) return "$0.00";
    return `$${value.toFixed(2)}`;
  };

  const changeClass = (value: number): string => {
    return value >= 0 ? classes.positive : classes.negative;
  }

  const handleStarClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    void favoritesStore.toggle(assetId).catch((err) => {
      console.error("[Asset] toggle favorite error", err);
    });
  };

  return (
    <tr className={classes.row}>
      <td 
        className={`${classes.td} ${classes.cellIndex}`}
        data-col="index"
      >
        <div className={classes.cellIndexInner}>
          <FavoriteButton isActive={isFavorite} onClick={handleStarClick} />
          <span>
            {index}
          </span>
        </div>
      </td>

      <td 
        className={`${classes.td} ${classes.cellName}`}
        data-col="name"
      >
        <div className={classes.assetInfo}>
          {logoUrlLocal && (
            <img 
              src={`${API}${logoUrlLocal}`}
              width={24}
              alt={`${name} logo`}
              className={classes.assetIcon}
            />
          )}
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

      <td className={`${classes.td} ${classes.cellNumeric}`}>{formatPrice(price)}</td>
      <td className={`${classes.td} ${classes.cellNumeric} ${changeClass(change1h)}`}>
        {formatPct(change1h)}  
      </td> 
      <td className={`${classes.td} ${classes.cellNumeric} ${changeClass(change24h)}`}>
        {formatPct(change24h)}
      </td>
      <td className={`${classes.td} ${classes.cellNumeric} ${changeClass(change7d)}`}>
        {formatPct(change7d)}
      </td>
      <td className={`${classes.td} ${classes.cellNumeric} ${changeClass(change30d)}`}>
        {formatPct(change30d)}
      </td>
      <td className={`${classes.td} ${classes.cellNumeric} ${changeClass(change1y)}`}>
        {formatPct(change1y)}
      </td>
      <td className={`${classes.td} ${classes.cellNumeric}`}>{formatValue(marketCap)}</td>
      <td className={`${classes.td} ${classes.cellNumeric}`}>{formatValue(fdv)}</td>
      <td className={`${classes.td} ${classes.cellNumeric}`}>{formatValue(volume24h)}</td>

      <td className={`${classes.td} ${classes.cellChart}`}>
        {sparkline7D && <Sparkline prices={sparkline7D.prices} />}
      </td>
    </tr>
  )
})