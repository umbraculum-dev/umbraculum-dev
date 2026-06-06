/* eslint-disable @typescript-eslint/no-unused-vars -- mechanical SOLID page split; trim imports in follow-up */

import { View } from "tamagui";

import type { WaterBoilPageModel } from "../../_hooks/useWaterBoilPage";
import { WaterBoilSaltsActionsBlock } from "./salts/WaterBoilSaltsActionsBlock";
import { WaterBoilSaltsEditorBlock } from "./salts/WaterBoilSaltsEditorBlock";
import { WaterBoilSaltsResultBlock } from "./salts/WaterBoilSaltsResultBlock";

export function WaterBoilSaltsSection({ model }: { model: WaterBoilPageModel }) {
  return (
    <>
      <View className="brew-panel" aria-labelledby="boil-salts-heading">
        <WaterBoilSaltsEditorBlock model={model} />
        <WaterBoilSaltsActionsBlock model={model} />
        <WaterBoilSaltsResultBlock model={model} />
      </View>
    </>
  );
}
