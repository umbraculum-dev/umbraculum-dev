import { SaltAdditionsEditor } from "@umbraculum/brewery-recipes-ui";
import { Button, SizableText, YStack } from "tamagui";

import { ErrorBox, MessageBox } from "../../../../../../../../../_components/recipe-edit";

import type { WaterMashPageModel } from "../../../_hooks/useWaterMashPage";

export function WaterMashSaltsEditorBlock({ model }: { model: WaterMashPageModel }) {
  const { canCall, saltAdditions, setSaltAdditions } = model;

  return (
    <>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
        Base profile is the mixed source water above. Add salts in grams; we compute resulting ions (ppm).
      </SizableText>

      <SaltAdditionsEditor rows={saltAdditions} onChange={setSaltAdditions} idPrefix="mash" disabled={!canCall} />
    </>
  );
}

export function WaterMashSaltsActionsBlock({ model }: { model: WaterMashPageModel }) {
  const {
    canCall,
    saltsStatus,
    saltsSaveStatus,
    saltsCalcSaveStatus,
    setSaltsSaveStatus,
    setSaltsCalcSaveStatus,
    saltsSubmitting,
    savingSalts,
    onSaveSaltAdditions,
    onCalcSalts,
  } = model;

  return (
    <YStack gap="$2" mt="$3">
      <XStack gap="$3" alignItems="center" flexWrap="wrap">
        <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onSaveSaltAdditions()} disabled={!canCall || savingSalts}>
          {savingSalts ? "Saving…" : "Save salts draft"}
        </Button>
        <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onCalcSalts()} disabled={!canCall || saltsSubmitting}>
          {saltsSubmitting ? "Calculating…" : "Calculate & save salts snapshot"}
        </Button>
        {saltsStatus ? <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" role="status" aria-live="polite">{saltsStatus}</SizableText> : null}
      </XStack>
      {(saltsSaveStatus || saltsCalcSaveStatus) ? (
        <MessageBox
          variant="success"
          role="status"
          aria-live="polite"
          dismissAfter={5000}
          onDismiss={() => {
            setSaltsSaveStatus(null);
            setSaltsCalcSaveStatus(null);
          }}
        >
          {saltsSaveStatus ?? saltsCalcSaveStatus}
        </MessageBox>
      ) : null}
    </YStack>
  );
}

export function WaterMashSaltsErrorBlock({ model }: { model: WaterMashPageModel }) {
  const { saltsError } = model;
  if (!saltsError) return null;
  return <ErrorBox mt="$3">{saltsError}</ErrorBox>;
}
