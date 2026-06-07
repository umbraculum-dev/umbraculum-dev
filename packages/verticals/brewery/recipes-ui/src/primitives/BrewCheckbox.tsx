import type { ComponentProps } from "react";
import React from "react";
import { Platform } from "react-native";
import { Checkbox as TamaguiCheckbox } from "tamagui";

import { Text } from "@umbraculum/ui";

export interface BrewCheckboxProps
  extends Omit<ComponentProps<typeof TamaguiCheckbox>, "children" | "native" | "unstyled"> {}

export function BrewCheckbox(props: BrewCheckboxProps) {
  const { accessibilityLabel, accessibilityRole, checked, disabled, size, ...rest } = props as unknown as {
    accessibilityLabel?: string;
    accessibilityRole?: string;
    checked?: boolean;
    disabled?: boolean;
    size?: ComponentProps<typeof TamaguiCheckbox>["size"];
  } & BrewCheckboxProps;

  const isChecked = checked === true;

  const sharedProps: ComponentProps<typeof TamaguiCheckbox> = {
    // Keep this custom-rendered so we control contrast/indicator on web.
    native: Platform.OS === "web" ? false : undefined,
    size: size ?? "$2",
    ...(disabled !== undefined ? { disabled } : {}),
    checked,
    unstyled: true,
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: isChecked ? "$color8" : "$borderColor",
    backgroundColor: isChecked ? "$color8" : "transparent",
    alignItems: "center",
    justifyContent: "center",
    ...(rest as ComponentProps<typeof TamaguiCheckbox>),
  } as ComponentProps<typeof TamaguiCheckbox>;

  if (Platform.OS === "web") {
    return (
      <TamaguiCheckbox aria-label={accessibilityLabel} {...sharedProps}>
        <TamaguiCheckbox.Indicator unstyled>
          <Text fontSize={12} lineHeight={12} fontWeight="700" color="$color1">
            ✓
          </Text>
        </TamaguiCheckbox.Indicator>
      </TamaguiCheckbox>
    );
  }

  return (
    <TamaguiCheckbox accessibilityLabel={accessibilityLabel} accessibilityRole={accessibilityRole} {...sharedProps}>
      <TamaguiCheckbox.Indicator unstyled>
        <Text fontSize={12} lineHeight={12} fontWeight="700" color="$color1">
          ✓
        </Text>
      </TamaguiCheckbox.Indicator>
    </TamaguiCheckbox>
  );
}

