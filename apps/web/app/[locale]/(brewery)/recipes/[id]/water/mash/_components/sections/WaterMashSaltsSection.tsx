import { Accordion, View } from "tamagui";

import { BrewAccordionHeader } from "../../../../../../../../_components/BrewAccordionHeader";

import type { WaterMashPageModel } from "../../_hooks/useWaterMashPage";
import {
  WaterMashSaltsActionsBlock,
  WaterMashSaltsEditorBlock,
  WaterMashSaltsErrorBlock,
} from "./salts/WaterMashSaltsBlocks";
import { WaterMashSaltsResultBlock } from "./salts/WaterMashSaltsResultBlock";

export function WaterMashSaltsSection({ model }: { model: WaterMashPageModel }) {
  const { t, openMashSections } = model;

  return (
    <Accordion.Item value="salts">
      <View className="brew-panel brew-section" aria-labelledby="salts-heading">
        <BrewAccordionHeader
          headingId="salts-heading"
          title={t("saltAdditionsManualV0")}
          open={openMashSections.includes("salts")}
        />
        <Accordion.Content>
          <WaterMashSaltsEditorBlock model={model} />
          <WaterMashSaltsActionsBlock model={model} />
          <WaterMashSaltsErrorBlock model={model} />
          <WaterMashSaltsResultBlock model={model} />
        </Accordion.Content>
      </View>
    </Accordion.Item>
  );
}
