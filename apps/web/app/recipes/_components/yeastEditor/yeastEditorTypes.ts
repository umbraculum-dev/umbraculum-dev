import type { EditorYeastRow } from "../../_lib/beerjsonRecipe";

export function roundTo(n: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(n * factor) / factor;
}

export type YeastSearchItem = {
  id?: string;
  name?: string;
  type?: string | null;
  lab?: string | null;
  productId?: string | null;
  attenuationMin?: number | null;
  attenuationMax?: number | null;
};

export type YeastEditorProps = {
  yeastRows: EditorYeastRow[];
  yeastAttenuationOverrides: Record<string, string>;
  /** Analysis result (for estimated cells). Yeast page only. */
  analysis?: unknown | null;
  /** Recipe ext JSON (for batchSizeLiters fallback). Yeast page only. */
  recipeExtJson?: unknown | null;
  /** Show math formulas (Estimated cells). Yeast page only. */
  surfaceMath?: boolean;
  readOnly: boolean;
  recipeId: string;
  onAddRow?: (row?: Partial<EditorYeastRow>) => void;
  onRemoveRow?: (id: string) => void;
  onUpdateRow?: (id: string, patch: Partial<EditorYeastRow>) => void;
  onAttenuationOverrideChange?: (id: string, value: string) => void;
  onSave?: () => void;
  canSave?: boolean;
  saving?: boolean;
  saveStatus?: string | null;
  onDismissSaveStatus?: () => void;
  canCallAccountScoped?: boolean;
  t: (key: string, values?: Record<string, string | number>) => string;
  tAnalysis: (key: string) => string;
  tUnits?: (key: string) => string;
  /** For locale-aware number formatting (e.g. Amount L/g). */
  locale?: string;
  formatFixed?: (locale: string, value: number, decimals: number) => string;
  /** Show low viability warning after save (yeast page only). */
  lowViabilityWarning?: number | null;
};

export function _newRowId(): string {
  try {
    return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  } catch {
    return `${Date.now()}-${Math.random()}`;
  }
}

export type YeastEditorEditableProps = {
  yeastRows: EditorYeastRow[];
  yeastAttenuationOverrides: Record<string, string>;
  batchSizeForCells: number | null;
  analysisOg: number | null | undefined;
  surfaceMath?: boolean;
  recipeId: string;
  onAddRow: (row?: Partial<EditorYeastRow>) => void;
  onRemoveRow: (id: string) => void;
  onUpdateRow: (id: string, patch: Partial<EditorYeastRow>) => void;
  onAttenuationOverrideChange: (id: string, value: string) => void;
  onSave: () => void;
  canSave: boolean;
  saving: boolean;
  saveStatus: string | null;
  onDismissSaveStatus?: () => void;
  canCallAccountScoped: boolean;
  t: (key: string, values?: Record<string, string | number>) => string;
  tAnalysis: (key: string) => string;
  tUnits: (key: string) => string;
  formatAmount: (value: number, decimals: number) => string;
  locale: string;
  lowViabilityWarning?: number | null;
};

export type YeastEditorRowContext = {
  yeastAttenuationOverrides: Record<string, string>;
  batchSizeForCells: number | null;
  analysisOg: number | null | undefined;
  surfaceMath?: boolean;
  onRemoveRow: (id: string) => void;
  onUpdateRow: (id: string, patch: Partial<EditorYeastRow>) => void;
  onAttenuationOverrideChange: (id: string, value: string) => void;
  onSave: () => void;
  saving: boolean;
  canCallAccountScoped: boolean;
  t: (key: string, values?: Record<string, string | number>) => string;
  tAnalysis: (key: string) => string;
  tUnits: (key: string) => string;
  formatAmount: (value: number, decimals: number) => string;
  locale: string;
  lowViabilityWarning?: number | null;
  firstManualCountRowIdx: number;
  requestAmountRecalc: () => void;
};

export type YeastEditorReadOnlyProps = {
  yeastRows: EditorYeastRow[];
  yeastAttenuationOverrides: Record<string, string>;
  recipeId: string;
  t: (key: string, values?: Record<string, string | number>) => string;
  tAnalysis: (key: string) => string;
  tUnits: (key: string) => string;
  formatAmount: (value: number, decimals: number) => string;
};
