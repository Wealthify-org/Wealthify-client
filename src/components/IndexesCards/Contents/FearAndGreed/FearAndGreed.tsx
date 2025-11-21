import classes from "../Contents.module.css";

type Props = {
  indexNumberValue: number;
  indexStringValue: string;
}

export const FearAndGreed = ({indexNumberValue, indexStringValue}: Props) => {
  return (
    <>
      <div className={`${classes.indexValue} ${classes.fearAndGreedIndex}`}>
        {indexNumberValue}
      </div>
      <p className={classes.footerText}>{indexStringValue}</p>
    </>
  )
}