import { TabButton } from "../TabButton/TabButton"
import classes from "./AssetsByCategoriesTab.module.css"

const categories = [
  "RWA", "AI", "Meme", "Blockchains", "L2", "AI Agents", "DeFi",  
]

export const AssetsByCategoriesTab = () => {
  return (
    <fieldset className={classes.assetCategoriesTab}>
      <h4 className={classes.legend}>
        Assets by categories
      </h4>
      <ul className={classes.list}>
        {categories.map(category => (
          <TabButton key={category}>
            {category}
          </TabButton>
        ))}
      </ul>
    </fieldset>
  )
}