"use client";

import { Input, View, XStack, YStack } from "tamagui";

import { RecipeEditFieldLabel } from "../../../_components/recipe-edit";

export function EquipmentCreateKettleFields(props: {
  t: (key: string, values?: Record<string, string>) => string;
  tUnits: (key: string) => string;
  createKettleVolumeLiters: string;
  setCreateKettleVolumeLiters: (value: string) => void;
  createKettleLossesLiters: string;
  setCreateKettleLossesLiters: (value: string) => void;
  createKettleBoilEvaporationRatePercentPerHour: string;
  setCreateKettleBoilEvaporationRatePercentPerHour: (value: string) => void;
  createKettleCoolingShrinkagePercent: string;
  setCreateKettleCoolingShrinkagePercent: (value: string) => void;
  createKettleHopsAbsorptionLiters: string;
  setCreateKettleHopsAbsorptionLiters: (value: string) => void;
}) {
  const {
    t,
    tUnits,
    createKettleVolumeLiters,
    setCreateKettleVolumeLiters,
    createKettleLossesLiters,
    setCreateKettleLossesLiters,
    createKettleBoilEvaporationRatePercentPerHour,
    setCreateKettleBoilEvaporationRatePercentPerHour,
    createKettleCoolingShrinkagePercent,
    setCreateKettleCoolingShrinkagePercent,
    createKettleHopsAbsorptionLiters,
    setCreateKettleHopsAbsorptionLiters,
  } = props;

  return (
    <fieldset className="brew-fieldset">
      <legend className="brew-fieldset-legend">{t("sectionTitles.kettle")}</legend>
      <XStack gap="$3" flexWrap="wrap" ai="flex-end">
        <View flex={1} minWidth={200}>
          <YStack gap="$1.5">
            <RecipeEditFieldLabel htmlFor="equip-kettle-vol">
              {t("kettleVolumeLitersLabel", { unit: tUnits("L") })}
            </RecipeEditFieldLabel>
            <Input
              id="equip-kettle-vol"
              type="number"
              inputMode="decimal"
              value={createKettleVolumeLiters}
              onChangeText={setCreateKettleVolumeLiters}
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
            <RecipeEditFieldLabel htmlFor="equip-kettle-losses">
              {t("kettleLossesLitersLabel", { unit: tUnits("L") })}
            </RecipeEditFieldLabel>
            <Input
              id="equip-kettle-losses"
              type="number"
              inputMode="decimal"
              value={createKettleLossesLiters}
              onChangeText={setCreateKettleLossesLiters}
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
            <RecipeEditFieldLabel htmlFor="equip-evap">
              {t("kettleBoilEvaporationRatePercentPerHourLabel")}
            </RecipeEditFieldLabel>
            <Input
              id="equip-evap"
              type="number"
              inputMode="decimal"
              value={createKettleBoilEvaporationRatePercentPerHour}
              onChangeText={setCreateKettleBoilEvaporationRatePercentPerHour}
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
            <RecipeEditFieldLabel htmlFor="equip-shrink">
              {t("kettleCoolingShrinkagePercentLabel")}
            </RecipeEditFieldLabel>
            <Input
              id="equip-shrink"
              type="number"
              inputMode="decimal"
              value={createKettleCoolingShrinkagePercent}
              onChangeText={setCreateKettleCoolingShrinkagePercent}
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
            <RecipeEditFieldLabel htmlFor="equip-hops-abs">
              {t("kettleHopsAbsorptionLitersLabel", { unit: tUnits("LPerG") })}
            </RecipeEditFieldLabel>
            <Input
              id="equip-hops-abs"
              type="number"
              inputMode="decimal"
              value={createKettleHopsAbsorptionLiters}
              onChangeText={setCreateKettleHopsAbsorptionLiters}
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
