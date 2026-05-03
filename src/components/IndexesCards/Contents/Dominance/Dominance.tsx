import classes from "../Contents.module.css";

type Props = {
  btcDominance: number;
  ethDominance: number;
}

const formatPct = (value: number): string => {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(2)}%`;
};

export const Dominance = ({btcDominance, ethDominance}: Props) => {
  return (
    <div className={classes.contentsContainer}>
      <div className={classes.contentsFlex}>
        <img
          src="/index-icons/btc-logo.svg"
          className={classes.contentsIcon}
          alt="Bitcoin logo"
        />
        <p className={`${classes.contentsText} ${classes.dominanceContentsText}`}>
          {formatPct(btcDominance)}
        </p>
      </div>
      <div className={classes.contentsFlex}>
        <img
          src="/index-icons/eth-logo.svg"
          className={classes.contentsIcon}
          alt="Ethereum logo"
        />
        <p className={`${classes.contentsText} ${classes.dominanceContentsText}`}>
          {formatPct(ethDominance)}
        </p>
      </div>
    </div>
  )
}