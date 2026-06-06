"use client";

import { View, YStack } from "tamagui";

import type { BrewSessionDetailPageModel } from "../../_hooks/useBrewSessionDetailPage";
import { BrewSessionSummaryActionsBlock } from "./brewSessionSummary/BrewSessionSummaryActionsBlock";
import { BrewSessionSummaryHeaderBlock } from "./brewSessionSummary/BrewSessionSummaryHeaderBlock";
import { BrewSessionSummaryStatsBlock } from "./brewSessionSummary/BrewSessionSummaryStatsBlock";

export function BrewSessionSummarySection({ model }: { model: BrewSessionDetailPageModel }) {
  const { session, recipe } = model;

  return (
    <>
      {session && recipe ? (
        <View
          bg="var(--surface)"
          borderWidth={1}
          borderColor="var(--border)"
          rounded="$3"
          p="$3"
        >
          <YStack gap="$1">
            <BrewSessionSummaryHeaderBlock model={model} />
            <BrewSessionSummaryStatsBlock model={model} />
          </YStack>

          <BrewSessionSummaryActionsBlock model={model} />
        </View>
      ) : null}
    </>
  );
}
