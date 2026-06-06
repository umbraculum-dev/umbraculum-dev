"use client";

import { Button, Checkbox, Input, SizableText, View, XStack, YStack } from "tamagui";

import { BrewSelect } from "../../../_components/BrewSelect";
import {
  RecipeEditFieldLabel,
  RecipeEditIngredientCard,
  RecipeEditSection,
} from "../../../_components/recipe-edit";
import { parseMinutes } from "../../_lib/brewdayStepsTypes";
import type { useBrewdayStepsSettingsPage } from "../../_hooks/useBrewdayStepsSettingsPage";

type Model = ReturnType<typeof useBrewdayStepsSettingsPage>;

export function BrewdayStepsDefaultSection(props: { model: Model }) {
  const {
    t,
    openSections,
    setSectionOpen,
    loading,
    defaultSteps,
    moveDefaultStepUp,
    moveDefaultStepDown,
    updateDefaultStep,
    sectionOptions,
    onSave,
    saving,
    canCallAccountScoped,
  } = props.model;

  return (
    <RecipeEditSection
      id="brewday-steps-default"
      headingId="brewday-steps-default-heading"
      label={t("sections.brewdayStepsDefault.title")}
      open={openSections['brewdayStepsDefault']}
      onOpenChange={(open) => setSectionOpen("brewdayStepsDefault", open)}
    >
      <SizableText
        size="$2"
        color="var(--text-muted)"
        fontFamily="$body"
        mt={0}
        mb="$2"
      >
        {t("defaultSectionNote")}
      </SizableText>

      {loading ? (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("loading")}
        </SizableText>
      ) : (
        <>
          {defaultSteps.length ? (
            <YStack gap="$2" mt="$3">
              {defaultSteps.map((s, idx) => (
                <RecipeEditIngredientCard key={s.id}>
                  <YStack gap="$2">
                    <XStack gap="$2" items="center" flexWrap="wrap">
                      <XStack gap="$1" flexShrink={0}>
                        <Button
                          size="$2"
                          bg="var(--surface-2)"
                          borderWidth={1}
                          borderColor="var(--border)"
                          color="var(--text)"
                          fontFamily="$body"
                          onPress={() => moveDefaultStepUp(idx)}
                          disabled={idx === 0}
                          aria-label={t("moveUp")}
                        >
                          ↑
                        </Button>
                        <Button
                          size="$2"
                          bg="var(--surface-2)"
                          borderWidth={1}
                          borderColor="var(--border)"
                          color="var(--text)"
                          fontFamily="$body"
                          onPress={() => moveDefaultStepDown(idx)}
                          disabled={idx === defaultSteps.length - 1}
                          aria-label={t("moveDown")}
                        >
                          ↓
                        </Button>
                      </XStack>
                      <View flex={1} minW={120}>
                        <RecipeEditFieldLabel htmlFor={`default-name-${s.id}`}>
                          {t("name")}
                        </RecipeEditFieldLabel>
                        <Input
                          id={`default-name-${s.id}`}
                          value={s.name}
                          onChangeText={(v) => updateDefaultStep(s.id, { name: v })}
                          size="$3"
                          w="100%"
                          bg="var(--surface)"
                          borderWidth={1}
                          borderColor="var(--border)"
                          rounded="$2"
                          fontFamily="$body"
                        />
                      </View>
                      <View minW={80}>
                        <RecipeEditFieldLabel htmlFor={`default-minutes-${s.id}`}>
                          {t("minutes")}
                        </RecipeEditFieldLabel>
                        <Input
                          id={`default-minutes-${s.id}`}
                          value={
                            s.minutes != null && s.minutes !== undefined
                              ? String(s.minutes)
                              : ""
                          }
                          onChangeText={(v) => {
                            const m = parseMinutes(v);
                            updateDefaultStep(s.id, {
                              minutes: m,
                            });
                          }}
                          placeholder="—"
                          keyboardType="numeric"
                          size="$3"
                          w="100%"
                          bg="var(--surface)"
                          borderWidth={1}
                          borderColor="var(--border)"
                          rounded="$2"
                          fontFamily="$body"
                        />
                      </View>
                      <View minW={140}>
                        <RecipeEditFieldLabel htmlFor={`default-section-${s.id}`}>
                          {t("assignedSection")}
                        </RecipeEditFieldLabel>
                        <BrewSelect
                          id={`default-section-${s.id}`}
                          value={s.sectionId}
                          onValueChange={(v) =>
                            updateDefaultStep(s.id, { sectionId: v })}
                          options={sectionOptions}
                          width="full"
                        />
                      </View>
                      <XStack gap="$2" items="center">
                        <Checkbox
                          id={`default-exclude-${s.id}`}
                          checked={s.exclude}
                          onCheckedChange={(c) =>
                            updateDefaultStep(s.id, { exclude: c === true })
                          }
                          size="$2"
                          aria-label={`${t("exclude")} ${s.name}`}
                        >
                          <Checkbox.Indicator />
                        </Checkbox>
                        <SizableText
                          as="label"
                          htmlFor={`default-exclude-${s.id}`}
                          size="$2"
                          color="var(--text-muted)"
                          fontFamily="$body"
                        >
                          {t("exclude")}
                        </SizableText>
                      </XStack>
                    </XStack>
                  </YStack>
                </RecipeEditIngredientCard>
              ))}
            </YStack>
          ) : null}

          <XStack gap="$3" items="center" mt="$3">
            <Button
              size="$3"
              bg="var(--surface-2)"
              borderWidth={1}
              borderColor="var(--border)"
              color="var(--text)"
              fontFamily="$body"
              onPress={() => { void onSave(); }}
              disabled={!canCallAccountScoped || saving}
            >
              {saving
                ? t("saving")
                : t("save")}
            </Button>
          </XStack>
        </>
      )}
    </RecipeEditSection>
  );
}
