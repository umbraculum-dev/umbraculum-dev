"use client";

import { YeastEditorRowPitchAmountFields } from "./rowPitch/YeastEditorRowPitchAmountFields";
import { YeastEditorRowPitchActions } from "./rowPitch/YeastEditorRowPitchActions";
import { YeastEditorRowPitchFields } from "./rowPitch/YeastEditorRowPitchFields";
import type { YeastEditorRowPitchProps } from "./rowPitch/yeastEditorRowPitchTypes";

export type { YeastEditorRowPitchProps } from "./rowPitch/yeastEditorRowPitchTypes";

export function YeastEditorRowPitch(props: YeastEditorRowPitchProps) {
  const { variant } = props;

  if (variant === "amount") {
    return <YeastEditorRowPitchAmountFields {...props} />;
  }

  return (
    <>
      <YeastEditorRowPitchFields {...props} />
      <YeastEditorRowPitchActions {...props} />
    </>
  );
}
