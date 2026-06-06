"use client";

import { useTranslations } from "next-intl";
import { Input, SizableText, XStack, YStack } from "tamagui";

import { BrewSelect } from "../../../../../../_components/BrewSelect";
import { MathHelpPopover } from "../../../../../../_components/MathHelpPopover";
import {
  RecipeEditFieldLabel,
  RecipeEditReadOnlyValue,
} from "../../../../../../_components/recipe-edit";
import {
  CELLS_PER_KG_DRY,
  CELLS_PER_L_LIQUID,
  CELLS_PER_L_SLURRY,
  computeCellsPerLFromManualCount,
  computeEstimatedCellsB,
  PITCH_RATE_TO_MILLION_CELLS_PER_ML_P,
  YEAST_PITCH_RATE_OPTIONS,
} from "../../../_lib/beerjsonRecipe";
import { mathExplain } from "../../../[id]/edit/_lib/mathExplain";
import { roundTo } from "../yeastEditorTypes";
import type { YeastEditorRowPitchProps } from "./yeastEditorRowPitchTypes";

export function YeastEditorRowPitchFields(props: YeastEditorRowPitchProps) {
  const { row: r, ctx } = props;
  const { batchSizeForCells, analysisOg, surfaceMath, onUpdateRow, t } = ctx;
  const tMath = useTranslations("math");

  return (
    <>
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
          {batchSizeForCells != null &&
          analysisOg != null &&
          r.format &&
          r.pitchRate &&
          r.pitchRate in PITCH_RATE_TO_MILLION_CELLS_PER_ML_P
            ? (() => {
                const cellsB = computeEstimatedCellsB(batchSizeForCells, analysisOg, r.pitchRate);
                return cellsB != null
                  ? t("yeastEstimatedCellsValue", { value: Math.round(cellsB) })
                  : "—";
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
    </>
  );
}
