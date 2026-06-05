"use client";

import { useCallback, useEffect, useMemo } from "react";

import {
  PRESET_SECTION_ORDER,
  type BrewSessionStep,
  computeRelativeCountdownSeconds,
  hasPresetStepTimer,
  isStepCompleteForSection,
} from "../_lib/brewSessionDetailUi";
import type { BrewSessionStepsHookParams } from "../_lib/brewSessionStepsTypes";

export function useBrewSessionStepsDerived(params: Pick<BrewSessionStepsHookParams, "steps" | "t" | "tPreset">) {
  const { steps, t, tPreset } = params;

  const getSectionLabel = useCallback(
    (sectionId: string) => {
      if ((PRESET_SECTION_ORDER as readonly string[]).includes(sectionId)) {
        return tPreset(`presetSections.${sectionId}` as Parameters<typeof tPreset>[0]);
      }
      const first = steps.find((s) => s.sectionId === sectionId);
      return first?.sectionName ?? sectionId;
    },
    [steps, tPreset],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, BrewSessionStep[]>();
    for (const st of steps) {
      const list = map.get(st.sectionId) ?? [];
      list.push(st);
      map.set(st.sectionId, list);
    }
    for (const [k, v] of map.entries()) {
      v.sort((a, b) => a.sortOrder - b.sortOrder);
      map.set(k, v);
    }
    const keys = [...map.keys()];
    keys.sort((a, b) => {
      const presetOrder = PRESET_SECTION_ORDER as readonly string[];
      const ia = presetOrder.indexOf(a);
      const ib = presetOrder.indexOf(b);
      if (ia !== -1 || ib !== -1) {
        return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
      }
      return getSectionLabel(a).localeCompare(getSectionLabel(b), undefined, { sensitivity: "base" });
    });
    return keys.map((k) => ({ sectionId: k, steps: map.get(k) ?? [] }));
  }, [steps, getSectionLabel]);

  const allSectionsDone = useMemo(() => {
    if (grouped.length === 0) return false;
    return grouped.every((g) => g.steps.length > 0 && g.steps.every(isStepCompleteForSection));
  }, [grouped]);

  const sectionHasRunningTimer = useMemo(() => {
    const running = new Set<string>();
    for (const st of steps) {
      const hasCustom = st.customTimerEnabled === true && st.timerState === "running";
      const hasPreset = hasPresetStepTimer(st) && st.timerState === "running";
      if (hasCustom || hasPreset) {
        running.add(st.sectionId);
      }
    }
    return (sectionId: string) => running.has(sectionId);
  }, [steps]);

  const sectionOptions = useMemo(() => {
    const opts = [
      ...PRESET_SECTION_ORDER.map((k) => ({
        value: k,
        label: tPreset(`presetSections.${k}` as Parameters<typeof tPreset>[0]),
      })),
    ];
    const custom = new Map<string, string>();
    for (const st of steps) {
      if (!(PRESET_SECTION_ORDER as readonly string[]).includes(st.sectionId) && st.sectionName) {
        custom.set(st.sectionId, st.sectionName);
      }
    }
    for (const [id, name] of [...custom.entries()].sort((a, b) => a[1].localeCompare(b[1]))) {
      opts.push({ value: id, label: name });
    }
    return opts;
  }, [steps, tPreset]);

  const relativeBaseOptions = useMemo(() => {
    const opts = [{ value: "", label: t("relativeToNone") }];
    const candidates = steps
      .filter((s) => s.minutesPlanned != null && s.minutesPlanned > 0)
      .map((s) => ({ id: s.id, label: `${s.name} (${getSectionLabel(s.sectionId)})` }));
    for (const c of candidates) {
      opts.push({ value: c.id, label: c.label });
    }
    return opts;
  }, [steps, t, getSectionLabel]);

  return {
    getSectionLabel,
    grouped,
    allSectionsDone,
    sectionHasRunningTimer,
    sectionOptions,
    relativeBaseOptions,
  };
}

export function useBrewSessionStepsAutoStopTimers(params: {
  canCall: boolean;
  brewSessionId: string;
  steps: BrewSessionStep[];
  grouped: ReturnType<typeof useBrewSessionStepsDerived>["grouped"];
  onStepTimer: (stepId: string, action: "start" | "pause" | "stop") => Promise<void>;
}) {
  const { canCall, brewSessionId, grouped, steps, onStepTimer } = params;

  useEffect(() => {
    if (!canCall || !brewSessionId) return;
    for (const g of grouped) {
      const sectionDone = g.steps.length > 0 && g.steps.every(isStepCompleteForSection);
      if (!sectionDone) continue;
      const anchorStep =
        g.sectionId === "mash"
          ? (g.steps.find((s) => s.name === "Start mash") ?? g.steps[0])
          : g.sectionId === "boil"
            ? (g.steps.find((s) => s.name === "Start boil") ?? g.steps[0])
            : null;
      if (!anchorStep) continue;
      if (anchorStep.timerState === "running" || anchorStep.timerState === "paused") {
        void onStepTimer(anchorStep.id, "stop");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canCall, brewSessionId, grouped, steps]);
}

export function computeRelativeCountdownForStep(step: BrewSessionStep, steps: BrewSessionStep[]) {
  return computeRelativeCountdownSeconds(step, steps);
}
