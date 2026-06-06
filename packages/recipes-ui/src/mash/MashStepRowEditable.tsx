import React from "react";
import { XStack, YStack } from "tamagui";

import { BrewCheckbox, Card, Input, SelectField, Text } from "@umbraculum/ui";

import { MashStepRowActions } from "./MashStepsToolbar";
import type { MashStepRowEditableProps } from "./MashStepRow.types";

export function MashStepRowEditable(props: MashStepRowEditableProps) {
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
