"use client";

import { Input, YStack } from "tamagui";

import { RecipeEditFieldLabel } from "../../../_components/recipe-edit";

export function EquipmentCreateNameField(props: {
  t: (key: string) => string;
  createName: string;
  setCreateName: (value: string) => void;
}) {
  const { t, createName, setCreateName } = props;

  return (
    <YStack gap="$1.5">
      <RecipeEditFieldLabel htmlFor="equip-name">{t("nameLabel")}</RecipeEditFieldLabel>
      <Input
        id="equip-name"
        value={createName}
        onChangeText={setCreateName}
        size="$3"
        w="100%"
        bg="var(--surface)"
        borderWidth={1}
        borderColor="var(--border)"
        rounded="$2"
        fontFamily="$body"
      />
    </YStack>
  );
}
