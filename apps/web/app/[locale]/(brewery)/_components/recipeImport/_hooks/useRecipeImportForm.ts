"use client";

import type { RecipeImportFormProps } from "../_lib/recipeImportTypes";
import { useRecipeImportFormState } from "./useRecipeImportFormState";
import { useRecipeImportFormSubmit } from "./useRecipeImportFormSubmit";

export function useRecipeImportForm(props: RecipeImportFormProps) {
  const { apiBasePath, workspaceId, accountId, canCall, onSingleImportSuccess } = props;
  const state = useRecipeImportFormState({ apiBasePath, canCall });
  const submit = useRecipeImportFormSubmit(state, {
    apiBasePath,
    workspaceId,
    accountId,
    canCall,
    onSingleImportSuccess,
  });

  return {
    t: state.t,
    tDash: state.tDash,
    c: state.c,
    canCall,
    fileName: state.fileName,
    content: state.content,
    formatOverride: state.formatOverride,
    setFormatOverride: state.setFormatOverride,
    format: state.format,
    styles: state.styles,
    stylesLoading: state.stylesLoading,
    stylesError: state.stylesError,
    styleKey: state.styleKey,
    setStyleKey: state.setStyleKey,
    previewLoading: state.previewLoading,
    previewError: state.previewError,
    preview: state.preview,
    importing: state.importing,
    importError: state.importError,
    bulkFileName: state.bulkFileName,
    bulkContent: state.bulkContent,
    bulkFormatOverride: state.bulkFormatOverride,
    setBulkFormatOverride: state.setBulkFormatOverride,
    bulkFormat: state.bulkFormat,
    bulkPreviewLoading: state.bulkPreviewLoading,
    bulkPreviewError: state.bulkPreviewError,
    bulkPreviewItems: state.bulkPreviewItems,
    bulkImporting: state.bulkImporting,
    bulkImportError: state.bulkImportError,
    bulkResult: state.bulkResult,
    openSections: state.openSections,
    setOpenSections: state.setOpenSections,
    onPickFile: submit.onPickFile,
    onPickBulkFile: submit.onPickBulkFile,
    onPreview: submit.onPreview,
    onBulkPreview: submit.onBulkPreview,
    onImport: submit.onImport,
    onBulkImport: submit.onBulkImport,
    resetSinglePreview: state.resetSinglePreview,
    resetBulkPreview: state.resetBulkPreview,
    canPreview: state.canPreview,
    canImport: state.canImport,
    formatLabel: state.formatLabel,
    dash: state.dash,
    canBulkPreview: state.canBulkPreview,
    canBulkImport: state.canBulkImport,
    bulkFormatLabel: state.bulkFormatLabel,
  };
}

export type UseRecipeImportFormModel = ReturnType<typeof useRecipeImportForm>;
