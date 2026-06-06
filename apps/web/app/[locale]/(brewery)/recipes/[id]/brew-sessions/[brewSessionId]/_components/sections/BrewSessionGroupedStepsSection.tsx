"use client";

import type { BrewSessionDetailPageModel } from "../../_hooks/useBrewSessionDetailPage";
import { BrewSessionGroupedSection } from "./BrewSessionGroupedSection";
import type { BrewSessionStepCardContext } from "./BrewSessionStepCard";

export function BrewSessionGroupedStepsSection({ model }: { model: BrewSessionDetailPageModel }) {
  const {
    grouped,
    t,
    canCall,
    session,
    steps,
    setSteps,
    stepsBaselineById,
    moveStep,
    onSaveStepLog,
    onRemoveStep,
    onToggleCustomTimerEnabled,
    onStepTimer,
    parseOffsetMinutes,
    computeElapsedSeconds,
    computeRelativeCountdownSeconds,
    relativeBaseOptions,
    oldestDueStepId,
    removeStepWorking,
    saveSectionLogsWorkingSectionId,
  } = model;

  const stepCardCtx: BrewSessionStepCardContext = {
    t,
    canCall,
    session,
    steps,
    setSteps,
    stepsBaselineById,
    moveStep,
    onSaveStepLog,
    onRemoveStep,
    onToggleCustomTimerEnabled,
    onStepTimer,
    parseOffsetMinutes,
    computeElapsedSeconds,
    computeRelativeCountdownSeconds,
    relativeBaseOptions,
    oldestDueStepId,
    removeStepWorking,
    saveSectionLogsWorkingSectionId,
  };

  return (
    <>
      {grouped.map((g) => (
        <BrewSessionGroupedSection key={g.sectionId} group={g} model={model} stepCardCtx={stepCardCtx} />
      ))}
    </>
  );
}
