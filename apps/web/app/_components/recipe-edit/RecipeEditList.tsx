"use client";

import type { ComponentProps } from "react";
import { YStack } from "tamagui";

export function RecipeEditList(props: ComponentProps<typeof YStack>) {
  return <YStack as="ul" className="brew-recipe-edit-list-disc" {...props} />;
}
