"use client";

import { useEffect, useMemo, useRef, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";

import { searchFermentables } from "@umbraculum/brewery-api-client";

import { webBreweryApiClient } from "../../../../_lib/breweryWaterClient";
import { newRowId } from "../_lib/recipeEditHelpers";
import type {
  FermentableSearchResult,
  GristMaltClass,
  GristPotential,
  GristRow,
} from "../_lib/recipeEditTypes";
import type { EditorGristRow } from "../../../_lib/beerjsonRecipe";

export function inferMaltClass(group: string | null | undefined, fermentableName: string): GristMaltClass {
  const g = (group ?? "").toLowerCase();
  const n = fermentableName.toLowerCase();
  if (g.includes("caramel") || g.includes("crystal")) return "crystal";
  if (g.includes("roast") || g.includes("roasted")) return "roast";
  if (n.includes("acid")) return "acid";
  return "base";
}

export function isRoastedLike(row: Pick<GristRow, "group" | "name">) {
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
}

export function inferDehuskedFromName(name: string) {
  const n = (name ?? "").toLowerCase();
  if (!n) return false;
  if (n.includes("dehusked") || n.includes("de-husked")) return true;
  if (n.includes("debittered") || n.includes("de-bittered")) return true;
  if (n.includes("carafa") && n.includes("special")) return true;
  if (n.includes("de bittered") || n.includes("de bitter")) return true;
  return false;
}

export function useRecipeEditFermentablesBulk(params: {
  t: (key: string) => string;
  roundTo: (n: number, d: number) => number;
  gristRows: EditorGristRow[];
  setGristRows: Dispatch<SetStateAction<EditorGristRow[]>>;
}) {
  const { t, roundTo, gristRows, setGristRows } = params;

  const [fermentableQuery, setFermentableQuery] = useState("");
  const [fermentableResults, setFermentableResults] = useState<FermentableSearchResult[]>([]);
  const [fermentableSearching, setFermentableSearching] = useState(false);
  const [fermentableSearchError, setFermentableSearchError] = useState<string | null>(null);
  const [fermentableAddMessage, setFermentableAddMessage] = useState<string | null>(null);
  const fermentableAddMessageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    fermentableQuery,
    setFermentableQuery,
    fermentableResults,
    fermentableSearching,
    fermentableSearchError,
    fermentableAddMessage,
    addFermentableFromDb,
    onSearchFermentables,
    clearFermentableSearchResults,
    gristTotals,
  };
}
