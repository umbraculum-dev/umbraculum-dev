import { Accordion, SizableText, View } from "tamagui";

import { BrewAccordionHeader } from "../../../../../../_components/BrewAccordionHeader";

import type { WaterSpargePageModel } from "../../_hooks/useWaterSpargePage";
import { WaterSpargeSaltsAfterSaltsBlock } from "./spargeSalts/WaterSpargeSaltsAfterSaltsBlock";
import { WaterSpargeSaltsCombinedBlock } from "./spargeSalts/WaterSpargeSaltsCombinedBlock";
import { WaterSpargeSaltsEditorBlock } from "./spargeSalts/WaterSpargeSaltsEditorBlock";

export function WaterSpargeSaltsSection({ model }: { model: WaterSpargePageModel }) {
  const { t, openSpargeSections } = model;

  return (
    <Accordion.Item value="salts">
      <View className="brew-panel brew-section" aria-labelledby="sparge-salts-heading">
        <BrewAccordionHeader
          headingId="sparge-salts-heading"
          title={t("saltAdditionsManualV0")}
          open={openSpargeSections.includes("salts")}
        />
        <Accordion.Content>
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
            {t("saltAdditionsHelp")}
          </SizableText>

          <WaterSpargeSaltsEditorBlock model={model} />
          <WaterSpargeSaltsAfterSaltsBlock model={model} />
          <WaterSpargeSaltsCombinedBlock model={model} />
        </Accordion.Content>
      </View>
    </Accordion.Item>
  );
}
