import { MessageBox } from "../../../../../../../_components/recipe-edit";
import { Button, XStack, YStack } from "tamagui";

import type { WaterMashAdjustmentActionsModel } from "./waterMashAdjustmentTypes";

export function WaterMashAdjustmentActionsBlock({ model }: { model: WaterMashAdjustmentActionsModel }) {
  const {
    canCall,
    loadingProfiles,
    refreshProfiles,
    onSaveAdjustment,
    savingAdjustment,
    adjustmentSaveStatus,
    setAdjustmentSaveStatus,
  } = model;

  return (
    <YStack gap="$2" mt="$3">
      <XStack gap="$3" alignItems="center" flexWrap="wrap">
        <Button
          size="$3"
          bg="var(--surface-2)"
          borderWidth={1}
          borderColor="var(--border)"
          color="var(--text)"
          onPress={() => void refreshProfiles()}
          disabled={!canCall || loadingProfiles}
        >
          {loadingProfiles ? "Reloading…" : "Reload water profiles"}
        </Button>
        <Button
          size="$3"
          bg="var(--surface-2)"
          borderWidth={1}
          borderColor="var(--border)"
          color="var(--text)"
          onPress={() => void onSaveAdjustment()}
          disabled={!canCall || savingAdjustment}
        >
          {savingAdjustment ? "Saving…" : "Save profile and volumes"}
        </Button>
      </XStack>
      {adjustmentSaveStatus ? (
        <MessageBox
          variant="success"
          role="status"
          aria-live="polite"
          dismissAfter={5000}
          onDismiss={() => setAdjustmentSaveStatus(null)}
        >
          {adjustmentSaveStatus}
        </MessageBox>
      ) : null}
    </YStack>
  );
}
