"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  AdSlotCard: () => AdSlotCard,
  Button: () => Button,
  Card: () => Card,
  Collapsible: () => Collapsible,
  Heading: () => Heading,
  Input: () => Input,
  ModeFieldset: () => ModeFieldset,
  ReadOnlyField: () => ReadOnlyField,
  ReadOnlyFieldLabel: () => ReadOnlyFieldLabel,
  ReadOnlyFieldRow: () => ReadOnlyFieldRow,
  ReadOnlyFieldValue: () => ReadOnlyFieldValue,
  Screen: () => Screen,
  SelectField: () => SelectField,
  Spinner: () => Spinner,
  Text: () => Text
});
module.exports = __toCommonJS(index_exports);

// src/primitives/AdSlotCard.tsx
var import_react_native = require("react-native");
var import_tamagui2 = require("tamagui");

// src/primitives/Card.tsx
var import_tamagui = require("tamagui");
var import_jsx_runtime = require("react/jsx-runtime");
function Card(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_tamagui.YStack,
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
var import_jsx_runtime2 = require("react/jsx-runtime");
function AdSlotCard(props) {
  const isWeb = import_react_native.Platform.OS === "web";
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_tamagui2.YStack, { marginVertical: 12, gap: "$1.5", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    Card,
    {
      ...isWeb ? { as: "aside", "aria-label": props.ariaLabel } : { accessibilityLabel: props.ariaLabel },
      backgroundColor: "$background",
      borderWidth: 1,
      borderColor: "$borderColor",
      borderRadius: "$2",
      padding: 10,
      children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_tamagui2.YStack, { gap: "$1.5", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
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
var import_react_native2 = require("react-native");
var import_tamagui3 = require("tamagui");
var import_jsx_runtime3 = require("react/jsx-runtime");
function Button(props) {
  const { accessibilityLabel, accessibilityRole, ...rest } = props;
  if (import_react_native2.Platform.OS === "web") {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      import_tamagui3.Button,
      {
        fontFamily: props.fontFamily ?? "$body",
        "aria-label": accessibilityLabel,
        ...rest
      }
    );
  }
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
    import_tamagui3.Button,
    {
      fontFamily: props.fontFamily ?? "$body",
      accessibilityLabel,
      accessibilityRole,
      ...rest
    }
  );
}

// src/primitives/Collapsible.tsx
var import_react_native3 = require("react-native");
var import_tamagui5 = require("tamagui");

// src/primitives/Text.tsx
var import_tamagui4 = require("tamagui");
var import_jsx_runtime4 = require("react/jsx-runtime");
function Text(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_tamagui4.SizableText, { fontFamily: props.fontFamily ?? "$body", ...props });
}
function Heading({ size, fontWeight, ...props }) {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
    import_tamagui4.SizableText,
    {
      fontFamily: props.fontFamily ?? "$body",
      fontWeight: fontWeight ?? "700",
      size: size ?? "$8",
      ...props
    }
  );
}

// src/primitives/Collapsible.tsx
var import_jsx_runtime5 = require("react/jsx-runtime");
function Collapsible(props) {
  const { title, summary, children, expanded, onExpandedChange, accessibilityLabel } = props;
  if (import_react_native3.Platform.OS === "web") {
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("details", { open: expanded, onToggle: (e) => onExpandedChange(e.target.open), children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
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
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_tamagui5.YStack, { gap: "$2", children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      Button,
      {
        onPress: () => onExpandedChange(!expanded),
        chromeless: true,
        size: "$4",
        accessibilityRole: "button",
        accessibilityLabel: accessibilityLabel ?? title,
        accessibilityState: { expanded },
        children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Text, { fontSize: 16, fontWeight: "700", children: title })
      }
    ),
    expanded ? children : null
  ] });
}

// src/primitives/Input.tsx
var import_react_native4 = require("react-native");
var import_tamagui6 = require("tamagui");
var import_jsx_runtime6 = require("react/jsx-runtime");
function Input(props) {
  const { accessibilityLabel, accessibilityRole, ...rest } = props;
  if (import_react_native4.Platform.OS === "web") {
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      import_tamagui6.Input,
      {
        fontFamily: props.fontFamily ?? "$body",
        "aria-label": accessibilityLabel,
        ...rest
      }
    );
  }
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
    import_tamagui6.Input,
    {
      fontFamily: props.fontFamily ?? "$body",
      accessibilityLabel,
      accessibilityRole,
      ...rest
    }
  );
}

// src/primitives/ModeFieldset.tsx
var import_tamagui7 = require("tamagui");
var import_jsx_runtime7 = require("react/jsx-runtime");
function ModeFieldset(props) {
  const { legend, name, value, onChange, options } = props;
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
    Card,
    {
      borderWidth: 1,
      borderColor: "$borderColor",
      backgroundColor: "$background",
      padding: "$3",
      marginBottom: "$3",
      gap: "$2",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Text, { fontSize: 12, opacity: 0.8, marginBottom: "$1", children: legend }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          import_tamagui7.RadioGroup,
          {
            name,
            value,
            onValueChange: (v) => onChange(v),
            "aria-label": legend,
            children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_tamagui7.YStack, { gap: "$2", children: options.map((o) => {
              const id = `${name}-${o.value}`;
              return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(import_tamagui7.XStack, { gap: "$2", alignItems: "center", children: [
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_tamagui7.RadioGroup.Item, { id, value: o.value, size: "$3", borderColor: "$borderColor", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_tamagui7.RadioGroup.Indicator, {}) }),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_tamagui7.Label, { htmlFor: id, children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Text, { fontSize: 12, children: o.label }) })
              ] }, o.value);
            }) })
          }
        )
      ]
    }
  );
}

// src/primitives/ReadOnlyField.tsx
var import_react_native5 = require("react-native");
var import_tamagui8 = require("tamagui");
var import_jsx_runtime8 = require("react/jsx-runtime");
function ReadOnlyFieldLabel({ children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Text, { fontSize: 11, opacity: 0.8, children });
}
function ReadOnlyFieldValue({ children }) {
  const isWeb = import_react_native5.Platform.OS === "web";
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
    import_tamagui8.YStack,
    {
      "data-readonly-field-value": true,
      padding: "$2",
      backgroundColor: isWeb ? "var(--field-readonly-bg)" : "$gray3",
      borderRadius: "$2",
      borderWidth: 1,
      borderColor: isWeb ? "var(--field-readonly-border)" : "$gray4",
      userSelect: "none",
      tabIndex: isWeb ? -1 : void 0,
      children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Text, { fontSize: 12, opacity: 0.9, children })
    }
  );
}
function ReadOnlyField({ label, value, minWidth, flex }) {
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_tamagui8.YStack, { gap: "$1", minWidth, flex, children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(ReadOnlyFieldLabel, { children: label }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(ReadOnlyFieldValue, { children: value })
  ] });
}
function ReadOnlyFieldRow({ children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_tamagui8.XStack, { gap: "$3", flexWrap: "wrap", alignItems: "flex-end", children });
}

// src/primitives/Screen.tsx
var import_react_native6 = require("react-native");
var import_tamagui9 = require("tamagui");
var import_jsx_runtime9 = require("react/jsx-runtime");
function Screen({ flex, style, ...props }) {
  const topInset = import_react_native6.Platform.OS === "web" ? 0 : Math.floor((import_react_native6.StatusBar.currentHeight ?? 0) / 2);
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
    import_tamagui9.YStack,
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
var import_react = require("react");
var import_react_native7 = require("react-native");
var import_jsx_runtime10 = require("react/jsx-runtime");
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
  const isWeb = import_react_native7.Platform.OS === "web";
  const [open, setOpen] = (0, import_react.useState)(false);
  const selectedLabel = (0, import_react.useMemo)(() => findLabel(value), [value, options]);
  if (isWeb) {
    return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
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
          placeholder ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("option", { value: "", disabled: true, children: placeholder }) : null,
          options.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("option", { value: opt.value, children: opt.label }, opt.value))
        ]
      }
    );
  }
  {
    return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_react_native7.View, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
        Button,
        {
          onPress: () => setOpen(true),
          size: "$3",
          background: "$background",
          borderWidth: 1,
          borderColor: "$borderColor",
          disabled,
          accessibilityLabel: ariaLabel,
          children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Text, { fontSize: 12, children: (renderValue ? String(renderValue(value)) : selectedLabel) || placeholder || "\u2014" })
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_react_native7.Modal, { visible: open, transparent: true, animationType: "fade", onRequestClose: () => setOpen(false), children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
        import_react_native7.Pressable,
        {
          style: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 16 },
          onPress: () => setOpen(false),
          children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_react_native7.Pressable, { onPress: () => null, children: /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(Card, { gap: "$2", background: "$background", borderWidth: 1, borderColor: "$borderColor", padding: "$3", children: [
            ariaLabel ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Text, { fontSize: 16, fontWeight: "700", children: ariaLabel }) : null,
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_react_native7.ScrollView, { style: { maxHeight: 320 }, children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_react_native7.View, { style: { gap: 8 }, children: options.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
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
                children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Text, { fontSize: 12, children: opt.label })
              },
              opt.value
            )) }) }),
            closeLabel ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Button, { onPress: () => setOpen(false), size: "$3", chromeless: true, children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Text, { children: closeLabel }) }) : null
          ] }) })
        }
      ) })
    ] });
  }
}

// src/primitives/Spinner.tsx
var import_tamagui10 = require("tamagui");
var import_jsx_runtime11 = require("react/jsx-runtime");
function Spinner(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_tamagui10.Spinner, { ...props });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
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
});
