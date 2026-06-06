"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { listStyles } from "@umbraculum/api-client/brewery";

import { webBreweryApiClient } from "../../../_lib/breweryWaterClient";
import {
  BREWERY_RECIPES_API_BASE,
  type BulkPreviewItem,
  type ImportFormat,
  type RecipeImportBulkResult,
  type RecipeImportFormProps,
  type RecipeImportPreview,
  type StyleListItem,
} from "../_lib/recipeImportTypes";

export function useRecipeImportFormState({
  apiBasePath,
  canCall,
}: Pick<RecipeImportFormProps, "apiBasePath" | "canCall">) {
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
    fileName,
    setFileName,
    content,
    setContent,
    formatOverride,
    setFormatOverride,
    format,
    styles,
    stylesLoading,
    stylesError,
    styleKey,
    setStyleKey,
    previewLoading,
    setPreviewLoading,
    previewError,
    setPreviewError,
    preview,
    setPreview,
    importing,
    setImporting,
    importError,
    setImportError,
    bulkFileName,
    setBulkFileName,
    bulkContent,
    setBulkContent,
    bulkFormatOverride,
    setBulkFormatOverride,
    bulkFormat,
    bulkPreviewLoading,
    setBulkPreviewLoading,
    bulkPreviewError,
    setBulkPreviewError,
    bulkPreviewItems,
    setBulkPreviewItems,
    bulkImporting,
    setBulkImporting,
    bulkImportError,
    setBulkImportError,
    bulkResult,
    setBulkResult,
    openSections,
    setOpenSections,
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

export type RecipeImportFormState = ReturnType<typeof useRecipeImportFormState>;
