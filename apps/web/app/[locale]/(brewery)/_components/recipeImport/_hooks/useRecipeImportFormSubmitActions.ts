"use client";

import {
  importRecipe,
  importRecipesBulk,
  previewBulkRecipeImport,
  previewRecipeImport,
} from "@umbraculum/api-client/brewery";
import {
  ApiClientError,
  importPlatformRecipe,
  importPlatformRecipesBulk,
  previewPlatformBulkRecipeImport,
  previewPlatformRecipeImport,
} from "@umbraculum/api-client";

import { webBreweryApiClient } from "../../../_lib/breweryWaterClient";
import { webPlatformApiClient } from "../../../../../_shared-layout/_lib/webApiClient";
import {
  apiErrorMessage,
  BREWERY_RECIPES_API_BASE,
  type BulkCreatedItem,
  type BulkFailedItem,
  type BulkPreviewItem,
  type ImportFormat,
  type ImportWarning,
  type RecipeImportFormProps,
  type RecipeImportPreview,
} from "../_lib/recipeImportTypes";
import type { RecipeImportFormState } from "./useRecipeImportFormState";

function facadeErrorMessage(err: unknown): string {
  if (err instanceof ApiClientError) return apiErrorMessage(err.body);
  return String(err);
}

type SubmitDeps = Pick<RecipeImportFormProps, "apiBasePath" | "workspaceId" | "accountId" | "canCall" | "onSingleImportSuccess">;

export function createRecipeImportSubmitActions(state: RecipeImportFormState, deps: SubmitDeps) {
  const { apiBasePath, workspaceId, accountId, canCall, onSingleImportSuccess } = deps;
  const { t } = state;

  const buildBody = (payload: Record<string, unknown>) => {
    const body = { ...payload };
    const effectiveWorkspaceId = workspaceId ?? accountId ?? null;
    if (effectiveWorkspaceId) body["workspaceId"] = effectiveWorkspaceId;
    return body;
  };

  const parsePreview = (p: Record<string, unknown>): RecipeImportPreview => {
    const name = typeof p["name"] === "string" ? p["name"] : "";
    const notesRaw = p["notes"];
    const notes = typeof notesRaw === "string" ? notesRaw : notesRaw === null ? null : null;
    const warningsRaw = p["warnings"];
    const warnings = Array.isArray(warningsRaw) ? (warningsRaw as ImportWarning[]) : [];
    return { name, notes, warnings };
  };

  const onPreview = async () => {
    if (!canCall) return;
    state.setPreview(null);
    state.setPreviewError(null);
    state.setImportError(null);
    if (!state.content.trim()) return state.setPreviewError(t("errors.noContent"));
    if (!state.format) return state.setPreviewError(t("errors.unknownFormat"));
    if (apiBasePath.includes("platform") && !(workspaceId ?? accountId)) return state.setPreviewError("Workspace is required");

    state.setPreviewLoading(true);
    try {
      const body = buildBody({ format: state.format, content: state.content });
      if (apiBasePath === BREWERY_RECIPES_API_BASE) {
        const data = await previewRecipeImport(webBreweryApiClient(), body);
        state.setPreview(parsePreview(data.preview as Record<string, unknown>));
      } else if (apiBasePath.includes("platform")) {
        const data = await previewPlatformRecipeImport(webPlatformApiClient(), body);
        state.setPreview(parsePreview(data.preview as Record<string, unknown>));
      } else {
        throw new Error(`Unsupported apiBasePath for preview: ${apiBasePath}`);
      }
    } catch (err) {
      state.setPreviewError(facadeErrorMessage(err));
    } finally {
      state.setPreviewLoading(false);
    }
  };

  const onBulkPreview = async () => {
    if (!canCall) return;
    state.resetBulkPreview();
    if (!state.bulkContent.trim()) return state.setBulkPreviewError(t("errors.noContent"));
    if (!state.bulkFormat) return state.setBulkPreviewError(t("errors.unknownFormat"));
    if (apiBasePath.includes("platform") && !(workspaceId ?? accountId)) return state.setBulkPreviewError("Workspace is required");

    state.setBulkPreviewLoading(true);
    try {
      const body = buildBody({ format: state.bulkFormat, content: state.bulkContent });
      if (apiBasePath === BREWERY_RECIPES_API_BASE) {
        const data = await previewBulkRecipeImport(webBreweryApiClient(), body);
        state.setBulkPreviewItems(data.previewItems as BulkPreviewItem[]);
      } else if (apiBasePath.includes("platform")) {
        const data = await previewPlatformBulkRecipeImport(webPlatformApiClient(), body);
        state.setBulkPreviewItems(data.previewItems as BulkPreviewItem[]);
      } else {
        throw new Error(`Unsupported apiBasePath for bulk preview: ${apiBasePath}`);
      }
    } catch (err) {
      state.setBulkPreviewError(facadeErrorMessage(err));
    } finally {
      state.setBulkPreviewLoading(false);
    }
  };

  const onImport = async () => {
    if (!canCall) return;
    state.setImportError(null);
    if (!state.content.trim()) return state.setImportError(t("errors.noContent"));
    if (!state.format) return state.setImportError(t("errors.unknownFormat"));
    if (!state.styleKey.trim()) return state.setImportError(t("errors.styleRequired"));
    if (apiBasePath.includes("platform") && !(workspaceId ?? accountId)) return state.setImportError("Workspace is required");

    state.setImporting(true);
    try {
      const body = buildBody({ format: state.format, content: state.content, styleKey: state.styleKey });
      if (apiBasePath === BREWERY_RECIPES_API_BASE) {
        const data = await importRecipe(webBreweryApiClient(), body);
        const recipe = data.recipe as Record<string, unknown>;
        const id = typeof recipe["id"] === "string" ? recipe["id"] : "";
        if (!id) throw new Error(t("errors.importMissingId"));
        onSingleImportSuccess?.(id);
      } else if (apiBasePath.includes("platform")) {
        const data = await importPlatformRecipe(webPlatformApiClient(), body);
        const recipe = data.recipe as Record<string, unknown>;
        const id = typeof recipe["id"] === "string" ? recipe["id"] : "";
        if (!id) throw new Error(t("errors.importMissingId"));
        onSingleImportSuccess?.(id);
      } else {
        throw new Error(`Unsupported apiBasePath for import: ${apiBasePath}`);
      }
    } catch (err) {
      state.setImportError(facadeErrorMessage(err));
    } finally {
      state.setImporting(false);
    }
  };

  const onBulkImport = async () => {
    if (!canCall) return;
    state.setBulkImportError(null);
    if (!state.bulkContent.trim()) return state.setBulkImportError(t("errors.noContent"));
    if (!state.bulkFormat) return state.setBulkImportError(t("errors.unknownFormat"));
    if (apiBasePath.includes("platform") && !(workspaceId ?? accountId)) return state.setBulkImportError("Workspace is required");

    state.setBulkImporting(true);
    try {
      const body = buildBody({ format: state.bulkFormat as ImportFormat, content: state.bulkContent });
      if (apiBasePath === BREWERY_RECIPES_API_BASE) {
        const data = await importRecipesBulk(webBreweryApiClient(), body);
        state.setBulkResult({
          created: data.created as BulkCreatedItem[],
          failed: data.failed as BulkFailedItem[],
        });
      } else if (apiBasePath.includes("platform")) {
        const data = await importPlatformRecipesBulk(webPlatformApiClient(), body);
        state.setBulkResult({
          created: data.created as BulkCreatedItem[],
          failed: data.failed as BulkFailedItem[],
        });
      } else {
        throw new Error(`Unsupported apiBasePath for bulk import: ${apiBasePath}`);
      }
    } catch (err) {
      state.setBulkImportError(facadeErrorMessage(err));
    } finally {
      state.setBulkImporting(false);
    }
  };

  return { onPreview, onBulkPreview, onImport, onBulkImport };
}
