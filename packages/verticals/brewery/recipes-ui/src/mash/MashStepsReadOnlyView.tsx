import React from "react";
import { YStack } from "tamagui";

import { Text } from "@umbraculum/ui";

import { MashStepRow } from "./MashStepRow";
import type { MashStepsReadOnlyViewProps } from "./MashStepRow.types";

export type { MashStepsReadOnlyViewProps };

export function MashStepsReadOnlyView(props: MashStepsReadOnlyViewProps) {
  const { mashRows, mashProcedure = null, waterVolumes, cardBackgroundColor, cardBorderColor, t, tUnits, locale, formatFixed } =
    props;

  return (
    <YStack gap="$2">
      {mashProcedure ? (
        <Text fontSize={12} opacity={0.8}>
          {mashProcedure.name} · {t("mashingGrainTemp")}: {mashProcedure.grainTemperatureC} °C
        </Text>
      ) : null}

      {mashRows.length ? (
        mashRows.map((r, idx) => (
          <MashStepRow
            key={r.id}
            readOnly
            row={r}
            index={idx}
            waterVolumes={waterVolumes}
            cardBackgroundColor={cardBackgroundColor}
            cardBorderColor={cardBorderColor}
            t={t}
            tUnits={tUnits}
            locale={locale}
            formatFixed={formatFixed}
          />
        ))
      ) : (
        <Text fontSize={12} opacity={0.8}>
          {t("mashingEmpty")}
        </Text>
      )}
    </YStack>
  );
}
