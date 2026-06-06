"use client";

import { Button, H2, View, XStack, YStack } from "tamagui";

import { ErrorBox } from "../../../../_components/recipe-edit";
import type { useEquipmentPage } from "../_hooks/useEquipmentPage";
import { EquipmentEditKettleFields } from "./edit/EquipmentEditKettleFields";
import { EquipmentEditMashFields } from "./edit/EquipmentEditMashFields";
import { EquipmentEditMiscFields } from "./edit/EquipmentEditMiscFields";
import { EquipmentEditNameField } from "./edit/EquipmentEditNameField";

type Model = ReturnType<typeof useEquipmentPage>;

export function EquipmentProfileEditForm(props: { model: Model }) {
  const {
    t,
    tUnits,
    editingId,
    editDraft,
    setEditDraft,
    editSubmitting,
    editError,
    onSaveEdit,
    cancelEdit,
  } = props.model;

  if (!editingId) return null;

  return (
    <View
      mt="$3"
      bg="var(--surface)"
      borderWidth={1}
      borderColor="var(--border)"
      rounded="$2"
      p="$3"
      aria-labelledby="equipment-edit"
    >
      <H2 id="equipment-edit" mt={0}>
        {t("editTitle")}
      </H2>
      <form onSubmit={(...a) => { void onSaveEdit(...(a as Parameters<typeof onSaveEdit>)); }} aria-describedby={editError ? "equipment-edit-error" : undefined}>
        <YStack gap="$3">
          <EquipmentEditNameField
            t={t}
            editDraft={editDraft}
            setEditDraft={setEditDraft}
          />

          <EquipmentEditKettleFields
            t={t}
            tUnits={tUnits}
            editDraft={editDraft}
            setEditDraft={setEditDraft}
          />

          <EquipmentEditMashFields
            t={t}
            tUnits={tUnits}
            editDraft={editDraft}
            setEditDraft={setEditDraft}
          />

          <EquipmentEditMiscFields
            t={t}
            tUnits={tUnits}
            editDraft={editDraft}
            setEditDraft={setEditDraft}
          />
        </YStack>

        <XStack gap="$3" mt="$3">
          <Button as="button" type="submit" size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" disabled={editSubmitting}>
            {editSubmitting ? t("saving") : t("save")}
          </Button>
          <Button
            size="$3"
            bg="var(--surface-2)"
            borderWidth={1}
            borderColor="var(--border)"
            color="var(--text)"
            onPress={cancelEdit}
            disabled={editSubmitting}
          >
            {t("cancel")}
          </Button>
        </XStack>
        {editError ? (
          <ErrorBox id="equipment-edit-error" mt="$3">{editError}</ErrorBox>
        ) : null}
      </form>
    </View>
  );
}
