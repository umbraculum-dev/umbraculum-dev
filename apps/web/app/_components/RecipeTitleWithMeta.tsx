"use client";

import type { ReactNode } from "react";

import { RecipeMetaLine } from "@brewery/recipes-ui";
import { H1, YStack } from "tamagui";

export function RecipeTitleWithMeta(props: {
  title: ReactNode;
  recipeId: string;
  enabled?: boolean;
  loadRecipeMeta: (id: string) => Promise<unknown> | unknown;
}) {
  const { title, recipeId, enabled, loadRecipeMeta } = props;

  return (
    <YStack gap="$1" mb="$2">
      <H1 mb={0}>{title}</H1>
      <RecipeMetaLine
        recipeId={recipeId}
        enabled={enabled}
        loadRecipeMeta={loadRecipeMeta}
      />
    </YStack>
  );
}

