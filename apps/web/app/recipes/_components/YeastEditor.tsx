"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "../../../src/i18n/navigation";
import { Button, Input, View, XStack, YStack } from "tamagui";
import { SizableText } from "tamagui";

import { BrewSelect } from "../../_components/BrewSelect";
import { MathHelpPopover } from "../../_components/MathHelpPopover";
import { apiFetch } from "../../_lib/apiClient";
import {
  ErrorBox,
  RecipeEditFieldLabel,
  RecipeEditIngredientCard,
  RecipeEditReadOnlyValue,
  RecipeEditSummary,
} from "../../_components/recipe-edit";
import {
  CELLS_PER_KG_DRY,
  CELLS_PER_L_LIQUID,
  CELLS_PER_L_SLURRY,
  computeAmountFromCellsB,
  computeEstimatedCellsB,
  PITCH_RATE_TO_MILLION_CELLS_PER_ML_P,
  YEAST_PITCH_RATE_OPTIONS,
  type EditorYeastRow,
  type YeastPitchRateKey,
} from "../_lib/beerjsonRecipe";
import { mathExplain } from "../[id]/edit/_lib/mathExplain";

function roundTo(n: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(n * factor) / factor;
}

type YeastEditorProps = {
  yeastRows: EditorYeastRow[];
  yeastAttenuationOverrides: Record<string, string>;
  /** Analysis result (for estimated cells). Yeast page only. */
  analysis?: unknown | null;
  /** Recipe ext JSON (for batchSizeLiters fallback). Yeast page only. */
  recipeExtJson?: unknown | null;
  /** Show math formulas (Estimated cells). Yeast page only. */
  surfaceMath?: boolean;
  readOnly: boolean;
  recipeId: string;
  onAddRow?: (row?: Partial<EditorYeastRow>) => void;
  onRemoveRow?: (id: string) => void;
  onUpdateRow?: (id: string, patch: Partial<EditorYeastRow>) => void;
  onAttenuationOverrideChange?: (id: string, value: string) => void;
  onSave?: () => void;
  canSave?: boolean;
  saving?: boolean;
  saveStatus?: string | null;
  canCallAccountScoped?: boolean;
  t: (key: string, values?: Record<string, string | number>) => string;
  tAnalysis: (key: string) => string;
  tUnits?: (key: string) => string;
  /** For locale-aware number formatting (e.g. Amount L/g). */
  locale?: string;
  formatFixed?: (locale: string, value: number, decimals: number) => string;
};

function newRowId(): string {
  try {
    return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  } catch {
    return `${Date.now()}-${Math.random()}`;
  }
}

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
  canCallAccountScoped = false,
  t,
  tAnalysis,
  tUnits = (k: string) => k,
  locale = "en",
  formatFixed: formatFixedProp,
}: YeastEditorProps) {
  const formatAmount = (value: number, decimals: number) =>
    formatFixedProp ? formatFixedProp(locale, value, decimals) : String(roundTo(value, decimals));
  const batchSizeLiters =
    recipeExtJson && typeof recipeExtJson === "object" && !Array.isArray(recipeExtJson)
      ? (recipeExtJson as any).batchSizeLiters
      : null;
  const analysisOg =
    analysis && typeof analysis === "object" && !Array.isArray(analysis)
      ? (analysis as any).result?.ogEstimatedSg
      : null;
  const analysisKettleVolume =
    analysis && typeof analysis === "object" && !Array.isArray(analysis)
      ? (analysis as any).result?.kettleVolumeLiters
      : null;
  const batchSizeForCells =
    typeof batchSizeLiters === "number" && Number.isFinite(batchSizeLiters) && batchSizeLiters > 0
      ? batchSizeLiters
      : typeof analysisKettleVolume === "number" && Number.isFinite(analysisKettleVolume) && analysisKettleVolume > 0
        ? analysisKettleVolume
        : null;

  if (readOnly) {
    return (
      <View>
        {yeastRows.length > 0 ? (
          <YStack gap="$3">
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mb={0}>
              {t("yeastPitchRateNote")}
            </SizableText>
            {yeastRows.map((r, idx) => (
              <RecipeEditIngredientCard key={r.id}>
                <XStack gap="$3" flexWrap="wrap" items="flex-end" flexDirection="row">
                  <View alignSelf="center">
                    <SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">
                      {idx + 1}
                    </SizableText>
                  </View>
                  <YStack gap="$1" flex={1} minW={200}>
                    <RecipeEditFieldLabel>{t("yeastNameLabel")}</RecipeEditFieldLabel>
                    <RecipeEditReadOnlyValue>{r.name}</RecipeEditReadOnlyValue>
                  </YStack>
                  {(r.lab ?? "") ? (
                    <YStack gap="$1" minW={120}>
                      <RecipeEditFieldLabel>Lab</RecipeEditFieldLabel>
                      <RecipeEditReadOnlyValue>{r.lab}</RecipeEditReadOnlyValue>
                    </YStack>
                  ) : null}
                  {(r.productId ?? "") ? (
                    <YStack gap="$1" minW={100}>
                      <RecipeEditFieldLabel>Product ID</RecipeEditFieldLabel>
                      <RecipeEditReadOnlyValue>{r.productId}</RecipeEditReadOnlyValue>
                    </YStack>
                  ) : null}
                  <YStack gap="$1" minW={100}>
                    <RecipeEditFieldLabel>Atten min (%)</RecipeEditFieldLabel>
                    <RecipeEditReadOnlyValue>
                      {typeof r.attenuationMin === "number" ? roundTo(r.attenuationMin, 3) : ""}
                    </RecipeEditReadOnlyValue>
                  </YStack>
                  <YStack gap="$1" minW={100}>
                    <RecipeEditFieldLabel>Atten max (%)</RecipeEditFieldLabel>
                    <RecipeEditReadOnlyValue>
                      {typeof r.attenuationMax === "number" ? roundTo(r.attenuationMax, 3) : ""}
                    </RecipeEditReadOnlyValue>
                  </YStack>
                  {yeastAttenuationOverrides[r.id]?.trim() ? (
                    <YStack gap="$1" minW={100}>
                      <RecipeEditFieldLabel>{tAnalysis("customAttenuationPercentLabel")}</RecipeEditFieldLabel>
                      <RecipeEditReadOnlyValue>{yeastAttenuationOverrides[r.id]}</RecipeEditReadOnlyValue>
                    </YStack>
                  ) : null}
                  <YStack gap="$1" minW={100}>
                    <RecipeEditFieldLabel>{t("yeastFermentationTempLabel", { unit: tUnits("C") })}</RecipeEditFieldLabel>
                    <RecipeEditReadOnlyValue>
                      {r.fermentationTempC != null && Number.isFinite(r.fermentationTempC)
                        ? roundTo(r.fermentationTempC, 1)
                        : "—"}
                    </RecipeEditReadOnlyValue>
                  </YStack>
                  <YStack gap="$1" minW={100}>
                    <RecipeEditFieldLabel>{t("yeastDiacetylRestLabel")}</RecipeEditFieldLabel>
                    <RecipeEditReadOnlyValue>
                      {r.diacetylRest === "yes" ? t("yeastDiacetylRestYes") : r.diacetylRest === "no" ? t("yeastDiacetylRestNo") : "—"}
                    </RecipeEditReadOnlyValue>
                  </YStack>
                  <YStack gap="$1" minW={100}>
                    <RecipeEditFieldLabel>
                      {t("yeastAmountLabel", { unit: r.format === "dry" ? tUnits("kg") : tUnits("L") })}
                    </RecipeEditFieldLabel>
                    <RecipeEditReadOnlyValue>
                      {r.format === "dry"
                        ? r.amountKg != null && Number.isFinite(r.amountKg)
                          ? formatAmount(r.amountKg, 3)
                          : "—"
                        : r.amountL != null && Number.isFinite(r.amountL)
                          ? formatAmount(r.amountL, 2)
                          : "—"}
                    </RecipeEditReadOnlyValue>
                  </YStack>
                  <YStack gap="$1" minW={100}>
                    <RecipeEditFieldLabel>{t("yeastOxygenationLabel")}</RecipeEditFieldLabel>
                    <RecipeEditReadOnlyValue>
                      {r.oxygenation === "yes" ? t("yeastOxygenationYes") : r.oxygenation === "no" ? t("yeastOxygenationNo") : "—"}
                    </RecipeEditReadOnlyValue>
                  </YStack>
                </XStack>

                <View flexBasis="100%" w="100%" mt="$2">
                  <details>
                    <RecipeEditSummary>
                      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                        {t("yeastAdvancedSubsectionHeading")}
                      </SizableText>
                    </RecipeEditSummary>
                    {!readOnly ? (
                      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2" mb="$2">
                        {t("yeastPitchRateAmountNote")}
                      </SizableText>
                    ) : null}
                    <XStack gap="$3" flexWrap="wrap" items="flex-end" mt="$2">
                      <YStack gap="$1" minW={220}>
                        <RecipeEditFieldLabel>{t("yeastPitchRateLabel")}</RecipeEditFieldLabel>
                        <RecipeEditReadOnlyValue>
                          {r.pitchRate && YEAST_PITCH_RATE_OPTIONS.find((o) => o.value === r.pitchRate)?.labelKey
                            ? t(YEAST_PITCH_RATE_OPTIONS.find((o) => o.value === r.pitchRate)!.labelKey)
                            : r.pitchRate
                              ? String(r.pitchRate)
                              : "—"}
                        </RecipeEditReadOnlyValue>
                      </YStack>
                      <YStack gap="$1" minW={140}>
                        <RecipeEditFieldLabel>{t("yeastFormatLabel")}</RecipeEditFieldLabel>
                        <RecipeEditReadOnlyValue>
                          {r.format === "dry" ? t("yeastFormatDry") : r.format === "liquid" ? t("yeastFormatLiquid") : r.format === "slurry" ? t("yeastFormatSlurry") : "—"}
                        </RecipeEditReadOnlyValue>
                      </YStack>
                      <YStack gap="$1" minW={180}>
                        <RecipeEditFieldLabel>{t("yeastSpeciesLabel")}</RecipeEditFieldLabel>
                        <RecipeEditReadOnlyValue>
                          {r.species === "saccharomyces_cerevisiae"
                            ? t("yeastSpeciesSaccharomycesCerevisiae")
                            : r.species === "saccharomyces_pastorianus"
                              ? t("yeastSpeciesSaccharomycesPastorianus")
                              : r.species === "brettanomyces"
                                ? t("yeastSpeciesBrettanomyces")
                                : r.species === "diastaticus"
                                  ? t("yeastSpeciesDiastaticus")
                                  : r.species === "other"
                                    ? t("yeastSpeciesOther")
                                    : "—"}
                        </RecipeEditReadOnlyValue>
                      </YStack>
                      <YStack gap="$1" minW={140}>
                        <RecipeEditFieldLabel>{t("yeastNeedsPropagationLabel")}</RecipeEditFieldLabel>
                        <RecipeEditReadOnlyValue>
                          {r.needsPropagation === "yes" ? t("yeastNeedsPropagationYes") : r.needsPropagation === "no" ? t("yeastNeedsPropagationNo") : "—"}
                        </RecipeEditReadOnlyValue>
                      </YStack>
                    </XStack>
                  </details>
                </View>
              </RecipeEditIngredientCard>
            ))}
            {recipeId ? (
              <SizableText size="$2" mt="$3" mb={0}>
                <Link href={`/recipes/${recipeId}/yeast`}>
                  {t("yeastEditInYeastPage")}
                </Link>
              </SizableText>
            ) : null}
          </YStack>
        ) : (
          <SizableText size="$2" color="$gray10">
            {t("yeastEmpty")}
            {recipeId ? (
              <>
                {" · "}
                <Link href={`/recipes/${recipeId}/yeast`}>
                  {t("yeastEditInYeastPage")}
                </Link>
              </>
            ) : null}
          </SizableText>
        )}
      </View>
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
      canCallAccountScoped={canCallAccountScoped}
      t={t}
      tAnalysis={tAnalysis}
      tUnits={tUnits}
      formatAmount={formatAmount}
    />
  );
}

type YeastEditorEditableProps = {
  yeastRows: EditorYeastRow[];
  yeastAttenuationOverrides: Record<string, string>;
  batchSizeForCells: number | null;
  analysisOg: number | null | undefined;
  surfaceMath?: boolean;
  recipeId: string;
  onAddRow: (row?: Partial<EditorYeastRow>) => void;
  onRemoveRow: (id: string) => void;
  onUpdateRow: (id: string, patch: Partial<EditorYeastRow>) => void;
  onAttenuationOverrideChange: (id: string, value: string) => void;
  onSave: () => void;
  canSave: boolean;
  saving: boolean;
  saveStatus: string | null;
  canCallAccountScoped: boolean;
  t: (key: string, values?: Record<string, string | number>) => string;
  tAnalysis: (key: string) => string;
  tUnits: (key: string) => string;
  formatAmount: (value: number, decimals: number) => string;
};

function YeastEditorEditable({
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
  canSave,
  saving,
  saveStatus,
  canCallAccountScoped,
  t,
  tAnalysis,
  tUnits,
  formatAmount,
}: YeastEditorEditableProps) {
  const tMath = useTranslations("math");
  const [yeastQuery, setYeastQuery] = useState("");
  const [yeastResults, setYeastResults] = useState<any[]>([]);
  const [yeastSearching, setYeastSearching] = useState(false);
  const [yeastSearchError, setYeastSearchError] = useState<string | null>(null);

  const onSearchYeasts = async (e: React.FormEvent) => {
    e.preventDefault();
    setYeastSearchError(null);
    setYeastSearching(true);
    try {
      const res = await apiFetch(`/api/ingredients/yeasts?query=${encodeURIComponent(yeastQuery)}`);
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      const items = (res.data as any)?.items;
      setYeastResults(Array.isArray(items) ? items : []);
    } catch (err) {
      setYeastSearchError(String(err));
      setYeastResults([]);
    } finally {
      setYeastSearching(false);
    }
  };

  const clearYeastSearchResults = () => {
    setYeastSearchError(null);
    setYeastResults([]);
  };

  const addYeastFromDb = (item: any) => {
    const id = typeof item?.id === "string" ? item.id : null;
    const nameRaw = typeof item?.name === "string" ? item.name : "";
    if (!id || !nameRaw) return;
    const lab = typeof item?.lab === "string" ? item.lab : null;
    const productId = typeof item?.productId === "string" ? item.productId : null;
    const attenuationMin =
      typeof item?.attenuationMin === "number" && Number.isFinite(item.attenuationMin) ? item.attenuationMin : null;
    const attenuationMax =
      typeof item?.attenuationMax === "number" && Number.isFinite(item.attenuationMax) ? item.attenuationMax : null;
    onAddRow({ ingredientId: id, name: nameRaw, lab, productId, attenuationMin, attenuationMax });
  };

  const addYeastRow = () => {
    onAddRow();
  };

  useEffect(() => {
    for (const r of yeastRows) {
      const format = r.format === "dry" || r.format === "liquid" || r.format === "slurry" ? r.format : null;
      const pitchRateValid = r.pitchRate && r.pitchRate in PITCH_RATE_TO_MILLION_CELLS_PER_ML_P;
      if (!format || !pitchRateValid || batchSizeForCells == null || analysisOg == null) continue;
      const cellsB = computeEstimatedCellsB(
        batchSizeForCells,
        analysisOg,
        r.pitchRate as YeastPitchRateKey,
      );
      if (cellsB == null) continue;
      const { amountL, amountKg } = computeAmountFromCellsB(
        cellsB,
        format,
        r.cellsPerLOverride,
        r.cellsPerKGOverride,
      );
      if (format === "dry" && amountKg != null) {
        const curr = r.amountKg != null && Number.isFinite(r.amountKg) ? r.amountKg : null;
        if (curr == null || Math.abs(curr - amountKg) > 0.0001) onUpdateRow(r.id, { amountKg });
      } else if (amountL != null) {
        const curr = r.amountL != null && Number.isFinite(r.amountL) ? r.amountL : null;
        if (curr == null || Math.abs(curr - amountL) > 0.0001) onUpdateRow(r.id, { amountL });
      }
    }
  }, [yeastRows, batchSizeForCells, analysisOg, onUpdateRow]);

  return (
    <View>
      <form onSubmit={onSearchYeasts}>
        <RecipeEditFieldLabel htmlFor="yeast-search">{t("yeastSearchLabel")}</RecipeEditFieldLabel>
        <XStack gap="$2" items="center" flexWrap="wrap" mt="$1">
          <Input
            id="yeast-search"
            value={yeastQuery}
            onChangeText={setYeastQuery}
            flex={1}
            minW={200}
            autoComplete="off"
            size="$3"
            w="100%"
            bg="var(--surface)"
            borderWidth={1}
            borderColor="var(--border)"
            rounded="$2"
            fontFamily="$body"
          />
          <Button
            type="submit"
            disabled={!canCallAccountScoped || yeastSearching}
            size="$3"
            bg="var(--surface-2)"
            borderWidth={1}
            borderColor="var(--border)"
            color="var(--text)"
            fontFamily="$body"
          >
            {yeastSearching ? "Searching…" : "Search"}
          </Button>
          <Button
            size="$3"
            bg="var(--surface-2)"
            borderWidth={1}
            borderColor="var(--border)"
            color="var(--text)"
            fontFamily="$body"
            onPress={clearYeastSearchResults}
            disabled={yeastSearching || (!yeastSearchError && yeastResults.length === 0)}
          >
            {t("buttons.clear")}
          </Button>
        </XStack>
        {yeastSearchError ? <ErrorBox mt="$2">{yeastSearchError}</ErrorBox> : null}
        {yeastResults.length ? (
          <View overflowX="auto" mt="$2">
            <YStack gap="$1">
              <XStack gap="$2" ai="center" minW="max-content">
                <View minW={180}>
                  <SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">
                    Name
                  </SizableText>
                </View>
                <View minW={100}>
                  <SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">
                    Lab
                  </SizableText>
                </View>
                <View minW={100}>
                  <SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">
                    Product ID
                  </SizableText>
                </View>
                <View minW={80}>
                  <SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">
                    {t("yeastFormatLabel")}
                  </SizableText>
                </View>
                <View minW={60} />
              </XStack>
              {yeastResults.slice(0, 20).map((it) => (
                <XStack key={it.id} gap="$2" ai="center" minW="max-content">
                  <View minW={180}>
                    <SizableText size="$2" fontFamily="$body" color="var(--text)">
                      {it.name}
                    </SizableText>
                  </View>
                  <View minW={100}>
                    <SizableText size="$2" fontFamily="$body" color="var(--text)">
                      {it.lab ?? ""}
                    </SizableText>
                  </View>
                  <View minW={100}>
                    <SizableText size="$2" fontFamily="$body" color="var(--text)">
                      {it.productId ?? ""}
                    </SizableText>
                  </View>
                  <View minW={80}>
                    <SizableText size="$2" fontFamily="$body" color="var(--text)">
                      {it.type ?? ""}
                    </SizableText>
                  </View>
                  <View minW={60}>
                    <Button
                      size="$2"
                      bg="var(--surface-2)"
                      borderWidth={1}
                      borderColor="var(--border)"
                      color="var(--text)"
                      fontFamily="$body"
                      onPress={() => addYeastFromDb(it)}
                      disabled={!canCallAccountScoped}
                    >
                      Add
                    </Button>
                  </View>
                </XStack>
              ))}
            </YStack>
          </View>
        ) : null}
      </form>

      <View borderTopWidth={1} borderColor="var(--border)" my="$3" />

      <XStack gap="$3" items="center" flexWrap="wrap">
        <Button
          size="$3"
          bg="var(--surface-2)"
          borderWidth={1}
          borderColor="var(--border)"
          color="var(--text)"
          fontFamily="$body"
          onPress={addYeastRow}
          disabled={!canCallAccountScoped}
        >
          {t("yeastAddCustomButton")}
        </Button>
      </XStack>

      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb="$2">
        {t("yeastPitchRateNote")}
      </SizableText>

      {yeastRows.length ? (
        <View overflowX="auto" mt="$3">
          <YStack gap="$3">
            {yeastRows.map((r, idx) => (
              <RecipeEditIngredientCard key={r.id}>
                <XStack gap="$3" flexWrap="wrap" items="flex-end" flexDirection="row">
                  <View alignSelf="center">
                    <SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">
                      {idx + 1}
                    </SizableText>
                  </View>
                  <YStack gap="$1" flex={1} minW={200}>
                    <RecipeEditFieldLabel htmlFor={!r.name ? `yeast-name-${r.id}` : undefined}>
                      {t("yeastNameLabel")}
                    </RecipeEditFieldLabel>
                    {r.name ? (
                      <RecipeEditReadOnlyValue>{r.name}</RecipeEditReadOnlyValue>
                    ) : (
                      <Input
                        id={`yeast-name-${r.id}`}
                        value={r.name}
                        onChangeText={(text) =>
                          onUpdateRow(r.id, {
                            name: text,
                            ingredientId: null,
                            lab: null,
                            productId: null,
                            attenuationMin: null,
                            attenuationMax: null,
                          })
                        }
                        placeholder={t("yeastCustomNamePlaceholder")}
                        autoComplete="off"
                        size="$3"
                        w="100%"
                        bg="var(--surface)"
                        borderWidth={1}
                        borderColor="var(--border)"
                        rounded="$2"
                        fontFamily="$body"
                      />
                    )}
                  </YStack>
                  {(r.lab ?? "") ? (
                    <YStack gap="$1" minW={120}>
                      <RecipeEditFieldLabel>Lab</RecipeEditFieldLabel>
                      <RecipeEditReadOnlyValue>{r.lab}</RecipeEditReadOnlyValue>
                    </YStack>
                  ) : null}
                  {(r.productId ?? "") ? (
                    <YStack gap="$1" minW={100}>
                      <RecipeEditFieldLabel>Product ID</RecipeEditFieldLabel>
                      <RecipeEditReadOnlyValue>{r.productId}</RecipeEditReadOnlyValue>
                    </YStack>
                  ) : null}
                  <YStack gap="$1" minW={100}>
                    <RecipeEditFieldLabel>Atten min (%)</RecipeEditFieldLabel>
                    <RecipeEditReadOnlyValue>
                      {typeof r.attenuationMin === "number" ? roundTo(r.attenuationMin, 3) : ""}
                    </RecipeEditReadOnlyValue>
                  </YStack>
                  <YStack gap="$1" minW={100}>
                    <RecipeEditFieldLabel>Atten max (%)</RecipeEditFieldLabel>
                    <RecipeEditReadOnlyValue>
                      {typeof r.attenuationMax === "number" ? roundTo(r.attenuationMax, 3) : ""}
                    </RecipeEditReadOnlyValue>
                  </YStack>
                  <YStack gap="$1" minW={100}>
                    <RecipeEditFieldLabel htmlFor={`yeast-atten-override-${r.id}`}>
                      {tAnalysis("customAttenuationPercentLabel")}
                    </RecipeEditFieldLabel>
                    <Input
                      id={`yeast-atten-override-${r.id}`}
                      value={yeastAttenuationOverrides[r.id] ?? ""}
                      onChangeText={(text) => onAttenuationOverrideChange(r.id, text)}
                      keyboardType="decimal-pad"
                      size="$3"
                      w={100}
                      bg="var(--surface)"
                      borderWidth={1}
                      borderColor="var(--border)"
                      rounded="$2"
                      fontFamily="$body"
                    />
                  </YStack>
                  <YStack gap="$1" minW={100}>
                    <RecipeEditFieldLabel htmlFor={`yeast-fermentation-temp-${r.id}`}>
                      {t("yeastFermentationTempLabel", { unit: tUnits("C") })}
                    </RecipeEditFieldLabel>
                    <Input
                      id={`yeast-fermentation-temp-${r.id}`}
                      value={
                        r.fermentationTempC != null && Number.isFinite(r.fermentationTempC)
                          ? String(r.fermentationTempC)
                          : ""
                      }
                      onChangeText={(text) => {
                        const trimmed = text.trim();
                        const parsed = trimmed === "" ? null : Number(trimmed);
                        onUpdateRow(r.id, {
                          fermentationTempC:
                            parsed != null && Number.isFinite(parsed) && parsed >= -10 && parsed <= 50
                              ? parsed
                              : null,
                        });
                      }}
                      keyboardType="decimal-pad"
                      size="$3"
                      w={80}
                      bg="var(--surface)"
                      borderWidth={1}
                      borderColor="var(--border)"
                      rounded="$2"
                      fontFamily="$body"
                    />
                  </YStack>
                  <YStack gap="$1" minW={100}>
                    <RecipeEditFieldLabel htmlFor={`yeast-diacetyl-rest-${r.id}`}>
                      {t("yeastDiacetylRestLabel")}
                    </RecipeEditFieldLabel>
                    <BrewSelect
                      id={`yeast-diacetyl-rest-${r.id}`}
                      value={r.diacetylRest === "yes" || r.diacetylRest === "no" ? r.diacetylRest : ""}
                      onValueChange={(v) =>
                        onUpdateRow(r.id, {
                          diacetylRest: v === "yes" || v === "no" ? v : null,
                        })
                      }
                      options={[
                        { value: "yes", label: t("yeastDiacetylRestYes") },
                        { value: "no", label: t("yeastDiacetylRestNo") },
                      ]}
                      placeholder="—"
                    />
                  </YStack>
                  <YStack gap="$1" minW={100}>
                    <RecipeEditFieldLabel htmlFor={`yeast-amount-${r.id}`}>
                      {t("yeastAmountLabel", {
                        unit: r.format === "dry" ? tUnits("kg") : tUnits("L"),
                      })}
                    </RecipeEditFieldLabel>
                    {(() => {
                      const format = r.format === "dry" || r.format === "liquid" || r.format === "slurry" ? r.format : null;
                      const pitchRateSet = r.pitchRate && r.pitchRate in PITCH_RATE_TO_MILLION_CELLS_PER_ML_P;
                      const isComputed = format != null && pitchRateSet && batchSizeForCells != null && analysisOg != null;
                      const rawVal =
                        r.format === "dry"
                          ? r.amountKg != null && Number.isFinite(r.amountKg)
                            ? r.amountKg
                            : null
                          : r.amountL != null && Number.isFinite(r.amountL)
                            ? r.amountL
                            : null;
                      const displayVal = rawVal != null ? String(rawVal) : "";
                      const amountDecimals = r.format === "dry" ? 3 : 2;
                      if (isComputed) {
                        return (
                          <RecipeEditReadOnlyValue>
                            {rawVal != null ? formatAmount(rawVal, amountDecimals) : "—"}
                          </RecipeEditReadOnlyValue>
                        );
                      }
                      return (
                        <Input
                          id={`yeast-amount-${r.id}`}
                          value={displayVal}
                          onChangeText={(text) => {
                            const trimmed = text.trim();
                            const parsed = trimmed === "" ? null : Number(trimmed);
                            const valid = parsed != null && Number.isFinite(parsed) && parsed >= 0;
                            if (r.format === "dry") {
                              onUpdateRow(r.id, { amountKg: valid ? parsed : null });
                            } else {
                              onUpdateRow(r.id, { amountL: valid ? parsed : null });
                            }
                          }}
                          keyboardType="decimal-pad"
                          size="$3"
                          w={100}
                          bg="var(--surface)"
                          borderWidth={1}
                          borderColor="var(--border)"
                          rounded="$2"
                          fontFamily="$body"
                        />
                      );
                    })()}
                  </YStack>
                  <YStack gap="$1" minW={100}>
                    <RecipeEditFieldLabel htmlFor={`yeast-oxygenation-${r.id}`}>
                      {t("yeastOxygenationLabel")}
                    </RecipeEditFieldLabel>
                    <BrewSelect
                      id={`yeast-oxygenation-${r.id}`}
                      value={r.oxygenation === "yes" || r.oxygenation === "no" ? r.oxygenation : ""}
                      onValueChange={(v) =>
                        onUpdateRow(r.id, {
                          oxygenation: v === "yes" || v === "no" ? v : null,
                        })
                      }
                      options={[
                        { value: "yes", label: t("yeastOxygenationYes") },
                        { value: "no", label: t("yeastOxygenationNo") },
                      ]}
                      placeholder="—"
                    />
                  </YStack>
                  <Button
                    size="$2"
                    bg="var(--surface-2)"
                    borderWidth={1}
                    borderColor="var(--border)"
                    color="var(--text)"
                    fontFamily="$body"
                    onPress={() => onRemoveRow(r.id)}
                    aria-label={`Remove yeast row ${idx + 1}`}
                  >
                    {t("yeastRemove")}
                  </Button>
                </XStack>

                <View flexBasis="100%" w="100%" mt="$2">
                  <details>
                    <RecipeEditSummary>
                      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                        {t("yeastAdvancedSubsectionHeading")}
                      </SizableText>
                    </RecipeEditSummary>
                    <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2" mb="$1">
                      {t("yeastPitchRateAmountNote")}
                    </SizableText>
                    <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mb="$2">
                      {t("yeastEstimatedCellsRecalcNote")}
                    </SizableText>
                    <XStack gap="$3" flexWrap="wrap" items="flex-end" mt="$2">
                      <YStack gap="$1" minW={140}>
                        <RecipeEditFieldLabel htmlFor={`yeast-format-${r.id}`}>
                          {t("yeastFormatLabel")}
                        </RecipeEditFieldLabel>
                        <BrewSelect
                          id={`yeast-format-${r.id}`}
                          value={r.format === "dry" || r.format === "liquid" || r.format === "slurry" ? r.format : ""}
                          onValueChange={(v) =>
                            onUpdateRow(r.id, {
                              format: v === "dry" || v === "liquid" || v === "slurry" ? v : null,
                            })
                          }
                          options={[
                            { value: "", label: "—" },
                            { value: "dry", label: t("yeastFormatDry") },
                            { value: "liquid", label: t("yeastFormatLiquid") },
                            { value: "slurry", label: t("yeastFormatSlurry") },
                          ]}
                          placeholder="—"
                        />
                      </YStack>
                      <YStack gap="$1" minW={220}>
                        <RecipeEditFieldLabel htmlFor={`yeast-pitch-rate-${r.id}`}>
                          {t("yeastPitchRateLabel")}
                          {!r.format || (r.format !== "dry" && r.format !== "liquid" && r.format !== "slurry") ? (
                            <SizableText size="$1" color="var(--text-muted)" fontFamily="$body" ml="$1" display="inline">
                              ({t("yeastPitchRateRequiresFormat")})
                            </SizableText>
                          ) : null}
                        </RecipeEditFieldLabel>
                        {r.format === "dry" || r.format === "liquid" || r.format === "slurry" ? (
                          <BrewSelect
                            id={`yeast-pitch-rate-${r.id}`}
                            value={r.pitchRate ?? ""}
                            onValueChange={(v) => onUpdateRow(r.id, { pitchRate: v || null })}
                            options={[
                              { value: "", label: `(${t("yeastPitchRateNone")})` },
                              ...YEAST_PITCH_RATE_OPTIONS.map((o) => ({
                                value: o.value,
                                label: t(o.labelKey),
                              })),
                            ]}
                            placeholder="—"
                          />
                        ) : (
                          <RecipeEditReadOnlyValue>—</RecipeEditReadOnlyValue>
                        )}
                      </YStack>
                      <YStack gap="$1" minW={140}>
                        <XStack gap="$2" alignItems="center" flexWrap="nowrap">
                          <RecipeEditFieldLabel title={t("yeastEstimatedCellsTooltip")}>
                            {t("yeastEstimatedCellsLabel")}
                          </RecipeEditFieldLabel>
                          {surfaceMath ? (
                            <MathHelpPopover
                              title={tMath(mathExplain["yeast.estimatedCells"].titleKey)}
                              body={tMath("yeast.estimatedCells.body")}
                              ariaLabel={tMath("fxLabel", {
                                topic: tMath(mathExplain["yeast.estimatedCells"].titleKey),
                              })}
                            />
                          ) : null}
                        </XStack>
                        <RecipeEditReadOnlyValue>
                          {batchSizeForCells != null && analysisOg != null && r.format && r.pitchRate && r.pitchRate in PITCH_RATE_TO_MILLION_CELLS_PER_ML_P
                            ? (() => {
                                const cellsB = computeEstimatedCellsB(
                                  batchSizeForCells,
                                  analysisOg,
                                  r.pitchRate as YeastPitchRateKey,
                                );
                                return cellsB != null ? t("yeastEstimatedCellsValue", { value: Math.round(cellsB) }) : "—";
                              })()
                            : "—"}
                        </RecipeEditReadOnlyValue>
                      </YStack>
                      {r.format === "liquid" || r.format === "slurry" ? (
                        <YStack gap="$1" minW={140}>
                          <RecipeEditFieldLabel htmlFor={`yeast-cells-per-l-${r.id}`}>
                            {t("yeastCellsPerLLabel")}
                          </RecipeEditFieldLabel>
                          <Input
                            id={`yeast-cells-per-l-${r.id}`}
                            value={
                              r.cellsPerLOverride != null && Number.isFinite(r.cellsPerLOverride)
                                ? String(r.cellsPerLOverride)
                                : r.format === "liquid"
                                  ? String(CELLS_PER_L_LIQUID)
                                  : String(CELLS_PER_L_SLURRY)
                            }
                            onChangeText={(text) => {
                              const trimmed = text.trim();
                              const parsed = trimmed === "" ? null : Number(trimmed);
                              onUpdateRow(r.id, {
                                cellsPerLOverride:
                                  parsed != null && Number.isFinite(parsed) && parsed > 0 ? parsed : null,
                              });
                            }}
                            keyboardType="decimal-pad"
                            size="$3"
                            w={100}
                            bg="var(--surface)"
                            borderWidth={1}
                            borderColor="var(--border)"
                            rounded="$2"
                            fontFamily="$body"
                          />
                        </YStack>
                      ) : r.format === "dry" ? (
                        <YStack gap="$1" minW={140}>
                          <RecipeEditFieldLabel htmlFor={`yeast-cells-per-kg-${r.id}`}>
                            {t("yeastCellsPerKGLabel")}
                          </RecipeEditFieldLabel>
                          <Input
                            id={`yeast-cells-per-kg-${r.id}`}
                            value={
                              r.cellsPerKGOverride != null && Number.isFinite(r.cellsPerKGOverride)
                                ? String(r.cellsPerKGOverride)
                                : String(CELLS_PER_KG_DRY)
                            }
                            onChangeText={(text) => {
                              const trimmed = text.trim();
                              const parsed = trimmed === "" ? null : Number(trimmed);
                              onUpdateRow(r.id, {
                                cellsPerKGOverride:
                                  parsed != null && Number.isFinite(parsed) && parsed > 0 ? parsed : null,
                              });
                            }}
                            keyboardType="decimal-pad"
                            size="$3"
                            w={100}
                            bg="var(--surface)"
                            borderWidth={1}
                            borderColor="var(--border)"
                            rounded="$2"
                            fontFamily="$body"
                          />
                        </YStack>
                      ) : null}
                      <YStack gap="$1" minW={200}>
                        <RecipeEditFieldLabel htmlFor={`yeast-species-${r.id}`}>
                          {t("yeastSpeciesLabel")}
                        </RecipeEditFieldLabel>
                        <BrewSelect
                          id={`yeast-species-${r.id}`}
                          value={
                            r.species === "saccharomyces_cerevisiae" ||
                            r.species === "saccharomyces_pastorianus" ||
                            r.species === "brettanomyces" ||
                            r.species === "diastaticus" ||
                            r.species === "other"
                              ? r.species
                              : ""
                          }
                          onValueChange={(v) =>
                            onUpdateRow(r.id, {
                              species:
                                v === "saccharomyces_cerevisiae" ||
                                v === "saccharomyces_pastorianus" ||
                                v === "brettanomyces" ||
                                v === "diastaticus" ||
                                v === "other"
                                  ? v
                                  : null,
                            })
                          }
                          options={[
                            { value: "", label: "—" },
                            { value: "saccharomyces_cerevisiae", label: t("yeastSpeciesSaccharomycesCerevisiae") },
                            { value: "saccharomyces_pastorianus", label: t("yeastSpeciesSaccharomycesPastorianus") },
                            { value: "brettanomyces", label: t("yeastSpeciesBrettanomyces") },
                            { value: "diastaticus", label: t("yeastSpeciesDiastaticus") },
                            { value: "other", label: t("yeastSpeciesOther") },
                          ]}
                          placeholder="—"
                        />
                      </YStack>
                      <YStack gap="$1" minW={140}>
                        <RecipeEditFieldLabel htmlFor={`yeast-needs-propagation-${r.id}`}>
                          {t("yeastNeedsPropagationLabel")}
                        </RecipeEditFieldLabel>
                        <BrewSelect
                          id={`yeast-needs-propagation-${r.id}`}
                          value={r.needsPropagation === "yes" || r.needsPropagation === "no" ? r.needsPropagation : ""}
                          onValueChange={(v) =>
                            onUpdateRow(r.id, {
                              needsPropagation: v === "yes" || v === "no" ? v : null,
                            })
                          }
                          options={[
                            { value: "yes", label: t("yeastNeedsPropagationYes") },
                            { value: "no", label: t("yeastNeedsPropagationNo") },
                          ]}
                          placeholder="—"
                        />
                      </YStack>
                    </XStack>
                    <SizableText size="$1" color="var(--text-muted)" fontFamily="$body" mt="$2" mb={0}>
                      {t("yeastCellsPerDefaultNote")}
                    </SizableText>
                    <SizableText size="$1" color="var(--text-muted)" fontFamily="$body" mb={0}>
                      {t("yeastCellsPerOverrideNote")}
                    </SizableText>
                  </details>
                </View>
              </RecipeEditIngredientCard>
            ))}
          </YStack>
        </View>
      ) : (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}>
          {t("yeastEmpty")}
        </SizableText>
      )}

      <XStack mt="$3" justify="flex-end" gap="$2" alignItems="center">
        <Button
          size="$3"
          bg="var(--surface-2)"
          borderWidth={1}
          borderColor="var(--border)"
          color="var(--text)"
          fontFamily="$body"
          onPress={onSave}
          disabled={!canCallAccountScoped || saving}
        >
          {saving ? "Saving…" : t("yeastSaveButton")}
        </Button>
        {saveStatus ? (
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" role="status" aria-live="polite">
            {saveStatus}
          </SizableText>
        ) : null}
      </XStack>
    </View>
  );
}
