import * as react_jsx_runtime from 'react/jsx-runtime';
import React, { ReactNode, ComponentProps } from 'react';
import { Button as Button$1, YStack, Checkbox, Input as Input$1, Spinner as Spinner$1, SizableText } from 'tamagui';

/**
 * Centralized read-only field tokens.
 * Single source of truth for web and native. Matches web default theme
 * color-mix(in srgb, var(--info) 8%, var(--surface)) ≈ #232934.
 */
declare const FIELD_READONLY_BG = "#232934";
declare const FIELD_READONLY_BORDER = "#3a4558";

/**
 * Injects shared readonly field tokens into document root so web and native
 * use the same colors. Must run client-side.
 */
declare function ThemeVarsInjector(): null;

interface AdSlotCardProps {
    ariaLabel: string;
    mediaHeightPx: number;
    media: ReactNode;
    contactLine: ReactNode;
    upgradeLine: ReactNode;
}
declare function AdSlotCard(props: AdSlotCardProps): react_jsx_runtime.JSX.Element;

type ButtonProps = ComponentProps<typeof Button$1>;
declare function Button(props: ButtonProps): react_jsx_runtime.JSX.Element;

type CardProps = Omit<ComponentProps<typeof YStack>, "children"> & {
    children: ReactNode;
};
declare function Card(props: CardProps): react_jsx_runtime.JSX.Element;

interface BrewCheckboxProps extends Omit<ComponentProps<typeof Checkbox>, "children" | "native" | "unstyled"> {
}
declare function BrewCheckbox(props: BrewCheckboxProps): react_jsx_runtime.JSX.Element;

interface CollapsibleProps {
    title: string;
    summary?: ReactNode;
    children: ReactNode;
    expanded: boolean;
    onExpandedChange: (next: boolean) => void;
    accessibilityLabel?: string;
}
declare function Collapsible(props: CollapsibleProps): react_jsx_runtime.JSX.Element;

type InputProps = ComponentProps<typeof Input$1>;
declare function Input(props: InputProps): react_jsx_runtime.JSX.Element;

type ModeOption<T extends string> = {
    value: T;
    label: string;
};
declare function ModeFieldset<T extends string>(props: {
    legend: string;
    name: string;
    value: T;
    onChange: (next: T) => void;
    options: ModeOption<T>[];
}): react_jsx_runtime.JSX.Element;

interface ReadOnlyFieldLabelProps {
    children: ReactNode;
}
declare function ReadOnlyFieldLabel({ children }: ReadOnlyFieldLabelProps): react_jsx_runtime.JSX.Element;
interface ReadOnlyFieldValueProps {
    children: ReactNode;
}
declare function ReadOnlyFieldValue({ children }: ReadOnlyFieldValueProps): react_jsx_runtime.JSX.Element;
interface ReadOnlyFieldProps {
    label: ReactNode;
    value: ReactNode;
    minWidth?: number;
    flex?: number;
}
declare function ReadOnlyField({ label, value, minWidth, flex }: ReadOnlyFieldProps): react_jsx_runtime.JSX.Element;
interface ReadOnlyFieldRowProps {
    children: ReactNode;
}
declare function ReadOnlyFieldRow({ children }: ReadOnlyFieldRowProps): react_jsx_runtime.JSX.Element;

type ScreenProps = Omit<ComponentProps<typeof YStack>, "children"> & {
    children: ReactNode;
};
declare function Screen({ flex, style, ...props }: ScreenProps): react_jsx_runtime.JSX.Element;

interface SelectOption {
    value: string;
    label: string;
}
interface SelectFieldProps {
    value: string;
    onValueChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    disabled?: boolean;
    id?: string;
    width?: "auto" | "full";
    "aria-label"?: string;
    "aria-labelledby"?: string;
    renderValue?: (value: string) => string;
    closeLabel?: string;
}
declare function SelectField({ value, onValueChange, options, placeholder, disabled, id, width, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, renderValue, closeLabel, }: SelectFieldProps): react_jsx_runtime.JSX.Element;

type SpinnerProps = React.ComponentProps<typeof Spinner$1>;
declare function Spinner(props: SpinnerProps): react_jsx_runtime.JSX.Element;

type TextProps = ComponentProps<typeof SizableText>;
declare function Text(props: TextProps): react_jsx_runtime.JSX.Element;
type HeadingProps = Omit<TextProps, "size"> & {
    size?: TextProps["size"];
};
declare function Heading({ size, fontWeight, ...props }: HeadingProps): react_jsx_runtime.JSX.Element;

/**
 * Cross-platform AI chat stream hook.
 *
 * The hook owns the SSE wire-protocol decoding (event/data frames) and
 * the in-flight turn accumulator, but it does NOT know how to talk to
 * the API — the caller supplies a `chatFetch(message) => Promise<Response>`
 * function so each platform can wire its own auth:
 *
 *   web → `fetch("/api/ai/chat", { credentials: "same-origin", ... })`
 *   native → `fetch(`${baseUrl}/api/ai/chat`, { headers: { Authorization: "Bearer ..." } })`
 *
 * The response body must be a streaming SSE source. RN 0.72+ on Hermes
 * supports `response.body.getReader()` over HTTPS, which is the path
 * used by Expo SDK 50+. Older runtimes need a polyfill such as
 * `react-native-sse`; the contract here is a Response-like object with
 * either a `body.getReader()` ReadableStream or a `text()` fallback.
 */
interface AiToolCallView {
    name: string;
    argsJson: string;
    resultJson: string | null;
    durationMs: number | null;
    errored: boolean;
}
interface AiProposalView {
    proposalId: string;
    moduleCode: string;
    proposalType: string;
    summary: string;
    status: "pending" | "applied" | "rejected";
}
interface AiChatTurn {
    id: string;
    status: "streaming" | "complete" | "error";
    text: string;
    toolCalls: AiToolCallView[];
    proposals: AiProposalView[];
    usage: {
        tokensIn: number;
        tokensOut: number;
        durationMs: number;
        model: string;
    } | null;
    error: {
        code: string;
        message: string;
    } | null;
}
interface AiChatMessage {
    id: string;
    role: "user" | "assistant";
    text: string;
    turn?: AiChatTurn;
}
/**
 * The wire-event union, matching the server-side `AiSseEvent` exactly.
 * Kept local so this hook can ship without depending on the API package.
 */
type IncomingEvent = {
    type: "assistant_chunk";
    text: string;
} | {
    type: "tool_call";
    name: string;
    argsJson: string;
} | {
    type: "tool_result";
    name: string;
    resultJson: string;
    durationMs: number;
    errored: boolean;
} | {
    type: "proposal";
    proposalId: string;
    moduleCode: string;
    proposalType: string;
    summary: string;
} | {
    type: "complete";
    usage: AiChatTurn["usage"];
} | {
    type: "error";
    code: string;
    message: string;
};
interface UseAiChatStreamInput {
    /**
     * Caller-provided chat invocation. Receives the user's message and
     * an `AbortSignal` (used by the hook's `reset()` to cancel in-flight
     * requests). Must return a Response-like object whose body streams
     * SSE frames or whose `text()` returns the full SSE payload.
     */
    chatFetch: (message: string, init: {
        signal: AbortSignal;
        routeId?: string | null;
    }) => Promise<Response>;
    /** Optional RouteId hint forwarded on each chat request. */
    routeId?: string | null;
    proposalApply?: (proposalId: string) => Promise<void>;
    proposalReject?: (proposalId: string) => Promise<void>;
}
/**
 * Shared chat state machine. One in-flight turn at a time; `send()` while
 * `pending` is true is a no-op.
 */
declare function useAiChatStream(input: UseAiChatStreamInput): {
    messages: AiChatMessage[];
    pending: boolean;
    terminalError: {
        code: string;
        message: string;
    } | null;
    send: (text: string) => Promise<void>;
    reset: () => void;
    applyProposal: (proposalId: string) => Promise<void>;
    rejectProposal: (proposalId: string) => Promise<void>;
};
/**
 * Consume an SSE response. Prefers the streaming `getReader()` path
 * (works in browsers + Hermes RN 0.72+); falls back to `text()` when
 * the runtime does not expose `body.getReader` (older RN, polyfilled
 * fetch implementations).
 *
 * Exported so cross-platform parity tests can exercise the same code
 * path the React hook uses.
 */
declare function consumeSseStream(res: Response, onEvent: (event: IncomingEvent) => void): Promise<void>;

/**
 * Translation lookup. The shared component is i18n-agnostic — the caller
 * passes a typed translator so web (next-intl) and native (@umbraculum/i18n-react)
 * can both supply their own implementation.
 */
type AiChatTranslate = (key: string, vars?: Record<string, string | number>) => string;
interface AiChatPanelProps {
    chat: ReturnType<typeof useAiChatStream>;
    t: AiChatTranslate;
    /**
     * Optional callback for the "subscription required" upgrade CTA.
     * If omitted, the CTA link is hidden.
     */
    onOpenUpgrade?: () => void;
}
/**
 * Cross-platform AI chat panel — Tamagui primitives only. The wire-protocol
 * + state machine live in `useAiChatStream`; this component is the visual
 * shell over them and is identical on web and native.
 *
 * Accessibility:
 *   - Outer container uses aria-labelledby pointing at the H2 title.
 *   - The streaming turn is marked aria-live="polite" (Tamagui forwards
 *     the prop to the underlying RN/DOM node).
 *   - The composer Button has an explicit aria-label.
 *   - Submit-on-Enter is wired via `onSubmitEditing` (cross-platform).
 */
declare function AiChatPanel({ chat, t, onOpenUpgrade }: AiChatPanelProps): react_jsx_runtime.JSX.Element;

export { AdSlotCard, type AdSlotCardProps, type AiChatMessage, AiChatPanel, type AiChatPanelProps, type AiChatTranslate, type AiChatTurn, type AiToolCallView, BrewCheckbox, type BrewCheckboxProps, Button, type ButtonProps, Card, type CardProps, Collapsible, type CollapsibleProps, FIELD_READONLY_BG, FIELD_READONLY_BORDER, Heading, type HeadingProps, Input, type InputProps, ModeFieldset, type ModeOption, ReadOnlyField, ReadOnlyFieldLabel, type ReadOnlyFieldLabelProps, type ReadOnlyFieldProps, ReadOnlyFieldRow, type ReadOnlyFieldRowProps, ReadOnlyFieldValue, type ReadOnlyFieldValueProps, Screen, type ScreenProps, SelectField, type SelectFieldProps, type SelectOption, Spinner, type SpinnerProps, Text, type TextProps, ThemeVarsInjector, type UseAiChatStreamInput, consumeSseStream, useAiChatStream };
