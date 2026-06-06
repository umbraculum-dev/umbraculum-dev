"use client";

import { Button, Input, View, XStack } from "tamagui";

import { BrewSelect } from "../../../../../../_components/BrewSelect";
import { RecipeEditFieldLabel } from "../../../../../../_components/recipe-edit";
import type { useBrewdayStepsSettingsPage } from "../../../_hooks/useBrewdayStepsSettingsPage";

type Model = ReturnType<typeof useBrewdayStepsSettingsPage>;

export function BrewdayStepsCustomAddForm(props: { model: Model }) {
  const {
    t,
    customStepName,
    setCustomStepName,
    customStepMinutes,
    setCustomStepMinutes,
    customStepSectionId,
    setCustomStepSectionId,
    sectionOptions,
    addCustomStep,
    canCallAccountScoped,
  } = props.model;

  return (
    <XStack gap="$2" items="flex-end" flexWrap="wrap" mt="$3">
      <View flex={1} minW={120}>
        <RecipeEditFieldLabel htmlFor="custom-step-name">
          {t("name")}
        </RecipeEditFieldLabel>
        <Input
          id="custom-step-name"
          value={customStepName}
          onChangeText={setCustomStepName}
          placeholder={t("name")}
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
        <RecipeEditFieldLabel htmlFor="custom-step-minutes">
          {t("minutes")}
        </RecipeEditFieldLabel>
        <Input
          id="custom-step-minutes"
          value={customStepMinutes}
          onChangeText={setCustomStepMinutes}
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
      <View flex={1} minW={140}>
        <RecipeEditFieldLabel htmlFor="custom-step-section">
          {t("assignedSection")}
        </RecipeEditFieldLabel>
        <BrewSelect
          id="custom-step-section"
          value={customStepSectionId}
          onValueChange={setCustomStepSectionId}
          options={[
            { value: "", label: "—" },
            ...sectionOptions,
          ]}
          width="full"
        />
      </View>
      <Button
        size="$3"
        bg="var(--surface-2)"
        borderWidth={1}
        borderColor="var(--border)"
        color="var(--text)"
        fontFamily="$body"
        onPress={addCustomStep}
        disabled={!canCallAccountScoped || !customStepName.trim()}
      >
        {t("add")}
      </Button>
    </XStack>
  );
}
