import { Button, XStack, YStack } from "tamagui";

import { MessageBox } from "../../../../../../../../../_components/recipe-edit";
import type { WaterSpargePageModel } from "../../../_hooks/useWaterSpargePage";

export function WaterSpargeConfigSaveBlock({ model }: { model: WaterSpargePageModel }) {
  const { canCall, savingSpargeConfig, onSaveSpargeConfig, spargeConfigSaveStatus, setSpargeConfigSaveStatus } = model;

  return (
    <YStack mt="$3" gap="$2">
      <XStack gap="$3" alignItems="center" flexWrap="wrap">
        <Button
          size="$3"
          bg="var(--surface-2)"
          borderWidth={1}
          borderColor="var(--border)"
          color="var(--text)"
          onPress={() => void onSaveSpargeConfig()}
          disabled={!canCall || savingSpargeConfig}
        >
          {savingSpargeConfig ? "Saving…" : "Save"}
        </Button>
      </XStack>
      {spargeConfigSaveStatus ? (
        <MessageBox
          variant="success"
          role="status"
          aria-live="polite"
          dismissAfter={5000}
          onDismiss={() => setSpargeConfigSaveStatus(null)}
        >
          {spargeConfigSaveStatus}
        </MessageBox>
      ) : null}
    </YStack>
  );
}
