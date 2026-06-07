import type { ComponentProps } from "react";
import React from "react";
import { SizableText } from "tamagui";

export type TextProps = ComponentProps<typeof SizableText>;

export function Text(props: TextProps) {
  return <SizableText fontFamily={props.fontFamily ?? "$body"} {...props} />;
}

export type HeadingProps = Omit<TextProps, "size"> & {
  size?: TextProps["size"];
};

export function Heading({ size, fontWeight, ...props }: HeadingProps) {
  return (
    <SizableText
      fontFamily={props.fontFamily ?? "$body"}
      fontWeight={fontWeight ?? "700"}
      size={size ?? "$8"}
      {...props}
    />
  );
}

