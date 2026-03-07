// src/primitives/Card.tsx
import { YStack } from "tamagui";
import { jsx } from "react/jsx-runtime";
function Card(props) {
  return /* @__PURE__ */ jsx(
    YStack,
    {
      borderWidth: props.borderWidth ?? 1,
      borderColor: props.borderColor ?? "$borderColor",
      borderRadius: props.borderRadius ?? "$4",
      backgroundColor: props.backgroundColor ?? "$background",
      padding: props.padding ?? "$3",
      ...props
    }
  );
}

// src/primitives/Text.tsx
import { SizableText } from "tamagui";
import { jsx as jsx2 } from "react/jsx-runtime";
function Text(props) {
  return /* @__PURE__ */ jsx2(SizableText, { fontFamily: props.fontFamily ?? "$body", ...props });
}
function Heading({ size, fontWeight, ...props }) {
  return /* @__PURE__ */ jsx2(
    SizableText,
    {
      fontFamily: props.fontFamily ?? "$body",
      fontWeight: fontWeight ?? "700",
      size: size ?? "$8",
      ...props
    }
  );
}

export {
  Card,
  Text,
  Heading
};
