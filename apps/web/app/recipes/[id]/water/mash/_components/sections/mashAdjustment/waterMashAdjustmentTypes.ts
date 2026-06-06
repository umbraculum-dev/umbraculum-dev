import type { WaterMashPageModel } from "../../../_hooks/useWaterMashPage";

export type WaterMashProfilePickersModel = Pick<
  WaterMashPageModel,
  | "t"
  | "tUnits"
  | "sourceProfileId"
  | "setSourceProfileId"
  | "targetProfileId"
  | "setTargetProfileId"
  | "dilutionProfileId"
  | "setDilutionProfileId"
  | "tapVolumeLiters"
  | "setTapVolumeLiters"
  | "dilutionVolumeLiters"
  | "setDilutionVolumeLiters"
  | "waterProfiles"
  | "dilutionProfiles"
>;

export type WaterMashAdjustmentActionsModel = Pick<
  WaterMashPageModel,
  | "canCall"
  | "loadingProfiles"
  | "refreshProfiles"
  | "onSaveAdjustment"
  | "savingAdjustment"
  | "adjustmentSaveStatus"
  | "setAdjustmentSaveStatus"
>;

export type WaterMashMixedIonsModel = Pick<
  WaterMashPageModel,
  "mixedSourceProfile" | "selectedTarget" | "fmt"
>;
