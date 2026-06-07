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
import "react";
import { Platform } from "react-native";
import { YStack as YStack2 } from "tamagui";

// src/primitives/Card.tsx
import "react";
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
import "react";
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
import "react";
import { Platform as Platform3 } from "react-native";
import { YStack as YStack3 } from "tamagui";

// src/primitives/Text.tsx
import "react";
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
import "react";
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
import "react";
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
                /* @__PURE__ */ jsx7(
                  RadioGroup.Item,
                  {
                    id,
                    value: o.value,
                    size: "$3",
                    borderColor: "$borderColor",
                    children: /* @__PURE__ */ jsx7(
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
import "react";
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
      backgroundColor: isWeb ? "var(--field-readonly-bg)" : FIELD_READONLY_BG,
      borderRadius: "$2",
      borderWidth: 1,
      borderColor: isWeb ? "var(--field-readonly-border)" : FIELD_READONLY_BORDER,
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
import "react";
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
  const isWeb = Platform7.OS === "web";
  const [open, setOpen] = useState(false);
  const selectedLabel = useMemo(
    () => options.find((opt) => opt.value === value)?.label ?? value,
    [value, options]
  );
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
          children: /* @__PURE__ */ jsx10(Text, { fontSize: 12, children: (renderValue ? renderValue(value) : selectedLabel) || placeholder || "\u2014" })
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
import "react";
import { Spinner as TamaguiSpinner } from "tamagui";
import { jsx as jsx11 } from "react/jsx-runtime";
function Spinner(props) {
  return /* @__PURE__ */ jsx11(TamaguiSpinner, { ...props });
}

// src/ai/useAiChatStream.ts
import { useCallback, useRef, useState as useState2 } from "react";

// src/ai/parseAiChatSseFrame.ts
function parseAiChatSseFrame(frame) {
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
function drainFrames(buf, onEvent) {
  let idx = buf.indexOf("\n\n");
  while (idx !== -1) {
    const frame = buf.slice(0, idx);
    buf = buf.slice(idx + 2);
    const event = parseAiChatSseFrame(frame);
    if (event) onEvent(event);
    idx = buf.indexOf("\n\n");
  }
  return buf;
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

// src/ai/useAiChatTurnAccumulator.ts
function newAiChatTurnId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function applyAiChatTurnEvent(setMessages, turnId, event) {
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
        case "proposal":
          turn.proposals = [
            ...turn.proposals,
            {
              proposalId: event.proposalId,
              moduleCode: event.moduleCode,
              proposalType: event.proposalType,
              summary: event.summary,
              status: "pending"
            }
          ];
          break;
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

// src/ai/useAiChatStream.ts
function useAiChatStream(input) {
  const { chatFetch, routeId, proposalApply, proposalReject } = input;
  const [messages, setMessages] = useState2([]);
  const [pending, setPending] = useState2(false);
  const [terminalError, setTerminalError] = useState2(null);
  const abortRef = useRef(null);
  const applyProposal = useCallback(
    async (proposalId) => {
      if (!proposalApply) return;
      await proposalApply(proposalId);
      setMessages(
        (prev) => prev.map((m) => {
          if (!m.turn) return m;
          return {
            ...m,
            turn: {
              ...m.turn,
              proposals: m.turn.proposals.map(
                (p) => p.proposalId === proposalId ? { ...p, status: "applied" } : p
              )
            }
          };
        })
      );
    },
    [proposalApply]
  );
  const rejectProposal = useCallback(
    async (proposalId) => {
      if (!proposalReject) return;
      await proposalReject(proposalId);
      setMessages(
        (prev) => prev.map((m) => {
          if (!m.turn) return m;
          return {
            ...m,
            turn: {
              ...m.turn,
              proposals: m.turn.proposals.map(
                (p) => p.proposalId === proposalId ? { ...p, status: "rejected" } : p
              )
            }
          };
        })
      );
    },
    [proposalReject]
  );
  const send = useCallback(
    async (text) => {
      const trimmed = text.trim();
      if (trimmed.length === 0 || pending) return;
      setPending(true);
      setTerminalError(null);
      const userMessage = {
        id: newAiChatTurnId(),
        role: "user",
        text: trimmed
      };
      const turnId = newAiChatTurnId();
      const assistantMessage = {
        id: turnId,
        role: "assistant",
        text: "",
        turn: {
          id: turnId,
          status: "streaming",
          text: "",
          toolCalls: [],
          proposals: [],
          usage: null,
          error: null
        }
      };
      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await chatFetch(trimmed, {
          signal: controller.signal,
          routeId: routeId ?? null
        });
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
        await consumeSseStream(res, (event) => applyAiChatTurnEvent(setMessages, turnId, event));
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
    [pending, chatFetch, routeId]
  );
  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setPending(false);
    setTerminalError(null);
  }, []);
  return { messages, pending, terminalError, send, reset, applyProposal, rejectProposal };
}

// src/ai/AiChatPanel.tsx
import { useState as useState3 } from "react";
import { H2, SizableText as SizableText2, View as View2, XStack as XStack3, YStack as YStack7 } from "tamagui";
import { jsx as jsx12, jsxs as jsxs6 } from "react/jsx-runtime";
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
    YStack7,
    {
      gap: "$4",
      ...{ "aria-labelledby": "ai-chat-title", role: "main" },
      children: [
        /* @__PURE__ */ jsxs6(YStack7, { gap: "$2", children: [
          /* @__PURE__ */ jsx12(H2, { id: "ai-chat-title", children: t("title") }),
          /* @__PURE__ */ jsx12(SizableText2, { size: "$2", theme: "alt2", children: t("subtitle") })
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
              /* @__PURE__ */ jsx12(SizableText2, { children: errorText }),
              isSubscriptionError && onOpenUpgrade ? /* @__PURE__ */ jsx12(XStack3, { marginTop: "$2", children: /* @__PURE__ */ jsx12(
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
        /* @__PURE__ */ jsx12(
          YStack7,
          {
            gap: "$3",
            minHeight: 300,
            padding: "$3",
            backgroundColor: "$background",
            borderRadius: "$3",
            borderWidth: 1,
            borderColor: "$borderColor",
            ...{ "aria-live": "polite" },
            children: messages.length === 0 ? /* @__PURE__ */ jsx12(SizableText2, { theme: "alt2", children: t("messages.empty") }) : messages.map((m) => /* @__PURE__ */ jsxs6(YStack7, { gap: "$1", children: [
              /* @__PURE__ */ jsx12(SizableText2, { fontWeight: "600", children: m.role === "user" ? t("messages.you") : t("messages.assistant") }),
              /* @__PURE__ */ jsx12(SizableText2, { children: m.text || (pending && m.role === "assistant" ? t("composer.thinking") : "") }),
              m.turn?.toolCalls.map((tc, i) => /* @__PURE__ */ jsx12(SizableText2, { size: "$1", theme: "alt2", children: tc.errored ? t("messages.toolError", { message: tc.name }) : t("messages.toolCall", { tool: tc.name }) }, `${m.id}-tc-${i}`)),
              m.turn?.proposals.map((p) => /* @__PURE__ */ jsxs6(
                YStack7,
                {
                  gap: "$2",
                  padding: "$2",
                  borderWidth: 1,
                  borderColor: "$borderColor",
                  borderRadius: "$2",
                  children: [
                    /* @__PURE__ */ jsx12(SizableText2, { size: "$2", children: p.summary }),
                    p.status === "pending" ? /* @__PURE__ */ jsxs6(XStack3, { gap: "$2", children: [
                      /* @__PURE__ */ jsx12(
                        Button,
                        {
                          size: "$2",
                          onPress: () => void chat.applyProposal(p.proposalId),
                          accessibilityLabel: t("proposals.apply"),
                          children: t("proposals.apply")
                        }
                      ),
                      /* @__PURE__ */ jsx12(
                        Button,
                        {
                          size: "$2",
                          onPress: () => void chat.rejectProposal(p.proposalId),
                          accessibilityLabel: t("proposals.dismiss"),
                          children: t("proposals.dismiss")
                        }
                      )
                    ] }) : /* @__PURE__ */ jsx12(SizableText2, { size: "$1", theme: "alt2", children: p.status === "applied" ? t("proposals.applied") : t("proposals.dismissed") })
                  ]
                },
                `${m.id}-prop-${p.proposalId}`
              ))
            ] }, m.id))
          }
        ),
        /* @__PURE__ */ jsxs6(XStack3, { gap: "$2", alignItems: "center", children: [
          /* @__PURE__ */ jsx12(View2, { flex: 1, children: /* @__PURE__ */ jsx12(
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
          /* @__PURE__ */ jsx12(
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
export {
  AdSlotCard,
  AiChatPanel,
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
