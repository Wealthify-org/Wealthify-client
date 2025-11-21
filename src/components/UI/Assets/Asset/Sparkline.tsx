"use client";

import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, TooltipContentProps } from "recharts";
import classes from "../Assets.module.css";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

type SparklineProps = {
  prices: number[];
};

const formatPrice = (value: number) =>
  value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });

// кастомная плашка тултипа
const CustomTooltip = ({
  active,
  payload,
}: TooltipContentProps<ValueType, NameType>) => {
  if (!active || !payload || !payload.length) return null;

  const value = payload[0].value as number;

  return (
    <div className={classes.sparklineTooltip}>
      ${formatPrice(value)}
    </div>
  );
};

export const Sparkline = ({ prices }: SparklineProps) => {
  if (!prices || prices.length === 0) return null;

  // Преобразуем массив в формат для Recharts
  const data = prices.map((price, index) => ({
    index,
    value: price,
  }));

  const isUp = prices[prices.length - 1] >= prices[0];
  const strokeColor = isUp ? "var(--green-color)" : "var(--red-color)";

  return (
    <div 
      className={classes.sparkline}
      onMouseDown={(e) => e.preventDefault()}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <XAxis dataKey="index" hide />
          <YAxis
            dataKey="value"
            hide
            domain={["dataMin", "dataMax"]} // <— ключевая строка
          />
          <Tooltip
            content={(props) => <CustomTooltip {...props} />}
            cursor={false}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
