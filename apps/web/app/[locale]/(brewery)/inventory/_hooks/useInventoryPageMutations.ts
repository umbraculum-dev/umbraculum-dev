"use client";

import { type FormEvent } from "react";

import { createInventoryItem, deleteInventoryItem, patchInventoryItem } from "@umbraculum/api-client/brewery";

import { webBreweryApiClient } from "../../../../_lib/breweryWaterClient";
import {
  ACID_SALT_OPTIONS,
  DEFAULT_UNIT,
  type FermentableSearchItem,
  type HopSearchItem,
  type InventoryCategory,
} from "../_lib/inventoryTypes";
import type { InventoryPageFiltersModel } from "./useInventoryPageFilters";

type UseInventoryPageMutationsParams = {
  canCall: boolean;
  refresh: () => Promise<void>;
  setError: (error: string | null) => void;
  filters: InventoryPageFiltersModel;
  fetchFermentablesPage: (page: number, query: string) => Promise<void>;
  fetchHopsPage: (page: number, query: string) => Promise<void>;
};

export function useInventoryPageMutations({
  canCall,
  refresh,
  setError,
  filters,
  fetchFermentablesPage,
  fetchHopsPage,
}: UseInventoryPageMutationsParams) {
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
    addCustom,
    addFromFermentable,
    addFromHop,
    addFromAcidSalt,
    updateQuantity,
    removeItem,
    onSearchFermentables,
    clearFermentablesSearch,
    onSearchHops,
    clearHopsSearch,
    onSearchAcidSalts,
    clearAcidSaltsSearch,
  };
}
