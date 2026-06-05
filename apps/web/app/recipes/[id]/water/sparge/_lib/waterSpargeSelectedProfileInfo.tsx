import type { WaterProfile } from "@umbraculum/contracts";
import { Button, SizableText, View, XStack } from "tamagui";

import { FieldBadge } from "../../../../../_components/recipe-edit";
import { bicarbonatePpmToAlkalinityPpmCaCO3 } from "../../_lib/waterChem";

export function buildSelectedSpargeProfileInfo(args: {
  selectedSpargeProfile: WaterProfile | null;
  canCall: boolean;
  fmt: (unitKey: string, value: unknown, fallback: number) => string;
  tUnits: (key: string) => string;
  setStartingAlk: (value: number) => void;
  setStartingPh: (value: string) => void;
}) {
  const { selectedSpargeProfile, canCall, fmt, tUnits, setStartingAlk, setStartingPh } = args;

  if (!selectedSpargeProfile) {
    return (
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2" mb={0}>
        (Optional) Select a sparge water profile; you can then apply its alkalinity to the input.
      </SizableText>
    );
  }

  return (
    <View className="brew-field-block brew-field-block--readonly brew-mt3">
      <View className="brew-field-block-header">
        <strong>Selected profile info</strong>
        <FieldBadge>Read-only</FieldBadge>
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" display="inline">
          From selected profile
        </SizableText>
      </View>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
        Bicarbonate: <code>{fmt("ppm", selectedSpargeProfile.bicarbonate, 0)}</code> {tUnits("ppm")} · Estimated
        alkalinity:{" "}
        <code>{fmt("ppm_as_CaCO3", bicarbonatePpmToAlkalinityPpmCaCO3(selectedSpargeProfile.bicarbonate), 0)}</code>{" "}
        {tUnits("ppmAsCaCO3")} · pH:{" "}
        {selectedSpargeProfile.ph == null ? (
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" display="inline">
            —
          </SizableText>
        ) : (
          <code>{fmt("pH", selectedSpargeProfile.ph, 2)}</code>
        )}
      </SizableText>
      <XStack mt="$2" gap="$3" alignItems="center" flexWrap="wrap">
        <Button
          size="$3"
          bg="var(--surface-2)"
          borderWidth={1}
          borderColor="var(--border)"
          color="var(--text)"
          onPress={() => {
            setStartingAlk(bicarbonatePpmToAlkalinityPpmCaCO3(selectedSpargeProfile.bicarbonate));
            setStartingPh(selectedSpargeProfile.ph == null ? "" : String(selectedSpargeProfile.ph));
          }}
          disabled={!canCall}
        >
          Use profile alkalinity + pH
        </Button>
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          If profile pH is missing, we clear Starting pH so you can enter it.
        </SizableText>
      </XStack>
    </View>
  );
}
