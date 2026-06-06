"use client";

import { Button, SizableText, XStack, YStack } from "tamagui";

import { formatElapsedSeconds, type BrewSessionStep } from "../../_lib/brewSessionDetailUi";

export function BrewSessionSectionAnchorTimer(props: {
  anchorStep: BrewSessionStep;
  minutes: number | null;
  label: string;
  canCall: boolean;
  computeElapsedSeconds: (step: BrewSessionStep) => number;
  onStepTimer: (stepId: string, action: "start" | "pause" | "stop") => void | Promise<void>;
  t: (key: string, values?: Record<string, string>) => string;
}) {
  const { anchorStep, minutes, label, canCall, computeElapsedSeconds, onStepTimer, t } = props;
  const running = anchorStep.timerState === "running";

  return (
    <YStack
      gap="$1"
      p="$2"
      bg={running ? "color-mix(in srgb, var(--warning) 18%, var(--surface))" : "var(--surface-2)"}
      rounded="$2"
      borderWidth={1}
      borderColor={running ? "color-mix(in srgb, var(--warning) 40%, var(--border))" : "var(--border)"}
    >
      <XStack gap="$2" items="center" flexWrap="wrap">
        <SizableText size="$3" fontFamily="$body" color="var(--text)">
          {label}
        </SizableText>
        {anchorStep.timerState === "idle" || anchorStep.timerState === "paused" ? (
          <Button
            onPress={() => void onStepTimer(anchorStep.id, "start")}
            disabled={!canCall}
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
        {anchorStep.timerState === "running" ? (
          <Button
            onPress={() => void onStepTimer(anchorStep.id, "pause")}
            disabled={!canCall}
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
        {anchorStep.timerState !== "stopped" ? (
          <Button
            onPress={() => void onStepTimer(anchorStep.id, "stop")}
            disabled={!canCall}
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
      {anchorStep.timerStartedAt ? (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
          {t("timerLine", {
            elapsed: formatElapsedSeconds(computeElapsedSeconds(anchorStep)),
            planned: minutes == null ? "—" : String(minutes),
          })}
          {minutes != null ? (
            <SizableText as="span" size="$2" color="var(--text-muted)" fontFamily="$body">
              {" "}
              ·{" "}
              {t("countdownLine", {
                remaining: formatElapsedSeconds(Math.max(0, minutes * 60 - computeElapsedSeconds(anchorStep))),
              })}
            </SizableText>
          ) : null}
        </SizableText>
      ) : null}
    </YStack>
  );
}
