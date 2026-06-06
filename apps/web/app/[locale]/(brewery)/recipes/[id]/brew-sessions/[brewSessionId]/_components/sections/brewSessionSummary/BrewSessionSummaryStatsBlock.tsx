import { SizableText, View } from "tamagui";

import { formatDateTime, formatElapsedSecondsHms } from "../../../_lib/brewSessionDetailUi";

import type { BrewSessionSummaryStatsModel } from "./brewSessionSummaryTypes";

export function BrewSessionSummaryStatsBlock({ model }: { model: BrewSessionSummaryStatsModel }) {
  const { t, locale, sessionTiming } = model;

  if (!sessionTiming) return null;

  return (
    <View
      w="100%"
      mt="$2"
      p="$2"
      bg={
        sessionTiming.status === "running"
          ? "color-mix(in srgb, var(--success) 14%, var(--surface))"
          : "color-mix(in srgb, var(--warning) 18%, var(--surface))"
      }
      borderWidth={1}
      borderColor={
        sessionTiming.status === "running"
          ? "color-mix(in srgb, var(--success) 40%, var(--border))"
          : "color-mix(in srgb, var(--warning) 40%, var(--border))"
      }
      rounded="$2"
    >
      <SizableText size="$3" fontFamily="$body" color="var(--text)" mt={0}>
        {t("sessionTimerLine", {
          elapsed: formatElapsedSecondsHms(sessionTiming.elapsedSeconds),
        })}
      </SizableText>
      {sessionTiming.status === "paused" && sessionTiming.pausedAt ? (
        <SizableText size="$2" fontFamily="$body" color="var(--text-muted)" mt={0}>
          {t("sessionPausedAtLine", { at: formatDateTime(locale, sessionTiming.pausedAt) })}
        </SizableText>
      ) : null}
      {sessionTiming.status === "stopped" && sessionTiming.stoppedAt ? (
        <SizableText size="$2" fontFamily="$body" color="var(--text-muted)" mt={0}>
          {t("sessionStoppedAtLine", { at: formatDateTime(locale, sessionTiming.stoppedAt) })}
        </SizableText>
      ) : null}
    </View>
  );
}
