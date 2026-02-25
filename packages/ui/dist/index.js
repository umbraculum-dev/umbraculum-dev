// src/primitives/Button.tsx
import { Platform } from "react-native";
import { Button as TamaguiButton } from "tamagui";
import { jsx } from "react/jsx-runtime";
function Button(props) {
  const { accessibilityLabel, accessibilityRole, ...rest } = props;
  if (Platform.OS === "web") {
    return /* @__PURE__ */ jsx(
      TamaguiButton,
      {
        fontFamily: props.fontFamily ?? "$body",
        "aria-label": accessibilityLabel,
        ...rest
      }
    );
  }
  return /* @__PURE__ */ jsx(
    TamaguiButton,
    {
      fontFamily: props.fontFamily ?? "$body",
      accessibilityLabel,
      accessibilityRole,
      ...rest
    }
  );
}

// src/primitives/Card.tsx
import { YStack } from "tamagui";
import { jsx as jsx2 } from "react/jsx-runtime";
function Card(props) {
  return /* @__PURE__ */ jsx2(
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

// src/primitives/Screen.tsx
import { YStack as YStack2 } from "tamagui";
import { jsx as jsx3 } from "react/jsx-runtime";
function Screen({ flex, style, ...props }) {
  return /* @__PURE__ */ jsx3(
    YStack2,
    {
      flex: flex ?? 1,
      style: [{ padding: 16, gap: 16 }, style],
      ...props
    }
  );
}

// src/primitives/Spinner.tsx
import { Spinner as TamaguiSpinner } from "tamagui";
import { jsx as jsx4 } from "react/jsx-runtime";
function Spinner(props) {
  return /* @__PURE__ */ jsx4(TamaguiSpinner, { ...props });
}

// src/primitives/Text.tsx
import { SizableText } from "tamagui";
import { jsx as jsx5 } from "react/jsx-runtime";
function Text(props) {
  return /* @__PURE__ */ jsx5(SizableText, { fontFamily: props.fontFamily ?? "$body", ...props });
}
function Heading({ size, fontWeight, ...props }) {
  return /* @__PURE__ */ jsx5(
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
  Button,
  Card,
  Heading,
  Screen,
  Spinner,
  Text
};
