"use client";

import { createContext, ReactNode, useContext, useMemo } from "react";
import { CategoryFilterStore } from "./CategoryFilterStore";

const CategoryFilterContext = createContext<CategoryFilterStore | null>(null);

export const CategoryFilterProvider = ({ children }: { children: ReactNode }) => {
  const store = useMemo(() => new CategoryFilterStore(), []);
  return (
    <CategoryFilterContext.Provider value={store}>
      {children}
    </CategoryFilterContext.Provider>
  );
};

export const useCategoryFilterStore = (): CategoryFilterStore => {
  const ctx = useContext(CategoryFilterContext);
  if (!ctx)
    throw new Error(
      "useCategoryFilterStore must be used within CategoryFilterProvider",
    );
  return ctx;
};
