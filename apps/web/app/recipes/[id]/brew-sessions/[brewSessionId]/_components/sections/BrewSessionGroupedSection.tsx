"use client";

import { SizableText, View, YStack } from "tamagui";

import { RecipeEditSection } from "../../../../../../_components/recipe-edit";

import {
  brewSessionSectionPillStyles,
  computeBrewSessionSectionStatus,
  findSectionAnchorStep,
  type BrewSessionSectionStatus,
  type BrewSessionStep,
} from "../../_lib/brewSessionDetailUi";
import type { BrewSessionDetailPageModel } from "../../_hooks/useBrewSessionDetailPage";
import { BrewSessionSectionAnchorTimer } from "./BrewSessionSectionAnchorTimer";
import { BrewSessionStepCard, type BrewSessionStepCardContext } from "./BrewSessionStepCard";

function sectionStatusLabel(t: BrewSessionDetailPageModel["t"], status: BrewSessionSectionStatus) {
  if (status === "done") return t("sectionStatusDone");
  if (status === "forced_finished") return t("sectionStatusForcedFinished");
  if (status === "in_progress") return t("sectionStatusInProgress");
  return t("sectionStatusPending");
}

export function BrewSessionGroupedSection(props: {
  group: { sectionId: string; steps: BrewSessionStep[] };
  model: BrewSessionDetailPageModel;
  stepCardCtx: BrewSessionStepCardContext;
}) {
  const { group: g, model, stepCardCtx } = props;
  const {
    t,
    session,
    stoppedBy,
    openSections,
    setOpenSections,
    sectionHasRunningTimer,
    getSectionLabel,
    canCall,
    computeElapsedSeconds,
    onStepTimer,
  } = model;

  const sectionStatus = computeBrewSessionSectionStatus({
    steps: g.steps,
    sessionStatus: session?.status,
    stoppedBy,
  });
  const sectionPillStyles = brewSessionSectionPillStyles(sectionStatus);

  const mashAnchorStep =
    g.sectionId === "mash" && session?.startedAt
      ? findSectionAnchorStep(g.sectionId, g.steps, "Start mash")
      : null;
  const boilAnchorStep =
    g.sectionId === "boil" && session?.startedAt
      ? findSectionAnchorStep(g.sectionId, g.steps, "Start boil")
      : null;

  return (
    <RecipeEditSection
      key={g.sectionId}
      id={`section-${g.sectionId}`}
      headingId={`section-${g.sectionId}-heading`}
      label={getSectionLabel(g.sectionId)}
      rightSlot={
        <View
          px="$2"
          py="$1"
          bg={sectionPillStyles.bg}
          borderWidth={1}
          borderColor={sectionPillStyles.borderColor}
          rounded="$2"
          minWidth={110}
          alignItems="center"
        >
          <SizableText size="$2" fontFamily="$body" color={sectionPillStyles.textColor} mt={0}>
            {sectionStatusLabel(t, sectionStatus)}
          </SizableText>
        </View>
      }
      open={openSections[g.sectionId] ?? false}
      onOpenChange={(open) => {
        if (!open && sectionHasRunningTimer(g.sectionId)) return;
        setOpenSections((prev) => ({ ...prev, [g.sectionId]: open }));
      }}
    >
      <YStack gap="$2">
        {mashAnchorStep ? (
          <BrewSessionSectionAnchorTimer
            anchorStep={mashAnchorStep}
            minutes={mashAnchorStep.minutesPlanned}
            label={t("startMashTimerMin", {
              minutes: mashAnchorStep.minutesPlanned != null ? `${mashAnchorStep.minutesPlanned} min` : "—",
            })}
            canCall={canCall}
            computeElapsedSeconds={computeElapsedSeconds}
            onStepTimer={onStepTimer}
            t={t}
          />
        ) : null}
        {boilAnchorStep ? (
          <BrewSessionSectionAnchorTimer
            anchorStep={boilAnchorStep}
            minutes={boilAnchorStep.minutesPlanned}
            label={t("startBoilTimerMin", {
              minutes: boilAnchorStep.minutesPlanned != null ? `${boilAnchorStep.minutesPlanned} min` : "—",
            })}
            canCall={canCall}
            computeElapsedSeconds={computeElapsedSeconds}
            onStepTimer={onStepTimer}
            t={t}
          />
        ) : null}
        {g.steps.map((st) => (
          <BrewSessionStepCard key={st.id} step={st} ctx={stepCardCtx} />
        ))}
      </YStack>
    </RecipeEditSection>
  );
}
