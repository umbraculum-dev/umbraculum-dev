import type { EditorMashStep } from "@umbraculum/brewery-beerjson";

import type { MashStepRowEditState } from "./useMashStepsEditorState";
import type { WaterVolumes } from "./useMashStepsEditorState";

export interface MashStepRowReadOnlyProps {
  readOnly: true;
  row: EditorMashStep;
  index: number;
  waterVolumes: WaterVolumes | null;
  cardBackgroundColor?: string | undefined;
  cardBorderColor?: string | undefined;
  t: (key: string, values?: Record<string, string | number>) => string;
  tUnits: (key: string) => string;
  locale: string;
  formatFixed: (locale: string, value: number, decimals: number) => string;
}

export interface MashStepRowEditableProps {
  readOnly?: false;
  row: EditorMashStep;
  index: number;
  editState: MashStepRowEditState;
  waterVolumes: WaterVolumes | null;
  firstStepAmountComputed?: number | null;
  onUpdateStep?: ((id: string, patch: Partial<EditorMashStep>) => void) | undefined;
  onMoveStep?: ((id: string, direction: "up" | "down") => void) | undefined;
  onDeleteStep?: ((id: string) => void) | undefined;
  t: (key: string, values?: Record<string, string | number>) => string;
  tUnits: (key: string) => string;
  locale: string;
  formatFixed: (locale: string, value: number, decimals: number) => string;
}

export type MashStepRowProps = MashStepRowReadOnlyProps | MashStepRowEditableProps;

export interface MashStepsReadOnlyViewProps {
  mashRows: EditorMashStep[];
  mashProcedure?: { name: string; grainTemperatureC: number } | null;
  waterVolumes: WaterVolumes | null;
  cardBackgroundColor?: string | undefined;
  cardBorderColor?: string | undefined;
  t: (key: string, values?: Record<string, string | number>) => string;
  tUnits: (key: string) => string;
  locale: string;
  formatFixed: (locale: string, value: number, decimals: number) => string;
}
