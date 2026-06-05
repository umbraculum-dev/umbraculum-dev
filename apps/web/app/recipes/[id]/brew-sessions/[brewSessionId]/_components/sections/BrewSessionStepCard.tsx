"use client";

import { View, YStack } from "tamagui";

import { RecipeEditIngredientCard } from "../../../../../../../_components/recipe-edit";

import {
  formatElapsedSeconds,
  hasPresetStepTimer,
  type BrewSessionStep,
} from "../../../_lib/brewSessionDetailUi";
import { BrewSessionStepCardActions } from "./BrewSessionStepCardActions";
import { BrewSessionStepCardHeader } from "./BrewSessionStepCardHeader";
import { BrewSessionStepCardScheduleFields } from "./BrewSessionStepCardScheduleFields";
import {
  BrewSessionStepCardLogFields,
  BrewSessionStepCardTimerBlock,
} from "./BrewSessionStepCardTimerBlock";
import type { BrewSessionStepCardContext, BrewSessionStepCardDerived } from "./brewSessionStepCardTypes";

export type { BrewSessionStepCardContext } from "./brewSessionStepCardTypes";

function deriveStepCardState(
  step: BrewSessionStep,
  ctx: BrewSessionStepCardContext,
): BrewSessionStepCardDerived {
  const { steps, computeElapsedSeconds, computeRelativeCountdownSeconds, t, oldestDueStepId } = ctx;

  const globalIdx = steps.findIndex((x) => x.id === step.id);
  const elapsed = computeElapsedSeconds(step);
  const remainingSeconds =
    step.minutesPlanned != null ? Math.max(0, step.minutesPlanned * 60 - elapsed) : null;
  const relativeBase = step.relativeToStepId ? steps.find((s) => s.id === step.relativeToStepId) : null;
  const relativeCountdownSecondsRaw = computeRelativeCountdownSeconds(step);
  const relativeCountdownSecondsDisplay =
    relativeCountdownSecondsRaw == null ? null : Math.max(0, relativeCountdownSecondsRaw);
  const isRelativeCountdownRelevant =
    !step.isDisabled && (step.status === "pending" || step.status === "in_progress");
  const showRelativeCountdown =
    isRelativeCountdownRelevant &&
    relativeCountdownSecondsRaw != null &&
    !!relativeBase?.timerStartedAt;
  const showOldestDueWarning =
    isRelativeCountdownRelevant &&
    step.id === oldestDueStepId &&
    relativeCountdownSecondsRaw != null &&
    relativeCountdownSecondsRaw <= 0;
  const relativeCountdownLine =
    relativeCountdownSecondsRaw != null && relativeCountdownSecondsRaw < 0
      ? t("relativeOverdueByLine", {
          overdue: formatElapsedSeconds(Math.abs(relativeCountdownSecondsRaw)),
        })
      : t("relativeRemainingBeforeStartLine", {
          remaining: formatElapsedSeconds(relativeCountdownSecondsDisplay ?? 0),
        });

  return {
    globalIdx,
    elapsed,
    remainingSeconds,
    relativeBase,
    relativeCountdownSecondsRaw,
    relativeCountdownSecondsDisplay,
    isRelativeCountdownRelevant,
    showRelativeCountdown,
    showOldestDueWarning,
    relativeCountdownLine,
  };
}

export function BrewSessionStepCard(props: { step: BrewSessionStep; ctx: BrewSessionStepCardContext }) {
  const { step: st, ctx } = props;
  const derived = deriveStepCardState(st, ctx);

  return (
    <View id={`step-${st.id}`}>
      <RecipeEditIngredientCard>
        <YStack gap="$2">
          <BrewSessionStepCardHeader step={st} ctx={ctx} derived={derived} />
          <BrewSessionStepCardActions step={st} ctx={ctx} />
          {hasPresetStepTimer(st) ? (
            <BrewSessionStepCardTimerBlock step={st} ctx={ctx} derived={derived} variant="preset" />
          ) : (st.customTimerEnabled ?? false) ? (
            <>
              <BrewSessionStepCardScheduleFields step={st} ctx={ctx} />
              <BrewSessionStepCardTimerBlock step={st} ctx={ctx} derived={derived} variant="custom" />
            </>
          ) : null}
          <BrewSessionStepCardLogFields step={st} ctx={ctx} />
        </YStack>
      </RecipeEditIngredientCard>
    </View>
  );
}
