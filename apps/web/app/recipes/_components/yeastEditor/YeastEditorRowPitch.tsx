"use client";

import { useTranslations } from "next-intl";
import { Input, SizableText, XStack, YStack } from "tamagui";

import { BrewSelect } from "../../../_components/BrewSelect";
import { MathHelpPopover } from "../../../_components/MathHelpPopover";
import {
  RecipeEditFieldLabel,
  RecipeEditReadOnlyValue,
} from "../../../_components/recipe-edit";
import {
  CELLS_PER_KG_DRY,
  CELLS_PER_L_LIQUID,
  CELLS_PER_L_SLURRY,
  computeCellsPerLFromManualCount,
  computeEstimatedCellsB,
  PITCH_RATE_TO_MILLION_CELLS_PER_ML_P,
  YEAST_PITCH_RATE_OPTIONS,
  type EditorYeastRow,
} from "../../_lib/beerjsonRecipe";
import { mathExplain } from "../../[id]/edit/_lib/mathExplain";
import { roundTo, type YeastEditorRowContext } from "./yeastEditorTypes";

type YeastEditorRowPitchProps = {
  row: EditorYeastRow;
  ctx: YeastEditorRowContext;
  variant: "amount" | "advanced";
};

export function YeastEditorRowPitch(props: YeastEditorRowPitchProps) {
  const { row: r, ctx, variant } = props;
  const {
    batchSizeForCells,
    analysisOg,
    surfaceMath,
    onUpdateRow,
    t,
    tUnits,
    formatAmount,
  } = ctx;
  const tMath = useTranslations("math");

  if (variant === "amount") {
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
      <XStack gap="$2" flexBasis="100%" w="100%" mt={-4} flexWrap="wrap" alignItems="center">
        <SizableText size="$1" color="var(--text-muted)" fontFamily="$body" mb={0}>
          {t("yeastCellsPerDefaultNote")}
        </SizableText>
        <SizableText size="$1" color="var(--text-muted)" fontFamily="$body" mb={0}>
          {t("yeastCellsPerOverrideNote")}
        </SizableText>
      </XStack>
    </>
  );
}
