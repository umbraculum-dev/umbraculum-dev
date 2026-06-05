import { useCallback, useMemo, useState } from "react";

import { searchFermentables as apiSearchFermentables } from "@umbraculum/api-client/brewery";
import type { EditorGristRow } from "@umbraculum/brewery-beerjson";

import { newRowId, inferMaltClass } from "../lib/recipeEditHelpers";
import type { FermentableSearchItem } from "../lib/recipeEditTypes";

export function useRecipeEditScreenFermentables(params: { api: ReturnType<() => unknown> | null }) {
  const { api } = params;

  const [gristRows, setGristRows] = useState<EditorGristRow[]>([]);
  const [fermentableQuery, setFermentableQuery] = useState("");
  const [fermentableResults, setFermentableResults] = useState<FermentableSearchItem[]>([]);
  const [fermentableSearching, setFermentableSearching] = useState(false);
  const [fermentableSearchError, setFermentableSearchError] = useState<string | null>(null);
  const [openFermentableIds, setOpenFermentableIds] = useState<string[]>([]);

  const searchFermentables = useCallback(async () => {
    if (!api) return;
    setFermentableSearching(true);
    setFermentableSearchError(null);
    try {
      const parsed = await apiSearchFermentables(
        api as Parameters<typeof apiSearchFermentables>[0],
        fermentableQuery.trim() ? { query: fermentableQuery.trim(), limit: 20 } : { limit: 20 },
      );
      const items = parsed.items;
      setFermentableResults(Array.isArray(items) ? (items as FermentableSearchItem[]) : []);
    } catch (err) {
      setFermentableSearchError(String(err));
      setFermentableResults([]);
    } finally {
      setFermentableSearching(false);
    }
  }, [api, fermentableQuery]);

  const addGristRow = useCallback(() => {
    setGristRows((prev) => [
      ...prev,
      {
        id: newRowId(),
        name: "",
        amountKg: 0,
        colorLovibond: null,
        potential: null,
        maltClass: "base",
        timingUse: "add_to_mash",
        lateAddition: false,
      },
    ]);
  }, []);

  const addFermentableFromDb = useCallback((item: FermentableSearchItem) => {
    const yieldPct = typeof item.yieldPercent === "number" && Number.isFinite(item.yieldPercent) ? item.yieldPercent : null;
    const ppg = typeof item.ppg === "number" && Number.isFinite(item.ppg) ? item.ppg : null;
    const potential = yieldPct != null ? { kind: "yieldPercent" as const, value: yieldPct } : ppg != null ? { kind: "ppg" as const, value: ppg } : null;
    const group = typeof item.group === "string" ? item.group : null;
    const maltClass = inferMaltClass(group, item.name);
    setGristRows((prev) => [
      ...prev,
      {
        id: newRowId(),
        ingredientId: item.id,
        name: item.name,
        producer: item.producer ?? null,
        group,
        amountKg: 0,
        colorLovibond: typeof item.colorLovibond === "number" ? item.colorLovibond : null,
        potential,
        maltClass,
        timingUse: "add_to_mash",
        lateAddition: false,
      },
    ]);
  }, []);

  const updateGristRow = useCallback((id: string, patch: Partial<EditorGristRow>) => {
    setGristRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const removeGristRow = useCallback((id: string) => {
    setGristRows((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const gristTotals = useMemo(() => {
    const totalKg = gristRows.reduce((sum, r) => sum + (typeof r.amountKg === "number" && Number.isFinite(r.amountKg) ? r.amountKg : 0), 0);
    let weightedSum = 0;
    let weightSum = 0;
    for (const r of gristRows) {
      const kg = typeof r.amountKg === "number" && Number.isFinite(r.amountKg) ? r.amountKg : 0;
      const lov = typeof r.colorLovibond === "number" && Number.isFinite(r.colorLovibond) ? r.colorLovibond : null;
      if (kg > 0 && lov != null) {
        weightedSum += kg * lov;
        weightSum += kg;
      }
    }
    const weightedAvgLovibond = weightSum > 0 ? weightedSum / weightSum : null;
    return { totalKg, weightedAvgLovibond };
  }, [gristRows]);

  return {
    gristRows,
    setGristRows,
    fermentableQuery,
    setFermentableQuery,
    fermentableResults,
    setFermentableResults,
    fermentableSearching,
    fermentableSearchError,
    searchFermentables,
    addGristRow,
    addFermentableFromDb,
    updateGristRow,
    removeGristRow,
    gristTotals,
    openFermentableIds,
    setOpenFermentableIds,
  };
}
