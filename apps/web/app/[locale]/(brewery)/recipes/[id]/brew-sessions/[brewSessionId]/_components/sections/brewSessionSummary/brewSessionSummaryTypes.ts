import type { BrewSessionDetailPageModel } from "../../../_hooks/useBrewSessionDetailPage";

export type BrewSessionSummaryHeaderModel = Pick<
  BrewSessionDetailPageModel,
  "t" | "session" | "recipe"
>;

export type BrewSessionSummaryStatsModel = Pick<
  BrewSessionDetailPageModel,
  "t" | "locale" | "sessionTiming"
>;

export type BrewSessionSummaryActionsModel = Pick<
  BrewSessionDetailPageModel,
  | "t"
  | "locale"
  | "canCall"
  | "session"
  | "sessionActionWorking"
  | "sessionActionError"
  | "onSessionAction"
  | "onStopSession"
  | "canDeleteSession"
  | "deleteConfirmShown"
  | "setDeleteConfirmShown"
  | "deleting"
  | "deleteError"
  | "setDeleteError"
  | "onDeleteSession"
  | "stoppedBy"
>;
