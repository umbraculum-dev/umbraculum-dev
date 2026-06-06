import { Link } from "../../../../../../../../../src/i18n/navigation";

import { ErrorBox } from "../../../../../../_components/recipe-edit";
import { BrewAccordionHeader } from "../../../../../../_components/BrewAccordionHeader";
import { Accordion, SizableText, View } from "tamagui";

import type { WaterMashPageModel } from "../../_hooks/useWaterMashPage";
import { WaterMashAdjustmentActionsBlock } from "./mashAdjustment/WaterMashAdjustmentActionsBlock";
import { WaterMashMixedIonsBlock } from "./mashAdjustment/WaterMashMixedIonsBlock";
import { WaterMashProfilePickersBlock } from "./mashAdjustment/WaterMashProfilePickersBlock";

export function WaterMashAdjustmentSection({ model }: { model: WaterMashPageModel }) {
  const { t, openMashSections, profilesError } = model;

  return (
    <Accordion.Item value="adjustment">
      <View className="brew-panel" aria-labelledby="adjustment-heading">
        <BrewAccordionHeader
          headingId="adjustment-heading"
          title={t("adjustmentHeading")}
          open={openMashSections.includes("adjustment")}
        />
        <Accordion.Content>
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
            Choose source/target/dilution profiles and volumes to compute a mixed starting water profile. Manage
            profiles on <Link href="/water-profiles">Water profiles</Link>.
          </SizableText>

          <WaterMashProfilePickersBlock model={model} />
          <WaterMashAdjustmentActionsBlock model={model} />

          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}>
            {t("adjustmentHint")}
          </SizableText>

          <WaterMashMixedIonsBlock model={model} />

          {profilesError ? <ErrorBox mt="$3">{profilesError}</ErrorBox> : null}
        </Accordion.Content>
      </View>
    </Accordion.Item>
  );
}
