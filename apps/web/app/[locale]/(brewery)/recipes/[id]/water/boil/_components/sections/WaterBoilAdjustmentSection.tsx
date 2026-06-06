import { ErrorBox } from "../../../../../../_components/recipe-edit";
import { H2, SizableText, View } from "tamagui";

import type { WaterBoilPageModel } from "../../_hooks/useWaterBoilPage";
import { WaterBoilAdjustmentActionsBlock } from "./boilAdjustment/WaterBoilAdjustmentActionsBlock";
import { WaterBoilMixedIonsBlock } from "./boilAdjustment/WaterBoilMixedIonsBlock";
import { WaterBoilProfilePickersBlock } from "./boilAdjustment/WaterBoilProfilePickersBlock";

export function WaterBoilAdjustmentSection({ model }: { model: WaterBoilPageModel }) {
  const { t, profilesError } = model;

  return (
    <>
      <View className="brew-panel" aria-labelledby="boil-adjustment-heading">
        <H2 id="boil-adjustment-heading" mt={0}>
          {t("adjustmentHeading")}
        </H2>
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
          {t("adjustmentHelp")}
        </SizableText>

        <WaterBoilProfilePickersBlock model={model} />
        <WaterBoilAdjustmentActionsBlock model={model} />
        <WaterBoilMixedIonsBlock model={model} />

        {profilesError ? <ErrorBox mt="$3">{profilesError}</ErrorBox> : null}
      </View>
    </>
  );
}
