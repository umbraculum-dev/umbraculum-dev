import { Accordion, View } from "tamagui";

import { BrewAccordionHeader } from "../../../../../../_components/BrewAccordionHeader";
import type { WaterSpargePageModel } from "../../_hooks/useWaterSpargePage";
import { WaterSpargeConfigFieldsBlock } from "./config/WaterSpargeConfigFieldBlocks";
import { WaterSpargeConfigSaveBlock } from "./config/WaterSpargeConfigSaveBlock";

export function WaterSpargeConfigSection({ model }: { model: WaterSpargePageModel }) {
  const { t, openSpargeSections } = model;

  return (
    <Accordion.Item value="spargeConfig">
      <View className="brew-panel" aria-labelledby="sparge-config-heading">
        <BrewAccordionHeader
          headingId="sparge-config-heading"
          title={t("spargeConfigurationHeading")}
          open={openSpargeSections.includes("spargeConfig")}
        />
        <Accordion.Content>
          <WaterSpargeConfigFieldsBlock model={model} />
          <WaterSpargeConfigSaveBlock model={model} />
        </Accordion.Content>
      </View>
    </Accordion.Item>
  );
}
