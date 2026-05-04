"use client";

import { observer } from "mobx-react-lite";
import { useTranslations } from "next-intl";

import { useCategoryFilterStore } from "@/stores/categoryFilterStore/CategoryFilterProvider";
import classes from "./AssetsByCategoriesTab.module.css";

/**
 * 13 ID, синхронизированных с CATEGORY_KEYWORDS на бэке
 * (libs/contracts/src/crypto-data-worker/category-keywords.ts).
 */
const CATEGORY_IDS = [
  "stablecoins",
  "blockchains",
  "l2",
  "defi",
  "liquidStaking",
  "ai",
  "aiAgents",
  "meme",
  "rwa",
  "gaming",
  "depin",
  "privacy",
  "exchangeTokens",
] as const;

export const AssetsByCategoriesTab = observer(() => {
  const t = useTranslations("sidebar");
  const store = useCategoryFilterStore();

  return (
    <fieldset className={classes.assetCategoriesTab}>
      <h4 className={classes.legend}>{t("assetsByCategories")}</h4>
      <ul className={classes.list}>
        {CATEGORY_IDS.map((id) => {
          const active = store.selected === id;
          return (
            <li key={id}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => store.toggle(id)}
                className={`${classes.pill} ${active ? classes.pillActive : ""}`}
              >
                {t(`categoryTags.${id}` as const)}
              </button>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
});
