"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import {
  importRecipe,
  importRecipesBulk,
  listStyles,
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
import { webPlatformApiClient } from "../../../_lib/webApiClient";
import {
  apiErrorMessage,
  BREWERY_RECIPES_API_BASE,
  RECIPES_IMPORT_BULK_MAX_BYTES,
  RECIPES_IMPORT_SINGLE_MAX_BYTES,
  type BulkCreatedItem,
  type BulkFailedItem,
  type BulkPreviewItem,
  type ImportFormat,
  type ImportWarning,
  type RecipeImportBulkResult,
  type RecipeImportFormProps,
  type RecipeImportPreview,
  type StyleListItem,
} from "../_lib/recipeImportTypes";

function facadeErrorMessage(err: unknown): string {
  if (err instanceof ApiClientError) return apiErrorMessage(err.body);
  return String(err);
}

export function useRecipeImportForm({
  apiBasePath,
  workspaceId,
  accountId,
  canCall,
  onSingleImportSuccess,
}: RecipeImportFormProps) {
  const t = useTranslations("recipes.import");
  const tDash = useTranslations("dashboard");
  const c = useTranslations("common");

  const [fileName, setFileName] = useState<string>("");
  const [content, setContent] = useState<string>("");

  const [formatOverride, setFormatOverride] = useState<"" | ImportFormat>("");
  const formatAuto = useMemo<ImportFormat | null>(() => {
    const n = fileName.toLowerCase().trim();
    if (n.endsWith(".xml")) return "beerxml";
    if (n.endsWith(".json")) return "beerjson";
    return null;
  }, [fileName]);
  const format: ImportFormat | null = formatOverride || formatAuto;

  const [styles, setStyles] = useState<StyleListItem[]>([]);
  const [stylesLoading, setStylesLoading] = useState(false);
  const [stylesError, setStylesError] = useState<string | null>(null);
  const [styleKey, setStyleKey] = useState("custom");

  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [preview, setPreview] = useState<RecipeImportPreview | null>(null);

  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const [bulkFileName, setBulkFileName] = useState<string>("");
  const [bulkContent, setBulkContent] = useState<string>("");
  const [bulkFormatOverride, setBulkFormatOverride] = useState<"" | ImportFormat>("");
  const bulkFormatAuto = useMemo<ImportFormat | null>(() => {
    const n = bulkFileName.toLowerCase().trim();
    if (n.endsWith(".xml")) return "beerxml";
    if (n.endsWith(".json")) return "beerjson";
    return null;
  }, [bulkFileName]);
  const bulkFormat: ImportFormat | null = bulkFormatOverride || bulkFormatAuto;

  const [bulkPreviewLoading, setBulkPreviewLoading] = useState(false);
  const [bulkPreviewError, setBulkPreviewError] = useState<string | null>(null);
  const [bulkPreviewItems, setBulkPreviewItems] = useState<BulkPreviewItem[] | null>(null);

  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkImportError, setBulkImportError] = useState<string | null>(null);
  const [bulkResult, setBulkResult] = useState<RecipeImportBulkResult | null>(null);

  const [openSections, setOpenSections] = useState<string[]>([]);

  useEffect(() => {
    if (!canCall) return;
    let cancelled = false;
    void (async () => {
      setStylesError(null);
      setStylesLoading(true);
      try {
        if (apiBasePath === BREWERY_RECIPES_API_BASE || apiBasePath.includes("platform")) {
          const data = await listStyles(webBreweryApiClient());
          if (!cancelled) setStyles(data.styles as StyleListItem[]);
        } else {
          throw new Error(`Unsupported apiBasePath for styles: ${apiBasePath}`);
        }
      } catch (err) {
        if (!cancelled) {
          setStyles([]);
          setStylesError(String(err));
        }
      } finally {
        if (!cancelled) setStylesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [canCall, apiBasePath]);

  const buildBody = (payload: Record<string, unknown>) => {
    const body = { ...payload };
    const effectiveWorkspaceId = workspaceId ?? accountId ?? null;
    if (effectiveWorkspaceId) body["workspaceId"] = effectiveWorkspaceId;
    return body;
  };

  const onPickFile = async (f: File | null) => {
    setPreview(null);
    setPreviewError(null);
    setImportError(null);
    setContent("");
    setFileName("");
    setFormatOverride("");

    if (!f) return;
    setFileName(f.name || "");

    if (f.size > RECIPES_IMPORT_SINGLE_MAX_BYTES) {
      setPreviewError(t("errors.fileTooLarge", { max: "1 MB" }));
      return;
    }
    try {
      const txt = await f.text();
      setContent(txt);
    } catch (err) {
      setPreviewError(String(err));
    }
  };

  const onPickBulkFile = async (f: File | null) => {
    setBulkPreviewItems(null);
    setBulkPreviewError(null);
    setBulkImportError(null);
    setBulkResult(null);
    setBulkContent("");
    setBulkFileName("");
    setBulkFormatOverride("");

    if (!f) return;
    setBulkFileName(f.name || "");

    if (f.size > RECIPES_IMPORT_BULK_MAX_BYTES) {
      setBulkPreviewError(t("errors.fileTooLarge", { max: "5 MB" }));
      return;
    }
    try {
      const txt = await f.text();
      setBulkContent(txt);
    } catch (err) {
      setBulkPreviewError(String(err));
    }
  };

  const onPreview = async () => {
    if (!canCall) return;
    setPreview(null);
    setPreviewError(null);
    setImportError(null);
    if (!content.trim()) return setPreviewError(t("errors.noContent"));
    if (!format) return setPreviewError(t("errors.unknownFormat"));
    if (apiBasePath.includes("platform") && !(workspaceId ?? accountId)) return setPreviewError("Workspace is required");

    setPreviewLoading(true);
    try {
      const body = buildBody({ format, content });
      if (apiBasePath === BREWERY_RECIPES_API_BASE) {
        const data = await previewRecipeImport(webBreweryApiClient(), body);
        const p = data.preview;
        const name = typeof p["name"] === "string" ? p["name"] : "";
        const notesRaw = p["notes"];
        const notes = typeof notesRaw === "string" ? notesRaw : notesRaw === null ? null : null;
        const warningsRaw = p["warnings"];
        const warnings = Array.isArray(warningsRaw) ? (warningsRaw as ImportWarning[]) : [];
        setPreview({ name, notes, warnings });
      } else if (apiBasePath.includes("platform")) {
        const data = await previewPlatformRecipeImport(webPlatformApiClient(), body);
        const p = data.preview;
        const name = typeof p["name"] === "string" ? p["name"] : "";
        const notesRaw = p["notes"];
        const notes = typeof notesRaw === "string" ? notesRaw : notesRaw === null ? null : null;
        const warningsRaw = p["warnings"];
        const warnings = Array.isArray(warningsRaw) ? (warningsRaw as ImportWarning[]) : [];
        setPreview({ name, notes, warnings });
      } else {
        throw new Error(`Unsupported apiBasePath for preview: ${apiBasePath}`);
      }
    } catch (err) {
      setPreviewError(facadeErrorMessage(err));
    } finally {
      setPreviewLoading(false);
    }
  };

  const onBulkPreview = async () => {
    if (!canCall) return;
    setBulkPreviewItems(null);
    setBulkPreviewError(null);
    setBulkImportError(null);
    setBulkResult(null);
    if (!bulkContent.trim()) return setBulkPreviewError(t("errors.noContent"));
    if (!bulkFormat) return setBulkPreviewError(t("errors.unknownFormat"));
    if (apiBasePath.includes("platform") && !(workspaceId ?? accountId)) return setBulkPreviewError("Workspace is required");

    setBulkPreviewLoading(true);
    try {
      const body = buildBody({ format: bulkFormat, content: bulkContent });
      if (apiBasePath === BREWERY_RECIPES_API_BASE) {
        const data = await previewBulkRecipeImport(webBreweryApiClient(), body);
        setBulkPreviewItems(data.previewItems as BulkPreviewItem[]);
      } else if (apiBasePath.includes("platform")) {
        const data = await previewPlatformBulkRecipeImport(webPlatformApiClient(), body);
        setBulkPreviewItems(data.previewItems as BulkPreviewItem[]);
      } else {
        throw new Error(`Unsupported apiBasePath for bulk preview: ${apiBasePath}`);
      }
    } catch (err) {
      setBulkPreviewError(facadeErrorMessage(err));
    } finally {
      setBulkPreviewLoading(false);
    }
  };

  const onImport = async () => {
    if (!canCall) return;
    setImportError(null);
    if (!content.trim()) return setImportError(t("errors.noContent"));
    if (!format) return setImportError(t("errors.unknownFormat"));
    if (!styleKey.trim()) return setImportError(t("errors.styleRequired"));
    if (apiBasePath.includes("platform") && !(workspaceId ?? accountId)) return setImportError("Workspace is required");

    setImporting(true);
    try {
      const body = buildBody({ format, content, styleKey });
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
      setImportError(facadeErrorMessage(err));
    } finally {
      setImporting(false);
    }
  };

  const onBulkImport = async () => {
    if (!canCall) return;
    setBulkImportError(null);
    if (!bulkContent.trim()) return setBulkImportError(t("errors.noContent"));
    if (!bulkFormat) return setBulkImportError(t("errors.unknownFormat"));
    if (apiBasePath.includes("platform") && !(workspaceId ?? accountId)) return setBulkImportError("Workspace is required");

    setBulkImporting(true);
    try {
      const body = buildBody({ format: bulkFormat, content: bulkContent });
      if (apiBasePath === BREWERY_RECIPES_API_BASE) {
        const data = await importRecipesBulk(webBreweryApiClient(), body);
        setBulkResult({
          created: data.created as BulkCreatedItem[],
          failed: data.failed as BulkFailedItem[],
        });
      } else if (apiBasePath.includes("platform")) {
        const data = await importPlatformRecipesBulk(webPlatformApiClient(), body);
        setBulkResult({
          created: data.created as BulkCreatedItem[],
          failed: data.failed as BulkFailedItem[],
        });
      } else {
        throw new Error(`Unsupported apiBasePath for bulk import: ${apiBasePath}`);
      }
    } catch (err) {
      setBulkImportError(facadeErrorMessage(err));
    } finally {
      setBulkImporting(false);
    }
  };

  const resetSinglePreview = () => {
    setPreview(null);
    setPreviewError(null);
    setImportError(null);
  };

  const resetBulkPreview = () => {
    setBulkPreviewItems(null);
    setBulkPreviewError(null);
    setBulkImportError(null);
    setBulkResult(null);
  };

  const canPreview = canCall && Boolean(content.trim()) && Boolean(format) && !previewLoading;
  const canImport = canCall && Boolean(preview) && Boolean(styleKey.trim()) && !importing;
  const formatLabel = format === "beerjson" ? t("formatBeerJson") : format === "beerxml" ? t("formatBeerXml") : "";
  const dash = t("dash");

  const canBulkPreview = canCall && Boolean(bulkContent.trim()) && Boolean(bulkFormat) && !bulkPreviewLoading;
  const canBulkImport = canCall && Boolean(bulkPreviewItems) && !bulkImporting;
  const bulkFormatLabel =
    bulkFormat === "beerjson" ? t("formatBeerJson") : bulkFormat === "beerxml" ? t("formatBeerXml") : "";

  return {
    t,
    tDash,
    c,
    canCall,
    fileName,
    content,
    formatOverride,
    setFormatOverride,
    format,
    styles,
    stylesLoading,
    stylesError,
    styleKey,
    setStyleKey,
    previewLoading,
    previewError,
    preview,
    importing,
    importError,
    bulkFileName,
    bulkContent,
    bulkFormatOverride,
    setBulkFormatOverride,
    bulkFormat,
    bulkPreviewLoading,
    bulkPreviewError,
    bulkPreviewItems,
    bulkImporting,
    bulkImportError,
    bulkResult,
    openSections,
    setOpenSections,
    onPickFile,
    onPickBulkFile,
    onPreview,
    onBulkPreview,
    onImport,
    onBulkImport,
    resetSinglePreview,
    resetBulkPreview,
    canPreview,
    canImport,
    formatLabel,
    dash,
    canBulkPreview,
    canBulkImport,
    bulkFormatLabel,
  };
}

export type UseRecipeImportFormModel = ReturnType<typeof useRecipeImportForm>;
