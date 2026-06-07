"use client";

import { type FormEvent } from "react";

import { createInventoryItem } from "@umbraculum/brewery-api-client";

import { webBreweryApiClient } from "../../_lib/breweryWaterClient";
import { ACID_SALT_OPTIONS } from "../_lib/inventoryTypes";
import type { UseInventoryPageMutationsParams } from "./useInventoryPageMutationsShared";

export function useInventoryPageMutationsAcidSalt({
  canCall,
  refresh,
  setError,
  filters,
}: Pick<UseInventoryPageMutationsParams, "canCall" | "refresh" | "setError" | "filters">) {
  const addFromAcidSalt = async (opt: (typeof ACID_SALT_OPTIONS)[number]) => {
    if (!canCall) return;
    try {
      await createInventoryItem(webBreweryApiClient(), {
        category: "acid_salt",
        name: opt.label,
        quantity: 0,
        unit: opt.unit,
      });
      await refresh();
    } catch (err) {
      setError(String(err));
    }
  };

  const onSearchAcidSalts = (e: FormEvent) => {
    e.preventDefault();
    const q = filters.acidSaltQuery.trim().toLowerCase();
    const results = q
      ? ACID_SALT_OPTIONS.filter(
          (x) => x.label.toLowerCase().includes(q) || x.value.toLowerCase().includes(q)
        )
      : ACID_SALT_OPTIONS;
    filters.setAcidSaltResults(results);
    filters.setAcidSaltSearched(true);
  };

  const clearAcidSaltsSearch = () => {
    filters.setAcidSaltQuery("");
    filters.setAcidSaltResults([]);
    filters.setAcidSaltSearched(false);
  };

  return {
    addFromAcidSalt,
    onSearchAcidSalts,
    clearAcidSaltsSearch,
  };
}
