"use client";

import { SizableText, View, YStack } from "tamagui";

import { type EditorYeastRow } from "../../../_lib/beerjsonRecipe";
import { YeastEditorRow } from "../YeastEditorRow";
import { type YeastEditorRowContext } from "../yeastEditorTypes";

type YeastEditorEditableRowsProps = {
  yeastRows: EditorYeastRow[];
  rowCtx: YeastEditorRowContext;
  t: (key: string, values?: Record<string, string | number>) => string;
};

export function YeastEditorEditableRows(props: YeastEditorEditableRowsProps) {
  const { yeastRows, rowCtx, t } = props;

  if (!yeastRows.length) {
    return (
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}>
        {t("yeastEmpty")}
      </SizableText>
    );
  }

  return (
    <View overflowX="auto" mt="$3">
      <YStack gap="$3">
        {yeastRows.map((r, idx) => (
          <YeastEditorRow key={r.id} row={r} idx={idx} ctx={rowCtx} />
        ))}
      </YStack>
    </View>
  );
}
