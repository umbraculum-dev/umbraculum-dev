import { SaltAdditionsEditor } from "@umbraculum/brewery-recipes-ui";
import { H2, SizableText } from "tamagui";

import type { WaterBoilPageModel } from "../../../_hooks/useWaterBoilPage";

export function WaterBoilSaltsEditorBlock({ model }: { model: WaterBoilPageModel }) {
  const { t, saltAdditions, setSaltAdditions, canCall } = model;

  return (
    <>
      <H2 id="boil-salts-heading" mt={0}>
        {t("saltAdditionsHeading")}
      </H2>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
        {t("saltAdditionsBaseHelp")}
      </SizableText>

      <SaltAdditionsEditor rows={saltAdditions} onChange={setSaltAdditions} idPrefix="boil" disabled={!canCall} />
    </>
  );
}
