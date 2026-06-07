import { useCallback, type Dispatch, type SetStateAction } from "react";

import { MASH_TEMPLATES, newMashRowId, type EditorMashStep } from "@umbraculum/brewery-beerjson";

export function useNativeWaterMashStepsMutations(params: {
  derivedMashWaterVolumeLiters: number;
  mashRows: EditorMashStep[];
  setMashRows: Dispatch<SetStateAction<EditorMashStep[]>>;
  setMashProcedure: Dispatch<SetStateAction<{ name: string; grainTemperatureC: number } | null>>;
  setMashStepsDirty: Dispatch<SetStateAction<boolean>>;
  setError: (value: string | null) => void;
  t: (key: string) => string;
}) {
  const {
    derivedMashWaterVolumeLiters,
    mashRows,
    setMashRows,
    setMashProcedure,
    setMashStepsDirty,
    setError,
    t,
  } = params;

  const checkMashStepsBudget = useCallback(() => {
    if (derivedMashWaterVolumeLiters > 0) {
      const otherInfusionSum = mashRows
        .slice(1)
        .filter((r) => r.deduceFromMashIn === true)
        .reduce((sum, r) => sum + (r.amountL ?? 0), 0);
      if (otherInfusionSum > derivedMashWaterVolumeLiters) {
        setError(t("mashStepsBudgetExceeded"));
        return false;
      }
    }
    return true;
  }, [derivedMashWaterVolumeLiters, mashRows, setError, t]);

  const addMashStep = () => {
    if (!checkMashStepsBudget()) return;

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
      if (idx < 0) return prev;

      const row = prev[idx];
      if (!row) return prev;
      let nextPatch = { ...patch };

      if (idx > 0 && "deduceFromMashIn" in nextPatch) {
        const checked = nextPatch.deduceFromMashIn === true;
        nextPatch = {
          ...nextPatch,
          deduceFromMashIn: checked,
          ...(checked ? {} : { amountL: 0 }),
        };
      }

      if (idx > 0 && "amountL" in nextPatch) {
        const requested = typeof nextPatch.amountL === "number" && Number.isFinite(nextPatch.amountL) ? nextPatch.amountL : 0;
        if (row.deduceFromMashIn !== true && nextPatch.deduceFromMashIn !== true) {
          nextPatch = { ...nextPatch, amountL: 0 };
        } else {
          const otherSum = prev
            .filter((r, i) => i !== idx && i !== 0)
            .reduce((s, r) => s + (r.deduceFromMashIn === true ? (r.amountL ?? 0) : 0), 0);
          const available = Math.max(0, derivedMashWaterVolumeLiters - otherSum);
          nextPatch = { ...nextPatch, amountL: Math.min(Math.max(0, requested), available) };
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
      const target = next[targetIdx];
      if (!tmp || !target) return prev;
      next[idx] = target;
      next[targetIdx] = tmp;
      return next;
    });
  };

  const addMashFromTemplate = (templateId: string) => {
    const tpl = MASH_TEMPLATES.find((x) => x.id === templateId);
    if (!tpl) return;

    if (!checkMashStepsBudget()) return;

    setMashStepsDirty(true);
    setMashProcedure((prev) => prev ?? { name: "Mash", grainTemperatureC: 20 });
    setMashRows((prev) => [
      ...prev,
      ...tpl.steps.map((s) => ({ ...s, id: newMashRowId(), deduceFromMashIn: false })),
    ]);
  };

  return {
    checkMashStepsBudget,
    addMashStep,
    updateMashStep,
    deleteMashStep,
    moveMashStep,
    addMashFromTemplate,
  };
}
