import type { ComponentProps, ReactNode } from "react";
import React from "react";
import { YStack } from "tamagui";

export type CardProps = Omit<ComponentProps<typeof YStack>, "children"> & {
  children: ReactNode;
};

export function Card(props: CardProps) {
  return (
    <YStack
      borderWidth={props.borderWidth ?? 1}
      borderColor={props.borderColor ?? "$borderColor"}
      borderRadius={props.borderRadius ?? "$4"}
      backgroundColor={props.backgroundColor ?? "$background"}
      padding={props.padding ?? "$3"}
      {...props}
    />
  );
}

