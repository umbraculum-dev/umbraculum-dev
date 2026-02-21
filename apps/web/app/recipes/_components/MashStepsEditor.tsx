"use client";

import { Link } from "../../../src/i18n/navigation";
import { Button, Checkbox, Input, View, XStack, YStack } from "tamagui";
import { SizableText } from "tamagui";

import { BrewSelect } from "../../_components/BrewSelect";
import { CodeInline } from "../../_components/CodeInline";
import {
  RecipeEditFieldLabel,
  RecipeEditIngredientCard,
  RecipeEditReadOnlyValue,
} from "../../_components/recipe-edit";
import type { EditorMash, EditorMashStep, EditorMashStepType } from "../_lib/beerjsonRecipe";
import { MASH_STEP_TYPE_OPTIONS, MASH_TEMPLATES, newMashRowId } from "../_lib/beerjsonRecipe";

export type WaterVolumes = { mashLiters: number; spargeLiters: number };

type MashStepsEditorProps = {
  mashRows: EditorMashStep[];
  mashProcedure: { name: string; grainTemperatureC: number } | null;
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
  t: (key: string, values?: Record<string, string | number>) => string;
  tUnits: (key: string) => string;
  locale: string;
  formatFixed: (locale: string, value: number, decimals: number) => string;
};

export function MashStepsEditor({
  mashRows,
  mashProcedure,
  waterVolumes,
  mashWaterBudgetLiters = null,
  firstStepAmountComputed = null,
  hideSpargeFromTypeOptions = false,
  readOnly = false,
  recipeId = "",
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
}: MashStepsEditorProps) {
  if (readOnly) {
    return (
      <View>
        {mashRows.length > 0 ? (
          <YStack gap="$3">
            <SizableText size="$2" color="$gray10" mb="$2">
              {mashProcedure?.name ?? "Mash"} · {t("mashingGrainTemp")}: {mashProcedure?.grainTemperatureC ?? 20} °C
            </SizableText>
            {mashRows.map((r, idx) => {
              const isSpargeStep = r.type === "sparge" && r.name.trim().toLowerCase() === "sparge";
              const amountDisplay = isSpargeStep && waterVolumes
                ? formatFixed(locale, waterVolumes.spargeLiters, 2)
                : r.amountL != null && Number.isFinite(r.amountL)
                  ? formatFixed(locale, r.amountL, 2)
                  : "—";
              const rampVal = r.rampTimeMin != null ? String(r.rampTimeMin) : "—";
              const deduceVal = idx > 0 ? (r.deduceFromMashIn === true ? "Yes" : "—") : "—";
              return (
                <RecipeEditIngredientCard key={r.id}>
                  <XStack gap="$3" flexWrap="wrap" items="flex-end">
                    <View alignSelf="center">
                      <SizableText size="$2" fontWeight="bold">
                        {idx + 1}
                      </SizableText>
                    </View>
                    <YStack gap="$1" minW={80}>
                      <RecipeEditFieldLabel>{t("mashingStepName")}</RecipeEditFieldLabel>
                      <RecipeEditReadOnlyValue>{r.name}</RecipeEditReadOnlyValue>
                    </YStack>
                    <YStack gap="$1" minW={80}>
                      <RecipeEditFieldLabel>{t("mashingStepType")}</RecipeEditFieldLabel>
                      <RecipeEditReadOnlyValue>{r.type}</RecipeEditReadOnlyValue>
                    </YStack>
                    <YStack gap="$1" minW={60}>
                      <RecipeEditFieldLabel>{t("mashingStepTemp", { unit: "°C" })}</RecipeEditFieldLabel>
                      <RecipeEditReadOnlyValue>{r.stepTemperatureC}</RecipeEditReadOnlyValue>
                    </YStack>
                    <YStack gap="$1" minW={50}>
                      <RecipeEditFieldLabel>{t("mashingStepTime", { unit: "min" })}</RecipeEditFieldLabel>
                      <RecipeEditReadOnlyValue>{r.stepTimeMin}</RecipeEditReadOnlyValue>
                    </YStack>
                    <YStack gap="$1" minW={80}>
                      <RecipeEditFieldLabel>{t("mashingStepAmount", { unit: "L" })}</RecipeEditFieldLabel>
                      <RecipeEditReadOnlyValue>
                        {amountDisplay !== "—" ? (
                          <>
                            <CodeInline>{amountDisplay}</CodeInline> {tUnits("L")}
                          </>
                        ) : (
                          "—"
                        )}
                      </RecipeEditReadOnlyValue>
                    </YStack>
                    {rampVal !== "—" ? (
                      <YStack gap="$1" minW={50}>
                        <RecipeEditFieldLabel>{t("mashingStepRamp", { unit: "min" })}</RecipeEditFieldLabel>
                        <RecipeEditReadOnlyValue>{rampVal}</RecipeEditReadOnlyValue>
                      </YStack>
                    ) : null}
                    {idx > 0 && deduceVal !== "—" ? (
                      <YStack gap="$1" minW={100}>
                        <RecipeEditFieldLabel>{t("mashingDeduceFromMashIn")}</RecipeEditFieldLabel>
                        <RecipeEditReadOnlyValue>{deduceVal}</RecipeEditReadOnlyValue>
                      </YStack>
                    ) : null}
                  </XStack>
                </RecipeEditIngredientCard>
              );
            })}
            {recipeId ? (
              <SizableText size="$2" mt="$3" mb={0}>
                <Link href={`/recipes/${recipeId}/water/mash#mash-steps`}>
                  {t("mashingEditInMashPage")}
                </Link>
              </SizableText>
            ) : null}
          </YStack>
        ) : (
          <SizableText size="$2" color="$gray10">
            {t("mashingEmpty")}
            {recipeId ? (
              <>
                {" · "}
                <Link href={`/recipes/${recipeId}/water/mash#mash-steps`}>
                  {t("mashingEditInMashPage")}
                </Link>
              </>
            ) : null}
          </SizableText>
        )}
      </View>
    );
  }

  const inputStyle = {
    size: "$3" as const,
    w: "100%",
    bg: "var(--surface)",
    borderWidth: 1,
    borderColor: "var(--border)",
    rounded: "$2",
    fontFamily: "$body",
  };

  return (
    <View className="brew-mash-steps-editor" alignItems="flex-start" w="100%">
      {mashWaterBudgetLiters != null && !readOnly ? (
        <YStack gap="$2" mb="$3">
          <SizableText size="$2" color="$gray10">{t("mashStepsWaterBudgetNote")}</SizableText>
          <SizableText size="$2" color="$gray10">{t("mashStepsMashInAlwaysPresentNote")}</SizableText>
          <SizableText size="$2" color="$gray10">{t("mashStepsTypeFallbackNote")}</SizableText>
        </YStack>
      ) : null}
      {mashRows.length > 0 ? (
        <YStack gap="$3">
          <XStack gap="$3" flexWrap="wrap" items="flex-end">
            <YStack gap="$1" minW={200}>
              <RecipeEditFieldLabel>{t("mashingProcedureName")}</RecipeEditFieldLabel>
              <RecipeEditReadOnlyValue>{mashProcedure?.name ?? "Mash"}</RecipeEditReadOnlyValue>
            </YStack>
            <YStack gap="$1" minW={80}>
              <RecipeEditFieldLabel htmlFor="mash-grain-temp">{t("mashingGrainTemp")}</RecipeEditFieldLabel>
              <XStack gap="$2" ai="center">
                <Input
                  id="mash-grain-temp"
                  value={String(mashProcedure?.grainTemperatureC ?? 20)}
                  onChangeText={(text) => {
                    const v = Number(text);
                    onUpdateProcedure?.({
                      ...(mashProcedure ?? { name: "Mash", grainTemperatureC: 20 }),
                      grainTemperatureC: Number.isFinite(v) ? v : 20,
                    });
                  }}
                  keyboardType="numeric"
                  {...inputStyle}
                  w={80}
                />
                <SizableText size="$2">°C</SizableText>
              </XStack>
            </YStack>
          </XStack>
          <YStack gap="$3" mt="$3">
            {mashRows.map((r, idx) => {
              const isSpargeStep = r.type === "sparge" && r.name.trim().toLowerCase() === "sparge";
              return (
                <RecipeEditIngredientCard key={r.id}>
                  <XStack gap="$3" flexWrap="wrap" items="flex-start">
                    <View alignSelf="center" pt="$4">
                      <SizableText size="$2" fontWeight="bold">{idx + 1}</SizableText>
                    </View>
                    <YStack gap="$1" minW={100} flex={1}>
                      <RecipeEditFieldLabel htmlFor={isSpargeStep || (idx === 0 && firstStepAmountComputed != null) ? undefined : `mash-step-name-${r.id}`}>
                        {t("mashingStepName")}
                      </RecipeEditFieldLabel>
                      {isSpargeStep ? (
                        <RecipeEditReadOnlyValue>Sparge</RecipeEditReadOnlyValue>
                      ) : idx === 0 && firstStepAmountComputed != null ? (
                        <RecipeEditReadOnlyValue>{r.name || "Mash In"}</RecipeEditReadOnlyValue>
                      ) : (
                        <Input
                          id={`mash-step-name-${r.id}`}
                          value={r.name}
                          onChangeText={(text) => onUpdateStep?.(r.id, { name: text })}
                          placeholder={t("mashingStepName")}
                          {...inputStyle}
                        />
                      )}
                    </YStack>
                    <YStack gap="$1" minW={100} flex={1}>
                      <RecipeEditFieldLabel htmlFor={isSpargeStep ? undefined : `mash-step-type-${r.id}`}>
                        {t("mashingStepType")}
                      </RecipeEditFieldLabel>
                      {isSpargeStep ? (
                        <RecipeEditReadOnlyValue>Sparge</RecipeEditReadOnlyValue>
                      ) : (
                        <BrewSelect
                          id={`mash-step-type-${r.id}`}
                          value={r.type}
                          onValueChange={(v) => onUpdateStep?.(r.id, { type: v as EditorMashStepType })}
                          options={
                            hideSpargeFromTypeOptions
                              ? MASH_STEP_TYPE_OPTIONS.filter((o) => o.value !== "sparge")
                              : MASH_STEP_TYPE_OPTIONS
                          }
                          width="full"
                        />
                      )}
                    </YStack>
                    <YStack gap="$1" minW={60}>
                      <RecipeEditFieldLabel htmlFor={`mash-step-temp-${r.id}`}>
                        {t("mashingStepTemp", { unit: "°C" })}
                      </RecipeEditFieldLabel>
                      <Input
                        id={`mash-step-temp-${r.id}`}
                        value={String(r.stepTemperatureC)}
                        onChangeText={(text) => onUpdateStep?.(r.id, { stepTemperatureC: Number(text) || 0 })}
                        keyboardType="numeric"
                        {...inputStyle}
                      />
                    </YStack>
                    <YStack gap="$1" minW={50}>
                      <RecipeEditFieldLabel htmlFor={`mash-step-time-${r.id}`}>
                        {t("mashingStepTime", { unit: "min" })}
                      </RecipeEditFieldLabel>
                      <Input
                        id={`mash-step-time-${r.id}`}
                        value={String(r.stepTimeMin)}
                        onChangeText={(text) =>
                          onUpdateStep?.(r.id, { stepTimeMin: Math.max(0, Number(text) || 0) })
                        }
                        keyboardType="numeric"
                        {...inputStyle}
                      />
                    </YStack>
                    <YStack gap="$1" minW={80}>
                      {idx === 0 && r.type === "infusion" && waterVolumes && firstStepAmountComputed == null ? (
                        <SizableText size="$1" color="$gray10" mb="$1">
                          {t("mashingFirstStepSuggested", { amount: formatFixed(locale, waterVolumes.mashLiters, 2), unit: tUnits("L") })}
                        </SizableText>
                      ) : null}
                      <RecipeEditFieldLabel htmlFor={isSpargeStep || (idx === 0 && firstStepAmountComputed != null) ? undefined : `mash-step-amount-${r.id}`}>
                        {t("mashingStepAmount", { unit: "L" })}
                      </RecipeEditFieldLabel>
                      {isSpargeStep ? (
                        <>
                          <RecipeEditReadOnlyValue>
                            {waterVolumes ? (
                              <><CodeInline>{formatFixed(locale, waterVolumes.spargeLiters, 2)}</CodeInline> {tUnits("L")}</>
                            ) : (
                              t("mashingSpargeStepAmountUnavailable")
                            )}
                          </RecipeEditReadOnlyValue>
                          {waterVolumes ? (
                            <SizableText size="$1" color="$gray10" mt="$1">
                              {t("mashingSpargeStepAmountSource")}
                            </SizableText>
                          ) : null}
                        </>
                      ) : idx === 0 && firstStepAmountComputed != null ? (
                        <RecipeEditReadOnlyValue>
                          <CodeInline>{formatFixed(locale, firstStepAmountComputed, 2)}</CodeInline> {tUnits("L")}
                        </RecipeEditReadOnlyValue>
                      ) : (
                        <Input
                          id={`mash-step-amount-${r.id}`}
                          value={r.amountL != null ? String(r.amountL) : ""}
                          onChangeText={(text) => {
                            onUpdateStep?.(r.id, {
                              amountL: text === "" ? null : Math.max(0, Number(text) || 0),
                            });
                          }}
                          placeholder="—"
                          keyboardType="numeric"
                          {...inputStyle}
                          disabled={idx > 0 && r.deduceFromMashIn !== true}
                        />
                      )}
                    </YStack>
                    <YStack gap="$1" minW={50}>
                      <RecipeEditFieldLabel htmlFor={`mash-step-ramp-${r.id}`}>
                        {t("mashingStepRamp", { unit: "min" })}
                      </RecipeEditFieldLabel>
                      <Input
                        id={`mash-step-ramp-${r.id}`}
                        value={r.rampTimeMin != null ? String(r.rampTimeMin) : ""}
                        onChangeText={(text) => {
                          onUpdateStep?.(r.id, {
                            rampTimeMin: text === "" ? null : Math.max(0, Number(text) || 0),
                          });
                        }}
                        placeholder="—"
                        keyboardType="numeric"
                        {...inputStyle}
                      />
                    </YStack>
                    {idx > 0 ? (
                      <XStack gap="$2" alignSelf="center" pt="$4" ai="center">
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
                        <SizableText size="$2" color="$gray10" as="label" htmlFor={`mash-step-deduce-${r.id}`}>
                          {t("mashingDeduceFromMashIn")}
                        </SizableText>
                      </XStack>
                    ) : (
                      <View />
                    )}
                    {idx > 0 ? (
                      <View alignSelf="center">
                        <Button
                          size="$2"
                          chromeless
                          circular
                          onPress={() => onDeleteStep?.(r.id)}
                          aria-label={t("mashingDeleteStep")}
                        >
                          ×
                        </Button>
                      </View>
                    ) : (
                      <View />
                    )}
                  </XStack>
                </RecipeEditIngredientCard>
              );
            })}
          </YStack>
        </YStack>
      ) : (
        <SizableText size="$2" color="$gray10">{t("mashingEmpty")}</SizableText>
      )}

      <XStack gap="$2" mt="$3" flexWrap="wrap" ai="center">
        <Button size="$2" onPress={onAddStep}>
          {t("mashingAddStep")}
        </Button>
        <XStack gap="$2" ai="center">
          <SizableText size="$2" color="$gray10">{t("mashingAddFromTemplate")}:</SizableText>
          {MASH_TEMPLATES.filter((tpl) => tpl.id !== "sparge").map((tpl) => (
            <Button
              key={tpl.id}
              size="$2"
              chromeless
              onPress={() => onAddFromTemplate?.(tpl.id)}
            >
              {t(tpl.labelKey)}
            </Button>
          ))}
        </XStack>
      </XStack>
      {onSave ? (
        <YStack gap="$2" mt="$3">
          <Button size="$2" onPress={onSave} disabled={!canSave || saving}>
            {saving ? "Saving…" : t("mashingSaveMashSteps")}
          </Button>
          {recipeId ? (
            <SizableText size="$2" mt="$2" mb={0}>
              <Link href={`/recipes/${recipeId}/edit#mashing`}>{t("mashStepsSeeRecapLink")}</Link>
            </SizableText>
          ) : null}
        </YStack>
      ) : null}
      {saveStatus ? (
        <SizableText size="$2" color="$gray10" aria-live="polite" display="block" mt="$2">
          {saveStatus}
        </SizableText>
      ) : null}
    </View>
  );
}
