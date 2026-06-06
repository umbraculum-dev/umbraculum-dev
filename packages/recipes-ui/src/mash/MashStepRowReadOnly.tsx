import React from "react";

import { MASH_STEP_TYPE_OPTIONS } from "@umbraculum/brewery-beerjson";
import { Card, ReadOnlyField, ReadOnlyFieldRow, Text } from "@umbraculum/ui";

import type { MashStepRowReadOnlyProps } from "./MashStepRow.types";

export function MashStepRowReadOnly(props: MashStepRowReadOnlyProps) {
  const { row: r, index: idx, waterVolumes, cardBackgroundColor, cardBorderColor, t, tUnits, locale, formatFixed } = props;
  const isSpargeStep = r.type === "sparge" && r.name.trim().toLowerCase() === "sparge";
  const amountDisplay =
    isSpargeStep && waterVolumes
      ? formatFixed(locale, waterVolumes.spargeLiters, 2)
      : r.amountL != null && Number.isFinite(r.amountL)
        ? formatFixed(locale, r.amountL, 2)
        : null;
  const typeLabel = MASH_STEP_TYPE_OPTIONS.find((o) => o.value === r.type)?.label ?? r.type;

  return (
    <Card
      key={r.id}
      data-mash-step-card
      {...((cardBackgroundColor ?? cardBorderColor) ? {} : { theme: "surface2" as const })}
      gap="$2"
      padding="$3"
      backgroundColor={cardBackgroundColor ?? "$background"}
      borderWidth={1}
      borderColor={cardBorderColor ?? "$borderColor"}
    >
      <Text fontSize={12} fontWeight="700">
        {idx + 1}. {r.name}
      </Text>
      <ReadOnlyFieldRow>
        <ReadOnlyField label={t("mashingStepType")} value={typeLabel} minWidth={120} flex={1} />
        <ReadOnlyField
          label={t("mashingStepTemp", { unit: "°C" })}
          value={String(r.stepTemperatureC)}
          minWidth={90}
        />
        <ReadOnlyField
          label={t("mashingStepTime", { unit: "min" })}
          value={String(r.stepTimeMin)}
          minWidth={90}
        />
        <ReadOnlyField
          label={t("mashingStepAmount", { unit: "L" })}
          value={
            amountDisplay != null ? (
              <>
                {amountDisplay} {tUnits("L")}
              </>
            ) : (
              "—"
            )
          }
          minWidth={120}
        />
      </ReadOnlyFieldRow>
    </Card>
  );
}
