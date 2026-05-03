"use client";

import classes from "../Assets.module.css";
import { starOutlinedPath, starFilledPath } from "./starPaths";

type Props = {
  isActive: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  ariaLabel?: string;
};

export const FavoriteButton = ({ isActive, onClick, ariaLabel }: Props) => {
  const handleStarClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onClick?.(event);
  };

  return (
    <button
      type="button"
      className={classes.starButton}
      onClick={handleStarClick}
      aria-label={ariaLabel ?? (isActive ? "Remove from favorites" : "Add to favorites")}
      aria-pressed={isActive}
    >
      <svg
        className={classes.starImage}
        width="110"
        height="110"
        viewBox="0 0 109 110"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* контур */}
        <path className={classes.starOutline} d={starOutlinedPath} />

        {/* заливка под ним */}
        <path
          className={[
            classes.starFill,
            isActive ? classes.starFillActive : "",
          ].join(" ")}
          d={starFilledPath}
        />
      </svg>
    </button>
  );
};
