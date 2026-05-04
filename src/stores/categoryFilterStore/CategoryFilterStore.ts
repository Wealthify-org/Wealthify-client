import { makeAutoObservable } from "mobx";

/**
 * Глобальный single-select фильтр по категориям активов.
 * Применяется в:
 *  - /home (Cryptocurrencies) — server-side через ?category=
 *  - /favorites — client-side по asset.categoryIds
 *  - /portfolios/[id] holdings — client-side по asset.categoryIds
 */
export class CategoryFilterStore {
  /** id выбранной категории (см. CATEGORY_KEYWORDS на бэке) или null. */
  selected: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  set(id: string | null) {
    this.selected = id;
  }

  clear() {
    this.selected = null;
  }

  toggle(id: string) {
    this.selected = this.selected === id ? null : id;
  }
}
