import type { ReactNode } from "react";
import React from "react";
import { Platform } from "react-native";
import { XStack, YStack } from "tamagui";

import { FIELD_READONLY_BG, FIELD_READONLY_BORDER } from "../theme/nativeReadonlyTokens";
import { Text } from "./Text";

export interface ReadOnlyFieldLabelProps {
  children: ReactNode;
}

export function ReadOnlyFieldLabel({ children }: ReadOnlyFieldLabelProps) {
  return (
    <Text fontSize={11} opacity={0.8}>
      {children}
    </Text>
  );
}

export interface ReadOnlyFieldValueProps {
  children: ReactNode;
}

export function ReadOnlyFieldValue({ children }: ReadOnlyFieldValueProps) {
  const isWeb = Platform.OS === "web";
  return (
    <YStack
      data-readonly-field-value
      padding="$2"
      backgroundColor={isWeb ? "var(--field-readonly-bg)" : FIELD_READONLY_BG}
      borderRadius="$2"
      borderWidth={1}
      borderColor={isWeb ? "var(--field-readonly-border)" : FIELD_READONLY_BORDER}
      userSelect="none"
      tabIndex={isWeb ? -1 : undefined}
    >
      <Text fontSize={12} opacity={0.9}>
        {children}
      </Text>
    </YStack>
  );
}

export interface ReadOnlyFieldProps {
  label: ReactNode;
  value: ReactNode;
  minWidth?: number;
  flex?: number;
}

export function ReadOnlyField({ label, value, minWidth, flex }: ReadOnlyFieldProps) {
  return (
    <YStack gap="$1" minWidth={minWidth} flex={flex}>
      <ReadOnlyFieldLabel>{label}</ReadOnlyFieldLabel>
      <ReadOnlyFieldValue>{value}</ReadOnlyFieldValue>
    </YStack>
  );
}

export interface ReadOnlyFieldRowProps {
  children: ReactNode;
}

export function ReadOnlyFieldRow({ children }: ReadOnlyFieldRowProps) {
  return (
    <XStack gap="$3" flexWrap="wrap" alignItems="flex-end">
      {children}
    </XStack>
  );
}

