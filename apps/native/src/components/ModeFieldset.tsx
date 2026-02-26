import React from "react";
import { View } from "react-native";

import { Button, Text } from "@brewery/ui";

export type ModeOption<T extends string> = { value: T; label: string };

export function ModeFieldset<T extends string>(props: {
  legend: string;
  name: string;
  value: T;
  onChange: (next: T) => void;
  options: ModeOption<T>[];
}) {
  const { legend, value, onChange, options } = props;

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: "var(--border)",
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
      }}
    >
      <Text fontSize={12} opacity={0.8} mb="$2" display="block">
        {legend}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {options.map((o) => (
          <Button
            key={o.value}
            size="$3"
            onPress={() => onChange(o.value)}
            background={value === o.value ? "$color4" : "$background"}
            borderWidth={1}
            borderColor="$borderColor"
          >
            <Text fontSize={12}>{o.label}</Text>
          </Button>
        ))}
      </View>
    </View>
  );
}
