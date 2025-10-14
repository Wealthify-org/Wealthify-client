"use client"

import classes from "./PortfolioCard.module.css"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";

type PortfolioCardProps = {
  title: string
  category: "Stocks" | "Crypto" | "Bonds"
  value: number
  valueChange: number
  isDecorative: boolean
}

const PortfolioCard = ({title, category, value, valueChange, isDecorative=true}: PortfolioCardProps) => {
  const isNegative = valueChange < 0
  const percentChange = valueChange / value * 100

  const priceChangeColorClasses = isNegative
    ? [classes.priceChange, classes.priceChangeRed].join(" ")
    : [classes.priceChange, classes.priceChangeGreen].join(" ")

  const cardShadowClasses = isNegative
    ? [classes.card, classes.cardRed].join(" ")
    : [classes.card, classes.cardGreen].join(" ")

  const cardClasses = cardShadowClasses

  const formatNumberWithCommas = (num: string): string => {
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  const formattedValue = formatNumberWithCommas(String(value))
  const formattedValueChange = formatNumberWithCommas(String(valueChange))
  const formattedPercentChange = percentChange.toFixed(2)

  // const generateData = (numberOfValues: number) => {
  //   return []
  // }

  const data = isDecorative ?  [
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
  ] : []

  return (
    <article aria-labelledby={`${title}-h`} className={cardClasses}>
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