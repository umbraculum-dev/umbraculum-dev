"use client";

import { useMemo, useState } from "react";

import { parseGristJson } from "../../../../_lib/grist";
import { newRowId } from "../_lib/recipeEditHelpers";
import type { EditorGristRow, EditorMiscRow } from "../../../_lib/beerjsonRecipe";
import type { MiscRow } from "../_lib/recipeEditTypes";

export function useRecipeEditMisc(params: {
  gristRows: EditorGristRow[];
  waterSettings: { mashGristImportedJson?: unknown } | null | undefined;
}) {
  const { gristRows, waterSettings } = params;
  const [miscRows, setMiscRows] = useState<EditorMiscRow[]>([]);

  const addMiscRow = () => {
    setMiscRows((prev) => [
      ...prev,
      {
        id: newRowId(),
        ingredientId: null,
        name: "",
        type: "other",
        use: "boil",
        timeMinutes: 10,
        amount: 0,
        amountIsWeight: true,
        useFor: null,
        notes: null,
      },
    ]);
  };

  const removeMiscRow = (id: string) => setMiscRows((prev) => prev.filter((r) => r.id !== id));
  const updateMiscRow = (id: string, patch: Partial<MiscRow>) =>
    setMiscRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const gristWaterConsistency = useMemo(() => {
    const recipeMashTotalKg = gristRows
      .filter((r) => (r.timingUse ?? "add_to_mash") === "add_to_mash")
      .reduce((acc, r) => acc + (Number.isFinite(r.amountKg) ? r.amountKg : 0), 0);
    const mashRows =
      waterSettings?.mashGristImportedJson != null
        ? parseGristJson(waterSettings.mashGristImportedJson)
        : [];
    const mashGristTotalKg = mashRows.reduce(
      (acc, r) => acc + (Number.isFinite(r.amountKg) ? r.amountKg : 0),
      0,
    );
    if (waterSettings == null) return { status: "na" as const, diffPct: null };
    const mashJsonEmpty =
      !Array.isArray(waterSettings.mashGristImportedJson) ||
      waterSettings.mashGristImportedJson.length === 0;
    if (mashJsonEmpty && recipeMashTotalKg > 0) return { status: "error" as const, diffPct: 100 };
    if (recipeMashTotalKg === 0 && mashGristTotalKg === 0) return { status: "passed" as const, diffPct: 0 };
    const denom = Math.max(recipeMashTotalKg, mashGristTotalKg, 0.0001);
    const diffPct = (Math.abs(recipeMashTotalKg - mashGristTotalKg) / denom) * 100;
    const status = diffPct <= 0.1 ? ("passed" as const) : ("error" as const);
    return { status, diffPct };
  }, [gristRows, waterSettings]);

  return {
    miscRows,
    setMiscRows,
    addMiscRow,
    removeMiscRow,
    updateMiscRow,
    gristWaterConsistency,
  };
}
