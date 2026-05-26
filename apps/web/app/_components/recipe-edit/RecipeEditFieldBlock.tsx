"use client";

import type { ReactNode } from "react";

import { SizableText, View, XStack, YStack } from "tamagui";

import { FieldBadge } from "./FieldBadge";

export type RecipeEditFieldBlockVariant = "default" | "readonly" | "computed" | "inProgress" | "programmed";

export interface RecipeEditFieldBlockProps {
  variant?: RecipeEditFieldBlockVariant;
  header: ReactNode;
  badge?: ReactNode;
  source?: ReactNode;
  children: ReactNode;
  mt?: string | number;
  mb?: string | number;
}

const variantStyles: Record<
  RecipeEditFieldBlockVariant,
  { bg: string; borderColor: string }
> = {
  default: {
    bg: "var(--surface)",
    borderColor: "var(--border)",
  },
  readonly: {
    bg: "var(--field-readonly-bg)",
    borderColor: "var(--field-readonly-border)",
  },
  computed: {
    bg: "var(--field-computed-bg)",
    borderColor: "var(--field-computed-border)",
  },
  inProgress: {
    bg: "color-mix(in srgb, var(--warning) 18%, var(--surface))",
    borderColor: "color-mix(in srgb, var(--warning) 40%, var(--border))",
  },
  programmed: {
    bg: "color-mix(in srgb, pink 16%, var(--surface))",
    borderColor: "color-mix(in srgb, pink 38%, var(--border))",
  },
};

export function RecipeEditFieldBlock({
  variant = "default",
  header,
  badge,
  source,
  children,
  mt,
  mb,
}: RecipeEditFieldBlockProps) {
  const styles = variantStyles[variant];

  return (
    <View
      borderWidth={1}
      borderColor={styles.borderColor}
      rounded="$2"
      p="$3"
      bg={styles.bg}
      mt={mt}
      mb={mb}
    >
      <YStack gap="$2">
        <XStack gap="$2" flexWrap="wrap" items="baseline">
          <SizableText size="$3" fontWeight="bold" fontFamily="$body" color="var(--text)">
            {header}
          </SizableText>
          {badge ? <FieldBadge>{badge}</FieldBadge> : null}
          {source ? (
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
              {source}
            </SizableText>
          ) : null}
        </XStack>
        {children}
      </YStack>
    </View>
  );
}
