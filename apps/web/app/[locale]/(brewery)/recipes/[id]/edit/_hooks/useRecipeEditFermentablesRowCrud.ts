"use client";

import { useCallback, useState } from "react";

import { asRecord } from "../../../../../../_shell/_lib/typeGuards";
import { newRowId } from "../_lib/recipeEditHelpers";
import type { GristRow } from "../_lib/recipeEditTypes";
import type { EditorGristRow } from "../../../_lib/beerjsonRecipe";

export function useRecipeEditFermentablesRowCrud() {
  const [gristRows, setGristRows] = useState<EditorGristRow[]>([]);

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

  const removeGristRow = (id: string) => {
    setGristRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updateGristRow = (id: string, patch: Partial<GristRow>) => {
    setGristRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  return {
    gristRows,
    setGristRows,
    hydrateGristRows,
    addGristRow,
    removeGristRow,
    updateGristRow,
  };
}
