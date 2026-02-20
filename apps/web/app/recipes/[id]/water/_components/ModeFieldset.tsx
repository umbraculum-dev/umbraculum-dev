"use client";

import { SizableText, YStack } from "tamagui";

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
    <fieldset className="brew-mode-fieldset" suppressHydrationWarning>
      <legend className="brew-muted brew-fieldset-legend">{legend}</legend>
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
    </fieldset>
  );
}
