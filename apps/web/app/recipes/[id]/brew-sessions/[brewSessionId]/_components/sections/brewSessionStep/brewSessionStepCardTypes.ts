import type { BrewSessionStep } from "../../../_lib/brewSessionDetailUi";
import type { BrewSessionDetailPageModel } from "../../../_hooks/useBrewSessionDetailPage";

export type BrewSessionStepCardContext = Pick<
  BrewSessionDetailPageModel,
  | "t"
  | "canCall"
  | "session"
  | "steps"
  | "setSteps"
  | "stepsBaselineById"
  | "moveStep"
  | "onSaveStepLog"
  | "onRemoveStep"
  | "onToggleCustomTimerEnabled"
  | "onStepTimer"
  | "parseOffsetMinutes"
  | "computeElapsedSeconds"
  | "computeRelativeCountdownSeconds"
  | "relativeBaseOptions"
  | "oldestDueStepId"
  | "removeStepWorking"
  | "saveSectionLogsWorkingSectionId"
>;

export type BrewSessionStepCardDerived = {
  globalIdx: number;
  elapsed: number;
  remainingSeconds: number | null;
  relativeBase: BrewSessionStep | null | undefined;
  relativeCountdownSecondsRaw: number | null;
  relativeCountdownSecondsDisplay: number | null;
  isRelativeCountdownRelevant: boolean;
  showRelativeCountdown: boolean;
  showOldestDueWarning: boolean;
  relativeCountdownLine: string;
};
