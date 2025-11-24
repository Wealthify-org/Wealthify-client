import classes from "../Assets.module.css";
export const SKELETON_ROWS = 15;

export const AssetSkeletonRow = () => {
  return (
    <tr className={`${classes.row} ${classes.skeletonRow}`}>
      {/* # */}
      <td className={`${classes.td} ${classes.cellIndex} ${classes.skeletonCell}`}>
        <div className={classes.skeletonBoxSmall} />
      </td>

      {/* Name */}
      <td className={`${classes.td} ${classes.cellName} ${classes.skeletonCell}`}>
        <div className={classes.assetInfo}>
          <div className={`${classes.assetIcon} ${classes.skeletonBox}`} />
          <div className={classes.assetInfoFlex}>
            <div className={`${classes.assetName} ${classes.skeletonBox}`} />
            <div className={`${classes.assetTicker} ${classes.skeletonBoxSmall}`} />
          </div>
        </div>
      </td>

      {/* Price */}
      <td className={`${classes.td} ${classes.cellNumeric} ${classes.skeletonCell}`}>
        <div className={classes.skeletonBoxSmall} />
      </td>

      {/* 1h */}
      <td className={`${classes.td} ${classes.cellNumeric} ${classes.skeletonCell}`}>
        <div className={classes.skeletonBoxSmall} />
      </td>

      {/* 24h */}
      <td className={`${classes.td} ${classes.cellNumeric} ${classes.skeletonCell}`}>
        <div className={classes.skeletonBoxSmall} />
      </td>

      {/* 7d */}
      <td className={`${classes.td} ${classes.cellNumeric} ${classes.skeletonCell}`}>
        <div className={classes.skeletonBoxSmall} />
      </td>

      {/* 30d */}
      <td className={`${classes.td} ${classes.cellNumeric} ${classes.skeletonCell}`}>
        <div className={classes.skeletonBoxSmall} />
      </td>

      {/* 1y */}
      <td className={`${classes.td} ${classes.cellNumeric} ${classes.skeletonCell}`}>
        <div className={classes.skeletonBoxSmall} />
      </td>

      {/* Market Cap */}
      <td className={`${classes.td} ${classes.cellNumeric} ${classes.skeletonCell}`}>
        <div className={classes.skeletonBox} />
      </td>

      {/* FDV */}
      <td className={`${classes.td} ${classes.cellNumeric} ${classes.skeletonCell}`}>
        <div className={classes.skeletonBox} />
      </td>

      {/* Volume */}
      <td className={`${classes.td} ${classes.cellNumeric} ${classes.skeletonCell}`}>
        <div className={classes.skeletonBox} />
      </td>

      {/* 7d Chart */}
      <td className={`${classes.td} ${classes.cellChart} ${classes.skeletonCell}`}>
        <div className={classes.skeletonChart} />
      </td>
    </tr>
  )
}