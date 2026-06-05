"use client";

import { Button, SizableText, TextArea, View, XStack, YStack } from "tamagui";

import { RecipeEditFieldLabel, RecipeEditSummary } from "../../../../../../../_components/recipe-edit";

import { formatElapsedSeconds, type BrewSessionStep } from "../../../_lib/brewSessionDetailUi";
import type { BrewSessionStepCardContext, BrewSessionStepCardDerived } from "./brewSessionStepCardTypes";

function BrewSessionStepTimerControls(props: {
  step: BrewSessionStep;
  ctx: BrewSessionStepCardContext;
}) {
  const { step: st, ctx } = props;
  const { t, canCall, session, onStepTimer } = ctx;

  return (
    <XStack gap="$2" items="center" flexWrap="wrap" width="100%">
      {st.timerState === "idle" || st.timerState === "paused" ? (
        <Button
          onPress={() => void onStepTimer(st.id, "start")}
          disabled={!canCall || !session?.startedAt}
          size="$3"
          bg="var(--surface-2)"
          borderWidth={1}
          borderColor="var(--border)"
          color="var(--text)"
          fontFamily="$body"
        >
          {t("timerStart")}
        </Button>
      ) : null}
      {st.timerState === "running" ? (
        <Button
          onPress={() => void onStepTimer(st.id, "pause")}
          disabled={!canCall || !session?.startedAt}
          size="$3"
          bg="var(--surface-2)"
          borderWidth={1}
          borderColor="var(--border)"
          color="var(--text)"
          fontFamily="$body"
        >
          {t("timerPause")}
        </Button>
      ) : null}
      {st.timerState !== "stopped" ? (
        <Button
          onPress={() => void onStepTimer(st.id, "stop")}
          disabled={!canCall || !session?.startedAt}
          size="$3"
          bg="var(--surface-2)"
          borderWidth={1}
          borderColor="var(--border)"
          color="var(--text)"
          fontFamily="$body"
        >
          {t("timerStop")}
        </Button>
      ) : null}
    </XStack>
  );
}

export function BrewSessionStepCardTimerBlock(props: {
  step: BrewSessionStep;
  ctx: BrewSessionStepCardContext;
  derived: BrewSessionStepCardDerived;
  variant: "preset" | "custom";
}) {
  const { step: st, ctx, derived, variant } = props;
  const { t } = ctx;
  const {
    elapsed,
    remainingSeconds,
    isRelativeCountdownRelevant,
    relativeCountdownSecondsDisplay,
    showRelativeCountdown,
    relativeCountdownLine,
  } = derived;

  if (variant === "preset") {
    return (
      <YStack gap="$1">
        {st.status === "in_progress" ? (
          <>
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
              {st.timerState === "stopped"
                ? t("timerLineStopped", { elapsed: formatElapsedSeconds(elapsed) })
                : t("timerLine", {
                    elapsed: formatElapsedSeconds(elapsed),
                    planned: st.minutesPlanned == null ? "—" : String(st.minutesPlanned),
                  })}
              {st.timerState !== "stopped" && remainingSeconds != null ? (
                <SizableText as="span" size="$2" color="var(--text-muted)" fontFamily="$body">
                  {" "}
                  · {t("countdownLine", { remaining: formatElapsedSeconds(remainingSeconds) })}
                </SizableText>
              ) : null}
            </SizableText>
            <BrewSessionStepTimerControls step={st} ctx={ctx} />
          </>
        ) : (
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
            {t("stepDurationTimerIdle")}
          </SizableText>
        )}
      </YStack>
    );
  }

  return (
    <YStack gap="$1">
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
        {st.timerState === "stopped"
          ? t("timerLineStopped", { elapsed: formatElapsedSeconds(elapsed) })
          : t("timerLine", {
              elapsed: formatElapsedSeconds(elapsed),
              planned: st.minutesPlanned == null ? "—" : String(st.minutesPlanned),
            })}
        {st.timerState !== "stopped" && remainingSeconds != null ? (
          <SizableText as="span" size="$2" color="var(--text-muted)" fontFamily="$body">
            {" "}
            · {t("countdownLine", { remaining: formatElapsedSeconds(remainingSeconds) })}
          </SizableText>
        ) : null}
        {st.timerState !== "stopped" &&
        isRelativeCountdownRelevant &&
        relativeCountdownSecondsDisplay != null &&
        !showRelativeCountdown ? (
          <SizableText as="span" size="$2" color="var(--text-muted)" fontFamily="$body">
            {" "}
            · {relativeCountdownLine}
          </SizableText>
        ) : null}
      </SizableText>
      <BrewSessionStepTimerControls step={st} ctx={ctx} />
    </YStack>
  );
}

export function BrewSessionStepCardLogFields(props: { step: BrewSessionStep; ctx: BrewSessionStepCardContext }) {
  const { step: st, ctx } = props;
  const { t, setSteps } = ctx;

  return (
    <View flexBasis="100%" w="100%">
      <details>
        <RecipeEditSummary>
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
            {t("stepNoteLabel")}
          </SizableText>
        </RecipeEditSummary>
        <View mt="$2">
          <RecipeEditFieldLabel htmlFor={`step-note-${st.id}`}>{t("stepNoteLabel")}</RecipeEditFieldLabel>
          <TextArea
            id={`step-note-${st.id}`}
            value={st.note ?? ""}
            onChangeText={(v) => setSteps((prev) => prev.map((s) => (s.id === st.id ? { ...s, note: v } : s)))}
            minHeight={80}
            bg="var(--surface)"
            borderWidth={1}
            borderColor="var(--border)"
            rounded="$2"
            fontFamily="$body"
          />
        </View>
      </details>
    </View>
  );
}
