"use client";

import { useTranslations } from "next-intl";
import { Input, SizableText, View, XStack, YStack } from "tamagui";

import { BrewSelect } from "../../../../_components/BrewSelect";
import { MathHelpPopover } from "../../../../_components/MathHelpPopover";
import { RecipeEditFieldLabel } from "../../../../_components/recipe-edit";
import { mathExplain } from "../../../[id]/edit/_lib/mathExplain";
import { roundTo } from "../yeastEditorTypes";
import {
  buildManualCellCountFromDilutionFactor,
  buildManualCellCountWithAlive,
  buildManualCellCountWithTotal,
  computeManualCountViability,
  isTotalCellsTooLow,
  isValidDilutionFactor,
} from "./yeastEditorRowManualCountHelpers";
import type { YeastEditorRowManualCountProps } from "./yeastEditorRowManualCountTypes";

export function YeastEditorRowManualCountFields(props: YeastEditorRowManualCountProps) {
  const { row: r, ctx } = props;
  const { surfaceMath, onUpdateRow, requestAmountRecalc, t } = ctx;
  const tMath = useTranslations("math");

  return (
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
            onUpdateRow(r.id, {
              manualCellCount: buildManualCellCountFromDilutionFactor(df, r.manualCellCount),
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
            if (!isValidDilutionFactor(df)) return;
            onUpdateRow(r.id, {
              manualCellCount: buildManualCellCountWithAlive(df, alive, r.manualCellCount),
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
            if (!isValidDilutionFactor(df)) return;
            onUpdateRow(r.id, {
              manualCellCount: buildManualCellCountWithTotal(df, total, r.manualCellCount),
            });
          }}
          onBlur={requestAmountRecalc}
          keyboardType="number-pad"
          size="$3"
          w={80}
          bg="var(--surface)"
          borderWidth={1}
          borderColor={isTotalCellsTooLow(r.manualCellCount) ? "$red10" : "var(--border)"}
          rounded="$2"
          fontFamily="$body"
        />
        {isTotalCellsTooLow(r.manualCellCount) ? (
          <SizableText size="$1" color="$red10" fontFamily="$body" mt="$1">
            {t("yeastManualCountTotalTooLow")}
          </SizableText>
        ) : null}
      </YStack>
      {r.manualCellCount &&
      r.manualCellCount.totalCells > 0 &&
      Number.isFinite(r.manualCellCount.aliveCells) ? (() => {
        const { displayViability, isInvalid } = computeManualCountViability(
          r.manualCellCount!.aliveCells,
          r.manualCellCount!.totalCells,
        );
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
  );
}
