import type { YeastScreenRowSectionProps } from "./YeastScreenRowIdentity";
export { YeastScreenRowPitchRate as YeastScreenRowPitch } from "./YeastScreenRowPitchRate";
export { YeastScreenRowPitchAdvanced } from "./YeastScreenRowPitchAdvanced";

export type YeastScreenRowPitchProps = YeastScreenRowSectionProps & {
  locale: string;
  tUnits: (key: string) => string;
  tCommon: (key: string) => string;
  batchSizeForCellsVal: number | null;
  analysisOg: number | null | undefined;
};
