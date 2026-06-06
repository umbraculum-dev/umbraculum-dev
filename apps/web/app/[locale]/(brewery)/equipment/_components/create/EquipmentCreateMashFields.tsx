"use client";

import { Input, View, XStack, YStack } from "tamagui";

import { RecipeEditFieldLabel } from "../../../_components/recipe-edit";

export function EquipmentCreateMashFields(props: {
  t: (key: string, values?: Record<string, string>) => string;
  tUnits: (key: string) => string;
  createMashVolumeLiters: string;
  setCreateMashVolumeLiters: (value: string) => void;
  createMashEfficiencyPercent: string;
  setCreateMashEfficiencyPercent: (value: string) => void;
  createMashLossesLiters: string;
  setCreateMashLossesLiters: (value: string) => void;
  createMashThicknessLPerKg: string;
  setCreateMashThicknessLPerKg: (value: string) => void;
  createMashGrainAbsorptionLPerKg: string;
  setCreateMashGrainAbsorptionLPerKg: (value: string) => void;
  createMashWaterLeftoverLiters: string;
  setCreateMashWaterLeftoverLiters: (value: string) => void;
}) {
  const {
    t,
    tUnits,
    createMashVolumeLiters,
    setCreateMashVolumeLiters,
    createMashEfficiencyPercent,
    setCreateMashEfficiencyPercent,
    createMashLossesLiters,
    setCreateMashLossesLiters,
    createMashThicknessLPerKg,
    setCreateMashThicknessLPerKg,
    createMashGrainAbsorptionLPerKg,
    setCreateMashGrainAbsorptionLPerKg,
    createMashWaterLeftoverLiters,
    setCreateMashWaterLeftoverLiters,
  } = props;

  return (
    <fieldset className="brew-fieldset">
      <legend className="brew-fieldset-legend">{t("sectionTitles.mash")}</legend>
      <XStack gap="$3" flexWrap="wrap" ai="flex-end">
        <View flex={1} minWidth={200}>
          <YStack gap="$1.5">
            <RecipeEditFieldLabel htmlFor="equip-mash-vol">
              {t("mashVolumeLitersLabel", { unit: tUnits("L") })}
            </RecipeEditFieldLabel>
            <Input
              id="equip-mash-vol"
              type="number"
              inputMode="decimal"
              value={createMashVolumeLiters}
              onChangeText={setCreateMashVolumeLiters}
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
            <RecipeEditFieldLabel htmlFor="equip-mash-eff">
              {t("mashEfficiencyPercentLabel")}
            </RecipeEditFieldLabel>
            <Input
              id="equip-mash-eff"
              type="number"
              inputMode="decimal"
              value={createMashEfficiencyPercent}
              onChangeText={setCreateMashEfficiencyPercent}
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
            <RecipeEditFieldLabel htmlFor="equip-mash-losses">
              {t("mashLossesLitersLabel", { unit: tUnits("L") })}
            </RecipeEditFieldLabel>
            <Input
              id="equip-mash-losses"
              type="number"
              inputMode="decimal"
              value={createMashLossesLiters}
              onChangeText={setCreateMashLossesLiters}
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
            <RecipeEditFieldLabel htmlFor="equip-mash-thickness">
              {t("mashThicknessLPerKgLabel", { unit: tUnits("LPerKg") })}
            </RecipeEditFieldLabel>
            <Input
              id="equip-mash-thickness"
              type="number"
              inputMode="decimal"
              value={createMashThicknessLPerKg}
              onChangeText={setCreateMashThicknessLPerKg}
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
            <RecipeEditFieldLabel htmlFor="equip-grain-abs">
              {t("mashGrainAbsorptionLPerKgLabel", { unit: tUnits("LPerKg") })}
            </RecipeEditFieldLabel>
            <Input
              id="equip-grain-abs"
              type="number"
              inputMode="decimal"
              value={createMashGrainAbsorptionLPerKg}
              onChangeText={setCreateMashGrainAbsorptionLPerKg}
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
            <RecipeEditFieldLabel htmlFor="equip-water-leftover">
              {t("mashWaterLeftoverLitersLabel", { unit: tUnits("L") })}
            </RecipeEditFieldLabel>
            <Input
              id="equip-water-leftover"
              type="number"
              inputMode="decimal"
              value={createMashWaterLeftoverLiters}
              onChangeText={setCreateMashWaterLeftoverLiters}
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
