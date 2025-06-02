import React from "react";
import classes from './portfolioCard.module.css'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const PortfolioCard = ({title, category, value, valueChange, isDecorative}) => {
  const isNegative = Number(valueChange) < 0
  const percentChange = Number(valueChange) / Number(value.replace(/,/g, '')) * 100

  const priceChangeColorClasses = isNegative 
    ? [classes.priceChange, classes.priceChangeRed].join(' ') 
    : [classes.priceChange, classes.priceChangeGreen].join(' ')

  const cardShadowClasses = isNegative
    ? [classes.card, classes.cardRed].join(' ')
    : [classes.card, classes.cardGreen].join(' ')

  const cardHoverClasses = isDecorative 
    ? ['hoverable']
    : []

  const cardClasses = [cardShadowClasses, cardHoverClasses].join(' ')
  
  const formatNumberWithCommas = (number) => {
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  const formattedValue = formatNumberWithCommas(value)
  const formattedValueChange = formatNumberWithCommas(valueChange.replace(/-/g, ''))
  const formattedPercentChange = percentChange.toFixed(2)

  const data = [
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
    <div className={cardClasses}>
      <div className={classes.topPart}>
        <p className={classes.mainText}>{title}</p>
        <p className={classes.secondaryText}>{category}</p>
      </div>

      <div className={classes.bottomPart}>
        <div className={classes.textsContainer}>
          <p className={classes.price}>{formattedValue}</p>
          <p className={classes.changeText}>24h change:</p>
          <p className={priceChangeColorClasses}>{formattedPercentChange}% ~${formattedValueChange}</p>
        </div>
        <div className={classes.chart}>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart data={data}>
              <XAxis tick={false} axisLine={true} stroke={isNegative ? "var(--red_color)" : "var(--green_color)"} strokeWidth={2} />
              <YAxis tick={false} axisLine={true} stroke={isNegative ? "var(--red_color)" : "var(--green_color)"} strokeWidth={2} />
              <Line type="monotone" dataKey="value" stroke={isNegative ? "var(--red_color)" : "var(--green_color)"} strokeWidth={2} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default PortfolioCard