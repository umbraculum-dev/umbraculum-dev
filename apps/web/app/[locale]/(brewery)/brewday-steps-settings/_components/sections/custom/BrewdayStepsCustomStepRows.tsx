"use client";

import { Button, Checkbox, Input, SizableText, View, XStack, YStack } from "tamagui";

import { BrewSelect } from "../../../../../../_components/BrewSelect";
import {
  RecipeEditFieldLabel,
  RecipeEditIngredientCard,
} from "../../../../../../_components/recipe-edit";
import { parseMinutes } from "../../../_lib/brewdayStepsTypes";
import type { useBrewdayStepsSettingsPage } from "../../../_hooks/useBrewdayStepsSettingsPage";

type Model = ReturnType<typeof useBrewdayStepsSettingsPage>;

export function BrewdayStepsCustomStepRows(props: { model: Model }) {
  const {
    t,
    customSteps,
    moveCustomStepUp,
    moveCustomStepDown,
    updateCustomStep,
    removeCustomStep,
    sectionOptions,
  } = props.model;

  if (!customSteps.length) return null;

  return (
    <YStack gap="$2" mt="$3">
      {customSteps.map((s, idx) => (
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
                  onPress={() => moveCustomStepUp(idx)}
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
                  onPress={() => moveCustomStepDown(idx)}
                  disabled={idx === customSteps.length - 1}
                  aria-label={t("moveDown")}
                >
                  ↓
                </Button>
              </XStack>
              <View flex={1} minW={120}>
                <RecipeEditFieldLabel htmlFor={`custom-name-${s.id}`}>
                  {t("name")}
                </RecipeEditFieldLabel>
                <Input
                  id={`custom-name-${s.id}`}
                  value={s.name}
                  onChangeText={(v) =>
                    updateCustomStep(s.id, { name: v })}
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
                <RecipeEditFieldLabel htmlFor={`custom-minutes-${s.id}`}>
                  {t("minutes")}
                </RecipeEditFieldLabel>
                <Input
                  id={`custom-minutes-${s.id}`}
                  value={
                    s.minutes != null && s.minutes !== undefined
                      ? String(s.minutes)
                      : ""
                  }
                  onChangeText={(v) => {
                    const m = parseMinutes(v);
                    updateCustomStep(s.id, { minutes: m });
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
                <RecipeEditFieldLabel htmlFor={`custom-section-${s.id}`}>
                  {t("assignedSection")}
                </RecipeEditFieldLabel>
                <BrewSelect
                  id={`custom-section-${s.id}`}
                  value={s.sectionId}
                  onValueChange={(v) =>
                    updateCustomStep(s.id, { sectionId: v })}
                  options={sectionOptions}
                  width="full"
                />
              </View>
              <XStack gap="$2" items="center">
                <Checkbox
                  id={`custom-exclude-${s.id}`}
                  checked={s.exclude}
                  onCheckedChange={(c) =>
                    updateCustomStep(s.id, { exclude: c === true })
                  }
                  size="$2"
                  aria-label={`${t("exclude")} ${s.name}`}
                >
                  <Checkbox.Indicator />
                </Checkbox>
                <SizableText
                  as="label"
                  htmlFor={`custom-exclude-${s.id}`}
                  size="$2"
                  color="var(--text-muted)"
                  fontFamily="$body"
                >
                  {t("exclude")}
                </SizableText>
              </XStack>
              <Button
                size="$2"
                bg="var(--surface-2)"
                borderWidth={1}
                borderColor="var(--border)"
                color="var(--text)"
                fontFamily="$body"
                onPress={() => removeCustomStep(s.id)}
                aria-label={`${t("remove")} ${s.name}`}
              >
                {t("remove")}
              </Button>
            </XStack>
          </YStack>
        </RecipeEditIngredientCard>
      ))}
    </YStack>
  );
}
