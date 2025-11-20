import { Asset } from "./Asset/Asset"
import classes from "./Assets.module.css"
import { MOCK_ASSETS } from "./mock"

export const Assets = () => {
  return (
    <section 
      className={classes.assetsSection}
      data-assets-scroll-container="1"  
    >
      <table 
        className={classes.table}
        data-assets-table="true"
      >
        <thead className={classes.thead}>
          <tr className={`${classes.trHead}`}>
            <th className={`${classes.th} ${classes.thIndex}`}>#</th>
            <th className={`${classes.th} ${classes.thName}`}>Name</th>
            <th className={`${classes.th} ${classes.thPrice}`}>Price</th>
            <th className={`${classes.th} ${classes.thPct}`}>1h %</th>
            <th className={`${classes.th} ${classes.thPct}`}>4h %</th>
            <th className={`${classes.th} ${classes.thPct}`}>24h %</th>
            <th className={`${classes.th} ${classes.thPct}`}>7d %</th>
            <th className={`${classes.th} ${classes.thMCap}`}>Market Cap</th>
            <th className={`${classes.th} ${classes.thFDV}`}>F.D.V.</th>
            <th className={`${classes.th} ${classes.thVolume}`}>24h Volume</th>
            <th className={`${classes.th} ${classes.chartTh}`}>7d Chart</th>
          </tr>
        </thead>
        
        <tbody>
          {MOCK_ASSETS.map((asset) => (
            <Asset key={asset.index} {...asset} />
          ))}
        </tbody>
      </table>
    </section>
  )
}