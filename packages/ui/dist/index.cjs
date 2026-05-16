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
  AiChatPanel: () => AiChatPanel,
  BrewCheckbox: () => BrewCheckbox,
  Button: () => Button,
  Card: () => Card,
  Collapsible: () => Collapsible,
  FIELD_READONLY_BG: () => FIELD_READONLY_BG,
  FIELD_READONLY_BORDER: () => FIELD_READONLY_BORDER,
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
  Text: () => Text,
  ThemeVarsInjector: () => ThemeVarsInjector,
  consumeSseStream: () => consumeSseStream,
  useAiChatStream: () => useAiChatStream
});
module.exports = __toCommonJS(index_exports);

// src/theme/nativeReadonlyTokens.ts
var FIELD_READONLY_BG = "#232934";
var FIELD_READONLY_BORDER = "#3a4558";

// src/theme/ThemeVarsInjector.tsx
var import_react = require("react");
function ThemeVarsInjector() {
  (0, import_react.useEffect)(() => {
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

// src/primitives/BrewCheckbox.tsx
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

// src/primitives/BrewCheckbox.tsx
var import_jsx_runtime5 = require("react/jsx-runtime");
function BrewCheckbox(props) {
  const { accessibilityLabel, accessibilityRole, checked, disabled, size, ...rest } = props;
  const isChecked = checked === true;
  const sharedProps = {
    // Keep this custom-rendered so we control contrast/indicator on web.
    native: import_react_native3.Platform.OS === "web" ? false : void 0,
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
  if (import_react_native3.Platform.OS === "web") {
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_tamagui5.Checkbox, { "aria-label": accessibilityLabel, ...sharedProps, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_tamagui5.Checkbox.Indicator, { unstyled: true, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Text, { fontSize: 12, lineHeight: 12, fontWeight: "700", color: "$color1", children: "\u2713" }) }) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_tamagui5.Checkbox, { accessibilityLabel, accessibilityRole, ...sharedProps, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_tamagui5.Checkbox.Indicator, { unstyled: true, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Text, { fontSize: 12, lineHeight: 12, fontWeight: "700", color: "$color1", children: "\u2713" }) }) });
}

// src/primitives/Collapsible.tsx
var import_react_native4 = require("react-native");
var import_tamagui6 = require("tamagui");
var import_jsx_runtime6 = require("react/jsx-runtime");
function Collapsible(props) {
  const { title, summary, children, expanded, onExpandedChange, accessibilityLabel } = props;
  if (import_react_native4.Platform.OS === "web") {
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("details", { open: expanded, onToggle: (e) => onExpandedChange(e.target.open), children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
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
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(import_tamagui6.YStack, { gap: "$2", children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      Button,
      {
        onPress: () => onExpandedChange(!expanded),
        chromeless: true,
        size: "$4",
        accessibilityRole: "button",
        accessibilityLabel: accessibilityLabel ?? title,
        accessibilityState: { expanded },
        children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Text, { fontSize: 16, fontWeight: "700", children: title })
      }
    ),
    expanded ? children : null
  ] });
}

// src/primitives/Input.tsx
var import_react_native5 = require("react-native");
var import_tamagui7 = require("tamagui");
var import_jsx_runtime7 = require("react/jsx-runtime");
function Input(props) {
  const { accessibilityLabel, accessibilityRole, ...rest } = props;
  if (import_react_native5.Platform.OS === "web") {
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
      import_tamagui7.Input,
      {
        fontFamily: props.fontFamily ?? "$body",
        "aria-label": accessibilityLabel,
        ...rest
      }
    );
  }
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
    import_tamagui7.Input,
    {
      fontFamily: props.fontFamily ?? "$body",
      accessibilityLabel,
      accessibilityRole,
      ...rest
    }
  );
}

// src/primitives/ModeFieldset.tsx
var import_tamagui8 = require("tamagui");
var import_jsx_runtime8 = require("react/jsx-runtime");
function ModeFieldset(props) {
  const { legend, name, value, onChange, options } = props;
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
    Card,
    {
      borderWidth: 1,
      borderColor: "$borderColor",
      backgroundColor: "$background",
      padding: "$3",
      marginBottom: "$3",
      gap: "$2",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Text, { fontSize: 12, opacity: 0.8, marginBottom: "$1", children: legend }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          import_tamagui8.RadioGroup,
          {
            name,
            value,
            onValueChange: (v) => onChange(v),
            "aria-label": legend,
            children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_tamagui8.YStack, { gap: "$2", children: options.map((o) => {
              const id = `${name}-${o.value}`;
              return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_tamagui8.XStack, { gap: "$2", alignItems: "center", children: [
                /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                  import_tamagui8.RadioGroup.Item,
                  {
                    id,
                    value: o.value,
                    size: "$3",
                    borderColor: "$borderColor",
                    children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                      import_tamagui8.RadioGroup.Indicator,
                      {
                        unstyled: true,
                        width: 10,
                        height: 10,
                        borderRadius: 9999,
                        backgroundColor: "$color8"
                      }
                    )
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_tamagui8.Label, { htmlFor: id, children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Text, { fontSize: 12, children: o.label }) })
              ] }, o.value);
            }) })
          }
        )
      ]
    }
  );
}

// src/primitives/ReadOnlyField.tsx
var import_react_native6 = require("react-native");
var import_tamagui9 = require("tamagui");
var import_jsx_runtime9 = require("react/jsx-runtime");
function ReadOnlyFieldLabel({ children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Text, { fontSize: 11, opacity: 0.8, children });
}
function ReadOnlyFieldValue({ children }) {
  const isWeb = import_react_native6.Platform.OS === "web";
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
    import_tamagui9.YStack,
    {
      "data-readonly-field-value": true,
      padding: "$2",
      backgroundColor: isWeb ? "var(--field-readonly-bg)" : FIELD_READONLY_BG,
      borderRadius: "$2",
      borderWidth: 1,
      borderColor: isWeb ? "var(--field-readonly-border)" : FIELD_READONLY_BORDER,
      userSelect: "none",
      tabIndex: isWeb ? -1 : void 0,
      children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Text, { fontSize: 12, opacity: 0.9, children })
    }
  );
}
function ReadOnlyField({ label, value, minWidth, flex }) {
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_tamagui9.YStack, { gap: "$1", minWidth, flex, children: [
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(ReadOnlyFieldLabel, { children: label }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(ReadOnlyFieldValue, { children: value })
  ] });
}
function ReadOnlyFieldRow({ children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_tamagui9.XStack, { gap: "$3", flexWrap: "wrap", alignItems: "flex-end", children });
}

// src/primitives/Screen.tsx
var import_react_native7 = require("react-native");
var import_tamagui10 = require("tamagui");
var import_jsx_runtime10 = require("react/jsx-runtime");
function Screen({ flex, style, ...props }) {
  const topInset = import_react_native7.Platform.OS === "web" ? 0 : Math.floor((import_react_native7.StatusBar.currentHeight ?? 0) / 2);
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
    import_tamagui10.YStack,
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
var import_react2 = require("react");
var import_react_native8 = require("react-native");
var import_jsx_runtime11 = require("react/jsx-runtime");
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
  const isWeb = import_react_native8.Platform.OS === "web";
  const [open, setOpen] = (0, import_react2.useState)(false);
  const selectedLabel = (0, import_react2.useMemo)(() => findLabel(value), [value, options]);
  if (isWeb) {
    return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(
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
          placeholder ? /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("option", { value: "", disabled: true, children: placeholder }) : null,
          options.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("option", { value: opt.value, children: opt.label }, opt.value))
        ]
      }
    );
  }
  {
    return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_react_native8.View, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
        Button,
        {
          onPress: () => setOpen(true),
          size: "$3",
          background: "$background",
          borderWidth: 1,
          borderColor: "$borderColor",
          disabled,
          accessibilityLabel: ariaLabel,
          children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Text, { fontSize: 12, children: (renderValue ? String(renderValue(value)) : selectedLabel) || placeholder || "\u2014" })
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_react_native8.Modal, { visible: open, transparent: true, animationType: "fade", onRequestClose: () => setOpen(false), children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
        import_react_native8.Pressable,
        {
          style: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 16 },
          onPress: () => setOpen(false),
          children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_react_native8.Pressable, { onPress: () => null, children: /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(Card, { gap: "$2", background: "$background", borderWidth: 1, borderColor: "$borderColor", padding: "$3", children: [
            ariaLabel ? /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Text, { fontSize: 16, fontWeight: "700", children: ariaLabel }) : null,
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_react_native8.ScrollView, { style: { maxHeight: 320 }, children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_react_native8.View, { style: { gap: 8 }, children: options.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
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
                children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Text, { fontSize: 12, children: opt.label })
              },
              opt.value
            )) }) }),
            closeLabel ? /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Button, { onPress: () => setOpen(false), size: "$3", chromeless: true, children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Text, { children: closeLabel }) }) : null
          ] }) })
        }
      ) })
    ] });
  }
}

// src/primitives/Spinner.tsx
var import_tamagui11 = require("tamagui");
var import_jsx_runtime12 = require("react/jsx-runtime");
function Spinner(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(import_tamagui11.Spinner, { ...props });
}

// src/ai/useAiChatStream.ts
var import_react3 = require("react");
function newId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function useAiChatStream(input) {
  const [messages, setMessages] = (0, import_react3.useState)([]);
  const [pending, setPending] = (0, import_react3.useState)(false);
  const [terminalError, setTerminalError] = (0, import_react3.useState)(null);
  const abortRef = (0, import_react3.useRef)(null);
  const send = (0, import_react3.useCallback)(
    async (text) => {
      const trimmed = text.trim();
      if (trimmed.length === 0 || pending) return;
      setPending(true);
      setTerminalError(null);
      const userMessage = {
        id: newId(),
        role: "user",
        text: trimmed
      };
      const turnId = newId();
      const assistantMessage = {
        id: turnId,
        role: "assistant",
        text: "",
        turn: {
          id: turnId,
          status: "streaming",
          text: "",
          toolCalls: [],
          usage: null,
          error: null
        }
      };
      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await input.chatFetch(trimmed, { signal: controller.signal });
        if (!res.ok) {
          let code = `http_${res.status}`;
          let message = `Request failed (${res.status})`;
          try {
            const cloneable = res.clone;
            const json = cloneable ? await cloneable.call(res).json() : await res.json();
            if (json.error?.code) code = json.error.code;
            if (json.error?.message) message = json.error.message;
          } catch {
          }
          setMessages(
            (prev) => prev.map(
              (m) => m.id === turnId ? {
                ...m,
                text: message,
                turn: m.turn ? { ...m.turn, status: "error", error: { code, message } } : m.turn
              } : m
            )
          );
          setTerminalError({ code, message });
          return;
        }
        await consumeSseStream(
          res,
          (event) => applyEvent(setMessages, turnId, event)
        );
      } catch (err) {
        if (err?.name === "AbortError") return;
        const message = err instanceof Error ? err.message : String(err);
        setTerminalError({ code: "stream_error", message });
        setMessages(
          (prev) => prev.map(
            (m) => m.id === turnId ? {
              ...m,
              turn: m.turn ? {
                ...m.turn,
                status: "error",
                error: { code: "stream_error", message }
              } : m.turn
            } : m
          )
        );
      } finally {
        setPending(false);
        abortRef.current = null;
      }
    },
    [pending, input]
  );
  const reset = (0, import_react3.useCallback)(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setPending(false);
    setTerminalError(null);
  }, []);
  return { messages, pending, terminalError, send, reset };
}
async function consumeSseStream(res, onEvent) {
  const reader = res.body?.getReader?.();
  if (reader) {
    const decoder = new TextDecoder();
    let buf = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      buf = drainFrames(buf, onEvent);
    }
    if (buf.length > 0) drainFrames(`${buf}

`, onEvent);
    return;
  }
  const text = await res.text();
  drainFrames(text.endsWith("\n\n") ? text : `${text}

`, onEvent);
}
function drainFrames(buf, onEvent) {
  let idx = buf.indexOf("\n\n");
  while (idx !== -1) {
    const frame = buf.slice(0, idx);
    buf = buf.slice(idx + 2);
    const event = parseSseFrame(frame);
    if (event) onEvent(event);
    idx = buf.indexOf("\n\n");
  }
  return buf;
}
function parseSseFrame(frame) {
  let event = "";
  const dataLines = [];
  for (const line of frame.split("\n")) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
  }
  if (!event || dataLines.length === 0) return null;
  try {
    const json = JSON.parse(dataLines.join("\n"));
    return json;
  } catch {
    return null;
  }
}
function applyEvent(setMessages, turnId, event) {
  setMessages(
    (prev) => prev.map((m) => {
      if (m.id !== turnId || !m.turn) return m;
      const turn = { ...m.turn };
      switch (event.type) {
        case "assistant_chunk":
          turn.text = `${turn.text}${event.text}`;
          break;
        case "tool_call":
          turn.toolCalls = [
            ...turn.toolCalls,
            {
              name: event.name,
              argsJson: event.argsJson,
              resultJson: null,
              durationMs: null,
              errored: false
            }
          ];
          break;
        case "tool_result": {
          const idx = turn.toolCalls.findIndex(
            (tc) => tc.name === event.name && tc.resultJson === null
          );
          if (idx >= 0) {
            const next = [...turn.toolCalls];
            next[idx] = {
              ...next[idx],
              resultJson: event.resultJson,
              durationMs: event.durationMs,
              errored: event.errored
            };
            turn.toolCalls = next;
          }
          break;
        }
        case "complete":
          turn.status = "complete";
          turn.usage = event.usage;
          break;
        case "error":
          turn.status = "error";
          turn.error = { code: event.code, message: event.message };
          break;
      }
      return { ...m, text: turn.text, turn };
    })
  );
}

// src/ai/AiChatPanel.tsx
var import_react4 = require("react");
var import_tamagui12 = require("tamagui");
var import_jsx_runtime13 = require("react/jsx-runtime");
function AiChatPanel({ chat, t, onOpenUpgrade }) {
  const { messages, pending, terminalError, send } = chat;
  const [draft, setDraft] = (0, import_react4.useState)("");
  const handleSend = () => {
    const text = draft.trim();
    if (!text || pending) return;
    setDraft("");
    void send(text);
  };
  const isSubscriptionError = terminalError?.code === "ai_subscription_required";
  const isNotEnabled = terminalError?.code === "ai_not_enabled";
  const isNoKey = terminalError?.code === "ai_no_key";
  const isDataEgress = terminalError?.code === "ai_data_egress_not_accepted";
  const isRateRole = terminalError?.code === "ai_rate_limit";
  const errorText = terminalError ? isSubscriptionError ? t("errors.subscriptionRequired") : isNotEnabled ? t("errors.notEnabled") : isNoKey ? t("errors.noKey") : isDataEgress ? t("errors.dataEgressNotAccepted") : isRateRole ? t("errors.rateLimit") : terminalError.message || t("errors.internal") : null;
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
    import_tamagui12.YStack,
    {
      gap: "$4",
      ...{ "aria-labelledby": "ai-chat-title", role: "main" },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_tamagui12.YStack, { gap: "$2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_tamagui12.H2, { id: "ai-chat-title", children: t("title") }),
          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_tamagui12.SizableText, { size: "$2", theme: "alt2", children: t("subtitle") })
        ] }),
        errorText ? /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
          import_tamagui12.View,
          {
            backgroundColor: "$yellow3",
            borderColor: "$yellow8",
            borderWidth: 1,
            padding: "$3",
            borderRadius: "$3",
            ...{ role: "alert" },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_tamagui12.SizableText, { children: errorText }),
              isSubscriptionError && onOpenUpgrade ? /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_tamagui12.XStack, { marginTop: "$2", children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                Button,
                {
                  size: "$2",
                  onPress: onOpenUpgrade,
                  accessibilityLabel: t("errors.subscriptionRequiredCta"),
                  children: t("errors.subscriptionRequiredCta")
                }
              ) }) : null
            ]
          }
        ) : null,
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
          import_tamagui12.YStack,
          {
            gap: "$3",
            minHeight: 300,
            padding: "$3",
            backgroundColor: "$background",
            borderRadius: "$3",
            borderWidth: 1,
            borderColor: "$borderColor",
            ...{ "aria-live": "polite" },
            children: messages.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_tamagui12.SizableText, { theme: "alt2", children: t("messages.empty") }) : messages.map((m) => /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_tamagui12.YStack, { gap: "$1", children: [
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_tamagui12.SizableText, { fontWeight: "600", children: m.role === "user" ? t("messages.you") : t("messages.assistant") }),
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_tamagui12.SizableText, { children: m.text || (pending && m.role === "assistant" ? t("composer.thinking") : "") }),
              m.turn?.toolCalls.map((tc, i) => /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_tamagui12.SizableText, { size: "$1", theme: "alt2", children: tc.errored ? t("messages.toolError", { message: tc.name }) : t("messages.toolCall", { tool: tc.name }) }, `${m.id}-tc-${i}`))
            ] }, m.id))
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_tamagui12.XStack, { gap: "$2", alignItems: "center", children: [
          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_tamagui12.View, { flex: 1, children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
            Input,
            {
              value: draft,
              onChangeText: setDraft,
              placeholder: t("composer.placeholder"),
              disabled: pending,
              onSubmitEditing: handleSend,
              returnKeyType: "send",
              accessibilityLabel: t("composer.placeholder")
            }
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
            Button,
            {
              onPress: handleSend,
              disabled: pending || draft.trim().length === 0,
              accessibilityLabel: t("composer.sendAriaLabel"),
              children: pending ? t("composer.thinking") : t("composer.send")
            }
          )
        ] })
      ]
    }
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AdSlotCard,
  AiChatPanel,
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
  ThemeVarsInjector,
  consumeSseStream,
  useAiChatStream
});
