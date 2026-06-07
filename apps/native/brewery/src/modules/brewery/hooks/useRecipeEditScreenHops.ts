import { useCallback, useState } from "react";

import { searchHops as apiSearchHops } from "@umbraculum/api-client/brewery";
import type { EditorHopRow } from "@umbraculum/brewery-beerjson";

import { newRowId } from "../lib/recipeEditHelpers";
import type { HopSearchItem } from "../lib/recipeEditTypes";

export function useRecipeEditScreenHops(params: { api: ReturnType<() => unknown> | null }) {
  const { api } = params;

  const [hopsRows, setHopsRows] = useState<EditorHopRow[]>([]);
  const [hopQuery, setHopQuery] = useState("");
  const [hopResults, setHopResults] = useState<HopSearchItem[]>([]);
  const [hopSearching, setHopSearching] = useState(false);
  const [hopSearchError, setHopSearchError] = useState<string | null>(null);
  const [openHopIds, setOpenHopIds] = useState<string[]>([]);

  const searchHops = useCallback(async () => {
    if (!api) return;
    setHopSearching(true);
    setHopSearchError(null);
    try {
      const parsed = await apiSearchHops(
        api as Parameters<typeof apiSearchHops>[0],
        hopQuery.trim() ? { query: hopQuery.trim(), limit: 20 } : { limit: 20 },
      );
      const items = parsed.items;
      setHopResults(Array.isArray(items) ? (items as HopSearchItem[]) : []);
    } catch (err) {
      setHopSearchError(String(err));
      setHopResults([]);
    } finally {
      setHopSearching(false);
    }
  }, [api, hopQuery]);

  const addHopRow = useCallback(() => {
    setHopsRows((prev) => [
      ...prev,
      {
        id: newRowId(),
        ingredientId: null,
        name: "",
        amountGrams: 0,
        alphaAcidPercent: null,
        use: "boil",
        timeMinutes: 60,
        form: "pellet",
      },
    ]);
  }, []);

  const addHopFromDb = useCallback((item: HopSearchItem) => {
    const alpha = typeof item.alphaMin === "number" && Number.isFinite(item.alphaMin)
      ? item.alphaMin
      : typeof item.alphaMax === "number" && Number.isFinite(item.alphaMax)
        ? item.alphaMax
        : null;
    setHopsRows((prev) => [
      ...prev,
      {
        id: newRowId(),
        ingredientId: item.id,
        name: item.name,
        country: item.country ?? null,
        amountGrams: 0,
        alphaAcidPercent: alpha,
        use: "boil",
        timeMinutes: 60,
        form: "pellet",
      },
    ]);
  }, []);

  const updateHopRow = useCallback((id: string, patch: Partial<EditorHopRow>) => {
    setHopsRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const removeHopRow = useCallback((id: string) => {
    setHopsRows((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return {
    hopsRows,
    setHopsRows,
    hopQuery,
    setHopQuery,
    hopResults,
    setHopResults,
    hopSearching,
    hopSearchError,
    searchHops,
    addHopRow,
    addHopFromDb,
    updateHopRow,
    removeHopRow,
    openHopIds,
    setOpenHopIds,
  };
}
