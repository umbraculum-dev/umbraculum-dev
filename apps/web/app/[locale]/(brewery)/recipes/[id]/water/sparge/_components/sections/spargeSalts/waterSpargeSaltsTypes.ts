import type { WaterSpargePageModel } from "../../../_hooks/useWaterSpargePage";

export type WaterSpargeSaltsEditorModel = Pick<
  WaterSpargePageModel,
  | "t"
  | "canCall"
  | "spargeSaltAdditions"
  | "setSpargeSaltAdditions"
  | "onSaveSpargeSaltsInputs"
  | "savingSpargeSalts"
  | "onCalculateSpargeSalts"
  | "spargeSaltsSubmitting"
  | "selectedSpargeProfile"
  | "spargeSaltsStatus"
  | "spargeSaltsSaveStatus"
  | "setSpargeSaltsSaveStatus"
  | "spargeSaltsCalcSaveStatus"
  | "setSpargeSaltsCalcSaveStatus"
  | "spargeSaltsError"
>;

export type WaterSpargeSaltsAfterSaltsModel = Pick<
  WaterSpargePageModel,
  | "spargeSaltsResult"
  | "surfaceMath"
  | "locale"
  | "tMath"
  | "tUnits"
  | "saltDerivation"
  | "fmt"
>;

export type WaterSpargeSaltsCombinedModel = Pick<
  WaterSpargePageModel,
  | "spargeSaltsResult"
  | "spargeResult"
  | "spargeOverall"
  | "surfaceMath"
  | "locale"
  | "tMath"
  | "tUnits"
  | "acidDerivation"
  | "fmt"
>;
