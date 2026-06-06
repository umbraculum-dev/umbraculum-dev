import { MashStepRowEditable } from "./MashStepRowEditable";
import { MashStepRowReadOnly } from "./MashStepRowReadOnly";
import type { MashStepRowProps } from "./MashStepRow.types";

export type {
  MashStepRowEditableProps,
  MashStepRowProps,
  MashStepRowReadOnlyProps,
  MashStepsReadOnlyViewProps,
} from "./MashStepRow.types";
export { MashStepsReadOnlyView } from "./MashStepsReadOnlyView";

export function MashStepRow(props: MashStepRowProps) {
  if (props.readOnly) {
    return <MashStepRowReadOnly {...props} />;
  }
  return <MashStepRowEditable {...props} />;
}
