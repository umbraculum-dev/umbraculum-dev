"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button, Input, SizableText, View, XStack, YStack } from "tamagui";

import { searchYeasts } from "@umbraculum/api-client/brewery";

import { BrewSelect } from "../../../_components/BrewSelect";
import { MathHelpPopover } from "../../../_components/MathHelpPopover";
import { webBreweryApiClient } from "../../../_lib/breweryWaterClient";
import {
  ErrorBox,
  MessageBox,
  RecipeEditFieldLabel,
  RecipeEditIngredientCard,
  RecipeEditReadOnlyValue,
  RecipeEditSummary,
  WarningBox,
} from "../../../_components/recipe-edit";
import {
  CELLS_PER_KG_DRY,
  CELLS_PER_L_LIQUID,
  CELLS_PER_L_SLURRY,
  computeAmountFromCellsB,
  computeCellsPerLFromManualCount,
  computeEstimatedCellsB,
  PITCH_RATE_TO_MILLION_CELLS_PER_ML_P,
  YEAST_PITCH_RATE_OPTIONS,
} from "../../_lib/beerjsonRecipe";
import { mathExplain } from "../../[id]/edit/_lib/mathExplain";
import { roundTo, type YeastEditorEditableProps, type YeastSearchItem } from "./yeastEditorTypes";

export function YeastEditorEditable({
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
  canSave: _canSave,
  saving,
  saveStatus,
  onDismissSaveStatus,
  canCallAccountScoped,
  t,
  tAnalysis,
  tUnits,
  formatAmount,
  locale,
  lowViabilityWarning = null,
}: YeastEditorEditableProps) {
  const tMath = useTranslations("math");
  const firstManualCountRowIdx = yeastRows.findIndex(
    (r) =>
      r.format === "slurry" &&
      r.manualCellCount &&
      r.manualCellCount.aliveCells > 0 &&
      r.manualCellCount.totalCells > 0 &&
      (r.manualCellCount.dilutionFactor === 200 || r.manualCellCount.dilutionFactor === 2000),
  );
  const [yeastQuery, setYeastQuery] = useState("");
  const [yeastResults, setYeastResults] = useState<YeastSearchItem[]>([]);
  const [yeastSearching, setYeastSearching] = useState(false);
  const [yeastSearchError, setYeastSearchError] = useState<string | null>(null);

  const onSearchYeasts = async (e: React.FormEvent) => {
    e.preventDefault();
    setYeastSearchError(null);
    setYeastSearching(true);
    try {
      const data = await searchYeasts(webBreweryApiClient(), { query: yeastQuery });
      setYeastResults(data.items as YeastSearchItem[]);
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

  const addYeastFromDb = (item: YeastSearchItem) => {
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

  const [amountRecalcTrigger, setAmountRecalcTrigger] = useState(0);
  const requestAmountRecalc = () => setAmountRecalcTrigger((n) => n + 1);

  useEffect(() => {
    for (const r of yeastRows) {
      const format = r.format === "dry" || r.format === "liquid" || r.format === "slurry" ? r.format : null;
      const pitchRateValid = r.pitchRate && r.pitchRate in PITCH_RATE_TO_MILLION_CELLS_PER_ML_P;
      if (!format || !pitchRateValid || batchSizeForCells == null || analysisOg == null) continue;
      const cellsB = computeEstimatedCellsB(
        batchSizeForCells,
        analysisOg,
        r.pitchRate,
      );
      if (cellsB == null) continue;
      const cellsPerLOverride =
        format === "slurry" && r.manualCellCount
          ? computeCellsPerLFromManualCount(r.manualCellCount)
          : r.cellsPerLOverride;
      const { amountL, amountKg } = computeAmountFromCellsB(
        cellsB,
        format,
        cellsPerLOverride,
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
  }, [yeastRows, batchSizeForCells, analysisOg, onUpdateRow, amountRecalcTrigger]);

  return (
    <View>
      <form onSubmit={(...a) => { void onSearchYeasts(...(a as Parameters<typeof onSearchYeasts>)); }}>
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
                    {t("yeastNameLabel")}
                  </SizableText>
                </View>
                <View minW={100}>
                  <SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">
                    {t("yeastLabLabel")}
                  </SizableText>
                </View>
                <View minW={100}>
                  <SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">
                    {t("yeastProductIdLabel")}
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
                      <RecipeEditFieldLabel>{t("yeastLabLabel")}</RecipeEditFieldLabel>
                      <RecipeEditReadOnlyValue>{r.lab}</RecipeEditReadOnlyValue>
                    </YStack>
                  ) : null}
                  {(r.productId ?? "") ? (
                    <YStack gap="$1" minW={100}>
                      <RecipeEditFieldLabel>{t("yeastProductIdLabel")}</RecipeEditFieldLabel>
                      <RecipeEditReadOnlyValue>{r.productId}</RecipeEditReadOnlyValue>
                    </YStack>
                  ) : null}
                  <YStack gap="$1" minW={100}>
                    <RecipeEditFieldLabel>{t("yeastAttenMinLabel")}</RecipeEditFieldLabel>
                    <RecipeEditReadOnlyValue>
                      {typeof r.attenuationMin === "number" ? roundTo(r.attenuationMin, 3) : ""}
                    </RecipeEditReadOnlyValue>
                  </YStack>
                  <YStack gap="$1" minW={100}>
                    <RecipeEditFieldLabel>{t("yeastAttenMaxLabel")}</RecipeEditFieldLabel>
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
                    <XStack gap="$2" alignItems="center" flexWrap="nowrap">
                      <RecipeEditFieldLabel htmlFor={`yeast-amount-${r.id}`}>
                        {t("yeastAmountLabel", {
                          unit: r.format === "dry" ? tUnits("kg") : tUnits("L"),
                        })}
                      </RecipeEditFieldLabel>
                      {surfaceMath && (r.format === "liquid" || r.format === "slurry") ? (
                        <MathHelpPopover
                          title={tMath(mathExplain["yeast.amountL"].titleKey)}
                          body={(() => {
                            const base = tMath("yeast.amountL.body");
                            const cellsB =
                              batchSizeForCells != null &&
                              analysisOg != null &&
                              r.pitchRate &&
                              r.pitchRate in PITCH_RATE_TO_MILLION_CELLS_PER_ML_P
                                ? computeEstimatedCellsB(
                                    batchSizeForCells,
                                    analysisOg,
                                    r.pitchRate,
                                  )
                                : null;
                            const cellsPerL =
                              r.format === "slurry" && r.manualCellCount
                                ? computeCellsPerLFromManualCount(r.manualCellCount)
                                : r.cellsPerLOverride != null &&
                                    Number.isFinite(r.cellsPerLOverride) &&
                                    r.cellsPerLOverride > 0
                                  ? r.cellsPerLOverride
                                  : r.format === "liquid"
                                    ? CELLS_PER_L_LIQUID
                                    : CELLS_PER_L_SLURRY;
                            const amountL =
                              r.amountL != null && Number.isFinite(r.amountL) ? r.amountL : null;
                            if (
                              cellsB != null &&
                              cellsPerL != null &&
                              cellsPerL > 0 &&
                              amountL != null
                            ) {
                              return (
                                base +
                                "\n\n" +
                                t("yeastAmountCalcExample", {
                                  cellsB: Math.round(cellsB),
                                  cellsPerL: Math.round(cellsPerL),
                                  amountL: formatAmount(amountL, 2),
                                })
                              );
                            }
                            return base;
                          })()}
                          ariaLabel={tMath("fxLabel", {
                            topic: tMath(mathExplain["yeast.amountL"].titleKey),
                          })}
                        />
                      ) : null}
                    </XStack>
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
                          <YStack gap="$1">
                            <RecipeEditReadOnlyValue>
                              {rawVal != null ? formatAmount(rawVal, amountDecimals) : "—"}
                            </RecipeEditReadOnlyValue>
                          </YStack>
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
                                  r.pitchRate,
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
                          {r.format === "slurry" &&
                          r.manualCellCount &&
                          computeCellsPerLFromManualCount(r.manualCellCount) != null ? (
                            <RecipeEditReadOnlyValue>
                              {roundTo(computeCellsPerLFromManualCount(r.manualCellCount)!, 0)}
                            </RecipeEditReadOnlyValue>
                          ) : (
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
                          )}
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
                      <XStack gap="$2" flexBasis="100%" w="100%" mt={-4} flexWrap="wrap" alignItems="center">
                        <SizableText size="$1" color="var(--text-muted)" fontFamily="$body" mb={0}>
                          {t("yeastCellsPerDefaultNote")}
                        </SizableText>
                        <SizableText size="$1" color="var(--text-muted)" fontFamily="$body" mb={0}>
                          {t("yeastCellsPerOverrideNote")}
                        </SizableText>
                      </XStack>
                      {r.format === "slurry" ? (
                        <YStack gap="$2" flexBasis="100%" w="100%" mt="$2" pt="$2" borderTopWidth={1} borderColor="var(--border)">
                          <SizableText size="$2" fontFamily="$body" color="var(--text)" fontWeight="600">
                            {t("yeastManualCountSectionTitle")}
                          </SizableText>
                          <SizableText size="$2" fontFamily="$body" color="var(--text-muted)" whiteSpace="pre-line">
                            {t("yeastManualCountFirstNote")}
                          </SizableText>
                          <SizableText
                            size="$2"
                            fontFamily="$body"
                            color="var(--text-muted)"
                            whiteSpace="pre-line"
                            textDecorationLine="underline"
                          >
                            {t("yeastManualCountDisclaimer")}
                          </SizableText>
                          <SizableText size="$2" fontFamily="$body" color="var(--text-muted)" fontWeight="600">
                            {t("yeastManualCountDirectlyInfluencesAmount")}
                          </SizableText>
                          <YStack gap="$2">
                          <XStack gap="$3" flexWrap="wrap" items="flex-end">
                            <YStack gap="$1" minW={140}>
                              <RecipeEditFieldLabel htmlFor={`yeast-manual-df-${r.id}`}>
                                {t("yeastManualCountDFLabel")}
                              </RecipeEditFieldLabel>
                              <BrewSelect
                                id={`yeast-manual-df-${r.id}`}
                                value={
                                  r.manualCellCount?.dilutionFactor === 200 ||
                                  r.manualCellCount?.dilutionFactor === 2000
                                    ? String(r.manualCellCount.dilutionFactor)
                                    : ""
                                }
                                onValueChange={(v) => {
                                  const df = v === "200" ? 200 : v === "2000" ? 2000 : null;
                                  if (df == null) {
                                    onUpdateRow(r.id, { manualCellCount: null });
                                    return;
                                  }
                                  const prev = r.manualCellCount;
                                  onUpdateRow(r.id, {
                                    manualCellCount: {
                                      dilutionFactor: df,
                                      aliveCells:
                                        prev?.aliveCells != null && Number.isFinite(prev.aliveCells) && prev.aliveCells > 0
                                          ? prev.aliveCells
                                          : 0,
                                      totalCells:
                                        prev?.totalCells != null && Number.isFinite(prev.totalCells) && prev.totalCells > 0
                                          ? prev.totalCells
                                          : 0,
                                    },
                                  });
                                }}
                                options={[
                                  { value: "", label: "—" },
                                  { value: "200", label: t("yeastManualCountDF200") },
                                  { value: "2000", label: t("yeastManualCountDF2000") },
                                ]}
                                placeholder="—"
                              />
                            </YStack>
                            <YStack gap="$1" minW={100}>
                              <XStack gap="$2" alignItems="center" flexWrap="nowrap">
                                <RecipeEditFieldLabel htmlFor={`yeast-manual-alive-${r.id}`}>
                                  {t("yeastManualCountAliveCellsLabel")}
                                </RecipeEditFieldLabel>
                                {surfaceMath ? (
                                  <MathHelpPopover
                                    title={tMath(mathExplain["yeast.manualCountAliveInfluence"].titleKey)}
                                    body={tMath("yeast.manualCountAliveInfluence.body")}
                                    ariaLabel={tMath("fxLabel", {
                                      topic: tMath(mathExplain["yeast.manualCountAliveInfluence"].titleKey),
                                    })}
                                  />
                                ) : null}
                              </XStack>
                              <Input
                                id={`yeast-manual-alive-${r.id}`}
                                value={
                                  r.manualCellCount?.aliveCells != null && Number.isFinite(r.manualCellCount.aliveCells)
                                    ? String(Math.round(r.manualCellCount.aliveCells))
                                    : ""
                                }
                                onChangeText={(text) => {
                                  const trimmed = text.trim();
                                  const parsed = trimmed === "" ? null : Number(trimmed);
                                  const alive = parsed != null && Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
                                  const df = r.manualCellCount?.dilutionFactor;
                                  if (df !== 200 && df !== 2000) return;
                                  const prevTotal =
                                    r.manualCellCount?.totalCells != null &&
                                    Number.isFinite(r.manualCellCount.totalCells) &&
                                    r.manualCellCount.totalCells > 0
                                      ? r.manualCellCount.totalCells
                                      : 0;
                                  onUpdateRow(r.id, {
                                    manualCellCount: {
                                      dilutionFactor: df,
                                      aliveCells: alive ?? 0,
                                      totalCells: prevTotal,
                                    },
                                  });
                                }}
                                onBlur={requestAmountRecalc}
                                keyboardType="number-pad"
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
                              <XStack gap="$2" alignItems="center" flexWrap="nowrap">
                                <RecipeEditFieldLabel htmlFor={`yeast-manual-total-${r.id}`}>
                                  {t("yeastManualCountTotalCellsLabel")}
                                </RecipeEditFieldLabel>
                                {surfaceMath ? (
                                  <MathHelpPopover
                                    title={tMath(mathExplain["yeast.manualCountTotalInfluence"].titleKey)}
                                    body={tMath("yeast.manualCountTotalInfluence.body")}
                                    ariaLabel={tMath("fxLabel", {
                                      topic: tMath(mathExplain["yeast.manualCountTotalInfluence"].titleKey),
                                    })}
                                  />
                                ) : null}
                              </XStack>
                              <Input
                                id={`yeast-manual-total-${r.id}`}
                                value={
                                  r.manualCellCount?.totalCells != null && Number.isFinite(r.manualCellCount.totalCells)
                                    ? String(Math.round(r.manualCellCount.totalCells))
                                    : ""
                                }
                                onChangeText={(text) => {
                                  const trimmed = text.trim();
                                  const parsed = trimmed === "" ? null : Number(trimmed);
                                  const total = parsed != null && Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
                                  const df = r.manualCellCount?.dilutionFactor;
                                  if (df !== 200 && df !== 2000) return;
                                  const prevAlive =
                                    r.manualCellCount?.aliveCells != null &&
                                    Number.isFinite(r.manualCellCount.aliveCells) &&
                                    r.manualCellCount.aliveCells >= 0
                                      ? r.manualCellCount.aliveCells
                                      : 0;
                                  onUpdateRow(r.id, {
                                    manualCellCount: {
                                      dilutionFactor: df,
                                      aliveCells: prevAlive,
                                      totalCells: total ?? 0,
                                    },
                                  });
                                }}
                                onBlur={requestAmountRecalc}
                                keyboardType="number-pad"
                                size="$3"
                                w={80}
                                bg="var(--surface)"
                                borderWidth={1}
                                borderColor={
                                  r.manualCellCount?.aliveCells != null &&
                                  r.manualCellCount?.aliveCells > 0 &&
                                  r.manualCellCount?.totalCells != null &&
                                  r.manualCellCount.totalCells > 0 &&
                                  r.manualCellCount.totalCells < r.manualCellCount.aliveCells
                                    ? "$red10"
                                    : "var(--border)"
                                }
                                rounded="$2"
                                fontFamily="$body"
                              />
                              {r.manualCellCount?.aliveCells != null &&
                              r.manualCellCount.aliveCells > 0 &&
                              r.manualCellCount?.totalCells != null &&
                              r.manualCellCount.totalCells > 0 &&
                              r.manualCellCount.totalCells < r.manualCellCount.aliveCells ? (
                                <SizableText size="$1" color="$red10" fontFamily="$body" mt="$1">
                                  {t("yeastManualCountTotalTooLow")}
                                </SizableText>
                              ) : null}
                            </YStack>
                            {r.manualCellCount &&
                            r.manualCellCount.totalCells > 0 &&
                            Number.isFinite(r.manualCellCount.aliveCells) ? (() => {
                              const rawViability =
                                (r.manualCellCount.aliveCells / r.manualCellCount.totalCells) * 100;
                              const displayViability = Math.min(100, rawViability);
                              const isInvalid = rawViability > 100;
                              return (
                                <YStack gap="$1" minW={100}>
                                  <XStack gap="$2" alignItems="center" flexWrap="wrap">
                                    <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                                      {t("yeastManualCountViabilityLabel")}
                                    </SizableText>
                                    {surfaceMath ? (
                                      <MathHelpPopover
                                        title={tMath(mathExplain["yeast.manualCountViability"].titleKey)}
                                        body={tMath("yeast.manualCountViability.body")}
                                        ariaLabel={tMath("fxLabel", {
                                          topic: tMath(mathExplain["yeast.manualCountViability"].titleKey),
                                        })}
                                      />
                                    ) : null}
                                  </XStack>
                                  <View
                                    p="$2"
                                    bg="var(--surface-2)"
                                    rounded="$2"
                                    borderWidth={1}
                                    borderColor={isInvalid ? "$red10" : "var(--border)"}
                                  >
                                    <SizableText
                                      size="$2"
                                      fontFamily="$body"
                                      color={isInvalid ? "$red10" : "var(--text)"}
                                    >
                                      {roundTo(displayViability, 1)}%
                                    </SizableText>
                                  </View>
                                </YStack>
                              );
                            })() : null}
                          </XStack>
                          {r.manualCellCount &&
                          r.manualCellCount.aliveCells > 0 &&
                          r.manualCellCount.totalCells > 0 &&
                          (r.manualCellCount.dilutionFactor === 200 ||
                            r.manualCellCount.dilutionFactor === 2000) ? (
                            <Button
                              size="$2"
                              alignSelf="flex-start"
                              bg="var(--surface-2)"
                              borderWidth={1}
                              borderColor="var(--border)"
                              color="var(--text)"
                              fontFamily="$body"
                              onPress={onSave}
                              disabled={!canCallAccountScoped || saving}
                            >
                              {t("yeastManualCountSaveCalculatedValues")}
                            </Button>
                          ) : null}
                          {lowViabilityWarning != null && idx === firstManualCountRowIdx ? (
                            <WarningBox mt="$2" role="status" aria-live="polite">
                              {t("yeastLowViabilityWarning", { pct: Math.round(lowViabilityWarning) })}
                            </WarningBox>
                          ) : null}
                          {r.manualCellCount &&
                          r.manualCellCount.aliveCells > 0 &&
                          r.manualCellCount.totalCells > 0 &&
                          (r.manualCellCount.dilutionFactor === 200 ||
                            r.manualCellCount.dilutionFactor === 2000) ? (
                            <View className="brew-field-block brew-field-block--computed" mt="$2">
                              <YStack gap="$2">
                                <YStack gap="$1">
                                  <XStack gap="$2" alignItems="center" flexWrap="nowrap">
                                    <RecipeEditFieldLabel>
                                      {t("yeastManualCountCalculatedLiveCellsPerGramLabel")}
                                    </RecipeEditFieldLabel>
                                    {surfaceMath ? (
                                      <MathHelpPopover
                                        title={tMath(mathExplain["yeast.manualCountLiveCellsPerGram"].titleKey)}
                                        body={tMath("yeast.manualCountLiveCellsPerGram.body")}
                                        ariaLabel={tMath("fxLabel", {
                                          topic: tMath(mathExplain["yeast.manualCountLiveCellsPerGram"].titleKey),
                                        })}
                                      />
                                    ) : null}
                                  </XStack>
                                  <RecipeEditReadOnlyValue>
                                    {(
                                      r.manualCellCount.aliveCells *
                                      5 *
                                      r.manualCellCount.dilutionFactor *
                                      10000
                                    ).toLocaleString(locale)}
                                  </RecipeEditReadOnlyValue>
                                </YStack>
                              </YStack>
                            </View>
                          ) : null}
                          </YStack>
                        </YStack>
                      ) : null}
                    </XStack>
                    <XStack gap="$3" flexWrap="wrap" items="flex-end" mt="$2">
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

      <YStack mt="$3" mb="$4" gap="$2" alignItems="flex-end">
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
          <MessageBox
            variant="success"
            role="status"
            aria-live="polite"
            dismissAfter={5000}
            onDismiss={onDismissSaveStatus}
          >
            {saveStatus}
          </MessageBox>
        ) : null}
      </YStack>
    </View>
  );
}
