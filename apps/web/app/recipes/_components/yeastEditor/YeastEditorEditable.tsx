"use client";

import React, { useEffect, useState } from "react";
import { Button, Input, SizableText, View, XStack, YStack } from "tamagui";

import { searchYeasts } from "@umbraculum/api-client/brewery";

import { webBreweryApiClient } from "../../../_lib/breweryWaterClient";
import {
  ErrorBox,
  MessageBox,
  RecipeEditFieldLabel,
} from "../../../_components/recipe-edit";
import {
  computeAmountFromCellsB,
  computeCellsPerLFromManualCount,
  computeEstimatedCellsB,
  PITCH_RATE_TO_MILLION_CELLS_PER_ML_P,
} from "../../_lib/beerjsonRecipe";
import { type YeastEditorEditableProps, type YeastEditorRowContext, type YeastSearchItem } from "./yeastEditorTypes";
import { YeastEditorRow } from "./YeastEditorRow";

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

  const rowCtx: YeastEditorRowContext = {
    yeastAttenuationOverrides,
    batchSizeForCells,
    analysisOg,
    surfaceMath,
    onRemoveRow,
    onUpdateRow,
    onAttenuationOverrideChange,
    onSave,
    saving,
    canCallAccountScoped,
    t,
    tAnalysis,
    tUnits,
    formatAmount,
    locale,
    lowViabilityWarning,
    firstManualCountRowIdx,
    requestAmountRecalc,
  };

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
              <YeastEditorRow key={r.id} row={r} idx={idx} ctx={rowCtx} />
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
