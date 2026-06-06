"use client";

import { Button, XStack } from "tamagui";

type YeastEditorEditableToolbarProps = {
  canCallAccountScoped: boolean;
  t: (key: string, values?: Record<string, string | number>) => string;
  onAddRow: () => void;
};

export function YeastEditorEditableToolbar({
  t,
  canCallAccountScoped,
  onAddRow,
}: YeastEditorEditableToolbarProps) {
  return (
    <XStack gap="$3" items="center" flexWrap="wrap">
      <Button
        size="$3"
        bg="var(--surface-2)"
        borderWidth={1}
        borderColor="var(--border)"
        color="var(--text)"
        fontFamily="$body"
        onPress={onAddRow}
        disabled={!canCallAccountScoped}
      >
        {t("yeastAddCustomButton")}
      </Button>
    </XStack>
  );
}
