"use client";

import { Button, Checkbox, Input, SizableText, View, XStack, YStack } from "tamagui";

import {
  RecipeEditFieldLabel,
  RecipeEditIngredientCard,
  RecipeEditSection,
} from "../../../_components/recipe-edit";
import { PRESET_KEYS } from "../../_lib/brewdayStepsTypes";
import type { useBrewdayStepsSettingsPage } from "../../_hooks/useBrewdayStepsSettingsPage";

type Model = ReturnType<typeof useBrewdayStepsSettingsPage>;

export function BrewdayStepsSectionsSection(props: { model: Model }) {
  const {
    t,
    openSections,
    setSectionOpen,
    loading,
    presetExcludes,
    setPresetExclude,
    sections,
    setCustomSectionExclude,
    removeCustomSection,
    customSectionName,
    setCustomSectionName,
    addCustomSection,
    canCallAccountScoped,
    onSave,
    saving,
  } = props.model;

  return (
    <RecipeEditSection
      id="brewday-steps-sections"
      headingId="brewday-steps-sections-heading"
      label={t("sections.brewdayStepsSections.title")}
      open={openSections['brewdayStepsSections']}
      onOpenChange={(open) => setSectionOpen("brewdayStepsSections", open)}
    >
      {loading ? (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("loading")}
        </SizableText>
      ) : (
        <>
          <YStack gap="$2" mt="$2">
            {PRESET_KEYS.map((k) => (
              <RecipeEditIngredientCard key={k}>
                <XStack gap="$2" items="center" flexWrap="wrap">
                  <SizableText
                    size="$3"
                    fontFamily="$body"
                    color="var(--text)"
                    flex={1}
                    minW={0}
                  >
                    {t(`presetSections.${k}`)}
                  </SizableText>
                  <XStack gap="$2" items="center">
                    <Checkbox
                      id={`section-exclude-preset-${k}`}
                      checked={presetExcludes[k] ?? false}
                      onCheckedChange={(c) =>
                        setPresetExclude(k, c === true)
                      }
                      size="$2"
                      aria-label={`${t("exclude")} ${t(`presetSections.${k}`)}`}
                    >
                      <Checkbox.Indicator />
                    </Checkbox>
                    <SizableText
                      as="label"
                      htmlFor={`section-exclude-preset-${k}`}
                      size="$2"
                      color="var(--text-muted)"
                      fontFamily="$body"
                    >
                      {t("exclude")}
                    </SizableText>
                  </XStack>
                </XStack>
              </RecipeEditIngredientCard>
            ))}
            {sections.customSections.map((c) => (
              <RecipeEditIngredientCard key={c.id}>
                <XStack gap="$2" items="center" flexWrap="wrap">
                  <SizableText
                    size="$3"
                    fontFamily="$body"
                    color="var(--text)"
                    flex={1}
                    minW={0}
                  >
                    {c.name}
                  </SizableText>
                  <XStack gap="$2" items="center">
                    <Checkbox
                      id={`section-exclude-custom-${c.id}`}
                      checked={c.exclude}
                      onCheckedChange={(ch) =>
                        setCustomSectionExclude(c.id, ch === true)
                      }
                      size="$2"
                      aria-label={`${t("exclude")} ${c.name}`}
                    >
                      <Checkbox.Indicator />
                    </Checkbox>
                    <SizableText
                      as="label"
                      htmlFor={`section-exclude-custom-${c.id}`}
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
                    onPress={() => removeCustomSection(c.id)}
                    aria-label={`${t("remove")} ${c.name}`}
                  >
                    {t("remove")}
                  </Button>
                </XStack>
              </RecipeEditIngredientCard>
            ))}
          </YStack>
          <XStack gap="$2" items="flex-end" flexWrap="wrap" mt="$3">
            <View flex={1} minW={180}>
              <RecipeEditFieldLabel htmlFor="add-custom-section">
                {t("addCustomSection")}
              </RecipeEditFieldLabel>
              <Input
                id="add-custom-section"
                value={customSectionName}
                onChangeText={setCustomSectionName}
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
              onPress={addCustomSection}
              disabled={!canCallAccountScoped || !customSectionName.trim()}
            >
              {t("add")}
            </Button>
          </XStack>
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
