import classes from "../Contents.module.css";

type Props = {
  indexNumberValue: number;
  indexStringValue: string;
}

export const AltSeason = ({indexNumberValue, indexStringValue}: Props) => {
  return (
    <>
      <div
        className={`${classes.indexValue} ${classes.altSeasonIndex}`}
        data-index-value
      >
        {indexNumberValue}
      </div>
      <p className={classes.footerText}>{indexStringValue}</p>
    </>
  )
}