"use client";

import type { ReactNode } from "react";

import { YStack } from "tamagui";

import { RecipeEditFieldLabel } from "./RecipeEditFieldLabel";

export interface RecipeEditFieldProps {
  id?: string;
  label: ReactNode;
  children: ReactNode;
}

export function RecipeEditField({ id, label, children }: RecipeEditFieldProps) {
  return (
    <YStack gap="$1" minW={0}>
      <RecipeEditFieldLabel htmlFor={id}>{label}</RecipeEditFieldLabel>
      {children}
    </YStack>
  );
}
