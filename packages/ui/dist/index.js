// src/primitives/AdSlotCard.tsx
import { Platform } from "react-native";
import { YStack as YStack2 } from "tamagui";

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

// src/primitives/AdSlotCard.tsx
import { jsx as jsx2, jsxs } from "react/jsx-runtime";
function AdSlotCard(props) {
  const isWeb = Platform.OS === "web";
  return /* @__PURE__ */ jsx2(YStack2, { marginVertical: 12, gap: "$1.5", children: /* @__PURE__ */ jsx2(
    Card,
    {
      ...isWeb ? { as: "aside", "aria-label": props.ariaLabel } : { accessibilityLabel: props.ariaLabel },
      backgroundColor: "$background",
      borderWidth: 1,
      borderColor: "$borderColor",
      borderRadius: "$2",
      padding: 10,
      children: /* @__PURE__ */ jsxs(YStack2, { gap: "$1.5", children: [
        /* @__PURE__ */ jsx2(
          Card,
          {
            height: props.mediaHeightPx,
            width: "100%",
            maxWidth: "100%",
            overflow: "hidden",
            borderRadius: "$2",
            backgroundColor: "$background",
            padding: 0,
            children: props.media
          }
        ),
        props.contactLine,
        props.upgradeLine
      ] })
    }
  ) });
}

// src/primitives/Button.tsx
import { Platform as Platform2 } from "react-native";
import { Button as TamaguiButton } from "tamagui";
import { jsx as jsx3 } from "react/jsx-runtime";
function Button(props) {
  const { accessibilityLabel, accessibilityRole, ...rest } = props;
  if (Platform2.OS === "web") {
    return /* @__PURE__ */ jsx3(
      TamaguiButton,
      {
        fontFamily: props.fontFamily ?? "$body",
        "aria-label": accessibilityLabel,
        ...rest
      }
    );
  }
  return /* @__PURE__ */ jsx3(
    TamaguiButton,
    {
      fontFamily: props.fontFamily ?? "$body",
      accessibilityLabel,
      accessibilityRole,
      ...rest
    }
  );
}

// src/primitives/Collapsible.tsx
import { Platform as Platform3 } from "react-native";
import { YStack as YStack3 } from "tamagui";

// src/primitives/Text.tsx
import { SizableText } from "tamagui";
import { jsx as jsx4 } from "react/jsx-runtime";
function Text(props) {
  return /* @__PURE__ */ jsx4(SizableText, { fontFamily: props.fontFamily ?? "$body", ...props });
}
function Heading({ size, fontWeight, ...props }) {
  return /* @__PURE__ */ jsx4(
    SizableText,
    {
      fontFamily: props.fontFamily ?? "$body",
      fontWeight: fontWeight ?? "700",
      size: size ?? "$8",
      ...props
    }
  );
}

// src/primitives/Collapsible.tsx
import { jsx as jsx5, jsxs as jsxs2 } from "react/jsx-runtime";
function Collapsible(props) {
  const { title, summary, children, expanded, onExpandedChange, accessibilityLabel } = props;
  if (Platform3.OS === "web") {
    return /* @__PURE__ */ jsxs2("details", { open: expanded, onToggle: (e) => onExpandedChange(e.target.open), children: [
      /* @__PURE__ */ jsx5(
        "summary",
        {
          className: "brew-details-summary",
          style: { fontSize: 12 },
          "aria-label": accessibilityLabel ?? title,
          children: summary ?? title
        }
      ),
      children
    ] });
  }
  return /* @__PURE__ */ jsxs2(YStack3, { gap: "$2", children: [
    /* @__PURE__ */ jsx5(
      Button,
      {
        onPress: () => onExpandedChange(!expanded),
        chromeless: true,
        size: "$4",
        accessibilityRole: "button",
        accessibilityLabel: accessibilityLabel ?? title,
        accessibilityState: { expanded },
        children: /* @__PURE__ */ jsx5(Text, { fontSize: 16, fontWeight: "700", children: title })
      }
    ),
    expanded ? children : null
  ] });
}

// src/primitives/Input.tsx
import { Platform as Platform4 } from "react-native";
import { Input as TamaguiInput } from "tamagui";
import { jsx as jsx6 } from "react/jsx-runtime";
function Input(props) {
  const { accessibilityLabel, accessibilityRole, ...rest } = props;
  if (Platform4.OS === "web") {
    return /* @__PURE__ */ jsx6(
      TamaguiInput,
      {
        fontFamily: props.fontFamily ?? "$body",
        "aria-label": accessibilityLabel,
        ...rest
      }
    );
  }
  return /* @__PURE__ */ jsx6(
    TamaguiInput,
    {
      fontFamily: props.fontFamily ?? "$body",
      accessibilityLabel,
      accessibilityRole,
      ...rest
    }
  );
}

// src/primitives/ModeFieldset.tsx
import { Label, RadioGroup, XStack, YStack as YStack4 } from "tamagui";
import { jsx as jsx7, jsxs as jsxs3 } from "react/jsx-runtime";
function ModeFieldset(props) {
  const { legend, name, value, onChange, options } = props;
  return /* @__PURE__ */ jsxs3(
    Card,
    {
      borderWidth: 1,
      borderColor: "$borderColor",
      backgroundColor: "$background",
      padding: "$3",
      marginBottom: "$3",
      gap: "$2",
      children: [
        /* @__PURE__ */ jsx7(Text, { fontSize: 12, opacity: 0.8, marginBottom: "$1", children: legend }),
        /* @__PURE__ */ jsx7(
          RadioGroup,
          {
            name,
            value,
            onValueChange: (v) => onChange(v),
            "aria-label": legend,
            children: /* @__PURE__ */ jsx7(YStack4, { gap: "$2", children: options.map((o) => {
              const id = `${name}-${o.value}`;
              return /* @__PURE__ */ jsxs3(XStack, { gap: "$2", alignItems: "center", children: [
                /* @__PURE__ */ jsx7(RadioGroup.Item, { id, value: o.value, size: "$3", borderColor: "$borderColor", children: /* @__PURE__ */ jsx7(RadioGroup.Indicator, {}) }),
                /* @__PURE__ */ jsx7(Label, { htmlFor: id, children: /* @__PURE__ */ jsx7(Text, { fontSize: 12, children: o.label }) })
              ] }, o.value);
            }) })
          }
        )
      ]
    }
  );
}

// src/primitives/ReadOnlyField.tsx
import { Platform as Platform5 } from "react-native";
import { XStack as XStack2, YStack as YStack5 } from "tamagui";
import { jsx as jsx8, jsxs as jsxs4 } from "react/jsx-runtime";
function ReadOnlyFieldLabel({ children }) {
  return /* @__PURE__ */ jsx8(Text, { fontSize: 11, opacity: 0.8, children });
}
function ReadOnlyFieldValue({ children }) {
  const isWeb = Platform5.OS === "web";
  return /* @__PURE__ */ jsx8(
    YStack5,
    {
      "data-readonly-field-value": true,
      padding: "$2",
      backgroundColor: isWeb ? "var(--field-readonly-bg)" : "$gray3",
      borderRadius: "$2",
      borderWidth: 1,
      borderColor: isWeb ? "var(--field-readonly-border)" : "$gray4",
      userSelect: "none",
      tabIndex: isWeb ? -1 : void 0,
      children: /* @__PURE__ */ jsx8(Text, { fontSize: 12, opacity: 0.9, children })
    }
  );
}
function ReadOnlyField({ label, value, minWidth, flex }) {
  return /* @__PURE__ */ jsxs4(YStack5, { gap: "$1", minWidth, flex, children: [
    /* @__PURE__ */ jsx8(ReadOnlyFieldLabel, { children: label }),
    /* @__PURE__ */ jsx8(ReadOnlyFieldValue, { children: value })
  ] });
}
function ReadOnlyFieldRow({ children }) {
  return /* @__PURE__ */ jsx8(XStack2, { gap: "$3", flexWrap: "wrap", alignItems: "flex-end", children });
}

// src/primitives/Screen.tsx
import { Platform as Platform6, StatusBar } from "react-native";
import { YStack as YStack6 } from "tamagui";
import { jsx as jsx9 } from "react/jsx-runtime";
function Screen({ flex, style, ...props }) {
  const topInset = Platform6.OS === "web" ? 0 : Math.floor((StatusBar.currentHeight ?? 0) / 2);
  return /* @__PURE__ */ jsx9(
    YStack6,
    {
      flex: flex ?? 1,
      backgroundColor: props.backgroundColor ?? "$background",
      style: [
        {
          paddingTop: 16 + topInset,
          paddingHorizontal: 16,
          paddingBottom: 16,
          gap: 16
        },
        style
      ],
      ...props
    }
  );
}

// src/primitives/SelectField.tsx
import { useMemo, useState } from "react";
import { Modal, Platform as Platform7, Pressable, ScrollView, View } from "react-native";
import { jsx as jsx10, jsxs as jsxs5 } from "react/jsx-runtime";
function SelectField({
  value,
  onValueChange,
  options,
  placeholder,
  disabled,
  id,
  width = "auto",
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  renderValue,
  closeLabel
}) {
  const findLabel = (v) => options.find((opt) => opt.value === v)?.label ?? v;
  const isWeb = Platform7.OS === "web";
  const [open, setOpen] = useState(false);
  const selectedLabel = useMemo(() => findLabel(value), [value, options]);
  if (isWeb) {
    return /* @__PURE__ */ jsxs5(
      "select",
      {
        id,
        value,
        onChange: (e) => onValueChange(e.target.value),
        disabled,
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledBy,
        style: {
          width: width === "full" ? "100%" : 180,
          minWidth: width === "full" ? void 0 : 180,
          padding: "8px 10px",
          borderRadius: 8,
          border: "1px solid var(--border, rgba(0,0,0,0.2))",
          background: "var(--surface, #fff)",
          color: "var(--text, #111)",
          fontFamily: "var(--font-body, system-ui, -apple-system, Segoe UI, Roboto, sans-serif)"
        },
        children: [
          placeholder ? /* @__PURE__ */ jsx10("option", { value: "", disabled: true, children: placeholder }) : null,
          options.map((opt) => /* @__PURE__ */ jsx10("option", { value: opt.value, children: opt.label }, opt.value))
        ]
      }
    );
  }
  {
    return /* @__PURE__ */ jsxs5(View, { children: [
      /* @__PURE__ */ jsx10(
        Button,
        {
          onPress: () => setOpen(true),
          size: "$3",
          background: "$background",
          borderWidth: 1,
          borderColor: "$borderColor",
          disabled,
          accessibilityLabel: ariaLabel,
          children: /* @__PURE__ */ jsx10(Text, { fontSize: 12, children: (renderValue ? String(renderValue(value)) : selectedLabel) || placeholder || "\u2014" })
        }
      ),
      /* @__PURE__ */ jsx10(Modal, { visible: open, transparent: true, animationType: "fade", onRequestClose: () => setOpen(false), children: /* @__PURE__ */ jsx10(
        Pressable,
        {
          style: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 16 },
          onPress: () => setOpen(false),
          children: /* @__PURE__ */ jsx10(Pressable, { onPress: () => null, children: /* @__PURE__ */ jsxs5(Card, { gap: "$2", background: "$background", borderWidth: 1, borderColor: "$borderColor", padding: "$3", children: [
            ariaLabel ? /* @__PURE__ */ jsx10(Text, { fontSize: 16, fontWeight: "700", children: ariaLabel }) : null,
            /* @__PURE__ */ jsx10(ScrollView, { style: { maxHeight: 320 }, children: /* @__PURE__ */ jsx10(View, { style: { gap: 8 }, children: options.map((opt) => /* @__PURE__ */ jsx10(
              Button,
              {
                onPress: () => {
                  onValueChange(opt.value);
                  setOpen(false);
                },
                size: "$3",
                background: opt.value === value ? "$color4" : "$background",
                borderWidth: 1,
                borderColor: "$borderColor",
                children: /* @__PURE__ */ jsx10(Text, { fontSize: 12, children: opt.label })
              },
              opt.value
            )) }) }),
            closeLabel ? /* @__PURE__ */ jsx10(Button, { onPress: () => setOpen(false), size: "$3", chromeless: true, children: /* @__PURE__ */ jsx10(Text, { children: closeLabel }) }) : null
          ] }) })
        }
      ) })
    ] });
  }
}

// src/primitives/Spinner.tsx
import { Spinner as TamaguiSpinner } from "tamagui";
import { jsx as jsx11 } from "react/jsx-runtime";
function Spinner(props) {
  return /* @__PURE__ */ jsx11(TamaguiSpinner, { ...props });
}
export {
  AdSlotCard,
  Button,
  Card,
  Collapsible,
  Heading,
  Input,
  ModeFieldset,
  ReadOnlyField,
  ReadOnlyFieldLabel,
  ReadOnlyFieldRow,
  ReadOnlyFieldValue,
  Screen,
  SelectField,
  Spinner,
  Text
};
