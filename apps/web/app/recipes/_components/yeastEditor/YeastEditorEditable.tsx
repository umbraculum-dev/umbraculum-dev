"use client";

import { View } from "tamagui";

import { type YeastEditorEditableProps } from "./yeastEditorTypes";
import { YeastEditorEditableRows } from "./editable/YeastEditorEditableRows";
import { YeastEditorEditableSaveFooter } from "./editable/YeastEditorEditableSaveFooter";
import { YeastEditorEditableSearch } from "./editable/YeastEditorEditableSearch";
import { YeastEditorEditableToolbar } from "./editable/YeastEditorEditableToolbar";
import {
  buildYeastEditorRowContext,
  useYeastEditorAmountRecalc,
} from "./editable/useYeastEditorEditableModel";

export function YeastEditorEditable({
  yeastRows,
  yeastAttenuationOverrides,
  batchSizeForCells,
  analysisOg,
  surfaceMath = false,
  onAddRow,
  onRemoveRow,
  onUpdateRow,
  onAttenuationOverrideChange,
  onSave,
  canSave: _canSave,
  saving,
  saveStatus,
  onDismissSaveStatus,
  canCallAccountScoped,
  t,
  tAnalysis,
  tUnits,
  formatAmount,
  locale,
  lowViabilityWarning = null,
}: YeastEditorEditableProps) {
  const { requestAmountRecalc } = useYeastEditorAmountRecalc({
    yeastRows,
    batchSizeForCells,
    analysisOg,
    onUpdateRow,
  });

  const rowCtx = buildYeastEditorRowContext({
    yeastRows,
    yeastAttenuationOverrides,
    batchSizeForCells,
    analysisOg,
    surfaceMath,
    onRemoveRow,
    onUpdateRow,
    onAttenuationOverrideChange,
    onSave,
    saving,
    canCallAccountScoped,
    t,
    tAnalysis,
    tUnits,
    formatAmount,
    locale,
    lowViabilityWarning,
    requestAmountRecalc,
  });

  return (
    <View>
      <YeastEditorEditableSearch
        canCallAccountScoped={canCallAccountScoped}
        t={t}
        onAddRow={onAddRow}
      />

      <View borderTopWidth={1} borderColor="var(--border)" my="$3" />

      <YeastEditorEditableToolbar
        t={t}
        canCallAccountScoped={canCallAccountScoped}
        onAddRow={() => onAddRow()}
      />

      <YeastEditorEditableRows yeastRows={yeastRows} rowCtx={rowCtx} t={t} />

      <YeastEditorEditableSaveFooter
        t={t}
        canCallAccountScoped={canCallAccountScoped}
        saving={saving}
        onSave={onSave}
        saveStatus={saveStatus}
        onDismissSaveStatus={onDismissSaveStatus}
      />
    </View>
  );
}
