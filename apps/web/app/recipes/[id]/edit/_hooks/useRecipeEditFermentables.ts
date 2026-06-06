"use client";

import {
  inferDehuskedFromName,
  inferMaltClass,
  isRoastedLike,
  useRecipeEditFermentablesBulk,
} from "./useRecipeEditFermentablesBulk";
import { useRecipeEditFermentablesRowCrud } from "./useRecipeEditFermentablesRowCrud";

export { inferDehuskedFromName, inferMaltClass, isRoastedLike };

export function useRecipeEditFermentables(params: { t: (key: string) => string; roundTo: (n: number, d: number) => number }) {
  const rowCrud = useRecipeEditFermentablesRowCrud();
  const bulk = useRecipeEditFermentablesBulk({
    t: params.t,
    roundTo: params.roundTo,
    gristRows: rowCrud.gristRows,
    setGristRows: rowCrud.setGristRows,
  });

  return {
    ...rowCrud,
    ...bulk,
    inferMaltClass,
    isRoastedLike,
    inferDehuskedFromName,
  };
}
