import React from "react";
import { Label, RadioGroup, XStack, YStack } from "tamagui";

import { Card } from "./Card";
import { Text } from "./Text";

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
    <Card
      borderWidth={1}
      borderColor="$borderColor"
      backgroundColor="$background"
      padding="$3"
      marginBottom="$3"
      gap="$2"
    >
      <Text fontSize={12} opacity={0.8} marginBottom="$1">
        {legend}
      </Text>

      <RadioGroup
        name={name}
        value={value}
        onValueChange={(v) => onChange(v as T)}
        aria-label={legend}
      >
        <YStack gap="$2">
          {options.map((o) => {
            const id = `${name}-${o.value}`;
            return (
              <XStack key={o.value} gap="$2" alignItems="center">
                <RadioGroup.Item
                  id={id}
                  value={o.value}
                  size="$3"
                  borderColor="$borderColor"
                >
                  <RadioGroup.Indicator
                    unstyled
                    width={10}
                    height={10}
                    borderRadius={9999}
                    backgroundColor="$color8"
                  />
                </RadioGroup.Item>
                <Label htmlFor={id}>
                  <Text fontSize={12}>{o.label}</Text>
                </Label>
              </XStack>
            );
          })}
        </YStack>
      </RadioGroup>
    </Card>
  );
}

