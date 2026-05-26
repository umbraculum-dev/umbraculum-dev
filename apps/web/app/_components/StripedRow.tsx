"use client";

import { styled, View } from "tamagui";

export const STRIPED_ROW_LIGHT_BG = "color-mix(in srgb, var(--surface-2) 35%, var(--surface))";

export const StripedRow = styled(View, {
  name: "StripedRow",
  px: "$2",
  py: "$1",
  borderRadius: "$2",
  variants: {
    odd: {
      true: { bg: STRIPED_ROW_LIGHT_BG },
      false: {},
    },
  } as const,
});

