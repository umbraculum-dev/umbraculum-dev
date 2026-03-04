// src/theme/nativeReadonlyTokens.ts
var FIELD_READONLY_BG = "#232934";
var FIELD_READONLY_BORDER = "#3a4558";

// src/theme/ThemeVarsInjector.tsx
import { useEffect } from "react";
function ThemeVarsInjector() {
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--field-readonly-bg", FIELD_READONLY_BG);
    root.style.setProperty("--field-readonly-border", FIELD_READONLY_BORDER);
    return () => {
      root.style.removeProperty("--field-readonly-bg");
      root.style.removeProperty("--field-readonly-border");
    };
  }, []);
  return null;
}

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

// src/primitives/BrewCheckbox.tsx
import { Platform as Platform3 } from "react-native";
import { Checkbox as TamaguiCheckbox } from "tamagui";

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

// src/primitives/BrewCheckbox.tsx
import { jsx as jsx5 } from "react/jsx-runtime";
function BrewCheckbox(props) {
  const { accessibilityLabel, accessibilityRole, checked, disabled, size, ...rest } = props;
  const isChecked = checked === true;
  const sharedProps = {
    // Keep this custom-rendered so we control contrast/indicator on web.
    native: Platform3.OS === "web" ? false : void 0,
    size: size ?? "$2",
    disabled,
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
    ...rest
  };
  if (Platform3.OS === "web") {
    return /* @__PURE__ */ jsx5(TamaguiCheckbox, { "aria-label": accessibilityLabel, ...sharedProps, children: /* @__PURE__ */ jsx5(TamaguiCheckbox.Indicator, { unstyled: true, children: /* @__PURE__ */ jsx5(Text, { fontSize: 12, lineHeight: 12, fontWeight: "700", color: "$color1", children: "\u2713" }) }) });
  }
  return /* @__PURE__ */ jsx5(TamaguiCheckbox, { accessibilityLabel, accessibilityRole, ...sharedProps, children: /* @__PURE__ */ jsx5(TamaguiCheckbox.Indicator, { unstyled: true, children: /* @__PURE__ */ jsx5(Text, { fontSize: 12, lineHeight: 12, fontWeight: "700", color: "$color1", children: "\u2713" }) }) });
}

// src/primitives/Collapsible.tsx
import { Platform as Platform4 } from "react-native";
import { YStack as YStack3 } from "tamagui";
import { jsx as jsx6, jsxs as jsxs2 } from "react/jsx-runtime";
function Collapsible(props) {
  const { title, summary, children, expanded, onExpandedChange, accessibilityLabel } = props;
  if (Platform4.OS === "web") {
    return /* @__PURE__ */ jsxs2("details", { open: expanded, onToggle: (e) => onExpandedChange(e.target.open), children: [
      /* @__PURE__ */ jsx6(
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
    /* @__PURE__ */ jsx6(
      Button,
      {
        onPress: () => onExpandedChange(!expanded),
        chromeless: true,
        size: "$4",
        accessibilityRole: "button",
        accessibilityLabel: accessibilityLabel ?? title,
        accessibilityState: { expanded },
        children: /* @__PURE__ */ jsx6(Text, { fontSize: 16, fontWeight: "700", children: title })
      }
    ),
    expanded ? children : null
  ] });
}

// src/primitives/Input.tsx
import { Platform as Platform5 } from "react-native";
import { Input as TamaguiInput } from "tamagui";
import { jsx as jsx7 } from "react/jsx-runtime";
function Input(props) {
  const { accessibilityLabel, accessibilityRole, ...rest } = props;
  if (Platform5.OS === "web") {
    return /* @__PURE__ */ jsx7(
      TamaguiInput,
      {
        fontFamily: props.fontFamily ?? "$body",
        "aria-label": accessibilityLabel,
        ...rest
      }
    );
  }
  return /* @__PURE__ */ jsx7(
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
import { Platform as Platform6 } from "react-native";
import { Label, RadioGroup, XStack, YStack as YStack4 } from "tamagui";
import { jsx as jsx8, jsxs as jsxs3 } from "react/jsx-runtime";
function ModeFieldset(props) {
  const { legend, name, value, onChange, options } = props;
  const isWeb = Platform6.OS === "web";
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
        /* @__PURE__ */ jsx8(Text, { fontSize: 12, opacity: 0.8, marginBottom: "$1", children: legend }),
        /* @__PURE__ */ jsx8(
          RadioGroup,
          {
            native: isWeb,
            name,
            value,
            onValueChange: (v) => onChange(v),
            "aria-label": legend,
            children: /* @__PURE__ */ jsx8(YStack4, { gap: "$2", children: options.map((o) => {
              const id = `${name}-${o.value}`;
              const checked = value === o.value;
              return /* @__PURE__ */ jsxs3(XStack, { gap: "$2", alignItems: "center", children: [
                /* @__PURE__ */ jsx8(
                  RadioGroup.Item,
                  {
                    id,
                    value: o.value,
                    size: "$3",
                    borderColor: "$borderColor",
                    children: !isWeb ? /* @__PURE__ */ jsx8(RadioGroup.Indicator, { unstyled: true, width: 10, height: 10, borderRadius: 9999, backgroundColor: "$color8" }) : null
                  }
                ),
                /* @__PURE__ */ jsx8(Label, { htmlFor: id, children: /* @__PURE__ */ jsx8(Text, { fontSize: 12, children: o.label }) })
              ] }, o.value);
            }) })
          }
        )
      ]
    }
  );
}

// src/primitives/ReadOnlyField.tsx
import { Platform as Platform7 } from "react-native";
import { XStack as XStack2, YStack as YStack5 } from "tamagui";
import { jsx as jsx9, jsxs as jsxs4 } from "react/jsx-runtime";
function ReadOnlyFieldLabel({ children }) {
  return /* @__PURE__ */ jsx9(Text, { fontSize: 11, opacity: 0.8, children });
}
function ReadOnlyFieldValue({ children }) {
  const isWeb = Platform7.OS === "web";
  return /* @__PURE__ */ jsx9(
    YStack5,
    {
      "data-readonly-field-value": true,
      padding: "$2",
      backgroundColor: isWeb ? "var(--field-readonly-bg)" : FIELD_READONLY_BG,
      borderRadius: "$2",
      borderWidth: 1,
      borderColor: isWeb ? "var(--field-readonly-border)" : FIELD_READONLY_BORDER,
      userSelect: "none",
      tabIndex: isWeb ? -1 : void 0,
      children: /* @__PURE__ */ jsx9(Text, { fontSize: 12, opacity: 0.9, children })
    }
  );
}
function ReadOnlyField({ label, value, minWidth, flex }) {
  return /* @__PURE__ */ jsxs4(YStack5, { gap: "$1", minWidth, flex, children: [
    /* @__PURE__ */ jsx9(ReadOnlyFieldLabel, { children: label }),
    /* @__PURE__ */ jsx9(ReadOnlyFieldValue, { children: value })
  ] });
}
function ReadOnlyFieldRow({ children }) {
  return /* @__PURE__ */ jsx9(XStack2, { gap: "$3", flexWrap: "wrap", alignItems: "flex-end", children });
}

// src/primitives/Screen.tsx
import { Platform as Platform8, StatusBar } from "react-native";
import { YStack as YStack6 } from "tamagui";
import { jsx as jsx10 } from "react/jsx-runtime";
function Screen({ flex, style, ...props }) {
  const topInset = Platform8.OS === "web" ? 0 : Math.floor((StatusBar.currentHeight ?? 0) / 2);
  return /* @__PURE__ */ jsx10(
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
import { Modal, Platform as Platform9, Pressable, ScrollView, View } from "react-native";
import { jsx as jsx11, jsxs as jsxs5 } from "react/jsx-runtime";
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
  const isWeb = Platform9.OS === "web";
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
          placeholder ? /* @__PURE__ */ jsx11("option", { value: "", disabled: true, children: placeholder }) : null,
          options.map((opt) => /* @__PURE__ */ jsx11("option", { value: opt.value, children: opt.label }, opt.value))
        ]
      }
    );
  }
  {
    return /* @__PURE__ */ jsxs5(View, { children: [
      /* @__PURE__ */ jsx11(
        Button,
        {
          onPress: () => setOpen(true),
          size: "$3",
          background: "$background",
          borderWidth: 1,
          borderColor: "$borderColor",
          disabled,
          accessibilityLabel: ariaLabel,
          children: /* @__PURE__ */ jsx11(Text, { fontSize: 12, children: (renderValue ? String(renderValue(value)) : selectedLabel) || placeholder || "\u2014" })
        }
      ),
      /* @__PURE__ */ jsx11(Modal, { visible: open, transparent: true, animationType: "fade", onRequestClose: () => setOpen(false), children: /* @__PURE__ */ jsx11(
        Pressable,
        {
          style: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 16 },
          onPress: () => setOpen(false),
          children: /* @__PURE__ */ jsx11(Pressable, { onPress: () => null, children: /* @__PURE__ */ jsxs5(Card, { gap: "$2", background: "$background", borderWidth: 1, borderColor: "$borderColor", padding: "$3", children: [
            ariaLabel ? /* @__PURE__ */ jsx11(Text, { fontSize: 16, fontWeight: "700", children: ariaLabel }) : null,
            /* @__PURE__ */ jsx11(ScrollView, { style: { maxHeight: 320 }, children: /* @__PURE__ */ jsx11(View, { style: { gap: 8 }, children: options.map((opt) => /* @__PURE__ */ jsx11(
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
                children: /* @__PURE__ */ jsx11(Text, { fontSize: 12, children: opt.label })
              },
              opt.value
            )) }) }),
            closeLabel ? /* @__PURE__ */ jsx11(Button, { onPress: () => setOpen(false), size: "$3", chromeless: true, children: /* @__PURE__ */ jsx11(Text, { children: closeLabel }) }) : null
          ] }) })
        }
      ) })
    ] });
  }
}

// src/primitives/Spinner.tsx
import { Spinner as TamaguiSpinner } from "tamagui";
import { jsx as jsx12 } from "react/jsx-runtime";
function Spinner(props) {
  return /* @__PURE__ */ jsx12(TamaguiSpinner, { ...props });
}
export {
  AdSlotCard,
  BrewCheckbox,
  Button,
  Card,
  Collapsible,
  FIELD_READONLY_BG,
  FIELD_READONLY_BORDER,
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
  Text,
  ThemeVarsInjector
};
