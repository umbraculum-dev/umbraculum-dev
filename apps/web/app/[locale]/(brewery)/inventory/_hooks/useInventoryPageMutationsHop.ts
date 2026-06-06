"use client";

import { type FormEvent } from "react";

import { createInventoryItem } from "@umbraculum/api-client/brewery";

import { webBreweryApiClient } from "../../../../_lib/breweryWaterClient";
import type { HopSearchItem } from "../_lib/inventoryTypes";
import type { UseInventoryPageMutationsParams } from "./useInventoryPageMutationsShared";

export function useInventoryPageMutationsHop({
  canCall,
  refresh,
  setError,
  filters,
  fetchHopsPage,
}: Pick<UseInventoryPageMutationsParams, "canCall" | "refresh" | "setError" | "filters" | "fetchHopsPage">) {
  const addFromHop = async (item: HopSearchItem) => {
    if (!canCall) return;
    try {
      const metadata = {
        ...(typeof item?.alphaMin === "number" && Number.isFinite(item.alphaMin) ? { alphaMin: item.alphaMin } : {}),
        ...(typeof item?.alphaMax === "number" && Number.isFinite(item.alphaMax) ? { alphaMax: item.alphaMax } : {}),
      };
      await createInventoryItem(webBreweryApiClient(), {
        category: "hop",
        ingredientId: item.id,
        name: item.name,
        quantity: 0,
        unit: "kg",
        metadata,
      });
      filters.setHopQuery("");
      filters.setHopResults([]);
      await refresh();
    } catch (err) {
      setError(String(err));
    }
  };

  const onSearchHops = (e: FormEvent) => {
    e.preventDefault();
    const q = filters.hopQuery;
    filters.setHopActiveQuery(q);
    void fetchHopsPage(0, q);
  };

  const clearHopsSearch = () => {
    filters.setHopQuery("");
    filters.setHopActiveQuery("");
    filters.setHopResults([]);
    filters.setHopTotal(null);
    filters.setHopPage(0);
    filters.setHopSearched(false);
  };

  return {
    addFromHop,
    onSearchHops,
    clearHopsSearch,
  };
}
