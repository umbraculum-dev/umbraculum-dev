"use client";

import { Input, View, XStack } from "tamagui";

import { BrewSelect } from "../../../../../../../_components/BrewSelect";
import { RecipeEditFieldLabel } from "../../../../../../../_components/recipe-edit";

import type { BrewSessionStep } from "../../../_lib/brewSessionDetailUi";
import type { BrewSessionStepCardContext } from "./brewSessionStepCardTypes";

export function BrewSessionStepCardScheduleFields(props: {
  step: BrewSessionStep;
  ctx: BrewSessionStepCardContext;
}) {
  const { step: st, ctx } = props;
  const { t, setSteps, parseOffsetMinutes, relativeBaseOptions } = ctx;

  return (
    <XStack gap="$2" items="flex-end" flexWrap="wrap">
      <View minW={240} flex={1}>
        <RecipeEditFieldLabel htmlFor={`step-relative-to-${st.id}`}>{t("relativeToLabel")}</RecipeEditFieldLabel>
        <BrewSelect
          id={`step-relative-to-${st.id}`}
          value={st.relativeToStepId ?? ""}
          onValueChange={(v) =>
            setSteps((prev) =>
              prev.map((s) => (s.id === st.id ? { ...s, relativeToStepId: v || null } : s)),
            )
          }
          options={relativeBaseOptions.filter((o) => o.value !== st.id)}
          width="full"
          aria-label={t("relativeToLabel")}
        />
      </View>
      <View minW={140}>
        <RecipeEditFieldLabel htmlFor={`step-offset-${st.id}`}>{t("offsetFromEndLabel")}</RecipeEditFieldLabel>
        <Input
          id={`step-offset-${st.id}`}
          value={st.offsetMinutesFromEnd == null ? "" : String(st.offsetMinutesFromEnd)}
          onChangeText={(v) => {
            const parsed = parseOffsetMinutes(v);
            setSteps((prev) =>
              prev.map((s) => (s.id === st.id ? { ...s, offsetMinutesFromEnd: parsed } : s)),
            );
          }}
          placeholder="—"
          keyboardType="numeric"
          size="$3"
          w="100%"
          bg="var(--surface)"
          borderWidth={1}
          borderColor="var(--border)"
          rounded="$2"
          fontFamily="$body"
        />
      </View>
    </XStack>
  );
}
