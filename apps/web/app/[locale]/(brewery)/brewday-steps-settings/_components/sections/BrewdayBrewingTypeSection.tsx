"use client";

import { Button, Input, SizableText, View, XStack, YStack } from "tamagui";

import { BrewSelect } from "../../../../../_components/BrewSelect";
import {
  RecipeEditFieldLabel,
  RecipeEditIngredientCard,
  RecipeEditSection,
} from "../../../../../_components/recipe-edit";
import { BREWING_TYPE_OPTIONS } from "../../_lib/brewdayStepsTypes";
import type { useBrewdayStepsSettingsPage } from "../../_hooks/useBrewdayStepsSettingsPage";

type Model = ReturnType<typeof useBrewdayStepsSettingsPage>;

export function BrewdayBrewingTypeSection(props: { model: Model }) {
  const {
    t,
    openSections,
    setSectionOpen,
    brewingType,
    setBrewingType,
    brewingTypeOptions,
    addBrewingMethodFromDropdown,
    canCallAccountScoped,
    customBrewingMethodName,
    setCustomBrewingMethodName,
    addCustomBrewingMethod,
    sections,
    removeBrewingMethodFromList,
    onSave,
    saving,
  } = props.model;

  return (
    <RecipeEditSection
      id="brewing-type"
      headingId="brewing-type-heading"
      label={t("sections.brewingType.title")}
      open={openSections['brewingType']}
      onOpenChange={(open) => setSectionOpen("brewingType", open)}
    >
      <XStack gap="$2" items="flex-end" flexWrap="wrap">
        <View flex={1} minW={180}>
          <RecipeEditFieldLabel htmlFor="brewing-type-select">
            {t("sections.brewingType.label")}
          </RecipeEditFieldLabel>
          <BrewSelect
            id="brewing-type-select"
            value={brewingType}
            onValueChange={setBrewingType}
            options={brewingTypeOptions}
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
          onPress={addBrewingMethodFromDropdown}
          disabled={!canCallAccountScoped || !brewingType}
          aria-label={`${t("add")} ${brewingType}`}
        >
          {t("add")}
        </Button>
      </XStack>
      <XStack gap="$2" items="flex-end" flexWrap="wrap" mt="$3">
        <View flex={1} minW={180}>
          <RecipeEditFieldLabel htmlFor="add-custom-brewing-method">
            {t("addCustomBrewingMethod")}
          </RecipeEditFieldLabel>
          <Input
            id="add-custom-brewing-method"
            value={customBrewingMethodName}
            onChangeText={setCustomBrewingMethodName}
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
        <Button
          size="$3"
          bg="var(--surface-2)"
          borderWidth={1}
          borderColor="var(--border)"
          color="var(--text)"
          fontFamily="$body"
          onPress={addCustomBrewingMethod}
          disabled={!canCallAccountScoped || !customBrewingMethodName.trim()}
        >
          {t("add")}
        </Button>
      </XStack>
      <YStack gap="$2" mt="$3">
        {(sections.customBrewingMethods ?? []).map((name, idx) => {
          const preset = BREWING_TYPE_OPTIONS.find((o) => o.value === name);
          const displayName = preset ? t(preset.labelKey) : name;
          return (
            <RecipeEditIngredientCard key={`${name}-${idx}`}>
              <XStack gap="$2" items="center" flexWrap="wrap">
                <SizableText
                  size="$3"
                  fontFamily="$body"
                  color="var(--text)"
                  flex={1}
                  minW={0}
                >
                  {displayName}
                </SizableText>
                <Button
                  size="$2"
                  bg="var(--surface-2)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  color="var(--text)"
                  fontFamily="$body"
                  onPress={() => removeBrewingMethodFromList(idx)}
                  aria-label={`${t("remove")} ${displayName}`}
                >
                  {t("remove")}
                </Button>
              </XStack>
            </RecipeEditIngredientCard>
          );
        })}
      </YStack>
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
          {saving ? t("saving") : t("save")}
        </Button>
      </XStack>
    </RecipeEditSection>
  );
}
