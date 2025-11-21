import classes from "../Contents.module.css";

type Props = {
  btcDominance: number;
  ethDominance: number;
}

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
          {btcDominance}%
        </p>
      </div>
      <div className={classes.contentsFlex}>
        <img 
          src="/index-icons/eth-logo.svg"
          className={classes.contentsIcon}
          alt="Bitcoin logo"
        />
        <p className={`${classes.contentsText} ${classes.dominanceContentsText}`}>
          {ethDominance}%
        </p>
      </div>
    </div>
  )
}