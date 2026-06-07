import React from "react";
import { Spinner as TamaguiSpinner } from "tamagui";

export type SpinnerProps = React.ComponentProps<typeof TamaguiSpinner>;

export function Spinner(props: SpinnerProps) {
  return <TamaguiSpinner {...props} />;
}

