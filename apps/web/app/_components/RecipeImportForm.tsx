"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { Accordion, Button, H3, SizableText, View, XStack, YStack } from "tamagui";

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

import { Link } from "../../src/i18n/navigation";
import { webBreweryApiClient } from "../_lib/breweryWaterClient";
import { webPlatformApiClient } from "../_lib/webApiClient";
import { BrewSelect } from "./BrewSelect";
import { ErrorBox, RecipeEditFieldLabel } from "./recipe-edit";
import { ImportExportPanel } from "./ImportExportPanel";
import { BrewAccordionSection } from "./BrewAccordionSection";

const RECIPES_IMPORT_SINGLE_MAX_BYTES = 1 * 1024 * 1024;
const RECIPES_IMPORT_BULK_MAX_BYTES = 5 * 1024 * 1024;

type ImportFormat = "beerjson" | "beerxml";

type StyleListItem = { key: string; name: string; code: string; sortOrder: number };

type ImportWarning = { code?: unknown; message?: unknown };

type BulkPreviewItem = {
  index?: number;
  name?: string;
  resolvedStyleCode?: string;
  resolvedStyleName?: string;
  warnings?: ImportWarning[];
};

type BulkCreatedItem = {
  recipeId: string;
  name?: string;
  style?: string;
};

type BulkFailedItem = {
  index?: number;
  name?: string;
  error?: string;
};

function apiErrorMessage(resData: unknown): string {
  const errData = resData as { error?: { code?: string; message?: string } } | undefined;
  return (
    errData?.error?.message ??
    (typeof resData === "string" ? resData : JSON.stringify(resData))
  );
}

function facadeErrorMessage(err: unknown): string {
  if (err instanceof ApiClientError) return apiErrorMessage(err.body);
  return String(err);
}

const BREWERY_RECIPES_API_BASE = "/api/recipes";

function isFileTooLargeError(msg: string | null): boolean {
  if (!msg) return false;
  const lower = msg.toLowerCase();
  return lower.includes("file too large") || lower.includes("file troppo grande");
}

export interface RecipeImportFormProps {
  apiBasePath: string;
  workspaceId?: string | null;
  accountId?: string | null;
  canCall: boolean;
  onSingleImportSuccess?: (recipeId: string) => void;
  showImportExportPanel?: boolean;
}

export function RecipeImportForm({
  apiBasePath,
  workspaceId,
  accountId,
  canCall,
  onSingleImportSuccess,
  showImportExportPanel = true,
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
  const [preview, setPreview] = useState<{ name: string; notes: string | null; warnings: ImportWarning[] } | null>(null);

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
  const [bulkResult, setBulkResult] = useState<{ created: BulkCreatedItem[]; failed: BulkFailedItem[] } | null>(null);

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
    if (effectiveWorkspaceId) body['workspaceId'] = effectiveWorkspaceId;
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

  const canPreview = canCall && Boolean(content.trim()) && Boolean(format) && !previewLoading;
  const canImport = canCall && Boolean(preview) && Boolean(styleKey.trim()) && !importing;
  const formatLabel = format === "beerjson" ? t("formatBeerJson") : format === "beerxml" ? t("formatBeerXml") : "";
  const dash = t("dash");

  const canBulkPreview = canCall && Boolean(bulkContent.trim()) && Boolean(bulkFormat) && !bulkPreviewLoading;
  const canBulkImport = canCall && Boolean(bulkPreviewItems) && !bulkImporting;
  const bulkFormatLabel = bulkFormat === "beerjson" ? t("formatBeerJson") : bulkFormat === "beerxml" ? t("formatBeerXml") : "";

  const LegendBox = (props: { subtitle: string; children?: React.ReactNode }) => (
    <View className="brew-field-block brew-field-block--readonly" mt="$2.5" mb="$4">
      <View className="brew-field-block-header">
        <SizableText size="$2" fontWeight="bold" fontFamily="$body">
          {t("legendTitle")}
        </SizableText>
      </View>
      <YStack gap="$2">
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0} mb={0}>
          {props.subtitle}
        </SizableText>
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0} mb={0}>
          {t("unitsNote")}
        </SizableText>
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0} mb={0}>
          {t("customImportNote")} <Link href="/contact">{t("customImportCta")}</Link>
        </SizableText>
        {props.children ? <View mt="$2">{props.children}</View> : null}
      </YStack>
    </View>
  );

  return (
    <>
      <YStack gap="$0">
        <Accordion
          type="multiple"
          value={openSections}
          onValueChange={(next) => setOpenSections(Array.isArray(next) ? next : next ? [next] : [])}
        >
          <BrewAccordionSection
            value="single"
            headingId="import-single-heading"
            title={t("singleHeading")}
            open={openSections.includes("single")}
          >
            <LegendBox subtitle={t("singleSubtitle")} />

            <RecipeEditFieldLabel htmlFor="import-file">{t("fileLabel")}</RecipeEditFieldLabel>
            <input
              id="import-file"
              type="file"
              accept=".json,.xml,application/json,text/xml,application/xml"
              onChange={(e) => void onPickFile(e.target.files?.[0] ?? null)}
              disabled={!canCall}
              aria-describedby="import-file-help"
            />
            <SizableText id="import-file-help" size="$2" color="var(--text-muted)" fontFamily="$body" mt="$1.5" mb="$3" display="block">
              {fileName ? t("filePicked", { name: fileName }) : t("fileNotPicked")}
            </SizableText>

            <XStack gap="$3" flexWrap="wrap" ai="flex-end">
              <View flex={1} minWidth={200}>
                <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="import-format">{t("formatLabel")}</RecipeEditFieldLabel>
                  <BrewSelect
                    id="import-format"
                    value={formatOverride}
                    onValueChange={(v) => setFormatOverride(v as "" | ImportFormat)}
                    options={[
                      { value: "", label: t("formatAuto") },
                      { value: "beerjson", label: t("formatBeerJson") },
                      { value: "beerxml", label: t("formatBeerXml") },
                    ]}
                    disabled={!canCall}
                    width="full"
                  />
                  <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$1.5">
                    {format ? t("formatResolved", { format: formatLabel }) : t("formatNotResolved")}
                  </SizableText>
                </YStack>
              </View>
              <View flex={1} minWidth={200}>
                <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="import-style">{t("styleLabel")}</RecipeEditFieldLabel>
                  <BrewSelect
                    id="import-style"
                    value={styleKey}
                    onValueChange={setStyleKey}
                    options={styles.map((s) => ({
                      value: s.key,
                      label: s.key === "custom" ? s.name : `${s.code} — ${s.name}`,
                    }))}
                    disabled={!canCall || stylesLoading || styles.length === 0}
                    width="full"
                  />
                  {stylesError ? (
                    <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$1.5">
                      {String(stylesError)}
                    </SizableText>
                  ) : null}
                </YStack>
              </View>
            </XStack>

            <XStack gap="$3" mt="$3" alignItems="center" flexWrap="wrap">
              <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onPreview()} disabled={!canPreview}>
                {previewLoading ? t("previewing") : t("preview")}
              </Button>
              <Button
                size="$3"
                bg="var(--surface-2)"
                borderWidth={1}
                borderColor="var(--border)"
                color="var(--text)"
                onPress={() => {
                  setPreview(null);
                  setPreviewError(null);
                  setImportError(null);
                }}
                disabled={!canCall || (!preview && !previewError && !importError)}
              >
                {t("reset")}
              </Button>
              <Link href="/recipes">{t("backToRecipes")}</Link>
              <Link href="/">{c("backToDashboard")}</Link>
            </XStack>

            {previewError ? (
              <>
                <ErrorBox mt="$3">{previewError}</ErrorBox>
                {isFileTooLargeError(previewError) ? (
                  <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2" mb={0}>
                    {t("errors.fileTooLargeHelp")}
                  </SizableText>
                ) : null}
              </>
            ) : null}

            {preview ? (
              <View className="brew-panel brew-section" aria-labelledby="import-preview-heading">
                <H3 id="import-preview-heading" mt={0} mb="$2">
                  {t("previewHeading")}
                </H3>

                <View className="brew-table-wrap">
                  <table className="brew-table">
                    <tbody>
                      <tr>
                        <td className="brew-preview-label">
                          <SizableText size="$2" fontWeight="bold" fontFamily="$body">
                            {t("previewNameLabel")}
                          </SizableText>
                        </td>
                        <td>
                          <code>{preview.name || dash}</code>
                        </td>
                      </tr>
                      <tr>
                        <td className="brew-preview-label">
                          <SizableText size="$2" fontWeight="bold" fontFamily="$body">
                            {t("previewNotesLabel")}
                          </SizableText>
                        </td>
                        <td>
                          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                            {preview.notes ? preview.notes : dash}
                          </SizableText>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </View>

                <H3 mt="$4" mb="$1.5">
                  {t("warningsHeading")}
                </H3>
                {preview.warnings.length ? (
                  <ul className="brew-recipe-edit-list-disc brew-list-mt0">
                    {preview.warnings.map((w, idx) => (
                      <li key={`${String(w?.code ?? "warn")}-${idx}`}>
                        <SizableText size="$2" fontFamily="$body">
                          <code>{typeof w?.code === "string" ? w.code : t("unknownWarningCode")}</code>{" "}
                          <SizableText color="var(--text-muted)">{typeof w?.message === "string" ? w.message : ""}</SizableText>
                        </SizableText>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
                    {t("noWarnings")}
                  </SizableText>
                )}

                <XStack gap="$3" mt="$3" alignItems="center" flexWrap="wrap">
                  <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onImport()} disabled={!canImport}>
                    {importing ? t("importing") : t("import")}
                  </Button>
                  {importError ? (
                    <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" aria-live="polite">
                      {importError}
                    </SizableText>
                  ) : null}
                </XStack>
                {importError ? (
                  <>
                    <ErrorBox mt="$3">{importError}</ErrorBox>
                    {isFileTooLargeError(importError) ? (
                      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2" mb={0}>
                        {t("errors.fileTooLargeHelp")}
                      </SizableText>
                    ) : null}
                  </>
                ) : null}
              </View>
            ) : null}
          </BrewAccordionSection>

          <BrewAccordionSection
            value="bulk"
            headingId="import-bulk-heading"
            title={t("bulkHeading")}
            open={openSections.includes("bulk")}
            spaced
          >
        <LegendBox subtitle={t("bulkSubtitle")}>
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0} mb={0}>
            {t("bulkStyleRule")}
          </SizableText>
        </LegendBox>

        <RecipeEditFieldLabel htmlFor="bulk-import-file">{t("fileLabel")}</RecipeEditFieldLabel>
        <input
          id="bulk-import-file"
          type="file"
          accept=".json,.xml,application/json,text/xml,application/xml"
          onChange={(e) => void onPickBulkFile(e.target.files?.[0] ?? null)}
          disabled={!canCall}
          aria-describedby="bulk-import-file-help"
        />
        <SizableText id="bulk-import-file-help" size="$2" color="var(--text-muted)" fontFamily="$body" mt="$1.5" mb="$3" display="block">
          {bulkFileName ? t("filePicked", { name: bulkFileName }) : t("fileNotPicked")}
        </SizableText>

        <YStack gap="$1.5" mt="$3">
          <RecipeEditFieldLabel htmlFor="bulk-import-format">{t("formatLabel")}</RecipeEditFieldLabel>
          <BrewSelect
            id="bulk-import-format"
            value={bulkFormatOverride}
            onValueChange={(v) => setBulkFormatOverride(v as "" | ImportFormat)}
            options={[
              { value: "", label: t("formatAuto") },
              { value: "beerjson", label: t("formatBeerJson") },
              { value: "beerxml", label: t("formatBeerXml") },
            ]}
            disabled={!canCall}
            width="full"
          />
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$1.5">
            {bulkFormat ? t("formatResolved", { format: bulkFormatLabel }) : t("formatNotResolved")}
          </SizableText>
        </YStack>

        <XStack gap="$3" mt="$3" alignItems="center" flexWrap="wrap">
          <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onBulkPreview()} disabled={!canBulkPreview}>
            {bulkPreviewLoading ? t("previewing") : t("preview")}
          </Button>
          <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onBulkImport()} disabled={!canBulkImport}>
            {bulkImporting ? t("importing") : t("import")}
          </Button>
          <Button
            size="$3"
            bg="var(--surface-2)"
            borderWidth={1}
            borderColor="var(--border)"
            color="var(--text)"
            onPress={() => {
              setBulkPreviewItems(null);
              setBulkPreviewError(null);
              setBulkImportError(null);
              setBulkResult(null);
            }}
            disabled={!canCall || (!bulkPreviewItems && !bulkPreviewError && !bulkImportError && !bulkResult)}
          >
            {t("reset")}
          </Button>
        </XStack>

        {bulkPreviewError ? (
          <>
            <ErrorBox mt="$3">{bulkPreviewError}</ErrorBox>
            {isFileTooLargeError(bulkPreviewError) ? (
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2" mb={0}>
                {t("errors.fileTooLargeHelp")}
              </SizableText>
            ) : null}
          </>
        ) : null}
        {bulkImportError ? (
          <>
            <ErrorBox mt="$3">{bulkImportError}</ErrorBox>
            {isFileTooLargeError(bulkImportError) ? (
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2" mb={0}>
                {t("errors.fileTooLargeHelp")}
              </SizableText>
            ) : null}
          </>
        ) : null}

        {bulkPreviewItems ? (
          <View mt="$3">
            <H3 mb="$1.5">{t("bulkPreviewHeading")}</H3>
            <ul className="brew-recipe-edit-list-disc brew-list-mt0">
              {bulkPreviewItems.map((it) => (
                <li key={String(it?.index ?? Math.random())} className="brew-list-item-mb">
                  <SizableText size="$2" fontFamily="$body">
                    <SizableText fontWeight="bold">{String(it?.name ?? dash)}</SizableText>
                    <SizableText color="var(--text-muted)">
                      {" "}({t("resolvedStyleLabel")}:{" "}
                      <code>{String(it?.resolvedStyleCode ?? t("customStyleCode"))}</code>{" "}
                      {String(it?.resolvedStyleName ?? t("customStyleName"))})
                    </SizableText>
                  </SizableText>
                  {Array.isArray(it?.warnings) && it.warnings.length ? (
                    <ul className="brew-recipe-edit-list-disc brew-list-mt1">
                      {it.warnings.map((w: ImportWarning, idx: number) => (
                        <li key={`${String(w?.code ?? "warn")}-${idx}`}>
                          <SizableText size="$2" fontFamily="$body">
                            <code>{typeof w?.code === "string" ? w.code : t("unknownWarningCode")}</code>{" "}
                            <SizableText color="var(--text-muted)">{typeof w?.message === "string" ? w.message : ""}</SizableText>
                          </SizableText>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </View>
        ) : null}

        {bulkResult ? (
          <YStack gap="$3" mt="$3">
            <View className="brew-field-block brew-field-block--computed">
              <View className="brew-field-block-header">
                <SizableText size="$2" fontWeight="bold" fontFamily="$body">
                  {t("bulkCreatedHeading")}
                </SizableText>
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                  {t("bulkCreatedCount", { count: bulkResult.created.length })}
                </SizableText>
              </View>
              {bulkResult.created.length ? (
                <ul className="brew-recipe-edit-list-disc brew-list-mt0">
                  {bulkResult.created.map((x) => (
                    <li key={String(x?.recipeId ?? Math.random())}>
                      <SizableText size="$2" fontFamily="$body">
                        <Link href={`/recipes/${String(x.recipeId)}/edit`}>{String(x?.name ?? "") || dash}</Link>
                        <SizableText color="var(--text-muted)"> ({String(x?.style ?? t("customStyleName"))})</SizableText>
                      </SizableText>
                    </li>
                  ))}
                </ul>
              ) : (
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
                  {t("bulkNoneCreated")}
                </SizableText>
              )}
            </View>

            {bulkResult.failed.length ? (
              <ErrorBox>
                {t("bulkFailedHeading")}{"\n"}
                {bulkResult.failed.map((f) => `#${String(f?.index ?? "?")}: ${String(f?.name ?? "")} — ${String(f?.error ?? "")}`).join("\n")}
              </ErrorBox>
            ) : null}
          </YStack>
        ) : null}
          </BrewAccordionSection>

          {showImportExportPanel ? (
            <BrewAccordionSection
              value="importExport"
              headingId="import-export-panel-heading"
              title={tDash("importExport.title")}
              open={openSections.includes("importExport")}
              spaced
            >
              <ImportExportPanel headingId="import-export-panel-heading-inner" className="" variant="content" />
            </BrewAccordionSection>
          ) : null}
        </Accordion>
      </YStack>
    </>
  );
}
