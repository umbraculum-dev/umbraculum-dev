import type { EditorMashStep, EditorMashStepType } from "@umbraculum/brewery-beerjson";
import { MASH_STEP_TYPE_OPTIONS } from "@umbraculum/brewery-beerjson";

export type WaterVolumes = { mashLiters: number; spargeLiters: number };

export interface MashStepsEditorProps {
  mashRows: EditorMashStep[];
  mashProcedure?: { name: string; grainTemperatureC: number } | null;
  waterVolumes: WaterVolumes | null;
  mashWaterBudgetLiters?: number | null;
  firstStepAmountComputed?: number | null;
  hideSpargeFromTypeOptions?: boolean;
  readOnly?: boolean;
  recipeId?: string;
  /** Override card background (e.g. native: SURFACE_CARD for contrast with field values). */
  cardBackgroundColor?: string;
  /** Override card border color. */
  cardBorderColor?: string;
  onUpdateProcedure?: (patch: { name?: string; grainTemperatureC?: number }) => void;
  onUpdateStep?: (id: string, patch: Partial<EditorMashStep>) => void;
  onMoveStep?: (id: string, direction: "up" | "down") => void;
  onAddStep?: () => void;
  onDeleteStep?: (id: string) => void;
  onAddFromTemplate?: (templateId: string) => void;
  onSave?: () => void;
  canSave?: boolean;
  saving?: boolean;
  saveStatus?: string | null;
  onDismissSaveStatus?: () => void;
  t: (key: string, values?: Record<string, string | number>) => string;
  tUnits: (key: string) => string;
  locale: string;
  formatFixed: (locale: string, value: number, decimals: number) => string;
}

export function isSpargeRow(r: EditorMashStep): boolean {
  return r.type === "sparge" && r.name.trim().toLowerCase() === "sparge";
}

export function stepTypeOptions(hideSparge: boolean | undefined) {
  return hideSparge ? MASH_STEP_TYPE_OPTIONS.filter((o) => o.value !== "sparge") : MASH_STEP_TYPE_OPTIONS;
}

export interface MashStepRowMoveState {
  canReorder: boolean;
  disableMoveUp: boolean;
  disableMoveDown: boolean;
}

export interface MashStepRowEditState {
  isSpargeStep: boolean;
  disableName: boolean;
  disableType: boolean;
  disableAmount: boolean;
  typeValue: EditorMashStepType;
  typeOptions: typeof MASH_STEP_TYPE_OPTIONS;
  move: MashStepRowMoveState;
}

export function useMashStepsEditorState(mashRows: EditorMashStep[], options: { hideSpargeFromTypeOptions?: boolean; onMoveStep?: unknown; firstStepAmountComputed?: number | null }) {
  const { hideSpargeFromTypeOptions = false, onMoveStep, firstStepAmountComputed = null } = options;

  const movableIndices = mashRows
    .map((r, idx) => ({ r, idx }))
    .filter(({ r, idx }) => idx > 0 && !isSpargeRow(r))
    .map(({ idx }) => idx);
  const firstMovableIdx = movableIndices.length ? movableIndices[0] : null;
  const lastMovableIdx = movableIndices.length ? movableIndices[movableIndices.length - 1] : null;

  function getRowEditState(r: EditorMashStep, idx: number): MashStepRowEditState {
    const isSpargeStep = isSpargeRow(r);
    const disableName = isSpargeStep || (idx === 0 && firstStepAmountComputed != null);
    const disableType = isSpargeStep;
    const disableAmount =
      isSpargeStep ||
      (idx === 0 && firstStepAmountComputed != null) ||
      (idx > 0 && r.deduceFromMashIn !== true);
    const typeOptions = stepTypeOptions(hideSpargeFromTypeOptions);
    const typeValue: EditorMashStepType = r.type;
    const canReorder = Boolean(onMoveStep) && idx > 0 && !isSpargeStep;
    const disableMoveUp = !canReorder || firstMovableIdx == null || idx === firstMovableIdx;
    const disableMoveDown = !canReorder || lastMovableIdx == null || idx === lastMovableIdx;

    return {
      isSpargeStep,
      disableName,
      disableType,
      disableAmount,
      typeValue,
      typeOptions,
      move: { canReorder, disableMoveUp, disableMoveDown },
    };
  }

  return { getRowEditState };
}
