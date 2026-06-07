"use client";

import { useCallback, useEffect, useState } from "react";

import { listInventory, searchFermentables, searchHops } from "@umbraculum/brewery-api-client";

import { webBreweryApiClient } from "../../_lib/breweryWaterClient";
import {
  PUBLIC_DB_PAGE_SIZE,
  type FermentableSearchItem,
  type HopSearchItem,
  type InventoryCategory,
  type InventoryItem,
} from "../_lib/inventoryTypes";
import type { InventoryPageFiltersModel } from "./useInventoryPageFilters";

export function useInventoryPageData(canCall: boolean, filters: InventoryPageFiltersModel) {
  const {
    setFermentableSearching,
    setFermentableSearched,
    setFermentableResults,
    setFermentableTotal,
    setFermentablePage,
    setHopSearching,
    setHopSearched,
    setHopResults,
    setHopTotal,
    setHopPage,
  } = filters;

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!canCall) return;
    setError(null);
    setLoading(true);
    try {
      const data = await listInventory(webBreweryApiClient());
      setItems(Array.isArray(data.items) ? (data.items as InventoryItem[]) : []);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [canCall]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const itemsByCategory = (cat: InventoryCategory) => items.filter((i) => i.category === cat);

  const fetchFermentablesPage = useCallback(
    async (page: number, query: string) => {
      if (!canCall) return;
      const safePage = Math.max(0, page);
      const offset = safePage * PUBLIC_DB_PAGE_SIZE;
      setFermentableSearching(true);
      setFermentableSearched(false);
      try {
        const data = await searchFermentables(webBreweryApiClient(), {
          query,
          limit: PUBLIC_DB_PAGE_SIZE,
          offset,
        });
        const items: FermentableSearchItem[] = Array.isArray(data.items)
          ? (data.items as FermentableSearchItem[])
          : [];
        setFermentableResults(items);
        setFermentableTotal(typeof data.total === "number" && Number.isFinite(data.total) ? data.total : null);
        setFermentablePage(safePage);
      } catch {
        setFermentableResults([]);
        setFermentableTotal(0);
        setFermentablePage(0);
      } finally {
        setFermentableSearched(true);
        setFermentableSearching(false);
      }
    },
    [canCall, setFermentablePage, setFermentableResults, setFermentableSearched, setFermentableSearching, setFermentableTotal]
  );

  const fetchHopsPage = useCallback(
    async (page: number, query: string) => {
      if (!canCall) return;
      const safePage = Math.max(0, page);
      const offset = safePage * PUBLIC_DB_PAGE_SIZE;
      setHopSearching(true);
      setHopSearched(false);
      try {
        const data = await searchHops(webBreweryApiClient(), {
          query,
          limit: PUBLIC_DB_PAGE_SIZE,
          offset,
        });
        const items: HopSearchItem[] = Array.isArray(data.items) ? (data.items as HopSearchItem[]) : [];
        setHopResults(items);
        setHopTotal(typeof data.total === "number" && Number.isFinite(data.total) ? data.total : null);
        setHopPage(safePage);
      } catch {
        setHopResults([]);
        setHopTotal(0);
        setHopPage(0);
      } finally {
        setHopSearched(true);
        setHopSearching(false);
      }
    },
    [canCall, setHopPage, setHopResults, setHopSearched, setHopSearching, setHopTotal]
  );

  return {
    items,
    loading,
    error,
    setError,
    refresh,
    itemsByCategory,
    fetchFermentablesPage,
    fetchHopsPage,
  };
}
