"use client";

import { H2, SizableText, View } from "tamagui";

import { ErrorBox } from "../../../../../../_components/recipe-edit";
import type { BrewSessionDetailPageModel } from "../../_hooks/useBrewSessionDetailPage";
import { BrewSessionHydrometerControlsBlock } from "./hydrometer/BrewSessionHydrometerControlsBlock";
import { BrewSessionHydrometerReadingBlock } from "./hydrometer/BrewSessionHydrometerReadingBlock";

export function BrewSessionHydrometerSection({ model }: { model: BrewSessionDetailPageModel }) {
  const { t, hydrometerError } = model;

  return (
    <>
      <View
        bg="var(--surface)"
        borderWidth={1}
        borderColor="var(--border)"
        rounded="$3"
        p="$3"
      >
        <H2 mt={0}>{t("hydrometerSectionTitle")}</H2>
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$1">
          {t("hydrometerSectionSubtitle")}
        </SizableText>

        {hydrometerError ? <ErrorBox mt="$2">{hydrometerError}</ErrorBox> : null}

        <BrewSessionHydrometerControlsBlock model={model} />
        <BrewSessionHydrometerReadingBlock model={model} />
      </View>
    </>
  );
}
