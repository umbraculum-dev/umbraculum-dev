"use client";

import { Button, YStack } from "tamagui";

import { MessageBox } from "../../../../../../_components/recipe-edit";

type YeastEditorEditableSaveFooterProps = {
  t: (key: string, values?: Record<string, string | number>) => string;
  canCallAccountScoped: boolean;
  saving: boolean;
  onSave: () => void;
  saveStatus: string | null;
  onDismissSaveStatus?: () => void;
};

export function YeastEditorEditableSaveFooter({
  t,
  canCallAccountScoped,
  saving,
  onSave,
  saveStatus,
  onDismissSaveStatus,
}: YeastEditorEditableSaveFooterProps) {
  return (
    <YStack mt="$3" mb="$4" gap="$2" alignItems="flex-end">
      <Button
        size="$3"
        bg="var(--surface-2)"
        borderWidth={1}
        borderColor="var(--border)"
        color="var(--text)"
        fontFamily="$body"
        onPress={onSave}
        disabled={!canCallAccountScoped || saving}
      >
        {saving ? "Saving…" : t("yeastSaveButton")}
      </Button>
      {saveStatus ? (
        <MessageBox
          variant="success"
          role="status"
          aria-live="polite"
          dismissAfter={5000}
          onDismiss={onDismissSaveStatus}
        >
          {saveStatus}
        </MessageBox>
      ) : null}
    </YStack>
  );
}
