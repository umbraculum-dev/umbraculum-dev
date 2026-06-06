"use client";

import { type Dispatch, type SetStateAction } from "react";

import { Input, YStack } from "tamagui";

import { RecipeEditFieldLabel } from "../../../../../_components/recipe-edit";

export function EquipmentEditNameField(props: {
  t: (key: string) => string;
  editDraft: Record<string, string>;
  setEditDraft: Dispatch<SetStateAction<Record<string, string>>>;
}) {
  const { t, editDraft, setEditDraft } = props;

  return (
    <YStack gap="$1.5">
      <RecipeEditFieldLabel htmlFor="equip-edit-name">{t("nameLabel")}</RecipeEditFieldLabel>
      <Input
        id="equip-edit-name"
        value={editDraft["name"] ?? ""}
        onChangeText={(v) => setEditDraft((d) => ({ ...d, name: v }))}
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
