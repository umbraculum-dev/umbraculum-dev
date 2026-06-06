"use client";

import { Button, Checkbox, SizableText, View, XStack } from "tamagui";

import { RecipeEditFieldLabel } from "../../../../../../../_components/recipe-edit";

import { hasPresetStepTimer, isStepDirtyForLogs, type BrewSessionStep } from "../../../_lib/brewSessionDetailUi";
import type { BrewSessionStepCardContext } from "./brewSessionStepCardTypes";

export function BrewSessionStepCardActions(props: { step: BrewSessionStep; ctx: BrewSessionStepCardContext }) {
  const { step: st, ctx } = props;
  const {
    t,
    canCall,
    session,
    stepsBaselineById,
    onSaveStepLog,
    onRemoveStep,
    onToggleCustomTimerEnabled,
    removeStepWorking,
    saveSectionLogsWorkingSectionId,
  } = ctx;

  return (
    <>
      <XStack gap="$2" items="center" flexWrap="wrap" justifyContent="space-between" width="100%">
        <XStack gap="$2" items="center" flexShrink={0}>
          {hasPresetStepTimer(st) ? (
            <RecipeEditFieldLabel>
              {t("stepDurationTimerLabel")} — {t("stepDurationTimerHelp")}
            </RecipeEditFieldLabel>
          ) : (
            <>
              <Checkbox
                id={`step-custom-timer-${st.id}`}
                checked={st.customTimerEnabled ?? false}
                onCheckedChange={(checked) => void onToggleCustomTimerEnabled(st.id, checked === true)}
                aria-label={t("activateCustomTimerLabel")}
                size="$4"
                bg="var(--surface-2)"
                borderWidth={2}
                borderColor="var(--border)"
                activeStyle={{
                  backgroundColor: "var(--info)",
                  borderColor: "var(--info)",
                }}
              >
                <Checkbox.Indicator backgroundColor="var(--text)" width={8} height={8} borderRadius={1} />
              </Checkbox>
              <RecipeEditFieldLabel htmlFor={`step-custom-timer-${st.id}`}>
                {t("activateCustomTimerLabel")}
              </RecipeEditFieldLabel>
            </>
          )}
        </XStack>
        <XStack gap="$2" items="center" flexShrink={0}>
          <Button
            onPress={() => void onSaveStepLog(st.id)}
            disabled={!canCall || saveSectionLogsWorkingSectionId === st.sectionId}
            size="$3"
            bg="var(--surface-2)"
            borderWidth={1}
            borderColor="var(--border)"
            color="var(--text)"
            fontFamily="$body"
          >
            {t("saveLogButton")}
          </Button>
          {!session?.startedAt ? (
            <Button
              onPress={() => void onRemoveStep(st.id)}
              disabled={!canCall || removeStepWorking != null}
              size="$3"
              bg="var(--surface-2)"
              borderWidth={1}
              borderColor="var(--border)"
              color="var(--text)"
              fontFamily="$body"
              aria-label={t("removeStepButton")}
            >
              {removeStepWorking === st.id ? t("removeStepRemoving") : t("removeStepButton")}
            </Button>
          ) : null}
        </XStack>
      </XStack>
      {isStepDirtyForLogs(st, stepsBaselineById) ? (
        <View
          alignSelf="flex-end"
          mt="$2"
          px="$2"
          py="$1"
          bg="color-mix(in srgb, var(--warning) 18%, var(--surface))"
          borderWidth={1}
          borderColor="color-mix(in srgb, var(--warning) 40%, var(--border))"
          rounded="$2"
        >
          <SizableText size="$2" fontFamily="$body" color="var(--text)" mt={0}>
            {t("pleaseSaveModifications")}
          </SizableText>
        </View>
      ) : null}
    </>
  );
}
