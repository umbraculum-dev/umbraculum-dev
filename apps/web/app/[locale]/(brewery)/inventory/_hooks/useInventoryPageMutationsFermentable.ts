"use client";

import { type FormEvent } from "react";

import { createInventoryItem } from "@umbraculum/api-client/brewery";

import { webBreweryApiClient } from "../../_lib/breweryWaterClient";
import type { FermentableSearchItem } from "../_lib/inventoryTypes";
import type { UseInventoryPageMutationsParams } from "./useInventoryPageMutationsShared";

export function useInventoryPageMutationsFermentable({
  canCall,
  refresh,
  setError,
  filters,
  fetchFermentablesPage,
}: Pick<
  UseInventoryPageMutationsParams,
  "canCall" | "refresh" | "setError" | "filters" | "fetchFermentablesPage"
>) {
  const addFromFermentable = async (item: FermentableSearchItem) => {
    if (!canCall) return;
    try {
      const metadata = {
        ...(typeof item?.producer === "string" && item.producer.trim() ? { producer: item.producer.trim() } : {}),
        ...(typeof item?.colorLovibond === "number" && Number.isFinite(item.colorLovibond)
          ? { colorLovibond: item.colorLovibond }
          : {}),
        ...(typeof item?.yieldPercent === "number" && Number.isFinite(item.yieldPercent)
          ? { yieldPercent: item.yieldPercent }
          : {}),
        ...(typeof item?.ppg === "number" && Number.isFinite(item.ppg) ? { ppg: item.ppg } : {}),
      };
      await createInventoryItem(webBreweryApiClient(), {
        category: "fermentable",
        ingredientId: item.id,
        name: item.name,
        quantity: 0,
        unit: "kg",
        metadata,
      });
      filters.setFermentableQuery("");
      filters.setFermentableResults([]);
      await refresh();
    } catch (err) {
      setError(String(err));
    }
  };

  const onSearchFermentables = (e: FormEvent) => {
    e.preventDefault();
    const q = filters.fermentableQuery;
    filters.setFermentableActiveQuery(q);
    void fetchFermentablesPage(0, q);
  };

  const clearFermentablesSearch = () => {
    filters.setFermentableQuery("");
    filters.setFermentableActiveQuery("");
    filters.setFermentableResults([]);
    filters.setFermentableTotal(null);
    filters.setFermentablePage(0);
    filters.setFermentableSearched(false);
  };

  return {
    addFromFermentable,
    onSearchFermentables,
    clearFermentablesSearch,
  };
}
