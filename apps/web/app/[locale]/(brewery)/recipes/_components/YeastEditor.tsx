"use client";

import { YeastEditorEditable } from "./yeastEditor/YeastEditorEditable";
import { YeastEditorReadOnly } from "./yeastEditor/YeastEditorReadOnly";
import { roundTo, type YeastEditorProps } from "./yeastEditor/yeastEditorTypes";

export type { YeastEditorEditableProps, YeastEditorProps, YeastSearchItem } from "./yeastEditor/yeastEditorTypes";

export function YeastEditor({
  yeastRows,
  yeastAttenuationOverrides,
  analysis = null,
  recipeExtJson = null,
  surfaceMath = false,
  readOnly,
  recipeId,
  onAddRow,
  onRemoveRow,
  onUpdateRow,
  onAttenuationOverrideChange,
  onSave,
  canSave = false,
  saving = false,
  saveStatus = null,
  onDismissSaveStatus,
  canCallAccountScoped = false,
  t,
  tAnalysis,
  tUnits = (k: string) => k,
  locale = "en",
  formatFixed: formatFixedProp,
  lowViabilityWarning = null,
}: YeastEditorProps) {
  const formatAmount = (value: number, decimals: number) =>
    formatFixedProp ? formatFixedProp(locale, value, decimals) : String(roundTo(value, decimals));
  const batchSizeLitersRaw =
    recipeExtJson && typeof recipeExtJson === "object" && !Array.isArray(recipeExtJson)
      ? (recipeExtJson as { batchSizeLiters?: unknown }).batchSizeLiters
      : null;
  const batchSizeLiters = typeof batchSizeLitersRaw === "number" ? batchSizeLitersRaw : null;
  const analysisOgRaw =
    analysis && typeof analysis === "object" && !Array.isArray(analysis)
      ? (analysis as { result?: { ogEstimatedSg?: unknown } }).result?.ogEstimatedSg
      : null;
  const analysisOg = typeof analysisOgRaw === "number" ? analysisOgRaw : null;
  const analysisKettleVolumeRaw =
    analysis && typeof analysis === "object" && !Array.isArray(analysis)
      ? (analysis as { result?: { kettleVolumeLiters?: unknown } }).result?.kettleVolumeLiters
      : null;
  const analysisKettleVolume = typeof analysisKettleVolumeRaw === "number" ? analysisKettleVolumeRaw : null;
  const batchSizeForCells =
    typeof batchSizeLiters === "number" && Number.isFinite(batchSizeLiters) && batchSizeLiters > 0
      ? batchSizeLiters
      : typeof analysisKettleVolume === "number" && Number.isFinite(analysisKettleVolume) && analysisKettleVolume > 0
        ? analysisKettleVolume
        : null;

  if (readOnly) {
    return (
      <YeastEditorReadOnly
        yeastRows={yeastRows}
        yeastAttenuationOverrides={yeastAttenuationOverrides}
        recipeId={recipeId}
        t={t}
        tAnalysis={tAnalysis}
        tUnits={tUnits}
        formatAmount={formatAmount}
      />
    );
  }

  return (
    <YeastEditorEditable
      yeastRows={yeastRows}
      yeastAttenuationOverrides={yeastAttenuationOverrides}
      batchSizeForCells={batchSizeForCells}
      analysisOg={analysisOg}
      surfaceMath={surfaceMath}
      recipeId={recipeId}
      onAddRow={onAddRow!}
      onRemoveRow={onRemoveRow!}
      onUpdateRow={onUpdateRow!}
      onAttenuationOverrideChange={onAttenuationOverrideChange!}
      onSave={onSave!}
      canSave={canSave}
      saving={saving}
      saveStatus={saveStatus}
      onDismissSaveStatus={onDismissSaveStatus}
      canCallAccountScoped={canCallAccountScoped}
      t={t}
      tAnalysis={tAnalysis}
      tUnits={tUnits}
      formatAmount={formatAmount}
      locale={locale}
      lowViabilityWarning={lowViabilityWarning}
    />
  );
}
