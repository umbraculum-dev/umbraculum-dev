import type { EditorYeastRow } from "../../../_lib/beerjsonRecipe";
import type { YeastEditorRowContext } from "../yeastEditorTypes";

export type YeastEditorRowManualCountProps = {
  row: EditorYeastRow;
  idx: number;
  ctx: YeastEditorRowContext;
};
