"use client";

import { useState } from "react";

import {
  patchBrewSessionStep,
  postBrewSessionStepLog,
  postBrewSessionStepTimerAction,
} from "@umbraculum/api-client/brewery";

import { webBreweryApiClient } from "../../../../../_lib/breweryWaterClient";
import { isStepDirtyForLogs } from "../_lib/brewSessionDetailUi";
import { deriveStepLogStatus } from "../_lib/brewSessionStepsPatchHelpers";
import type { BrewSessionStepsHookParams } from "../_lib/brewSessionStepsTypes";

export function useBrewSessionStepsTimerMutations(params: BrewSessionStepsHookParams) {
  const {
    canCall,
    brewSessionId,
    steps,
    setSteps,
    stepsBaselineById,
    refresh,
    t,
  } = params;

  const [stepActionError, setStepActionError] = useState<string | null>(null);
  const [saveSectionLogsWorkingSectionId, setSaveSectionLogsWorkingSectionId] = useState<string | null>(null);
  const [saveSectionLogsStatus, setSaveSectionLogsStatus] = useState<string | null>(null);

  const onSaveStepLog = async (stepId: string) => {
    if (!canCall || !brewSessionId) return;
    setStepActionError(null);
    setSaveSectionLogsStatus(null);
    try {
      const step = steps.find((s) => s.id === stepId);
      if (!step) return;

      const sectionId = step.sectionId;
      const sectionSteps = steps
        .filter((s) => s.sectionId === sectionId)
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder);
      const dirtySteps = sectionSteps.filter((s) => isStepDirtyForLogs(s, stepsBaselineById));
      const toSave = dirtySteps.length > 0 ? dirtySteps : [step];

      setSaveSectionLogsWorkingSectionId(sectionId);
      for (const st of toSave) {
        await postBrewSessionStepLog(webBreweryApiClient(), brewSessionId, st.id, {
          status: deriveStepLogStatus(st),
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

  return {
    stepActionError,
    setStepActionError,
    saveSectionLogsWorkingSectionId,
    setSaveSectionLogsWorkingSectionId,
    saveSectionLogsStatus,
    setSaveSectionLogsStatus,
    onSaveStepLog,
    onToggleCustomTimerEnabled,
    onStepTimer,
  };
}
