import { MessageBox } from "../../../../../_components/recipe-edit";
import { Button, SizableText, XStack, YStack } from "tamagui";

import type { WaterAcidificationMode } from "../../_lib/waterCalcTypes";

export function WaterAcidificationSaveBar(props: {
  canCall: boolean;
  submitting: boolean;
  saving: boolean;
  acidificationMode: WaterAcidificationMode;
  saveDraftLabel: string;
  onSave: () => void;
  saveStatus: string | null;
  calcSaveStatus: string | null;
  onDismissStatus: () => void;
  inlineStatus?: string | null;
  submitFirst?: boolean;
}) {
  const {
    canCall,
    submitting,
    saving,
    acidificationMode,
    saveDraftLabel,
    onSave,
    saveStatus,
    calcSaveStatus,
    onDismissStatus,
    inlineStatus,
    submitFirst = false,
  } = props;

  const submitButton = (
    <Button
      as="button"
      type="submit"
      size="$3"
      bg="var(--surface-2)"
      borderWidth={1}
      borderColor="var(--border)"
      color="var(--text)"
      disabled={!canCall || submitting}
    >
      {submitting
        ? "Working…"
        : acidificationMode === "manual"
          ? "Estimate & save snapshot"
          : "Calculate & save snapshot"}
    </Button>
  );

  const saveButton = (
    <Button
      size="$3"
      bg="var(--surface-2)"
      borderWidth={1}
      borderColor="var(--border)"
      color="var(--text)"
      onPress={() => void onSave()}
      disabled={!canCall || saving}
    >
      {saving ? "Saving…" : saveDraftLabel}
    </Button>
  );

  return (
    <YStack gap="$2" mt="$3" mb="$3">
      <XStack gap="$3" alignItems="center" flexWrap="wrap">
        {submitFirst ? (
          <>
            {submitButton}
            {saveButton}
          </>
        ) : (
          <>
            {saveButton}
            {submitButton}
          </>
        )}
        {inlineStatus ? (
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" role="status" aria-live="polite">
            {inlineStatus}
          </SizableText>
        ) : null}
      </XStack>
      {saveStatus || calcSaveStatus ? (
        <MessageBox
          variant="success"
          role="status"
          aria-live="polite"
          dismissAfter={5000}
          onDismiss={onDismissStatus}
        >
          {saveStatus ?? calcSaveStatus}
        </MessageBox>
      ) : null}
    </YStack>
  );
}
