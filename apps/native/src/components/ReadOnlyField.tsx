import React from "react";
import { View } from "react-native";

import { Text } from "@brewery/ui";

export interface ReadOnlyFieldProps {
  value: string;
  placeholder?: string;
  textAlign?: "left" | "center" | "right";
}

/**
 * Read-only display field (grayed out, non-keyboard-accessible).
 * Matches web RecipeEditReadOnlyValue styling.
 */
export function ReadOnlyField({ value, placeholder = "—", textAlign }: ReadOnlyFieldProps) {
  const display = (value ?? "").trim() || placeholder;
  return (
    <View
      style={{
        padding: 8,
        backgroundColor: "#1a1f2e",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#2a2f3a",
      }}
    >
      <Text
        fontSize={14}
        color="$gray11"
        fontFamily="$body"
        style={textAlign ? { textAlign } : undefined}
      >
        {display}
      </Text>
    </View>
  );
}
