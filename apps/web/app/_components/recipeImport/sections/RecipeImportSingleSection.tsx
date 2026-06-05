"use client";

import { Link } from "../../../../src/i18n/navigation";
import { Button, H3, SizableText, View, XStack, YStack } from "tamagui";

import { BrewSelect } from "../../BrewSelect";
import { BrewAccordionSection } from "../../BrewAccordionSection";
import { ErrorBox, RecipeEditFieldLabel } from "../../recipe-edit";
import type { ImportFormat } from "../_lib/recipeImportTypes";
import { isFileTooLargeError } from "../_lib/recipeImportTypes";
import type { UseRecipeImportFormModel } from "../_hooks/useRecipeImportForm";
import { RecipeImportLegendBox } from "../RecipeImportLegendBox";

export function RecipeImportSingleSection({ model }: { model: UseRecipeImportFormModel }) {
  const {
    t,
    c,
    canCall,
    fileName,
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
    openSections,
    onPickFile,
    onPreview,
    onImport,
    resetSinglePreview,
    canPreview,
    canImport,
    formatLabel,
    dash,
  } = model;

  return (
    <BrewAccordionSection
      value="single"
      headingId="import-single-heading"
      title={t("singleHeading")}
      open={openSections.includes("single")}
    >
      <RecipeImportLegendBox model={model} subtitle={t("singleSubtitle")} />

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
          onPress={resetSinglePreview}
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
  );
}
