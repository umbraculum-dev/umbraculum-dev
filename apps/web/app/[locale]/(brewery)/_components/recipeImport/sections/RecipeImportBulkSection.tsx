"use client";

import { Link } from "../../../../../../src/i18n/navigation";
import { Button, H3, SizableText, View, XStack, YStack } from "tamagui";

import { BrewSelect } from "../../BrewSelect";
import { BrewAccordionSection } from "../../BrewAccordionSection";
import { ErrorBox, RecipeEditFieldLabel } from "../../recipe-edit";
import type { ImportFormat, ImportWarning } from "../_lib/recipeImportTypes";
import { isFileTooLargeError } from "../_lib/recipeImportTypes";
import type { UseRecipeImportFormModel } from "../_hooks/useRecipeImportForm";
import { RecipeImportLegendBox } from "../RecipeImportLegendBox";

export function RecipeImportBulkSection({ model }: { model: UseRecipeImportFormModel }) {
  const {
    t,
    canCall,
    bulkFileName,
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
    onPickBulkFile,
    onBulkPreview,
    onBulkImport,
    resetBulkPreview,
    canBulkPreview,
    canBulkImport,
    bulkFormatLabel,
    dash,
  } = model;

  return (
    <BrewAccordionSection
      value="bulk"
      headingId="import-bulk-heading"
      title={t("bulkHeading")}
      open={openSections.includes("bulk")}
      spaced
    >
      <RecipeImportLegendBox model={model} subtitle={t("bulkSubtitle")}>
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0} mb={0}>
          {t("bulkStyleRule")}
        </SizableText>
      </RecipeImportLegendBox>

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
          onPress={resetBulkPreview}
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
  );
}
