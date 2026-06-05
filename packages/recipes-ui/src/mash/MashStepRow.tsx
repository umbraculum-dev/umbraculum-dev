import React from "react";
import { XStack, YStack } from "tamagui";

import type { EditorMashStep } from "@umbraculum/brewery-beerjson";
import { MASH_STEP_TYPE_OPTIONS } from "@umbraculum/brewery-beerjson";

import { BrewCheckbox, Card, Input, ReadOnlyField, ReadOnlyFieldRow, SelectField, Text } from "@umbraculum/ui";

import { MashStepRowActions } from "./MashStepsToolbar";
import type { MashStepRowEditState } from "./useMashStepsEditorState";
import type { WaterVolumes } from "./useMashStepsEditorState";

export interface MashStepRowReadOnlyProps {
  readOnly: true;
  row: EditorMashStep;
  index: number;
  waterVolumes: WaterVolumes | null;
  cardBackgroundColor?: string | undefined;
  cardBorderColor?: string | undefined;
  t: (key: string, values?: Record<string, string | number>) => string;
  tUnits: (key: string) => string;
  locale: string;
  formatFixed: (locale: string, value: number, decimals: number) => string;
}

export interface MashStepRowEditableProps {
  readOnly?: false;
  row: EditorMashStep;
  index: number;
  editState: MashStepRowEditState;
  waterVolumes: WaterVolumes | null;
  firstStepAmountComputed?: number | null;
  onUpdateStep?: ((id: string, patch: Partial<EditorMashStep>) => void) | undefined;
  onMoveStep?: ((id: string, direction: "up" | "down") => void) | undefined;
  onDeleteStep?: ((id: string) => void) | undefined;
  t: (key: string, values?: Record<string, string | number>) => string;
  tUnits: (key: string) => string;
  locale: string;
  formatFixed: (locale: string, value: number, decimals: number) => string;
}

export type MashStepRowProps = MashStepRowReadOnlyProps | MashStepRowEditableProps;

export interface MashStepsReadOnlyViewProps {
  mashRows: EditorMashStep[];
  mashProcedure?: { name: string; grainTemperatureC: number } | null;
  waterVolumes: WaterVolumes | null;
  cardBackgroundColor?: string | undefined;
  cardBorderColor?: string | undefined;
  t: (key: string, values?: Record<string, string | number>) => string;
  tUnits: (key: string) => string;
  locale: string;
  formatFixed: (locale: string, value: number, decimals: number) => string;
}

export function MashStepsReadOnlyView(props: MashStepsReadOnlyViewProps) {
  const { mashRows, mashProcedure = null, waterVolumes, cardBackgroundColor, cardBorderColor, t, tUnits, locale, formatFixed } =
    props;

  return (
    <YStack gap="$2">
      {mashProcedure ? (
        <Text fontSize={12} opacity={0.8}>
          {mashProcedure.name} · {t("mashingGrainTemp")}: {mashProcedure.grainTemperatureC} °C
        </Text>
      ) : null}

      {mashRows.length ? (
        mashRows.map((r, idx) => (
          <MashStepRow
            key={r.id}
            readOnly
            row={r}
            index={idx}
            waterVolumes={waterVolumes}
            cardBackgroundColor={cardBackgroundColor}
            cardBorderColor={cardBorderColor}
            t={t}
            tUnits={tUnits}
            locale={locale}
            formatFixed={formatFixed}
          />
        ))
      ) : (
        <Text fontSize={12} opacity={0.8}>
          {t("mashingEmpty")}
        </Text>
      )}
    </YStack>
  );
}

export function MashStepRow(props: MashStepRowProps) {
  if (props.readOnly) {
    const { row: r, index: idx, waterVolumes, cardBackgroundColor, cardBorderColor, t, tUnits, locale, formatFixed } =
      props;
    const isSpargeStep = r.type === "sparge" && r.name.trim().toLowerCase() === "sparge";
    const amountDisplay =
      isSpargeStep && waterVolumes
        ? formatFixed(locale, waterVolumes.spargeLiters, 2)
        : r.amountL != null && Number.isFinite(r.amountL)
          ? formatFixed(locale, r.amountL, 2)
          : null;
    const typeLabel = MASH_STEP_TYPE_OPTIONS.find((o) => o.value === r.type)?.label ?? r.type;

    return (
      <Card
        key={r.id}
        data-mash-step-card
        {...((cardBackgroundColor ?? cardBorderColor) ? {} : { theme: "surface2" as const })}
        gap="$2"
        padding="$3"
        backgroundColor={cardBackgroundColor ?? "$background"}
        borderWidth={1}
        borderColor={cardBorderColor ?? "$borderColor"}
      >
        <Text fontSize={12} fontWeight="700">
          {idx + 1}. {r.name}
        </Text>
        <ReadOnlyFieldRow>
          <ReadOnlyField label={t("mashingStepType")} value={typeLabel} minWidth={120} flex={1} />
          <ReadOnlyField
            label={t("mashingStepTemp", { unit: "°C" })}
            value={String(r.stepTemperatureC)}
            minWidth={90}
          />
          <ReadOnlyField
            label={t("mashingStepTime", { unit: "min" })}
            value={String(r.stepTimeMin)}
            minWidth={90}
          />
          <ReadOnlyField
            label={t("mashingStepAmount", { unit: "L" })}
            value={
              amountDisplay != null ? (
                <>
                  {amountDisplay} {tUnits("L")}
                </>
              ) : (
                "—"
              )
            }
            minWidth={120}
          />
        </ReadOnlyFieldRow>
      </Card>
    );
  }

  const {
    row: r,
    index: idx,
    editState,
    waterVolumes,
    firstStepAmountComputed = null,
    onUpdateStep,
    onMoveStep,
    onDeleteStep,
    t,
    tUnits,
    locale,
    formatFixed,
  } = props;
  const { isSpargeStep, disableName, disableType, disableAmount, typeValue, typeOptions, move } = editState;

  return (
    <Card key={r.id} gap="$2" padding="$3" background="$background" borderWidth={1} borderColor="$borderColor">
      <XStack justifyContent="space-between" alignItems="center">
        <Text fontSize={14} fontWeight="700">
          {idx + 1}. {r.name || t("mashingStepName")}
        </Text>
        <MashStepRowActions
          index={idx}
          rowId={r.id}
          move={move}
          onMoveStep={onMoveStep}
          onDeleteStep={onDeleteStep}
          t={t}
        />
      </XStack>

      <YStack gap="$2">
        <YStack gap="$1">
          <Text fontSize={11} opacity={0.8}>
            {t("mashingStepName")}
          </Text>
          {disableName ? (
            <Text fontSize={12} opacity={0.85}>
              {isSpargeStep ? "Sparge" : r.name || "Mash In"}
            </Text>
          ) : (
            <Input
              value={r.name}
              onChangeText={(text) => onUpdateStep?.(r.id, { name: text })}
              size="$3"
              background="$background"
              borderWidth={1}
              borderColor="$borderColor"
            />
          )}
        </YStack>

        <YStack gap="$1">
          <Text fontSize={11} opacity={0.8}>
            {t("mashingStepType")}
          </Text>
          {disableType ? (
            <Text fontSize={12} opacity={0.85}>
              Sparge
            </Text>
          ) : (
            <SelectField
              value={typeValue}
              onValueChange={(v) => onUpdateStep?.(r.id, { type: v as typeof typeValue })}
              options={typeOptions}
              width="full"
              aria-label={t("mashingStepType")}
            />
          )}
        </YStack>

        <XStack gap="$2" flexWrap="wrap">
          <YStack gap="$1" flex={1} minWidth={120}>
            <Text fontSize={11} opacity={0.8}>
              {t("mashingStepTemp", { unit: "°C" })}
            </Text>
            <Input
              keyboardType="decimal-pad"
              value={String(r.stepTemperatureC)}
              onChangeText={(text) => onUpdateStep?.(r.id, { stepTemperatureC: Number(text) || 0 })}
              size="$3"
              background="$background"
              borderWidth={1}
              borderColor="$borderColor"
            />
          </YStack>

          <YStack gap="$1" flex={1} minWidth={120}>
            <Text fontSize={11} opacity={0.8}>
              {t("mashingStepTime", { unit: "min" })}
            </Text>
            <Input
              keyboardType="decimal-pad"
              value={String(r.stepTimeMin)}
              onChangeText={(text) => onUpdateStep?.(r.id, { stepTimeMin: Math.max(0, Number(text) || 0) })}
              size="$3"
              background="$background"
              borderWidth={1}
              borderColor="$borderColor"
            />
          </YStack>
        </XStack>

        <YStack gap="$1">
          <Text fontSize={11} opacity={0.8}>
            {t("mashingStepAmount", { unit: tUnits("L") })}
          </Text>
          {isSpargeStep ? (
            <Text fontSize={12} opacity={0.85}>
              {waterVolumes ? `${formatFixed(locale, waterVolumes.spargeLiters, 2)} ${tUnits("L")}` : "—"}
            </Text>
          ) : idx === 0 && firstStepAmountComputed != null ? (
            <Text fontSize={12} opacity={0.85}>
              {formatFixed(locale, firstStepAmountComputed, 2)} {tUnits("L")}
            </Text>
          ) : (
            <Input
              keyboardType="decimal-pad"
              value={r.amountL != null ? String(r.amountL) : ""}
              onChangeText={(text) =>
                onUpdateStep?.(r.id, { amountL: text.trim() ? Math.max(0, Number(text) || 0) : null })
              }
              placeholder="—"
              size="$3"
              background="$background"
              borderWidth={1}
              borderColor="$borderColor"
              disabled={disableAmount}
            />
          )}
        </YStack>

        {idx > 0 ? (
          <XStack gap="$2" alignItems="center">
            <BrewCheckbox
              id={`mash-step-deduce-${r.id}`}
              checked={r.deduceFromMashIn === true}
              onCheckedChange={(checked) =>
                onUpdateStep?.(r.id, {
                  deduceFromMashIn: checked === true,
                })
              }
              size="$2"
              accessibilityLabel={t("mashingDeduceFromMashIn")}
              accessibilityRole="checkbox"
            />
            <Text fontSize={12} opacity={0.85}>
              {t("mashingDeduceFromMashIn")}
            </Text>
          </XStack>
        ) : null}
      </YStack>
    </Card>
  );
}
