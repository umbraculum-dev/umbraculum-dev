"use client";

import { useState } from "react";

import {
  patchBrewSessionSteps,
  postBrewSessionStepLog,
} from "@umbraculum/api-client/brewery";

import { webBreweryApiClient } from "../../../../../../../_lib/breweryWaterClient";
import {
  PRESET_SECTION_ORDER,
  type BrewSessionStep,
  computeElapsedSeconds,
  isStepDirtyForLogs,
} from "../_lib/brewSessionDetailUi";
import {
  deriveStepLogStatus,
  moveStepInList,
  parseMinutes,
  parseOffsetMinutes,
  stepsToPatchPayload,
} from "../_lib/brewSessionStepsPatchHelpers";
import type { BrewSessionStepsHookParams } from "../_lib/brewSessionStepsTypes";

export function useBrewSessionStepsPatchMutations(
  params: BrewSessionStepsHookParams & {
    sectionOptions: { value: string; label: string }[];
    setStepActionError: (error: string | null) => void;
  },
) {
  const {
    canCall,
    brewSessionId,
    steps,
    setSteps,
    stepsBaselineById,
    refresh,
    t,
    sectionOptions,
    setStepActionError,
  } = params;

  const [savingSteps, setSavingSteps] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [removeStepWorking, setRemoveStepWorking] = useState<string | null>(null);
  const [removeStepSuccess, setRemoveStepSuccess] = useState<string | null>(null);
  const [customStepName, setCustomStepName] = useState("");
  const [customStepMinutes, setCustomStepMinutes] = useState("");
  const [customStepSectionId, setCustomStepSectionId] = useState<string>("");

  const moveStep = (stepId: string, dir: -1 | 1) => {
    setSteps((prev) => moveStepInList(prev, stepId, dir));
  };

  const onSaveSteps = async () => {
    if (!canCall || !brewSessionId) return;
    setSaveStatus(null);
    setSaveError(null);
    setSavingSteps(true);
    try {
      const dirtyForLogs = steps.filter((s) => isStepDirtyForLogs(s, stepsBaselineById));
      const stepsData = await patchBrewSessionSteps(webBreweryApiClient(), brewSessionId, {
        steps: stepsToPatchPayload(steps),
      });
      setSteps(Array.isArray(stepsData.steps) ? (stepsData.steps as BrewSessionStep[]) : steps);

      for (const st of dirtyForLogs) {
        await postBrewSessionStepLog(webBreweryApiClient(), brewSessionId, st.id, {
          status: deriveStepLogStatus(st),
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

  const onRemoveStep = async (stepId: string) => {
    if (!canCall || !brewSessionId) return;
    setStepActionError(null);
    setRemoveStepSuccess(null);
    setRemoveStepWorking(stepId);
    try {
      const remaining = steps.filter((s) => s.id !== stepId);
      const stepsData = await patchBrewSessionSteps(webBreweryApiClient(), brewSessionId, {
        steps: stepsToPatchPayload(remaining),
      });
      setSteps(Array.isArray(stepsData.steps) ? (stepsData.steps as BrewSessionStep[]) : remaining);
      setRemoveStepSuccess(t("removeStepSuccess"));
    } catch (err) {
      setStepActionError(String(err));
    } finally {
      setRemoveStepWorking(null);
    }
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
      const stepsData = await patchBrewSessionSteps(webBreweryApiClient(), brewSessionId, {
        steps: stepsToPatchPayload(nextSteps),
      });
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

  return {
    savingSteps,
    setSavingSteps,
    saveStatus,
    setSaveStatus,
    saveError,
    setSaveError,
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
    moveStep,
    onSaveSteps,
    onRemoveStep,
    addCustomStep,
    parseMinutes,
    parseOffsetMinutes,
    computeElapsedSeconds: (s: BrewSessionStep) => computeElapsedSeconds(s),
  };
}
