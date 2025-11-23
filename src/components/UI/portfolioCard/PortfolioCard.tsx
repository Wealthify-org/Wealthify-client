"use client"

import classes from "./PortfolioCard.module.css"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";

export type PortfolioCardProps = {
  title: string
  category: "Stocks" | "Crypto" | "Bonds" | "Fiat"
  value: number
  valueChange: number
  isDecorative: boolean
  portfolioValueChangeData?: number[];
  cardClassNames?: string;
  cardGreenClasses?: string;
  cardRedClasses?: string;
}

const PortfolioCard = ({
  title, 
  category, 
  value, 
  valueChange, 
  portfolioValueChangeData=[], 
  isDecorative=true, 
  cardClassNames="",
  cardGreenClasses="",
  cardRedClasses=""
}: PortfolioCardProps) => {
  const isNegative = valueChange < 0
  const rawPercentChange =
    value === 0 ? 0 : (valueChange / value) * 100;

  const priceChangeColorClasses = isNegative
    ? [classes.priceChange, classes.priceChangeRed].join(" ")
    : [classes.priceChange, classes.priceChangeGreen].join(" ")

  const cardGreen = `${cardGreenClasses} ${classes.cardGreen}`;
  const cardRed = `${cardRedClasses} ${classes.cardRed}`

  const cardShadowClasses = isNegative
    ? [classes.card, cardRed].join(" ")
    : [classes.card, cardGreen].join(" ")

  const cardClasses = cardShadowClasses

  const formatNumber = (num: number): string => {
    if (!Number.isFinite(num)) return "0.00";

    const fixed = num.toFixed(2); // округление до двух знаков
    const [integer, fraction] = fixed.split(".");

    const withCommas = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return `${withCommas}.${fraction}`;
  };


  const formattedValue = formatNumber(value);
  const formattedValueChange = formatNumber(valueChange);
  const formattedPercentChange = formatNumber(rawPercentChange);

  const shouldTakeDataFromProps = portfolioValueChangeData.length > 0;

  const data = shouldTakeDataFromProps 
    ? portfolioValueChangeData
    : [
      { value: 1500 },
      { value: 2500 },
      { value: 2050 },
      { value: 2500 },
      { value: 2400 },
      { value: 2800 },
      { value: 2700 },
      { value: 3000 },
      { value: 3100 },
      { value: 2700 }
    ]

  return (
    <article aria-labelledby={`${title}-h`} className={`${cardClasses} ${cardClassNames}`}>
      <header className={classes.topPart}>
        <h3 id={`${title}-h`} className={classes.mainText}>{title}</h3>
        <p className={classes.secondaryText}>{category}</p>
      </header>

      <div className={classes.bottomPart}>
        <dl className={classes.textsContainer}>
          <dt className={classes.price}>{formattedValue}</dt>
          <dd className={classes.changeText}>24h change:</dd>
          <dd className={priceChangeColorClasses}>{formattedPercentChange}% ~${formattedValueChange}</dd>
        </dl>
        <figure className={classes.chart} aria-hidden="true" inert>
          <ResponsiveContainer>
            <LineChart data={data}>
              <XAxis tick={false} axisLine={true} stroke={isNegative ? "var(--red-color)" : "var(--green-color)"} strokeWidth={2} />
              <YAxis tick={false} axisLine={true} stroke={isNegative ? "var(--red-color)" : "var(--green-color)"} strokeWidth={2} />
              <Line type="monotone" dataKey="value" stroke={isNegative ? "var(--red-color)" : "var(--green-color)"} strokeWidth={2} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </figure>
      </div>
    </article>  
  )
}

export default PortfolioCard