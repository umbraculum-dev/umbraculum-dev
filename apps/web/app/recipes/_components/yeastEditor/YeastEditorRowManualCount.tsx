"use client";

import { useTranslations } from "next-intl";
import { Button, Input, SizableText, View, XStack, YStack } from "tamagui";

import { BrewSelect } from "../../../_components/BrewSelect";
import { MathHelpPopover } from "../../../_components/MathHelpPopover";
import {
  RecipeEditFieldLabel,
  RecipeEditReadOnlyValue,
  WarningBox,
} from "../../../_components/recipe-edit";
import { type EditorYeastRow } from "../../_lib/beerjsonRecipe";
import { mathExplain } from "../../[id]/edit/_lib/mathExplain";
import { roundTo, type YeastEditorRowContext } from "./yeastEditorTypes";

type YeastEditorRowManualCountProps = {
  row: EditorYeastRow;
  idx: number;
  ctx: YeastEditorRowContext;
};

export function YeastEditorRowManualCount(props: YeastEditorRowManualCountProps) {
  const { row: r, idx, ctx } = props;
  const {
    surfaceMath,
    onUpdateRow,
    onSave,
    saving,
    canCallAccountScoped,
    t,
    locale,
    lowViabilityWarning,
    firstManualCountRowIdx,
    requestAmountRecalc,
  } = ctx;
  const tMath = useTranslations("math");

  if (r.format !== "slurry") {
    return null;
  }

  return (
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
            const rawViability = (r.manualCellCount.aliveCells / r.manualCellCount.totalCells) * 100;
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
        (r.manualCellCount.dilutionFactor === 200 || r.manualCellCount.dilutionFactor === 2000) ? (
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
        (r.manualCellCount.dilutionFactor === 200 || r.manualCellCount.dilutionFactor === 2000) ? (
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
  );
}
