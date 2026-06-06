"use client";

import { isStepDirtyForLogs, type BrewSessionStep } from "../_lib/brewSessionDetailUi";
import type { BrewSessionStepsHookParams } from "../_lib/brewSessionStepsTypes";
import {
  computeRelativeCountdownForStep,
  useBrewSessionStepsAutoStopTimers,
  useBrewSessionStepsDerived,
} from "./useBrewSessionStepsLoad";
import { useBrewSessionStepsMutations } from "./useBrewSessionStepsMutations";

export function useBrewSessionSteps(params: BrewSessionStepsHookParams) {
  const derived = useBrewSessionStepsDerived(params);
  const mutations = useBrewSessionStepsMutations({ ...params, sectionOptions: derived.sectionOptions });

  useBrewSessionStepsAutoStopTimers({
    canCall: params.canCall,
    brewSessionId: params.brewSessionId,
    steps: params.steps,
    grouped: derived.grouped,
    onStepTimer: mutations.onStepTimer,
  });

  return {
    ...mutations,
    getSectionLabel: derived.getSectionLabel,
    grouped: derived.grouped,
    allSectionsDone: derived.allSectionsDone,
    sectionHasRunningTimer: derived.sectionHasRunningTimer,
    sectionOptions: derived.sectionOptions,
    relativeBaseOptions: derived.relativeBaseOptions,
    isStepDirtyForLogs: (s: BrewSessionStep) => isStepDirtyForLogs(s, params.stepsBaselineById),
    computeRelativeCountdownSeconds: (step: BrewSessionStep) =>
      computeRelativeCountdownForStep(step, params.steps),
  };
}
