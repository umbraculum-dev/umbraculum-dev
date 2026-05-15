import {
  Card,
  Heading,
  Text
} from "./chunk-XF6MCNOA.js";

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
import { YStack } from "tamagui";
import { jsx, jsxs } from "react/jsx-runtime";
function AdSlotCard(props) {
  const isWeb = Platform.OS === "web";
  return /* @__PURE__ */ jsx(YStack, { marginVertical: 12, gap: "$1.5", children: /* @__PURE__ */ jsx(
    Card,
    {
      ...isWeb ? { as: "aside", "aria-label": props.ariaLabel } : { accessibilityLabel: props.ariaLabel },
      backgroundColor: "$background",
      borderWidth: 1,
      borderColor: "$borderColor",
      borderRadius: "$2",
      padding: 10,
      children: /* @__PURE__ */ jsxs(YStack, { gap: "$1.5", children: [
        /* @__PURE__ */ jsx(
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
import { jsx as jsx2 } from "react/jsx-runtime";
function Button(props) {
  const { accessibilityLabel, accessibilityRole, ...rest } = props;
  if (Platform2.OS === "web") {
    return /* @__PURE__ */ jsx2(
      TamaguiButton,
      {
        fontFamily: props.fontFamily ?? "$body",
        "aria-label": accessibilityLabel,
        ...rest
      }
    );
  }
  return /* @__PURE__ */ jsx2(
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
import { jsx as jsx3 } from "react/jsx-runtime";
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
    return /* @__PURE__ */ jsx3(TamaguiCheckbox, { "aria-label": accessibilityLabel, ...sharedProps, children: /* @__PURE__ */ jsx3(TamaguiCheckbox.Indicator, { unstyled: true, children: /* @__PURE__ */ jsx3(Text, { fontSize: 12, lineHeight: 12, fontWeight: "700", color: "$color1", children: "\u2713" }) }) });
  }
  return /* @__PURE__ */ jsx3(TamaguiCheckbox, { accessibilityLabel, accessibilityRole, ...sharedProps, children: /* @__PURE__ */ jsx3(TamaguiCheckbox.Indicator, { unstyled: true, children: /* @__PURE__ */ jsx3(Text, { fontSize: 12, lineHeight: 12, fontWeight: "700", color: "$color1", children: "\u2713" }) }) });
}

// src/primitives/Collapsible.tsx
import { Platform as Platform4 } from "react-native";
import { YStack as YStack2 } from "tamagui";
import { jsx as jsx4, jsxs as jsxs2 } from "react/jsx-runtime";
function Collapsible(props) {
  const { title, summary, children, expanded, onExpandedChange, accessibilityLabel } = props;
  if (Platform4.OS === "web") {
    return /* @__PURE__ */ jsxs2("details", { open: expanded, onToggle: (e) => onExpandedChange(e.target.open), children: [
      /* @__PURE__ */ jsx4(
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
  return /* @__PURE__ */ jsxs2(YStack2, { gap: "$2", children: [
    /* @__PURE__ */ jsx4(
      Button,
      {
        onPress: () => onExpandedChange(!expanded),
        chromeless: true,
        size: "$4",
        accessibilityRole: "button",
        accessibilityLabel: accessibilityLabel ?? title,
        accessibilityState: { expanded },
        children: /* @__PURE__ */ jsx4(Text, { fontSize: 16, fontWeight: "700", children: title })
      }
    ),
    expanded ? children : null
  ] });
}

// src/primitives/Input.tsx
import { Platform as Platform5 } from "react-native";
import { Input as TamaguiInput } from "tamagui";
import { jsx as jsx5 } from "react/jsx-runtime";
function Input(props) {
  const { accessibilityLabel, accessibilityRole, ...rest } = props;
  if (Platform5.OS === "web") {
    return /* @__PURE__ */ jsx5(
      TamaguiInput,
      {
        fontFamily: props.fontFamily ?? "$body",
        "aria-label": accessibilityLabel,
        ...rest
      }
    );
  }
  return /* @__PURE__ */ jsx5(
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
import { Label, RadioGroup, XStack, YStack as YStack3 } from "tamagui";
import { jsx as jsx6, jsxs as jsxs3 } from "react/jsx-runtime";
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
        /* @__PURE__ */ jsx6(Text, { fontSize: 12, opacity: 0.8, marginBottom: "$1", children: legend }),
        /* @__PURE__ */ jsx6(
          RadioGroup,
          {
            name,
            value,
            onValueChange: (v) => onChange(v),
            "aria-label": legend,
            children: /* @__PURE__ */ jsx6(YStack3, { gap: "$2", children: options.map((o) => {
              const id = `${name}-${o.value}`;
              return /* @__PURE__ */ jsxs3(XStack, { gap: "$2", alignItems: "center", children: [
                /* @__PURE__ */ jsx6(
                  RadioGroup.Item,
                  {
                    id,
                    value: o.value,
                    size: "$3",
                    borderColor: "$borderColor",
                    children: /* @__PURE__ */ jsx6(
                      RadioGroup.Indicator,
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
                /* @__PURE__ */ jsx6(Label, { htmlFor: id, children: /* @__PURE__ */ jsx6(Text, { fontSize: 12, children: o.label }) })
              ] }, o.value);
            }) })
          }
        )
      ]
    }
  );
}

// src/primitives/ReadOnlyField.tsx
import { Platform as Platform6 } from "react-native";
import { XStack as XStack2, YStack as YStack4 } from "tamagui";
import { jsx as jsx7, jsxs as jsxs4 } from "react/jsx-runtime";
function ReadOnlyFieldLabel({ children }) {
  return /* @__PURE__ */ jsx7(Text, { fontSize: 11, opacity: 0.8, children });
}
function ReadOnlyFieldValue({ children }) {
  const isWeb = Platform6.OS === "web";
  return /* @__PURE__ */ jsx7(
    YStack4,
    {
      "data-readonly-field-value": true,
      padding: "$2",
      backgroundColor: isWeb ? "var(--field-readonly-bg)" : FIELD_READONLY_BG,
      borderRadius: "$2",
      borderWidth: 1,
      borderColor: isWeb ? "var(--field-readonly-border)" : FIELD_READONLY_BORDER,
      userSelect: "none",
      tabIndex: isWeb ? -1 : void 0,
      children: /* @__PURE__ */ jsx7(Text, { fontSize: 12, opacity: 0.9, children })
    }
  );
}
function ReadOnlyField({ label, value, minWidth, flex }) {
  return /* @__PURE__ */ jsxs4(YStack4, { gap: "$1", minWidth, flex, children: [
    /* @__PURE__ */ jsx7(ReadOnlyFieldLabel, { children: label }),
    /* @__PURE__ */ jsx7(ReadOnlyFieldValue, { children: value })
  ] });
}
function ReadOnlyFieldRow({ children }) {
  return /* @__PURE__ */ jsx7(XStack2, { gap: "$3", flexWrap: "wrap", alignItems: "flex-end", children });
}

// src/primitives/Screen.tsx
import { Platform as Platform7, StatusBar } from "react-native";
import { YStack as YStack5 } from "tamagui";
import { jsx as jsx8 } from "react/jsx-runtime";
function Screen({ flex, style, ...props }) {
  const topInset = Platform7.OS === "web" ? 0 : Math.floor((StatusBar.currentHeight ?? 0) / 2);
  return /* @__PURE__ */ jsx8(
    YStack5,
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
import { Modal, Platform as Platform8, Pressable, ScrollView, View } from "react-native";
import { jsx as jsx9, jsxs as jsxs5 } from "react/jsx-runtime";
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
  const isWeb = Platform8.OS === "web";
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
          placeholder ? /* @__PURE__ */ jsx9("option", { value: "", disabled: true, children: placeholder }) : null,
          options.map((opt) => /* @__PURE__ */ jsx9("option", { value: opt.value, children: opt.label }, opt.value))
        ]
      }
    );
  }
  {
    return /* @__PURE__ */ jsxs5(View, { children: [
      /* @__PURE__ */ jsx9(
        Button,
        {
          onPress: () => setOpen(true),
          size: "$3",
          background: "$background",
          borderWidth: 1,
          borderColor: "$borderColor",
          disabled,
          accessibilityLabel: ariaLabel,
          children: /* @__PURE__ */ jsx9(Text, { fontSize: 12, children: (renderValue ? String(renderValue(value)) : selectedLabel) || placeholder || "\u2014" })
        }
      ),
      /* @__PURE__ */ jsx9(Modal, { visible: open, transparent: true, animationType: "fade", onRequestClose: () => setOpen(false), children: /* @__PURE__ */ jsx9(
        Pressable,
        {
          style: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 16 },
          onPress: () => setOpen(false),
          children: /* @__PURE__ */ jsx9(Pressable, { onPress: () => null, children: /* @__PURE__ */ jsxs5(Card, { gap: "$2", background: "$background", borderWidth: 1, borderColor: "$borderColor", padding: "$3", children: [
            ariaLabel ? /* @__PURE__ */ jsx9(Text, { fontSize: 16, fontWeight: "700", children: ariaLabel }) : null,
            /* @__PURE__ */ jsx9(ScrollView, { style: { maxHeight: 320 }, children: /* @__PURE__ */ jsx9(View, { style: { gap: 8 }, children: options.map((opt) => /* @__PURE__ */ jsx9(
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
                children: /* @__PURE__ */ jsx9(Text, { fontSize: 12, children: opt.label })
              },
              opt.value
            )) }) }),
            closeLabel ? /* @__PURE__ */ jsx9(Button, { onPress: () => setOpen(false), size: "$3", chromeless: true, children: /* @__PURE__ */ jsx9(Text, { children: closeLabel }) }) : null
          ] }) })
        }
      ) })
    ] });
  }
}

// src/primitives/Spinner.tsx
import { Spinner as TamaguiSpinner } from "tamagui";
import { jsx as jsx10 } from "react/jsx-runtime";
function Spinner(props) {
  return /* @__PURE__ */ jsx10(TamaguiSpinner, { ...props });
}

// src/ai/useAiChatStream.ts
import { useCallback, useRef, useState as useState2 } from "react";
function newId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function useAiChatStream(input) {
  const [messages, setMessages] = useState2([]);
  const [pending, setPending] = useState2(false);
  const [terminalError, setTerminalError] = useState2(null);
  const abortRef = useRef(null);
  const send = useCallback(
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
  const reset = useCallback(() => {
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
import { useState as useState3 } from "react";
import { Button as Button2, H2, Input as Input2, SizableText, View as View2, XStack as XStack3, YStack as YStack6 } from "tamagui";
import { jsx as jsx11, jsxs as jsxs6 } from "react/jsx-runtime";
function AiChatPanel({ chat, t, onOpenUpgrade }) {
  const { messages, pending, terminalError, send } = chat;
  const [draft, setDraft] = useState3("");
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
  return /* @__PURE__ */ jsxs6(
    YStack6,
    {
      gap: "$4",
      ...{ "aria-labelledby": "ai-chat-title", role: "main" },
      children: [
        /* @__PURE__ */ jsxs6(YStack6, { gap: "$2", children: [
          /* @__PURE__ */ jsx11(H2, { id: "ai-chat-title", children: t("title") }),
          /* @__PURE__ */ jsx11(SizableText, { size: "$2", theme: "alt2", children: t("subtitle") })
        ] }),
        errorText ? /* @__PURE__ */ jsxs6(
          View2,
          {
            backgroundColor: "$yellow3",
            borderColor: "$yellow8",
            borderWidth: 1,
            padding: "$3",
            borderRadius: "$3",
            ...{ role: "alert" },
            children: [
              /* @__PURE__ */ jsx11(SizableText, { children: errorText }),
              isSubscriptionError && onOpenUpgrade ? /* @__PURE__ */ jsx11(XStack3, { marginTop: "$2", children: /* @__PURE__ */ jsx11(
                Button2,
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
        /* @__PURE__ */ jsx11(
          YStack6,
          {
            gap: "$3",
            minHeight: 300,
            padding: "$3",
            backgroundColor: "$background",
            borderRadius: "$3",
            borderWidth: 1,
            borderColor: "$borderColor",
            ...{ "aria-live": "polite" },
            children: messages.length === 0 ? /* @__PURE__ */ jsx11(SizableText, { theme: "alt2", children: t("messages.empty") }) : messages.map((m) => /* @__PURE__ */ jsxs6(YStack6, { gap: "$1", children: [
              /* @__PURE__ */ jsx11(SizableText, { fontWeight: "600", children: m.role === "user" ? t("messages.you") : t("messages.assistant") }),
              /* @__PURE__ */ jsx11(SizableText, { children: m.text || (pending && m.role === "assistant" ? t("composer.thinking") : "") }),
              m.turn?.toolCalls.map((tc, i) => /* @__PURE__ */ jsx11(SizableText, { size: "$1", theme: "alt2", children: tc.errored ? t("messages.toolError", { message: tc.name }) : t("messages.toolCall", { tool: tc.name }) }, `${m.id}-tc-${i}`))
            ] }, m.id))
          }
        ),
        /* @__PURE__ */ jsxs6(XStack3, { gap: "$2", alignItems: "center", children: [
          /* @__PURE__ */ jsx11(View2, { flex: 1, children: /* @__PURE__ */ jsx11(
            Input2,
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
          /* @__PURE__ */ jsx11(
            Button2,
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
export {
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
};
