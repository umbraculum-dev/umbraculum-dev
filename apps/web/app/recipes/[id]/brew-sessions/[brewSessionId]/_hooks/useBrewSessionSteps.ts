"use client";

import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";

import {
  patchBrewSessionStep,
  patchBrewSessionSteps,
  postBrewSessionStepLog,
  postBrewSessionStepTimerAction,
} from "@umbraculum/api-client/brewery";

import { webBreweryApiClient } from "../../../../../_lib/breweryWaterClient";
import {
  PRESET_SECTION_ORDER,
  type BrewSessionStep,
  type BrewSessionStepBaseline,
  computeElapsedSeconds,
  computeRelativeCountdownSeconds,
  hasPresetStepTimer,
  isStepCompleteForSection,
  isStepDirtyForLogs,
} from "../_lib/brewSessionDetailUi";

export function useBrewSessionSteps(params: {
  canCall: boolean;
  brewSessionId: string;
  steps: BrewSessionStep[];
  setSteps: Dispatch<SetStateAction<BrewSessionStep[]>>;
  stepsBaselineById: Record<string, BrewSessionStepBaseline>;
  refresh: () => Promise<void>;
  t: (key: string) => string;
  tPreset: (key: string) => string;
}) {
  const { canCall, brewSessionId, steps, setSteps, stepsBaselineById, refresh, t, tPreset } = params;

  const [savingSteps, setSavingSteps] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [stepActionError, setStepActionError] = useState<string | null>(null);
  const [saveSectionLogsWorkingSectionId, setSaveSectionLogsWorkingSectionId] = useState<string | null>(null);
  const [saveSectionLogsStatus, setSaveSectionLogsStatus] = useState<string | null>(null);
  const [removeStepWorking, setRemoveStepWorking] = useState<string | null>(null);
  const [removeStepSuccess, setRemoveStepSuccess] = useState<string | null>(null);
  const [customStepName, setCustomStepName] = useState("");
  const [customStepMinutes, setCustomStepMinutes] = useState("");
  const [customStepSectionId, setCustomStepSectionId] = useState<string>("");

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

  const moveStep = (stepId: string, dir: -1 | 1) => {
    setSteps((prev) => {
      const idx = prev.findIndex((s) => s.id === stepId);
      if (idx < 0) return prev;
      const nextIdx = idx + dir;
      if (nextIdx < 0 || nextIdx >= prev.length) return prev;
      const next = [...prev];
      const a = next[idx];
      const b = next[nextIdx];
      next[idx] = b;
      next[nextIdx] = a;
      return next.map((s, i) => ({ ...s, sortOrder: i }));
    });
  };

  const onSaveSteps = async () => {
    if (!canCall || !brewSessionId) return;
    setSaveStatus(null);
    setSaveError(null);
    setSavingSteps(true);
    try {
      const dirtyForLogs = steps.filter((s) => isStepDirtyForLogs(s, stepsBaselineById));

      const payload = steps.map((s) => ({
        id: s.id,
        sectionId: s.sectionId,
        sectionName: s.sectionName,
        name: s.name,
        isDisabled: s.isDisabled,
        minutesPlanned: s.minutesPlanned,
        relativeToStepId: s.relativeToStepId,
        offsetMinutesFromEnd: s.offsetMinutesFromEnd,
        customTimerEnabled: s.customTimerEnabled ?? false,
      }));
      const stepsData = await patchBrewSessionSteps(webBreweryApiClient(), brewSessionId, { steps: payload });
      setSteps(Array.isArray(stepsData.steps) ? (stepsData.steps as BrewSessionStep[]) : steps);

      for (const st of dirtyForLogs) {
        const derivedStatus = st.isDisabled ? "skipped" : (st.status ?? "pending");
        await postBrewSessionStepLog(webBreweryApiClient(), brewSessionId, st.id, {
          status: derivedStatus,
          note: st.note ?? null,
          name: st.name,
          isDisabled: st.isDisabled,
        });
      }

      await refresh();
      setSaveStatus(t("saveSuccess"));
    } catch (err) {
      setSaveError(String(err));
    } finally {
      setSavingSteps(false);
    }
  };

  const onSaveStepLog = async (stepId: string) => {
    if (!canCall || !brewSessionId) return;
    setStepActionError(null);
    setSaveSectionLogsStatus(null);
    try {
      const step = steps.find((s) => s.id === stepId);
      if (!step) return;

      const sectionId = step.sectionId;
      const sectionSteps = steps.filter((s) => s.sectionId === sectionId).slice().sort((a, b) => a.sortOrder - b.sortOrder);
      const dirtySteps = sectionSteps.filter((s) => isStepDirtyForLogs(s, stepsBaselineById));
      const toSave = dirtySteps.length > 0 ? dirtySteps : [step];

      setSaveSectionLogsWorkingSectionId(sectionId);
      for (const st of toSave) {
        const derivedStatus = st.isDisabled ? "skipped" : (st.status ?? "pending");
        await postBrewSessionStepLog(webBreweryApiClient(), brewSessionId, st.id, {
          status: derivedStatus,
          note: st.note ?? null,
          name: st.name,
          isDisabled: st.isDisabled,
        });
      }

      await refresh();
      setSaveSectionLogsStatus(t("saveSuccess"));
    } catch (err) {
      setStepActionError(String(err));
    } finally {
      setSaveSectionLogsWorkingSectionId(null);
    }
  };

  const onToggleCustomTimerEnabled = async (stepId: string, enabled: boolean) => {
    setStepActionError(null);
    setSteps((prev) => prev.map((s) => (s.id === stepId ? { ...s, customTimerEnabled: enabled } : s)));
    if (!canCall || !brewSessionId) return;
    try {
      const data = await patchBrewSessionStep(webBreweryApiClient(), brewSessionId, stepId, {
        customTimerEnabled: enabled,
      });
      const updated = data.step;
      if (updated) {
        setSteps((prev) => prev.map((s) => (s.id === stepId ? { ...s, ...updated } : s)));
      }
    } catch (err) {
      setStepActionError(String(err));
      setSteps((prev) => prev.map((s) => (s.id === stepId ? { ...s, customTimerEnabled: !enabled } : s)));
    }
  };

  const onRemoveStep = async (stepId: string) => {
    if (!canCall || !brewSessionId) return;
    setStepActionError(null);
    setRemoveStepSuccess(null);
    setRemoveStepWorking(stepId);
    try {
      const remaining = steps.filter((s) => s.id !== stepId);
      const payload = remaining.map((s) => ({
        id: s.id,
        sectionId: s.sectionId,
        sectionName: s.sectionName,
        name: s.name,
        isDisabled: s.isDisabled,
        minutesPlanned: s.minutesPlanned,
        relativeToStepId: s.relativeToStepId,
        offsetMinutesFromEnd: s.offsetMinutesFromEnd,
        customTimerEnabled: s.customTimerEnabled ?? false,
      }));
      const stepsData = await patchBrewSessionSteps(webBreweryApiClient(), brewSessionId, { steps: payload });
      setSteps(Array.isArray(stepsData.steps) ? (stepsData.steps as BrewSessionStep[]) : remaining);
      setRemoveStepSuccess(t("removeStepSuccess"));
    } catch (err) {
      setStepActionError(String(err));
    } finally {
      setRemoveStepWorking(null);
    }
  };

  const onStepTimer = async (stepId: string, action: "start" | "pause" | "stop") => {
    if (!canCall || !brewSessionId) return;
    setStepActionError(null);
    try {
      const data = await postBrewSessionStepTimerAction(webBreweryApiClient(), brewSessionId, stepId, action);
      const updated = data.step;
      if (updated) {
        setSteps((prev) => prev.map((s) => (s.id === stepId ? { ...s, ...updated } : s)));
      }
      await refresh();
    } catch (err) {
      setStepActionError(String(err));
    }
  };

  const parseMinutes = (val: string): number | null => {
    const n = parseInt(val, 10);
    if (Number.isNaN(n) || n < 0) return null;
    return n;
  };

  const parseOffsetMinutes = (val: string): number | null => {
    const trimmed = val.trim();
    if (!trimmed) return null;
    const n = parseInt(trimmed, 10);
    if (Number.isNaN(n)) return null;
    return n;
  };

  const addCustomStep = async () => {
    const name = customStepName.trim();
    if (!name) return;
    const sectionId = customStepSectionId || PRESET_SECTION_ORDER[0];
    const minutes = parseMinutes(customStepMinutes);
    const sectionName = (PRESET_SECTION_ORDER as readonly string[]).includes(sectionId)
      ? null
      : (sectionOptions.find((o) => o.value === sectionId)?.label ?? null);
    const nextLocal: BrewSessionStep = {
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
      sectionId,
      sectionName,
      name,
      isDisabled: false,
      sortOrder: steps.length,
      minutesPlanned: minutes,
      relativeToStepId: null,
      offsetMinutesFromEnd: null,
      status: "pending",
      note: null,
      timerState: "idle",
      timerStartedAt: null,
      timerLastStartedAt: null,
      timerPausedAt: null,
      timerStoppedAt: null,
      timerAccumulatedSeconds: 0,
      customTimerEnabled: false,
    };
    const nextSteps = [...steps, nextLocal].map((s, idx) => ({ ...s, sortOrder: idx }));
    setSteps(nextSteps);
    setCustomStepName("");
    setCustomStepMinutes("");
    setCustomStepSectionId("");

    if (!canCall || !brewSessionId) return;
    setSaveStatus(null);
    setSaveError(null);
    setSavingSteps(true);
    try {
      const payload = nextSteps.map((s) => ({
        id: s.id,
        sectionId: s.sectionId,
        sectionName: s.sectionName,
        name: s.name,
        isDisabled: s.isDisabled,
        minutesPlanned: s.minutesPlanned,
        relativeToStepId: s.relativeToStepId,
        offsetMinutesFromEnd: s.offsetMinutesFromEnd,
        customTimerEnabled: s.customTimerEnabled ?? false,
      }));
      const stepsData = await patchBrewSessionSteps(webBreweryApiClient(), brewSessionId, { steps: payload });
      if (Array.isArray(stepsData.steps)) {
        setSteps(stepsData.steps as BrewSessionStep[]);
      }
      await refresh();
    } catch (err) {
      setSaveError(String(err));
    } finally {
      setSavingSteps(false);
    }
  };

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

  return {
    savingSteps,
    setSavingSteps,
    saveStatus,
    setSaveStatus,
    saveError,
    setSaveError,
    stepActionError,
    setStepActionError,
    saveSectionLogsWorkingSectionId,
    setSaveSectionLogsWorkingSectionId,
    saveSectionLogsStatus,
    setSaveSectionLogsStatus,
    removeStepWorking,
    setRemoveStepWorking,
    removeStepSuccess,
    setRemoveStepSuccess,
    customStepName,
    setCustomStepName,
    customStepMinutes,
    setCustomStepMinutes,
    customStepSectionId,
    setCustomStepSectionId,
    getSectionLabel,
    grouped,
    allSectionsDone,
    sectionHasRunningTimer,
    sectionOptions,
    moveStep,
    isStepDirtyForLogs: (s: BrewSessionStep) => isStepDirtyForLogs(s, stepsBaselineById),
    onSaveSteps,
    onSaveStepLog,
    onToggleCustomTimerEnabled,
    onRemoveStep,
    onStepTimer,
    parseMinutes,
    parseOffsetMinutes,
    addCustomStep,
    computeElapsedSeconds: (s: BrewSessionStep) => computeElapsedSeconds(s),
    relativeBaseOptions,
    computeRelativeCountdownSeconds: (step: BrewSessionStep) => computeRelativeCountdownSeconds(step, steps),
  };
}
