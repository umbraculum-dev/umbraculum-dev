"use client";

import { SizableText, XStack } from "tamagui";

import type { YeastEditorRowPitchProps } from "./yeastEditorRowPitchTypes";

export function YeastEditorRowPitchActions(props: YeastEditorRowPitchProps) {
  const { ctx } = props;
  const { t } = ctx;

  return (
    <XStack gap="$2" flexBasis="100%" w="100%" mt={-4} flexWrap="wrap" alignItems="center">
      <SizableText size="$1" color="var(--text-muted)" fontFamily="$body" mb={0}>
        {t("yeastCellsPerDefaultNote")}
      </SizableText>
      <SizableText size="$1" color="var(--text-muted)" fontFamily="$body" mb={0}>
        {t("yeastCellsPerOverrideNote")}
      </SizableText>
    </XStack>
  );
}
