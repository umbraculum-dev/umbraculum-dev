import { SaltAdditionsEditor } from "@umbraculum/brewery-recipes-ui";

import { ErrorBox, MessageBox } from "../../../../../../../../../_components/recipe-edit";
import { Button, SizableText, XStack, YStack } from "tamagui";

import type { WaterSpargeSaltsEditorModel } from "./waterSpargeSaltsTypes";

export function WaterSpargeSaltsEditorBlock({ model }: { model: WaterSpargeSaltsEditorModel }) {
  const {
    canCall,
    spargeSaltAdditions,
    setSpargeSaltAdditions,
    onSaveSpargeSaltsInputs,
    savingSpargeSalts,
    onCalculateSpargeSalts,
    spargeSaltsSubmitting,
    selectedSpargeProfile,
    spargeSaltsStatus,
    spargeSaltsSaveStatus,
    setSpargeSaltsSaveStatus,
    spargeSaltsCalcSaveStatus,
    setSpargeSaltsCalcSaveStatus,
    spargeSaltsError,
  } = model;

  return (
    <>
      <SaltAdditionsEditor
        rows={spargeSaltAdditions}
        onChange={setSpargeSaltAdditions}
        idPrefix="sparge"
        disabled={!canCall}
      />

      <YStack mt="$3" gap="$2">
        <XStack gap="$3" alignItems="center" flexWrap="wrap">
          <Button
            size="$3"
            bg="var(--surface-2)"
            borderWidth={1}
            borderColor="var(--border)"
            color="var(--text)"
            onPress={() => void onSaveSpargeSaltsInputs()}
            disabled={!canCall || savingSpargeSalts}
          >
            {savingSpargeSalts ? "Saving…" : "Save salts draft"}
          </Button>
          <Button
            size="$3"
            bg="var(--surface-2)"
            borderWidth={1}
            borderColor="var(--border)"
            color="var(--text)"
            onPress={() => void onCalculateSpargeSalts()}
            disabled={!canCall || spargeSaltsSubmitting || !selectedSpargeProfile}
          >
            {spargeSaltsSubmitting ? "Calculating…" : "Calculate & save salts snapshot"}
          </Button>
          {spargeSaltsStatus ? (
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" role="status" aria-live="polite">
              {spargeSaltsStatus}
            </SizableText>
          ) : null}
        </XStack>
        {spargeSaltsSaveStatus || spargeSaltsCalcSaveStatus ? (
          <MessageBox
            variant="success"
            role="status"
            aria-live="polite"
            dismissAfter={5000}
            onDismiss={() => {
              setSpargeSaltsSaveStatus(null);
              setSpargeSaltsCalcSaveStatus(null);
            }}
          >
            {spargeSaltsSaveStatus ?? spargeSaltsCalcSaveStatus}
          </MessageBox>
        ) : null}
      </YStack>

      {spargeSaltsError ? <ErrorBox mt="$3">{spargeSaltsError}</ErrorBox> : null}
    </>
  );
}
