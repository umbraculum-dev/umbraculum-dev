"use client";

import { YStack } from "tamagui";

import type { BrewSessionDetailPageModel } from "../_hooks/useBrewSessionDetailPage";
import { BrewSessionDetailHeaderSection } from "./sections/BrewSessionDetailHeaderSection";
import { BrewSessionSummarySection } from "./sections/BrewSessionSummarySection";
import { BrewSessionDateSection } from "./sections/BrewSessionDateSection";
import { BrewSessionHydrometerSection } from "./sections/BrewSessionHydrometerSection";
import { BrewSessionCustomStepSection } from "./sections/BrewSessionCustomStepSection";
import { BrewSessionStepsToolbarSection } from "./sections/BrewSessionStepsToolbarSection";
import { BrewSessionGroupedStepsSection } from "./sections/BrewSessionGroupedStepsSection";
import { BrewSessionLogsSection } from "./sections/BrewSessionLogsSection";
import { BrewSessionActionBarSection } from "./sections/BrewSessionActionBarSection";

export function BrewSessionDetailPageContent({ model }: { model: BrewSessionDetailPageModel }) {
  return (
    <YStack gap="$3">
      <BrewSessionDetailHeaderSection model={model} />
      <BrewSessionSummarySection model={model} />
      <BrewSessionDateSection model={model} />
      <BrewSessionHydrometerSection model={model} />
      <BrewSessionCustomStepSection model={model} />
      <BrewSessionStepsToolbarSection model={model} />
      <BrewSessionGroupedStepsSection model={model} />
      <BrewSessionLogsSection model={model} />
      <BrewSessionActionBarSection model={model} />
    </YStack>
  );
}
