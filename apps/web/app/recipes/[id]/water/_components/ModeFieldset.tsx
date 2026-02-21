"use client";

import { SizableText, View, XStack, YStack } from "tamagui";

export type ModeOption<T extends string> = { value: T; label: string };

export function ModeFieldset<T extends string>(props: {
  legend: string;
  name: string;
  value: T;
  onChange: (next: T) => void;
  options: ModeOption<T>[];
}) {
  const { legend, name, value, onChange, options } = props;

  return (
    <View
      borderWidth={1}
      borderColor="var(--border)"
      rounded="$2"
      p="$3"
      mb="$3"
      suppressHydrationWarning
    >
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mb="$2" display="block">
        {legend}
      </SizableText>
      <YStack gap="$2">
        {options.map((o) => (
          <label key={o.value} className="brew-radio-label">
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
            />
            <SizableText size="$2" fontFamily="$body">
              {o.label}
            </SizableText>
          </label>
        ))}
      </YStack>
    </View>
  );
}
