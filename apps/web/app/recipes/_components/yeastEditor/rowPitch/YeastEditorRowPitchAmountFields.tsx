"use client";

import { useTranslations } from "next-intl";
import { Input, XStack, YStack } from "tamagui";

import { MathHelpPopover } from "../../../../_components/MathHelpPopover";
import {
  RecipeEditFieldLabel,
  RecipeEditReadOnlyValue,
} from "../../../../_components/recipe-edit";
import {
  CELLS_PER_L_LIQUID,
  CELLS_PER_L_SLURRY,
  computeCellsPerLFromManualCount,
  computeEstimatedCellsB,
  PITCH_RATE_TO_MILLION_CELLS_PER_ML_P,
} from "../../../_lib/beerjsonRecipe";
import { mathExplain } from "../../../[id]/edit/_lib/mathExplain";
import type { YeastEditorRowPitchProps } from "./yeastEditorRowPitchTypes";

export function YeastEditorRowPitchAmountFields(props: YeastEditorRowPitchProps) {
  const { row: r, ctx } = props;
  const { batchSizeForCells, analysisOg, surfaceMath, onUpdateRow, t, tUnits, formatAmount } = ctx;
  const tMath = useTranslations("math");

  return (
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
                  ? computeEstimatedCellsB(batchSizeForCells, analysisOg, r.pitchRate)
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
              const amountL = r.amountL != null && Number.isFinite(r.amountL) ? r.amountL : null;
              if (cellsB != null && cellsPerL != null && cellsPerL > 0 && amountL != null) {
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
        const format =
          r.format === "dry" || r.format === "liquid" || r.format === "slurry" ? r.format : null;
        const pitchRateSet = r.pitchRate && r.pitchRate in PITCH_RATE_TO_MILLION_CELLS_PER_ML_P;
        const isComputed =
          format != null && pitchRateSet && batchSizeForCells != null && analysisOg != null;
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
  );
}
