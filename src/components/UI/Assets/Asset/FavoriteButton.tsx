"use client"

import classes from "../Assets.module.css"
import { starOutlinedPath, starFilledPath } from "./starPaths"

export const FavoriteButton = () => {
  const handleStarClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ): void => {
    event.stopPropagation();      // 👈 не даём клику долететь до <tr>
    event.preventDefault();    // опционально, если нужно
    // onToggleFavorite?.();         // тут уже делаешь, что нужно со звездой
  };

  return (
    <button className={classes.starButton} onClick={handleStarClick}>
        <svg
          className={classes.starImage}
          width="110" 
          height="110" 
          viewBox="0 0 109 110"
          xmlns="http://www.w3.org/2000/svg"
        >
        <path
          className={classes.starOutline}
          d={starOutlinedPath}
        />
        {/* заливка под ним */}
        <path
          className={classes.starFill}
          d={starFilledPath}
        />
      </svg>
    </button>
  )
}