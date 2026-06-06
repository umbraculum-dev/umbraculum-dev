"use client";

import { type Dispatch, type SetStateAction } from "react";

import { Input, View, XStack, YStack } from "tamagui";

import { RecipeEditFieldLabel } from "../../../_components/recipe-edit";

export function EquipmentEditMiscFields(props: {
  t: (key: string, values?: Record<string, string>) => string;
  tUnits: (key: string) => string;
  editDraft: Record<string, string>;
  setEditDraft: Dispatch<SetStateAction<Record<string, string>>>;
}) {
  const { t, tUnits, editDraft, setEditDraft } = props;

  return (
    <fieldset className="brew-fieldset">
      <legend className="brew-fieldset-legend">{t("sectionTitles.misc")}</legend>
      <XStack gap="$3" flexWrap="wrap" ai="flex-end">
        <View flex={1} minWidth={200}>
          <YStack gap="$1.5">
            <RecipeEditFieldLabel htmlFor="equip-edit-other-losses">
              {t("otherLossesLitersLabel", { unit: tUnits("L") })}
            </RecipeEditFieldLabel>
            <Input
              id="equip-edit-other-losses"
              type="number"
              inputMode="decimal"
              value={editDraft["otherLossesLiters"] ?? ""}
              onChangeText={(v) => setEditDraft((d) => ({ ...d, otherLossesLiters: v }))}
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
