import { Button, SizableText, XStack, YStack } from "tamagui";

import { ErrorBox, MessageBox } from "../../../../../../../_components/recipe-edit";
import type { WaterBoilPageModel } from "../../../_hooks/useWaterBoilPage";

export function WaterBoilSaltsActionsBlock({ model }: { model: WaterBoilPageModel }) {
  const {
    canCall,
    savingSalts,
    saltsSubmitting,
    saltsStatus,
    saltsSaveStatus,
    setSaltsSaveStatus,
    saltsCalcSaveStatus,
    setSaltsCalcSaveStatus,
    onSaveSaltAdditions,
    onCalcSalts,
  } = model;

  return (
    <>
      <YStack mt="$3" gap="$2">
        <XStack gap="$3" alignItems="center" flexWrap="wrap">
          <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onSaveSaltAdditions()} disabled={!canCall || savingSalts}>
            {savingSalts ? "Saving…" : "Save salts draft"}
          </Button>
          <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onCalcSalts()} disabled={!canCall || saltsSubmitting}>
            {saltsSubmitting ? "Calculating…" : "Calculate & save salts snapshot"}
          </Button>
          {saltsStatus ? (
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" role="status" aria-live="polite">
              {saltsStatus}
            </SizableText>
          ) : null}
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

      {model.saltsError ? (
        <ErrorBox mt="$3">{model.saltsError}</ErrorBox>
      ) : null}
    </>
  );
}
