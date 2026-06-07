"use client";

import { createInventoryItem, deleteInventoryItem, patchInventoryItem } from "@umbraculum/brewery-api-client";

import { webBreweryApiClient } from "../../_lib/breweryWaterClient";
import { DEFAULT_UNIT, type InventoryCategory } from "../_lib/inventoryTypes";
import type { InventoryPageFiltersModel } from "./useInventoryPageFilters";

export type UseInventoryPageMutationsParams = {
  canCall: boolean;
  refresh: () => Promise<void>;
  setError: (error: string | null) => void;
  filters: InventoryPageFiltersModel;
  fetchFermentablesPage: (page: number, query: string) => Promise<void>;
  fetchHopsPage: (page: number, query: string) => Promise<void>;
};

export function useInventoryPageMutationsShared({
  canCall,
  refresh,
  setError,
  filters,
}: Pick<UseInventoryPageMutationsParams, "canCall" | "refresh" | "setError" | "filters">) {
  const addCustom = async (category: InventoryCategory) => {
    if (!canCall) return;
    const name = (filters.customName[category] ?? "").trim();
    if (!name) return;
    const qtyStr = filters.customQty[category] ?? "0";
    const qty = parseFloat(qtyStr);
    const unit = category === "acid_salt" ? "ml" : DEFAULT_UNIT[category];
    const metadata = (() => {
      if (category === "fermentable") {
        const producer = filters.customFermentableProducer.trim() || undefined;
        const colorLovibond = Number.isFinite(parseFloat(filters.customFermentableLovibond))
          ? parseFloat(filters.customFermentableLovibond)
          : undefined;
        const yieldPercent = Number.isFinite(parseFloat(filters.customFermentableYieldPercent))
          ? parseFloat(filters.customFermentableYieldPercent)
          : undefined;
        const ppg = Number.isFinite(parseFloat(filters.customFermentablePpg))
          ? parseFloat(filters.customFermentablePpg)
          : undefined;
        const out: Record<string, unknown> = {
          ...(producer ? { producer } : {}),
          ...(colorLovibond !== undefined ? { colorLovibond } : {}),
          ...(yieldPercent !== undefined ? { yieldPercent } : {}),
          ...(ppg !== undefined ? { ppg } : {}),
        };
        return Object.keys(out).length ? out : undefined;
      }
      if (category === "hop") {
        const alphaMin = Number.isFinite(parseFloat(filters.customHopAlphaMin))
          ? parseFloat(filters.customHopAlphaMin)
          : undefined;
        const alphaMax = Number.isFinite(parseFloat(filters.customHopAlphaMax))
          ? parseFloat(filters.customHopAlphaMax)
          : undefined;
        const out: Record<string, unknown> = {
          ...(alphaMin !== undefined ? { alphaMin } : {}),
          ...(alphaMax !== undefined ? { alphaMax } : {}),
        };
        return Object.keys(out).length ? out : undefined;
      }
      return undefined;
    })();
    try {
      await createInventoryItem(webBreweryApiClient(), {
        category,
        name,
        quantity: Number.isFinite(qty) ? qty : 0,
        unit,
        metadata,
      });
      filters.setCustomName((prev) => ({ ...prev, [category]: "" }));
      filters.setCustomQty((prev) => ({ ...prev, [category]: "" }));
      if (category === "fermentable") {
        filters.setCustomFermentableProducer("");
        filters.setCustomFermentableLovibond("");
        filters.setCustomFermentableYieldPercent("");
        filters.setCustomFermentablePpg("");
      }
      if (category === "hop") {
        filters.setCustomHopAlphaMin("");
        filters.setCustomHopAlphaMax("");
      }
      await refresh();
    } catch (err) {
      setError(String(err));
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (!canCall) return;
    try {
      await patchInventoryItem(webBreweryApiClient(), id, { quantity });
      filters.setQtyDraft((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      await refresh();
    } catch (err) {
      setError(String(err));
    }
  };

  const removeItem = async (id: string) => {
    if (!canCall) return;
    try {
      await deleteInventoryItem(webBreweryApiClient(), id);
      await refresh();
    } catch (err) {
      setError(String(err));
    }
  };

  return {
    addCustom,
    updateQuantity,
    removeItem,
  };
}
