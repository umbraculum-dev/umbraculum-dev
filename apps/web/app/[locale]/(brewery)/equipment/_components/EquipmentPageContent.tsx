"use client";

import { H1, SizableText, YStack } from "tamagui";

import { Link } from "../../../../../src/i18n/navigation";
import { ErrorBox } from "../../../../_components/recipe-edit";
import type { useEquipmentPage } from "../_hooks/useEquipmentPage";
import { EquipmentProfileCreateForm } from "./EquipmentProfileCreateForm";
import { EquipmentProfileEditForm } from "./EquipmentProfileEditForm";
import { EquipmentProfileListSection } from "./EquipmentProfileListSection";

type Model = ReturnType<typeof useEquipmentPage>;

export function EquipmentPageContent(props: { model: Model }) {
  const { model } = props;
  const { t, tNav, error, canWrite, editingId } = model;

  return (
    <YStack gap="$3">
      <H1 mb="$2">{tNav("equipment")}</H1>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
        {t("subtitle")}
      </SizableText>

      <Link href="/recipes">
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" as="span">
          {t("backToRecipes")}
        </SizableText>
      </Link>

      {error ? (
        <ErrorBox>{error}</ErrorBox>
      ) : null}

      <EquipmentProfileListSection model={model} />

      {canWrite && editingId ? (
        <EquipmentProfileEditForm model={model} />
      ) : null}

      {canWrite ? (
        <EquipmentProfileCreateForm model={model} />
      ) : null}
    </YStack>
  );
}
