"use client";

import { type Dispatch, type SetStateAction } from "react";

import { Input, View, XStack, YStack } from "tamagui";

import { RecipeEditFieldLabel } from "../../../../../_components/recipe-edit";

export function EquipmentEditKettleFields(props: {
  t: (key: string, values?: Record<string, string>) => string;
  tUnits: (key: string) => string;
  editDraft: Record<string, string>;
  setEditDraft: Dispatch<SetStateAction<Record<string, string>>>;
}) {
  const { t, tUnits, editDraft, setEditDraft } = props;

  return (
    <fieldset className="brew-fieldset">
      <legend className="brew-fieldset-legend">{t("sectionTitles.kettle")}</legend>
      <XStack gap="$3" flexWrap="wrap" ai="flex-end">
        <View flex={1} minWidth={200}>
          <YStack gap="$1.5">
            <RecipeEditFieldLabel htmlFor="equip-edit-kettle-vol">
              {t("kettleVolumeLitersLabel", { unit: tUnits("L") })}
            </RecipeEditFieldLabel>
            <Input
              id="equip-edit-kettle-vol"
              type="number"
              inputMode="decimal"
              value={editDraft["kettleVolumeLiters"] ?? ""}
              onChangeText={(v) => setEditDraft((d) => ({ ...d, kettleVolumeLiters: v }))}
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
            <RecipeEditFieldLabel htmlFor="equip-edit-kettle-losses">
              {t("kettleLossesLitersLabel", { unit: tUnits("L") })}
            </RecipeEditFieldLabel>
            <Input
              id="equip-edit-kettle-losses"
              type="number"
              inputMode="decimal"
              value={editDraft["kettleLossesLiters"] ?? ""}
              onChangeText={(v) => setEditDraft((d) => ({ ...d, kettleLossesLiters: v }))}
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
            <RecipeEditFieldLabel htmlFor="equip-edit-evap">
              {t("kettleBoilEvaporationRatePercentPerHourLabel")}
            </RecipeEditFieldLabel>
            <Input
              id="equip-edit-evap"
              type="number"
              inputMode="decimal"
              value={editDraft["kettleBoilEvaporationRatePercentPerHour"] ?? ""}
              onChangeText={(v) => setEditDraft((d) => ({ ...d, kettleBoilEvaporationRatePercentPerHour: v }))}
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
            <RecipeEditFieldLabel htmlFor="equip-edit-shrink">
              {t("kettleCoolingShrinkagePercentLabel")}
            </RecipeEditFieldLabel>
            <Input
              id="equip-edit-shrink"
              type="number"
              inputMode="decimal"
              value={editDraft["kettleCoolingShrinkagePercent"] ?? ""}
              onChangeText={(v) => setEditDraft((d) => ({ ...d, kettleCoolingShrinkagePercent: v }))}
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
            <RecipeEditFieldLabel htmlFor="equip-edit-hops-abs">
              {t("kettleHopsAbsorptionLitersLabel", { unit: tUnits("LPerG") })}
            </RecipeEditFieldLabel>
            <Input
              id="equip-edit-hops-abs"
              type="number"
              inputMode="decimal"
              value={editDraft["kettleHopsAbsorptionLiters"] ?? ""}
              onChangeText={(v) => setEditDraft((d) => ({ ...d, kettleHopsAbsorptionLiters: v }))}
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
