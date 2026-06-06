"use client";

import { type Dispatch, type SetStateAction } from "react";

import { Input, View, XStack, YStack } from "tamagui";

import { RecipeEditFieldLabel } from "../../../../../_components/recipe-edit";

export function EquipmentEditMashFields(props: {
  t: (key: string, values?: Record<string, string>) => string;
  tUnits: (key: string) => string;
  editDraft: Record<string, string>;
  setEditDraft: Dispatch<SetStateAction<Record<string, string>>>;
}) {
  const { t, tUnits, editDraft, setEditDraft } = props;

  return (
    <fieldset className="brew-fieldset">
      <legend className="brew-fieldset-legend">{t("sectionTitles.mash")}</legend>
      <XStack gap="$3" flexWrap="wrap" ai="flex-end">
        <View flex={1} minWidth={200}>
          <YStack gap="$1.5">
            <RecipeEditFieldLabel htmlFor="equip-edit-mash-vol">
              {t("mashVolumeLitersLabel", { unit: tUnits("L") })}
            </RecipeEditFieldLabel>
            <Input
              id="equip-edit-mash-vol"
              type="number"
              inputMode="decimal"
              value={editDraft["mashVolumeLiters"] ?? ""}
              onChangeText={(v) => setEditDraft((d) => ({ ...d, mashVolumeLiters: v }))}
              size="$3"
              w="100%"
              bg="var(--surface)"
              borderWidth={1}
              borderColor="var(--border)"
              rounded="$2"
              fontFamily="$body"
            />
          </YStack>
        </View>
        <View flex={1} minWidth={200}>
          <YStack gap="$1.5">
            <RecipeEditFieldLabel htmlFor="equip-edit-mash-eff">
              {t("mashEfficiencyPercentLabel")}
            </RecipeEditFieldLabel>
            <Input
              id="equip-edit-mash-eff"
              type="number"
              inputMode="decimal"
              value={editDraft["mashEfficiencyPercent"] ?? ""}
              onChangeText={(v) => setEditDraft((d) => ({ ...d, mashEfficiencyPercent: v }))}
              size="$3"
              w="100%"
              bg="var(--surface)"
              borderWidth={1}
              borderColor="var(--border)"
              rounded="$2"
              fontFamily="$body"
            />
          </YStack>
        </View>
        <View flex={1} minWidth={200}>
          <YStack gap="$1.5">
            <RecipeEditFieldLabel htmlFor="equip-edit-mash-losses">
              {t("mashLossesLitersLabel", { unit: tUnits("L") })}
            </RecipeEditFieldLabel>
            <Input
              id="equip-edit-mash-losses"
              type="number"
              inputMode="decimal"
              value={editDraft["mashLossesLiters"] ?? ""}
              onChangeText={(v) => setEditDraft((d) => ({ ...d, mashLossesLiters: v }))}
              size="$3"
              w="100%"
              bg="var(--surface)"
              borderWidth={1}
              borderColor="var(--border)"
              rounded="$2"
              fontFamily="$body"
            />
          </YStack>
        </View>
        <View flex={1} minWidth={200}>
          <YStack gap="$1.5">
            <RecipeEditFieldLabel htmlFor="equip-edit-thickness">
              {t("mashThicknessLPerKgLabel", { unit: tUnits("LPerKg") })}
            </RecipeEditFieldLabel>
            <Input
              id="equip-edit-thickness"
              type="number"
              inputMode="decimal"
              value={editDraft["mashThicknessLPerKg"] ?? ""}
              onChangeText={(v) => setEditDraft((d) => ({ ...d, mashThicknessLPerKg: v }))}
              size="$3"
              w="100%"
              bg="var(--surface)"
              borderWidth={1}
              borderColor="var(--border)"
              rounded="$2"
              fontFamily="$body"
            />
          </YStack>
        </View>
        <View flex={1} minWidth={200}>
          <YStack gap="$1.5">
            <RecipeEditFieldLabel htmlFor="equip-edit-grain-abs">
              {t("mashGrainAbsorptionLPerKgLabel", { unit: tUnits("LPerKg") })}
            </RecipeEditFieldLabel>
            <Input
              id="equip-edit-grain-abs"
              type="number"
              inputMode="decimal"
              value={editDraft["mashGrainAbsorptionLPerKg"] ?? ""}
              onChangeText={(v) => setEditDraft((d) => ({ ...d, mashGrainAbsorptionLPerKg: v }))}
              size="$3"
              w="100%"
              bg="var(--surface)"
              borderWidth={1}
              borderColor="var(--border)"
              rounded="$2"
              fontFamily="$body"
            />
          </YStack>
        </View>
        <View flex={1} minWidth={200}>
          <YStack gap="$1.5">
            <RecipeEditFieldLabel htmlFor="equip-edit-water-leftover">
              {t("mashWaterLeftoverLitersLabel", { unit: tUnits("L") })}
            </RecipeEditFieldLabel>
            <Input
              id="equip-edit-water-leftover"
              type="number"
              inputMode="decimal"
              value={editDraft["mashWaterLeftoverLiters"] ?? ""}
              onChangeText={(v) => setEditDraft((d) => ({ ...d, mashWaterLeftoverLiters: v }))}
              size="$3"
              w="100%"
              bg="var(--surface)"
              borderWidth={1}
              borderColor="var(--border)"
              rounded="$2"
              fontFamily="$body"
            />
          </YStack>
        </View>
      </XStack>
    </fieldset>
  );
}
