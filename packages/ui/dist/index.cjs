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
  Button: () => Button,
  Card: () => Card,
  Heading: () => Heading,
  Screen: () => Screen,
  Spinner: () => Spinner,
  Text: () => Text
});
module.exports = __toCommonJS(index_exports);

// src/primitives/Button.tsx
var import_react_native = require("react-native");
var import_tamagui = require("tamagui");
var import_jsx_runtime = require("react/jsx-runtime");
function Button(props) {
  const { accessibilityLabel, accessibilityRole, ...rest } = props;
  if (import_react_native.Platform.OS === "web") {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_tamagui.Button,
      {
        fontFamily: props.fontFamily ?? "$body",
        "aria-label": accessibilityLabel,
        ...rest
      }
    );
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_tamagui.Button,
    {
      fontFamily: props.fontFamily ?? "$body",
      accessibilityLabel,
      accessibilityRole,
      ...rest
    }
  );
}

// src/primitives/Card.tsx
var import_tamagui2 = require("tamagui");
var import_jsx_runtime2 = require("react/jsx-runtime");
function Card(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    import_tamagui2.YStack,
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
var import_react_native2 = require("react-native");
var import_tamagui3 = require("tamagui");
var import_jsx_runtime3 = require("react/jsx-runtime");
function Screen({ flex, style, ...props }) {
  const topInset = import_react_native2.Platform.OS === "web" ? 0 : Math.floor((import_react_native2.StatusBar.currentHeight ?? 0) / 2);
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
    import_tamagui3.YStack,
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

// src/primitives/Spinner.tsx
var import_tamagui4 = require("tamagui");
var import_jsx_runtime4 = require("react/jsx-runtime");
function Spinner(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_tamagui4.Spinner, { ...props });
}

// src/primitives/Text.tsx
var import_tamagui5 = require("tamagui");
var import_jsx_runtime5 = require("react/jsx-runtime");
function Text(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_tamagui5.SizableText, { fontFamily: props.fontFamily ?? "$body", ...props });
}
function Heading({ size, fontWeight, ...props }) {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
    import_tamagui5.SizableText,
    {
      fontFamily: props.fontFamily ?? "$body",
      fontWeight: fontWeight ?? "700",
      size: size ?? "$8",
      ...props
    }
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Button,
  Card,
  Heading,
  Screen,
  Spinner,
  Text
});
