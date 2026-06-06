import type { WaterBoilPageModel } from "../../../_hooks/useWaterBoilPage";

export type WaterBoilProfilePickersModel = Pick<
  WaterBoilPageModel,
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
  | "selectedSource"
  | "selectedTarget"
  | "selectedDilution"
  | "selectedProfileInfo"
>;

export type WaterBoilAdjustmentActionsModel = Pick<
  WaterBoilPageModel,
  | "canCall"
  | "loadingProfiles"
  | "refreshProfiles"
  | "onSaveAdjustment"
  | "savingAdjustment"
  | "adjustmentSaveStatus"
  | "setAdjustmentSaveStatus"
>;

export type WaterBoilMixedIonsModel = Pick<
  WaterBoilPageModel,
  "t" | "mixedSourceProfile" | "selectedTarget" | "fmt"
>;
