"use client";

import type { ReactNode } from "react";

import { H2, View } from "tamagui";

export interface RecipeEditSectionProps {
  id: string;
  headingId: string;
  label: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function RecipeEditSection({
  id,
  headingId,
  label,
  open,
  onOpenChange,
  children,
}: RecipeEditSectionProps) {
  return (
    <View
      as="section"
      id={id}
      bg="var(--surface)"
      borderWidth={1}
      borderColor="var(--border)"
      rounded="$3"
      p="$3"
    >
      <details
        open={open}
        onToggle={(e) => onOpenChange((e.target as HTMLDetailsElement).open)}
      >
        <summary className="recipeEditDetailsSummary">
          <H2 id={headingId} m={0} size="$5" fontFamily="$heading" color="var(--text)">
            {label}
          </H2>
        </summary>
        <View mt="$3">{children}</View>
      </details>
    </View>
  );
}
