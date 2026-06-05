"use client";

import { useCallback, useState, type FormEvent } from "react";

import { searchHops } from "@umbraculum/api-client/brewery";

import { webBreweryApiClient } from "../../../../_lib/breweryWaterClient";
import { newRowId } from "../_lib/recipeEditHelpers";
import type { HopRow, HopSearchResult } from "../_lib/recipeEditTypes";
import type { EditorHopRow } from "../../../_lib/beerjsonRecipe";

export function useRecipeEditHops(params: { roundTo: (n: number, d: number) => number }) {
  const { roundTo } = params;

  const [hopsRows, setHopsRows] = useState<EditorHopRow[]>([]);
  const [hopQuery, setHopQuery] = useState("");
  const [hopResults, setHopResults] = useState<HopSearchResult[]>([]);
  const [hopSearching, setHopSearching] = useState(false);
  const [hopSearchError, setHopSearchError] = useState<string | null>(null);

  const hydrateHopsRows = useCallback((params: {
    hopsRows: EditorHopRow[];
    linksHops: Record<string, unknown> | null;
    hopFormOverrides: Record<string, unknown> | null;
  }) => {
    const { hopsRows: rows, linksHops, hopFormOverrides } = params;
    const hops = rows.map((row) => {
      const override = hopFormOverrides
        ? hopFormOverrides[row.id] === "debittered_leaf" || hopFormOverrides[row.id] === "hop_extract"
          ? (hopFormOverrides[row.id] as "debittered_leaf" | "hop_extract")
          : null
        : null;
      return {
        ...row,
        ingredientId: linksHops && typeof linksHops[row.id] === "string" ? (linksHops[row.id] as string) : null,
        form: override ?? (row.form ?? "pellet"),
      };
    }) as EditorHopRow[];
    setHopsRows(hops);
  }, []);

  const addHopRow = (row?: Partial<HopRow>) => {
    setHopsRows((prev) => [
      ...prev,
      {
        id: newRowId(),
        ingredientId: null,
        name: "",
        country: null,
        form: "pellet",
        amountGrams: 0,
        alphaAcidPercent: null,
        use: "boil",
        timeMinutes: 60,
        ...row,
      },
    ]);
  };

  const removeHopRow = (id: string) => setHopsRows((prev) => prev.filter((r) => r.id !== id));

  const updateHopRow = (id: string, patch: Partial<HopRow>) =>
    setHopsRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const addHopFromDb = (item: HopSearchResult) => {
    const id = typeof item.id === "string" ? item.id : null;
    const name = typeof item.name === "string" ? item.name : "";
    if (!id || !name) return;
    const country = typeof item.country === "string" ? item.country : null;
    const alphaMin = typeof item.alphaMin === "number" && Number.isFinite(item.alphaMin) ? item.alphaMin : null;
    const alphaMax = typeof item.alphaMax === "number" && Number.isFinite(item.alphaMax) ? item.alphaMax : null;
    const alphaAcidPercent =
      alphaMin !== null && alphaMax !== null ? (alphaMin + alphaMax) / 2 : alphaMin !== null ? alphaMin : alphaMax;
    addHopRow({
      ingredientId: id,
      name,
      country,
      alphaAcidPercent:
        typeof alphaAcidPercent === "number" && Number.isFinite(alphaAcidPercent)
          ? roundTo(alphaAcidPercent, 3)
          : null,
      use: "boil",
      timeMinutes: 60,
      amountGrams: 0,
    });
  };

  const onSearchHops = async (e: FormEvent) => {
    e.preventDefault();
    setHopSearchError(null);
    setHopSearching(true);
    try {
      const data = await searchHops(webBreweryApiClient(), { query: hopQuery });
      setHopResults(data.items as unknown as HopSearchResult[]);
    } catch (err) {
      setHopSearchError(String(err));
      setHopResults([]);
    } finally {
      setHopSearching(false);
    }
  };

  const clearHopSearchResults = () => {
    setHopSearchError(null);
    setHopResults([]);
  };

  return {
    hopsRows,
    setHopsRows,
    hopQuery,
    setHopQuery,
    hopResults,
    hopSearching,
    hopSearchError,
    hydrateHopsRows,
    addHopRow,
    removeHopRow,
    updateHopRow,
    addHopFromDb,
    onSearchHops,
    clearHopSearchResults,
  };
}
