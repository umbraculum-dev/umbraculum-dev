"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";

import { searchFermentables } from "@umbraculum/api-client/brewery";

import { webBreweryApiClient } from "../../../../_lib/breweryWaterClient";
import { asRecord } from "../../../../_lib/typeGuards";
import { newRowId } from "../_lib/recipeEditHelpers";
import type {
  FermentableSearchResult,
  GristMaltClass,
  GristPotential,
  GristRow,
} from "../_lib/recipeEditTypes";
import type { EditorGristRow } from "../../../_lib/beerjsonRecipe";

export function useRecipeEditFermentables(params: { t: (key: string) => string; roundTo: (n: number, d: number) => number }) {
  const { t, roundTo } = params;

  const [gristRows, setGristRows] = useState<EditorGristRow[]>([]);
  const [fermentableQuery, setFermentableQuery] = useState("");
  const [fermentableResults, setFermentableResults] = useState<FermentableSearchResult[]>([]);
  const [fermentableSearching, setFermentableSearching] = useState(false);
  const [fermentableSearchError, setFermentableSearchError] = useState<string | null>(null);
  const [fermentableAddMessage, setFermentableAddMessage] = useState<string | null>(null);
  const fermentableAddMessageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const inferMaltClass = (group: string | null | undefined, fermentableName: string): GristMaltClass => {
    const g = (group ?? "").toLowerCase();
    const n = fermentableName.toLowerCase();
    if (g.includes("caramel") || g.includes("crystal")) return "crystal";
    if (g.includes("roast") || g.includes("roasted")) return "roast";
    if (n.includes("acid")) return "acid";
    return "base";
  };

  const isRoastedLike = (row: Pick<GristRow, "group" | "name">) => {
    const g = (row.group ?? "").toLowerCase();
    const n = (row.name ?? "").toLowerCase();
    return (
      g.includes("roast") ||
      g.includes("roasted") ||
      g.includes("black") ||
      g.includes("chocolate") ||
      n.includes("roast") ||
      n.includes("black malt") ||
      n.includes("chocolate") ||
      n.includes("carafa") ||
      n.includes("patent") ||
      n.includes("brown malt")
    );
  };

  const inferDehuskedFromName = (name: string) => {
    const n = (name ?? "").toLowerCase();
    if (!n) return false;
    if (n.includes("dehusked") || n.includes("de-husked")) return true;
    if (n.includes("debittered") || n.includes("de-bittered")) return true;
    if (n.includes("carafa") && n.includes("special")) return true;
    if (n.includes("de bittered") || n.includes("de bitter")) return true;
    return false;
  };

  const hydrateGristRows = useCallback((params: {
    gristRows: EditorGristRow[];
    linksGrist: Record<string, unknown> | null;
    mashPhModel: Record<string, unknown> | null;
  }) => {
    const { gristRows: rows, linksGrist, mashPhModel } = params;
    const grist = rows.map((row) => {
      const ingredientId =
        linksGrist && typeof linksGrist[row.id] === "string" ? (linksGrist[row.id] as string) : null;
      const m = row.id && mashPhModel ? asRecord(mashPhModel[row.id]) : null;
      return {
        ...row,
        ingredientId,
        mashDiPh: typeof m?.["mashDiPh"] === "number" ? m["mashDiPh"] : row.mashDiPh ?? null,
        mashTaToPh57_mEqPerKg:
          typeof m?.["mashTaToPh57_mEqPerKg"] === "number"
            ? m["mashTaToPh57_mEqPerKg"]
            : row.mashTaToPh57_mEqPerKg ?? null,
        mashRoastDehuskedOverride:
          m && "roastDehuskedOverride" in m
            ? (m["roastDehuskedOverride"] as boolean | null)
            : row.mashRoastDehuskedOverride ?? null,
      };
    });
    setGristRows(grist);
  }, []);

  const addGristRow = () => {
    setGristRows((prev) => [
      ...prev,
      {
        id: newRowId(),
        ingredientId: null,
        name: "",
        producer: null,
        group: null,
        mashDiPh: null,
        mashTaToPh57_mEqPerKg: null,
        mashRoastDehuskedOverride: null,
        mashRoastDehuskedSource: "unknown",
        mashPhModelSource: "unknown",
        amountKg: 0,
        colorLovibond: null,
        potential: null,
        maltClass: "base",
        timingUse: "add_to_mash",
        lateAddition: false,
      },
    ]);
  };

  const addFermentableFromDb = (item: FermentableSearchResult) => {
    const id = typeof item.id === "string" ? item.id : null;
    const itemName = typeof item.name === "string" ? item.name : "";
    if (!id || !itemName) return;
    const producer = typeof item.producer === "string" ? item.producer : null;
    const group = typeof item.group === "string" ? item.group : null;
    const mashDiPh = typeof item.mashDiPh === "number" && Number.isFinite(item.mashDiPh) ? item.mashDiPh : null;
    const mashTaToPh57_mEqPerKg =
      typeof item.mashTaToPh57_mEqPerKg === "number" && Number.isFinite(item.mashTaToPh57_mEqPerKg)
        ? item.mashTaToPh57_mEqPerKg
        : null;
    const mashPhModelSource =
      mashDiPh !== null || mashTaToPh57_mEqPerKg !== null ? ("default" as const) : ("unknown" as const);
    const name = itemName;
    const colorLovibond =
      typeof item.colorLovibond === "number" && Number.isFinite(item.colorLovibond)
        ? roundTo(item.colorLovibond, 3)
        : null;
    const ppg = typeof item.ppg === "number" && Number.isFinite(item.ppg) ? roundTo(item.ppg, 3) : null;
    const yieldPercent =
      typeof item.yieldPercent === "number" && Number.isFinite(item.yieldPercent)
        ? roundTo(item.yieldPercent, 3)
        : null;

    const potential: GristPotential =
      ppg !== null ? { kind: "ppg", value: ppg } : yieldPercent !== null ? { kind: "yieldPercent", value: yieldPercent } : null;
    const maltClass = inferMaltClass(typeof item.group === "string" ? item.group : null, itemName);

    setGristRows((prev) => [
      ...prev,
      {
        id: newRowId(),
        ingredientId: id,
        name,
        producer,
        group,
        mashDiPh,
        mashTaToPh57_mEqPerKg,
        mashRoastDehuskedOverride: null,
        mashRoastDehuskedSource: "unknown",
        mashPhModelSource,
        amountKg: 0,
        colorLovibond,
        potential,
        maltClass,
        timingUse: "add_to_mash",
        lateAddition: false,
      },
    ]);
    const msg = t("fermentableAddedSaveHint");
    setFermentableAddMessage(msg);
    if (fermentableAddMessageTimeoutRef.current) {
      clearTimeout(fermentableAddMessageTimeoutRef.current);
    }
    fermentableAddMessageTimeoutRef.current = setTimeout(() => {
      setFermentableAddMessage(null);
      fermentableAddMessageTimeoutRef.current = null;
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (fermentableAddMessageTimeoutRef.current) {
        clearTimeout(fermentableAddMessageTimeoutRef.current);
      }
    };
  }, []);

  const removeGristRow = (id: string) => {
    setGristRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updateGristRow = (id: string, patch: Partial<GristRow>) => {
    setGristRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const onSearchFermentables = async (e: FormEvent) => {
    e.preventDefault();
    setFermentableSearchError(null);
    setFermentableSearching(true);
    try {
      const data = await searchFermentables(webBreweryApiClient(), { query: fermentableQuery });
      setFermentableResults(data.items as unknown as FermentableSearchResult[]);
    } catch (err) {
      setFermentableSearchError(String(err));
      setFermentableResults([]);
    } finally {
      setFermentableSearching(false);
    }
  };

  const clearFermentableSearchResults = () => {
    setFermentableSearchError(null);
    setFermentableResults([]);
  };

  const gristTotals = useMemo(() => {
    const totalKg = gristRows.reduce((acc, r) => acc + (Number.isFinite(r.amountKg) ? r.amountKg : 0), 0);
    let colorSum = 0;
    let colorWeight = 0;
    for (const r of gristRows) {
      if (r.colorLovibond === null) continue;
      const w = Number.isFinite(r.amountKg) ? r.amountKg : 0;
      if (w <= 0) continue;
      colorSum += w * r.colorLovibond;
      colorWeight += w;
    }
    const weightedAvgLovibond = colorWeight > 0 ? colorSum / colorWeight : null;
    return { totalKg, weightedAvgLovibond };
  }, [gristRows]);

  return {
    gristRows,
    setGristRows,
    fermentableQuery,
    setFermentableQuery,
    fermentableResults,
    fermentableSearching,
    fermentableSearchError,
    fermentableAddMessage,
    addGristRow,
    addFermentableFromDb,
    removeGristRow,
    updateGristRow,
    onSearchFermentables,
    clearFermentableSearchResults,
    hydrateGristRows,
    inferMaltClass,
    isRoastedLike,
    inferDehuskedFromName,
    gristTotals,
  };
}
