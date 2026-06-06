"use client";

import { Button, Input, SizableText, View, XStack } from "tamagui";

import { BrewSelect } from "../../../../../../../../../_components/BrewSelect";
import { RecipeEditFieldLabel, RecipeEditReadOnlyValue } from "../../../../../../../../../_components/recipe-edit";

import { hasPresetStepTimer, type BrewSessionStep } from "../../../_lib/brewSessionDetailUi";
import type { BrewSessionStepCardContext, BrewSessionStepCardDerived } from "./brewSessionStepCardTypes";

export function BrewSessionStepCardHeader(props: {
  step: BrewSessionStep;
  ctx: BrewSessionStepCardContext;
  derived: BrewSessionStepCardDerived;
}) {
  const { step: st, ctx, derived } = props;
  const { t, session, steps, setSteps, moveStep, onStepTimer } = ctx;
  const { globalIdx, showRelativeCountdown, showOldestDueWarning, relativeCountdownLine } = derived;

  return (
    <>
      <XStack gap="$2" items="center" flexWrap="wrap">
        <XStack gap="$1" flexShrink={0}>
          <Button
            size="$2"
            bg="var(--surface-2)"
            borderWidth={1}
            borderColor="var(--border)"
            color="var(--text)"
            fontFamily="$body"
            onPress={() => moveStep(st.id, -1)}
            disabled={globalIdx <= 0}
            aria-label={t("moveUp")}
          >
            ↑
          </Button>
          <Button
            size="$2"
            bg="var(--surface-2)"
            borderWidth={1}
            borderColor="var(--border)"
            color="var(--text)"
            fontFamily="$body"
            onPress={() => moveStep(st.id, 1)}
            disabled={globalIdx === steps.length - 1}
            aria-label={t("moveDown")}
          >
            ↓
          </Button>
        </XStack>

        <View flex={1} minW={180}>
          <RecipeEditFieldLabel htmlFor={`step-name-${st.id}`}>{t("stepNameLabel")}</RecipeEditFieldLabel>
          <Input
            id={`step-name-${st.id}`}
            value={st.name}
            onChangeText={(v) => setSteps((prev) => prev.map((s) => (s.id === st.id ? { ...s, name: v } : s)))}
            size="$3"
            w="100%"
            bg="var(--surface)"
            borderWidth={1}
            borderColor="var(--border)"
            rounded="$2"
            fontFamily="$body"
          />
        </View>

        <View minW={120}>
          <RecipeEditFieldLabel htmlFor={`step-status-${st.id}`}>{t("stepStatusLabel")}</RecipeEditFieldLabel>
          {session?.startedAt && !st.isDisabled ? (
            <BrewSelect
              id={`step-status-${st.id}`}
              value={st.status}
              onValueChange={(v) => {
                const newStatus = v as BrewSessionStep["status"];
                const prevStatus = st.status;
                setSteps((prev) => prev.map((s) => (s.id === st.id ? { ...s, status: newStatus } : s)));
                if (hasPresetStepTimer(st)) {
                  if (newStatus === "in_progress") {
                    void onStepTimer(st.id, "start");
                  } else if (
                    prevStatus === "in_progress" &&
                    (newStatus === "done" || newStatus === "skipped" || newStatus === "pending")
                  ) {
                    void onStepTimer(st.id, "stop");
                  }
                }
              }}
              options={[
                { value: "pending", label: t("statusPending") },
                { value: "in_progress", label: t("statusInProgress") },
                { value: "done", label: t("statusDone") },
                { value: "skipped", label: t("statusSkipped") },
              ]}
              width="full"
              aria-label={t("stepStatusLabel")}
              tone={
                st.status === "done"
                  ? "success"
                  : st.status === "in_progress"
                    ? "warning"
                    : st.status === "skipped"
                      ? "info"
                      : "default"
              }
            />
          ) : (
            <RecipeEditReadOnlyValue>
              <SizableText
                size="$2"
                fontFamily="$body"
                color={
                  st.status === "done"
                    ? "var(--success)"
                    : st.status === "in_progress"
                      ? "var(--warning)"
                      : st.status === "skipped" || st.status === "not_applicable"
                        ? "var(--info)"
                        : "var(--text-muted)"
                }
              >
                {st.isDisabled
                  ? t("statusSkipped")
                  : st.status === "in_progress"
                    ? t("statusInProgress")
                    : st.status === "done"
                      ? t("statusDone")
                      : st.status === "skipped" || st.status === "not_applicable"
                        ? t("statusSkipped")
                        : t("statusPending")}
              </SizableText>
            </RecipeEditReadOnlyValue>
          )}
        </View>

        <View minW={140}>
          <RecipeEditFieldLabel htmlFor={`step-disabled-${st.id}`}>{t("disableStepLabel")}</RecipeEditFieldLabel>
          <BrewSelect
            id={`step-disabled-${st.id}`}
            value={st.isDisabled ? "yes" : "no"}
            onValueChange={(v) =>
              setSteps((prev) =>
                prev.map((s) =>
                  s.id === st.id
                    ? v === "yes"
                      ? { ...s, isDisabled: true, status: "skipped" }
                      : { ...s, isDisabled: false, status: s.status === "skipped" ? "pending" : s.status }
                    : s,
                ),
              )
            }
            options={[
              { value: "no", label: t("disableNo") },
              { value: "yes", label: t("disableYes") },
            ]}
            width="full"
            aria-label={t("disableStepLabel")}
          />
        </View>
      </XStack>

      {showRelativeCountdown ? (
        showOldestDueWarning ? (
          <View
            p="$2"
            bg="color-mix(in srgb, var(--warning) 18%, var(--surface))"
            borderWidth={1}
            borderColor="color-mix(in srgb, var(--warning) 40%, var(--border))"
            rounded="$2"
          >
            <SizableText size="$2" color="var(--text)" fontFamily="$body" mt={0}>
              {relativeCountdownLine}
            </SizableText>
          </View>
        ) : (
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
            {relativeCountdownLine}
          </SizableText>
        )
      ) : null}
    </>
  );
}
