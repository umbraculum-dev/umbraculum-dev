"use client";

import { useMemo, type Dispatch, type SetStateAction } from "react";

import {
  MASH_TEMPLATES,
  newMashRowId,
  type EditorMashStep,
} from "../../../../_lib/beerjsonRecipe";

export function useWaterMashStepsMutations(params: {
  derivedMashWaterVolumeLiters: number;
  mashRows: EditorMashStep[];
  setMashRows: Dispatch<SetStateAction<EditorMashStep[]>>;
  setMashProcedure: Dispatch<SetStateAction<{ name: string; grainTemperatureC: number } | null>>;
  setMashStepsDirty: Dispatch<SetStateAction<boolean>>;
}) {
  const { derivedMashWaterVolumeLiters, mashRows, setMashRows, setMashProcedure, setMashStepsDirty } = params;

  const computeFirstStepAmountL = useMemo(() => {
    const otherInfusionSum = mashRows
      .slice(1)
      .filter((r) => r.deduceFromMashIn === true)
      .reduce((sum, r) => sum + (r.amountL ?? 0), 0);
    return Math.max(0, derivedMashWaterVolumeLiters - otherInfusionSum);
  }, [mashRows, derivedMashWaterVolumeLiters]);

  const addMashStep = () => {
    setMashStepsDirty(true);
    setMashProcedure((prev) => prev ?? { name: "Mash", grainTemperatureC: 20 });
    setMashRows((prev) => [
      ...prev,
      {
        id: newMashRowId(),
        name: "",
        type: "infusion",
        stepTemperatureC: 67,
        stepTimeMin: 60,
        amountL: 0,
        deduceFromMashIn: false,
      },
    ]);
  };

  const updateMashStep = (id: string, patch: Partial<EditorMashStep>) => {
    setMashStepsDirty(true);
    setMashRows((prev) => {
      const idx = prev.findIndex((r) => r.id === id);
      const row = idx >= 0 ? prev[idx] : null;
      if (!row) return prev;

      let nextPatch = patch;

      if ("deduceFromMashIn" in nextPatch && idx > 0) {
        if (nextPatch.deduceFromMashIn !== true) {
          nextPatch = { ...nextPatch, amountL: 0 };
        } else if (row.amountL != null) {
          const otherSum = prev
            .filter((r, i) => i !== idx && i !== 0 && r.deduceFromMashIn === true)
            .reduce((s, r) => s + (r.amountL ?? 0), 0);
          const available = Math.max(0, derivedMashWaterVolumeLiters - otherSum);
          nextPatch = { ...nextPatch, amountL: Math.min(row.amountL, available) };
        }
      }

      if ("amountL" in nextPatch && nextPatch.amountL != null && idx > 0) {
        if ((row.deduceFromMashIn ?? false) !== true) {
          nextPatch = { ...nextPatch, amountL: 0 };
        } else {
          const otherSum = prev
            .filter((r, i) => i !== idx && i !== 0 && r.deduceFromMashIn === true)
            .reduce((s, r) => s + (r.amountL ?? 0), 0);
          const available = Math.max(0, derivedMashWaterVolumeLiters - otherSum);
          nextPatch = { ...nextPatch, amountL: Math.min(nextPatch.amountL, available) };
        }
      }

      return prev.map((r) => (r.id === id ? { ...r, ...nextPatch } : r));
    });
  };

  const deleteMashStep = (id: string) => {
    setMashStepsDirty(true);
    setMashRows((prev) => prev.filter((r) => r.id !== id));
  };

  const moveMashStep = (id: string, direction: "up" | "down") => {
    setMashStepsDirty(true);
    setMashRows((prev) => {
      const idx = prev.findIndex((r) => r.id === id);
      const row = idx >= 0 ? prev[idx] : null;
      if (!row) return prev;

      const isSpargeRow = (r: EditorMashStep) => r.type === "sparge" && r.name.trim().toLowerCase() === "sparge";
      if (idx <= 0 || isSpargeRow(row)) return prev;

      const movable = prev
        .map((r, i) => ({ r, i }))
        .filter(({ r, i }) => i > 0 && !isSpargeRow(r))
        .map(({ i }) => i);
      if (!movable.length) return prev;

      const targetIdx =
        direction === "up"
          ? [...movable].reverse().find((i) => i < idx) ?? null
          : movable.find((i) => i > idx) ?? null;
      if (targetIdx == null) return prev;

      const next = prev.slice();
      const tmp = next[idx];
      next[idx] = next[targetIdx];
      next[targetIdx] = tmp;
      return next;
    });
  };

  const addMashFromTemplate = (templateId: string) => {
    const tpl = MASH_TEMPLATES.find((x) => x.id === templateId);
    if (!tpl) return;
    setMashStepsDirty(true);
    setMashProcedure((prev) => prev ?? { name: "Mash", grainTemperatureC: 20 });
    setMashRows((prev) => [
      ...prev,
      ...tpl.steps.map((s) => ({
        ...s,
        id: newMashRowId(),
        deduceFromMashIn: false,
      })),
    ]);
  };

  const updateMashProcedure = (patch: { name?: string; grainTemperatureC?: number }) => {
    setMashStepsDirty(true);
    setMashProcedure((prev) => {
      const base = prev ?? { name: "Mash", grainTemperatureC: 20 };
      return { ...base, ...patch };
    });
  };

  return {
    computeFirstStepAmountL,
    addMashStep,
    updateMashStep,
    deleteMashStep,
    moveMashStep,
    addMashFromTemplate,
    updateMashProcedure,
  };
}
