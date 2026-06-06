import type { Dispatch, SetStateAction } from "react";

import type { BrewSessionStep, BrewSessionStepBaseline } from "../_lib/brewSessionDetailUi";

export type BrewSessionStepsHookParams = {
  canCall: boolean;
  brewSessionId: string;
  steps: BrewSessionStep[];
  setSteps: Dispatch<SetStateAction<BrewSessionStep[]>>;
  stepsBaselineById: Record<string, BrewSessionStepBaseline>;
  refresh: () => Promise<void>;
  t: (key: string) => string;
  tPreset: (key: string) => string;
};

export type StepPatchPayload = {
  id: string;
  sectionId: string;
  sectionName: string | null;
  name: string;
  isDisabled: boolean;
  minutesPlanned: number | null;
  relativeToStepId: string | null;
  offsetMinutesFromEnd: number | null;
  customTimerEnabled: boolean;
};
