import React from "react";
import { Checkbox, XStack, YStack } from "tamagui";

import type { EditorMashStep, EditorMashStepType } from "@brewery/beerjson";
import { MASH_STEP_TYPE_OPTIONS, MASH_TEMPLATES } from "@brewery/beerjson";

import { Button, Card, Input, ReadOnlyField, ReadOnlyFieldRow, SelectField, Text } from "@brewery/ui";

export type WaterVolumes = { mashLiters: number; spargeLiters: number };

export interface MashStepsEditorProps {
  mashRows: EditorMashStep[];
  mashProcedure?: { name: string; grainTemperatureC: number } | null;
  waterVolumes: WaterVolumes | null;
  mashWaterBudgetLiters?: number | null;
  firstStepAmountComputed?: number | null;
  hideSpargeFromTypeOptions?: boolean;
  readOnly?: boolean;
  recipeId?: string;
  onUpdateProcedure?: (patch: { name?: string; grainTemperatureC?: number }) => void;
  onUpdateStep?: (id: string, patch: Partial<EditorMashStep>) => void;
  onAddStep?: () => void;
  onDeleteStep?: (id: string) => void;
  onAddFromTemplate?: (templateId: string) => void;
  onSave?: () => void;
  canSave?: boolean;
  saving?: boolean;
  saveStatus?: string | null;
  onDismissSaveStatus?: () => void;
  t: (key: string, values?: Record<string, string | number>) => string;
  tUnits: (key: string) => string;
  locale: string;
  formatFixed: (locale: string, value: number, decimals: number) => string;
}

function stepTypeOptions(hideSparge: boolean | undefined) {
  return hideSparge ? MASH_STEP_TYPE_OPTIONS.filter((o) => o.value !== "sparge") : MASH_STEP_TYPE_OPTIONS;
}

export function MashStepsEditor(props: MashStepsEditorProps) {
  const {
    mashRows,
    mashProcedure = null,
    waterVolumes,
    mashWaterBudgetLiters = null,
    firstStepAmountComputed = null,
    hideSpargeFromTypeOptions = false,
    readOnly = false,
    onUpdateProcedure,
    onUpdateStep,
    onAddStep,
    onDeleteStep,
    onAddFromTemplate,
    onSave,
    canSave = false,
    saving = false,
    saveStatus = null,
    t,
    tUnits,
    locale,
    formatFixed,
  } = props;

  if (readOnly) {
    return (
      <YStack gap="$2">
        {mashProcedure ? (
          <Text fontSize={12} opacity={0.8}>
            {mashProcedure.name} · {t("mashingGrainTemp")}: {mashProcedure.grainTemperatureC} °C
          </Text>
        ) : null}

        {mashRows.length ? (
          mashRows.map((r, idx) => {
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
                theme="surface2"
                gap="$2"
                padding="$3"
                backgroundColor="$background"
                borderWidth={1}
                borderColor="$borderColor"
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
          })
        ) : (
          <Text fontSize={12} opacity={0.8}>
            {t("mashingEmpty")}
          </Text>
        )}
      </YStack>
    );
  }

  return (
    <YStack gap="$3">
      {mashWaterBudgetLiters != null ? (
        <Text fontSize={12} opacity={0.8}>
          {t("mashStepsWaterBudgetNote")}
        </Text>
      ) : null}

      {mashProcedure && onUpdateProcedure ? (
        <Card gap="$2" padding="$3" background="$background" borderWidth={1} borderColor="$borderColor">
          <Text fontSize={12} fontWeight="700">
            {t("mashingProcedureName")}
          </Text>
          <Input
            value={mashProcedure.name}
            onChangeText={(text) => onUpdateProcedure({ name: text })}
            size="$3"
            background="$background"
            borderWidth={1}
            borderColor="$borderColor"
          />
          <Text fontSize={12} fontWeight="700" marginTop="$2">
            {t("mashingGrainTemp")}
          </Text>
          <Input
            keyboardType="decimal-pad"
            value={String(mashProcedure.grainTemperatureC)}
            onChangeText={(text) => {
              const v = Number(text);
              onUpdateProcedure({ grainTemperatureC: Number.isFinite(v) ? v : mashProcedure.grainTemperatureC });
            }}
            size="$3"
            background="$background"
            borderWidth={1}
            borderColor="$borderColor"
          />
        </Card>
      ) : null}

      {mashRows.map((r, idx) => {
        const isSpargeStep = r.type === "sparge" && r.name.trim().toLowerCase() === "sparge";
        const disableName = isSpargeStep || (idx === 0 && firstStepAmountComputed != null);
        const disableType = isSpargeStep;
        const disableAmount = isSpargeStep || (idx === 0 && firstStepAmountComputed != null) || (idx > 0 && r.deduceFromMashIn === true);
        const typeOptions = stepTypeOptions(hideSpargeFromTypeOptions);
        const typeValue: EditorMashStepType = r.type;

        return (
          <Card key={r.id} gap="$2" padding="$3" background="$background" borderWidth={1} borderColor="$borderColor">
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize={14} fontWeight="700">
                {idx + 1}. {r.name || t("mashingStepName")}
              </Text>
              {idx > 0 && onDeleteStep ? (
                <Button size="$2" chromeless onPress={() => onDeleteStep(r.id)}>
                  <Text fontSize={12}>{t("mashingDeleteStep")}</Text>
                </Button>
              ) : null}
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
                  <Text fontSize={12} opacity={0.85}>Sparge</Text>
                ) : (
                  <SelectField
                    value={typeValue}
                    onValueChange={(v) => onUpdateStep?.(r.id, { type: v as EditorMashStepType })}
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
                  {t("mashingStepAmount", { unit: "L" })} ({tUnits("L")})
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
                  <Checkbox
                    id={`mash-step-deduce-${r.id}`}
                    checked={r.deduceFromMashIn === true}
                    onCheckedChange={(checked) =>
                      onUpdateStep?.(r.id, {
                        deduceFromMashIn: checked === true,
                        ...(checked === true ? {} : { amountL: 0 }),
                      })
                    }
                    aria-label={t("mashingDeduceFromMashIn")}
                    size="$2"
                    native
                  >
                    <Checkbox.Indicator />
                  </Checkbox>
                  <Text fontSize={12} opacity={0.85}>
                    {t("mashingDeduceFromMashIn")}
                  </Text>
                </XStack>
              ) : null}
            </YStack>
          </Card>
        );
      })}

      <XStack gap="$2" flexWrap="wrap" alignItems="center">
        {onAddStep ? (
          <Button size="$3" onPress={onAddStep}>
            <Text>{t("mashingAddStep")}</Text>
          </Button>
        ) : null}

        {onAddFromTemplate ? (
          <XStack gap="$2" flexWrap="wrap" alignItems="center">
            <Text fontSize={12} opacity={0.8}>
              {t("mashingAddFromTemplate")}:
            </Text>
            {MASH_TEMPLATES.filter((tpl) => tpl.id !== "sparge").map((tpl) => (
              <Button key={tpl.id} size="$3" chromeless onPress={() => onAddFromTemplate(tpl.id)}>
                <Text fontSize={12}>{t(tpl.labelKey)}</Text>
              </Button>
            ))}
          </XStack>
        ) : null}
      </XStack>

      {onSave ? (
        <YStack gap="$2">
          <Button size="$3" onPress={onSave} disabled={!canSave || saving}>
            <Text>{saving ? t("saving") : t("mashingSaveMashSteps")}</Text>
          </Button>
          {saveStatus ? (
            <Card gap="$1" padding="$2" background="$color4" borderWidth={1} borderColor="$borderColor">
              <Text fontSize={12}>{saveStatus}</Text>
            </Card>
          ) : null}
        </YStack>
      ) : null}
    </YStack>
  );
}

