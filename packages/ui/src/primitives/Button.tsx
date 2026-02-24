import type { ComponentProps } from "react";
import React from "react";
import { Button as TamaguiButton } from "tamagui";

export type ButtonProps = ComponentProps<typeof TamaguiButton>;

export function Button(props: ButtonProps) {
  return <TamaguiButton fontFamily={props.fontFamily ?? "$body"} {...props} />;
}

