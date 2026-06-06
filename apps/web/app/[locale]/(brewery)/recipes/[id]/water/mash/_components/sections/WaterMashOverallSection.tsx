import { Accordion, SizableText, View } from "tamagui";

import { BrewAccordionHeader } from "../../../../../../_components/BrewAccordionHeader";

import type { WaterMashPageModel } from "../../_hooks/useWaterMashPage";
import {
  WaterMashOverallActionsBlock,
  WaterMashOverallErrorBlock,
  WaterMashOverallStatsBlock,
} from "./mashOverall/WaterMashOverallBlocks";

export function WaterMashOverallSection({ model }: { model: WaterMashPageModel }) {
  const { t, openMashSections } = model;

  return (
    <Accordion.Item value="overall">
      <View className="brew-panel brew-section" aria-labelledby="overall-mash-water-result">
        <BrewAccordionHeader
          headingId="overall-mash-water-result"
          title={t("overallResultHeading")}
          open={openMashSections.includes("overall")}
        />
        <Accordion.Content>
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
            Click <strong>Preview overall</strong> to preview, or <strong>Calculate &amp; save overall snapshot</strong> to persist a snapshot.
          </SizableText>
          <WaterMashOverallActionsBlock model={model} />
          <WaterMashOverallErrorBlock model={model} />
          <WaterMashOverallStatsBlock model={model} />
        </Accordion.Content>
      </View>
    </Accordion.Item>
  );
}
