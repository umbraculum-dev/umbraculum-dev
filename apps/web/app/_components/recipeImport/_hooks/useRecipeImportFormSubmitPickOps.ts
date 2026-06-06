"use client";

import {
  RECIPES_IMPORT_BULK_MAX_BYTES,
  RECIPES_IMPORT_SINGLE_MAX_BYTES,
} from "../_lib/recipeImportTypes";
import type { RecipeImportFormState } from "./useRecipeImportFormState";

export function createRecipeImportPickHandlers(state: RecipeImportFormState) {
  const onPickFile = async (f: File | null) => {
    state.resetSinglePreview();
    state.setContent("");
    state.setFileName("");
    state.setFormatOverride("");

    if (!f) return;
    state.setFileName(f.name || "");

    if (f.size > RECIPES_IMPORT_SINGLE_MAX_BYTES) {
      state.setPreviewError(state.t("errors.fileTooLarge", { max: "1 MB" }));
      return;
    }
    try {
      const txt = await f.text();
      state.setContent(txt);
    } catch (err) {
      state.setPreviewError(String(err));
    }
  };

  const onPickBulkFile = async (f: File | null) => {
    state.resetBulkPreview();
    state.setBulkContent("");
    state.setBulkFileName("");
    state.setBulkFormatOverride("");

    if (!f) return;
    state.setBulkFileName(f.name || "");

    if (f.size > RECIPES_IMPORT_BULK_MAX_BYTES) {
      state.setBulkPreviewError(state.t("errors.fileTooLarge", { max: "5 MB" }));
      return;
    }
    try {
      const txt = await f.text();
      state.setBulkContent(txt);
    } catch (err) {
      state.setBulkPreviewError(String(err));
    }
  };

  return { onPickFile, onPickBulkFile };
}
