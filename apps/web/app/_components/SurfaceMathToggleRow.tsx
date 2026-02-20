"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

import { Button, XStack } from "tamagui";

export function SurfaceMathToggleRow(props: {
  left: ReactNode;
  rightHint?: ReactNode;
  surfaceMath: boolean;
  onToggle: () => void;
  mt?: number | string;
  mb?: number | string;
  style?: React.CSSProperties;
}) {
  const tMath = useTranslations("math");
  const { left, rightHint, surfaceMath, onToggle, mt, mb, style } = props;

  return (
    <XStack
      gap="$3"
      alignItems="center"
      flexWrap="wrap"
      mt={mt}
      mb={mb}
      style={style}
    >
      {left}
      <XStack
        marginLeft="auto"
        gap="$2.5"
        alignItems="center"
        flexWrap="wrap"
      >
        {rightHint}
        <Button
          size="$2"
          chromeless
          onPress={onToggle}
          bg="var(--surface-2)"
          borderWidth={1}
          borderColor="var(--border)"
          color="var(--text)"
          fontFamily="$body"
        >
          {surfaceMath ? tMath("toggleHide") : tMath("toggleShow")}
        </Button>
      </XStack>
    </XStack>
  );
}

