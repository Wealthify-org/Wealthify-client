/**
 * IndexBadge — inline SVG-«квадратики» для индексов в дашборде.
 * Воспроизводит дизайн оригинальных PNG/SVG-иконок:
 *  - S&P 500   — кораллово-красный squircle, белый текст в 2 строки
 *  - Gold      — пастельно-жёлтый squircle, тёмные «слитки золота» (3 стэка)
 *  - TOTAL     — синий squircle, белый текст «TOTAL» одной строкой
 *  - TOTAL 2/3 — тот же синий squircle, «TOTAL» + цифра ниже
 */

type Variant = "sp500" | "gold" | "total" | "total2" | "total3";

type Props = {
  variant: Variant;
  className?: string;
  size?: number | string;
  ariaLabel?: string;
};

// единые цвета — соответствуют оригиналу
const COLORS = {
  spBg: "#FF5C5C",
  goldBg: "#FFEC88",
  goldFg: "#3D3D3D",
  totalBg: "#3E5BFF",
  text: "#FFFFFF",
} as const;

// Раньше был iOS-стиль squircle (rx=22). Дизайн перешёл на «почти-
// квадратные» tile-иконки. Скругление 4 синхронизировано с обёрткой
// `.contentsIcon` — чтобы по углам SVG не проступал серый фон.
const SQUIRCLE_RX = 4;

export const IndexBadge = ({ variant, className, size, ariaLabel }: Props) => {
  const dim = size ?? "100%";
  const role = ariaLabel ? "img" : "presentation";

  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      role={role}
      aria-label={ariaLabel}
      className={className}
    >
      {variant === "sp500" && <SP500 />}
      {variant === "gold" && <Gold />}
      {variant === "total" && <Total />}
      {variant === "total2" && <TotalNumbered n="2" />}
      {variant === "total3" && <TotalNumbered n="3" />}
    </svg>
  );
};

// ── варианты ───────────────────────────────────────────────────────────────

const SP500 = () => (
  <>
    <rect
      width="100"
      height="100"
      rx={SQUIRCLE_RX}
      ry={SQUIRCLE_RX}
      fill={COLORS.spBg}
    />
    <text
      x="50"
      y="44"
      textAnchor="middle"
      dominantBaseline="middle"
      fontFamily="inherit"
      fontWeight={800}
      fontSize="22"
      letterSpacing="-0.02em"
      fill={COLORS.text}
    >
      S&amp;P
    </text>
    <text
      x="50"
      y="70"
      textAnchor="middle"
      dominantBaseline="middle"
      fontFamily="inherit"
      fontWeight={800}
      fontSize="22"
      letterSpacing="0.02em"
      fill={COLORS.text}
    >
      500
    </text>
  </>
);

const Gold = () => (
  <>
    <rect
      width="100"
      height="100"
      rx={SQUIRCLE_RX}
      ry={SQUIRCLE_RX}
      fill={COLORS.goldBg}
    />
    {/* три «слитка»: верхний по центру, два внизу слева/справа.
        path-ы взяты пропорционально из оригинального gold.svg (1000×1000) */}
    {/* нижний-левый */}
    <path
      d="M27.65 49.30
         C27.86 48.70 28.43 48.30 29.06 48.30
         L40.94 48.30
         C41.57 48.30 42.14 48.70 42.35 49.30
         L48.30 66.30
         C48.64 67.28 47.92 68.30 46.89 68.30
         L23.11 68.30
         C22.08 68.30 21.36 67.28 21.70 66.30
         L27.65 49.30 Z"
      fill={COLORS.goldFg}
    />
    {/* нижний-правый */}
    <path
      d="M57.65 49.30
         C57.86 48.70 58.43 48.30 59.06 48.30
         L70.94 48.30
         C71.57 48.30 72.14 48.70 72.35 49.30
         L78.30 66.30
         C78.64 67.28 77.92 68.30 76.89 68.30
         L53.11 68.30
         C52.08 68.30 51.36 67.28 51.70 66.30
         L57.65 49.30 Z"
      fill={COLORS.goldFg}
    />
    {/* верхний центр */}
    <path
      d="M42.99 27.69
         C43.20 27.08 43.77 26.67 44.41 26.67
         L55.59 26.67
         C56.23 26.67 56.80 27.08 57.01 27.69
         L62.68 44.69
         C63.00 45.66 62.28 46.67 61.25 46.67
         L38.75 46.67
         C37.72 46.67 37.00 45.66 37.32 44.69
         L42.99 27.69 Z"
      fill={COLORS.goldFg}
    />
  </>
);

const Total = () => (
  <>
    <rect
      width="100"
      height="100"
      rx={SQUIRCLE_RX}
      ry={SQUIRCLE_RX}
      fill={COLORS.totalBg}
    />
    <text
      x="50"
      y="50"
      textAnchor="middle"
      dominantBaseline="middle"
      fontFamily="inherit"
      fontWeight={800}
      fontSize="22"
      letterSpacing="0.04em"
      fill={COLORS.text}
    >
      TOTAL
    </text>
  </>
);

const TotalNumbered = ({ n }: { n: string }) => (
  <>
    <rect
      width="100"
      height="100"
      rx={SQUIRCLE_RX}
      ry={SQUIRCLE_RX}
      fill={COLORS.totalBg}
    />
    <text
      x="50"
      y="38"
      textAnchor="middle"
      dominantBaseline="middle"
      fontFamily="inherit"
      fontWeight={800}
      fontSize="20"
      letterSpacing="0.04em"
      fill={COLORS.text}
    >
      TOTAL
    </text>
    <text
      x="50"
      y="68"
      textAnchor="middle"
      dominantBaseline="middle"
      fontFamily="inherit"
      fontWeight={800}
      fontSize="28"
      fill={COLORS.text}
    >
      {n}
    </text>
  </>
);
