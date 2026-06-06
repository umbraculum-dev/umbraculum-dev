import type { EditorYeastRow } from "../../../_lib/beerjsonRecipe";
import type { YeastEditorRowContext } from "../yeastEditorTypes";

export type YeastEditorRowPitchProps = {
  row: EditorYeastRow;
  ctx: YeastEditorRowContext;
  variant: "amount" | "advanced";
};
