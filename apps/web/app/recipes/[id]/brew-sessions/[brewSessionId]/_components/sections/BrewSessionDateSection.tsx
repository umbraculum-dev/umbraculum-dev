"use client";

import { H2, View, YStack } from "tamagui";

import type { BrewSessionDetailPageModel } from "../../_hooks/useBrewSessionDetailPage";
import { BrewSessionDateDisplayRow, BrewSessionDateEditForm } from "./brewSessionDate/BrewSessionDateBlocks";

export function BrewSessionDateSection({ model }: { model: BrewSessionDetailPageModel }) {
  const { session, dateEditing } = model;

  return (
    <>
      {session ? (
        <View bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$3" p="$3">
          <H2 mt={0}>{model.t("dateSectionTitle")}</H2>
          <YStack gap="$2" mt="$2">
            {dateEditing ? <BrewSessionDateEditForm model={model} /> : <BrewSessionDateDisplayRow model={model} />}
          </YStack>
        </View>
      ) : null}
    </>
  );
}
