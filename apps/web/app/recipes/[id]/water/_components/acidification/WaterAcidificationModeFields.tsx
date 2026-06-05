import { BrewSelect } from "../../../../../_components/BrewSelect";
import { RecipeEditFieldLabel } from "../../../../../_components/recipe-edit";
import { ModeFieldset } from "@umbraculum/ui";
import { Input, View, YStack } from "tamagui";

import type { WaterAcidificationMode } from "../../_lib/waterCalcTypes";

const ACID_TYPE_OPTIONS = [
  { value: "phosphoric", label: "Phosphoric" },
  { value: "lactic", label: "Lactic" },
  { value: "hydrochloric", label: "Hydrochloric" },
  { value: "sulfuric", label: "Sulfuric" },
  { value: "acetic", label: "Acetic" },
  { value: "citric", label: "Citric (solid)" },
  { value: "tartaric", label: "Tartaric (solid)" },
  { value: "malic", label: "Malic (solid)" },
] as const;

const STRENGTH_KIND_OPTIONS = [
  { value: "percent", label: "Percent (%)" },
  { value: "normality", label: "Normality (N)" },
  { value: "molarity", label: "Molarity (M)" },
  { value: "solid", label: "Solid (pure)" },
] as const;

export function WaterAcidificationModeFields(props: {
  idPrefix: string;
  modeName: string;
  modeLegend?: string;
  modeOptions: Array<{ value: WaterAcidificationMode; label: string }>;
  acidificationMode: WaterAcidificationMode;
  setAcidificationMode: (value: WaterAcidificationMode) => void;
  acidType: string;
  setAcidType: (value: string) => void;
  strengthKind: "percent" | "normality" | "molarity" | "solid";
  setStrengthKind: (value: "percent" | "normality" | "molarity" | "solid") => void;
  strengthValue: number;
  setStrengthValue: (value: number) => void;
  manualAcidAdded: number;
  setManualAcidAdded: (value: number) => void;
  tUnits: (key: string) => string;
  modeFieldWidth?: "full" | "inline";
  showModeField?: boolean;
}) {
  const {
    idPrefix,
    modeName,
    modeLegend = "Mode",
    modeOptions,
    acidificationMode,
    setAcidificationMode,
    acidType,
    setAcidType,
    strengthKind,
    setStrengthKind,
    strengthValue,
    setStrengthValue,
    manualAcidAdded,
    setManualAcidAdded,
    tUnits,
    modeFieldWidth = "inline",
    showModeField = true,
  } = props;

  const modeFieldset = showModeField ? (
    <ModeFieldset
      legend={modeLegend}
      name={modeName}
      value={acidificationMode}
      onChange={(v) => setAcidificationMode(v)}
      options={modeOptions}
    />
  ) : null;

  return (
    <>
      {modeFieldset
        ? modeFieldWidth === "full"
          ? (
              <View width="100%" flexBasis="100%">
                {modeFieldset}
              </View>
            )
          : modeFieldset
        : null}

      <View flex={1} minWidth={200}>
        <YStack gap="$1.5">
          <RecipeEditFieldLabel htmlFor={`${idPrefix}-acid-type`}>Acid type</RecipeEditFieldLabel>
          <BrewSelect
            id={`${idPrefix}-acid-type`}
            value={acidType}
            onValueChange={setAcidType}
            options={[...ACID_TYPE_OPTIONS]}
            width="full"
          />
        </YStack>
      </View>

      <View flex={1} minWidth={200}>
        <YStack gap="$1.5">
          <RecipeEditFieldLabel htmlFor={`${idPrefix}-strength-kind`}>Strength kind</RecipeEditFieldLabel>
          <BrewSelect
            id={`${idPrefix}-strength-kind`}
            value={strengthKind}
            onValueChange={(v) => setStrengthKind(v as "percent" | "normality" | "molarity" | "solid")}
            options={[...STRENGTH_KIND_OPTIONS]}
            width="full"
          />
        </YStack>
      </View>

      <View width="100%" flexBasis="100%">
        <YStack gap="$1.5">
          <RecipeEditFieldLabel htmlFor={`${idPrefix}-strength-value`}>
            Strength value {strengthKind === "percent" ? "(whole %, e.g. 88)" : ""}
          </RecipeEditFieldLabel>
          <Input
            id={`${idPrefix}-strength-value`}
            keyboardType="decimal-pad"
            value={String(strengthValue)}
            onChangeText={(text) => setStrengthValue(Number(text) || 0)}
            disabled={strengthKind === "solid"}
            size="$3"
            w="100%"
            bg="var(--surface)"
            borderWidth={1}
            borderColor="var(--border)"
            rounded="$2"
            fontFamily="$body"
          />
        </YStack>
      </View>

      {acidificationMode === "manual" ? (
        <View width="100%" flexBasis="100%">
          <YStack gap="$1.5">
            <RecipeEditFieldLabel htmlFor={`${idPrefix}-manual-acid-added`}>
              Acid added ({strengthKind === "solid" ? tUnits("g") : tUnits("mL")})
            </RecipeEditFieldLabel>
            <Input
              id={`${idPrefix}-manual-acid-added`}
              keyboardType="decimal-pad"
              value={String(manualAcidAdded)}
              onChangeText={(text) => setManualAcidAdded(Number(text) || 0)}
              size="$3"
              w="100%"
              bg="var(--surface)"
              borderWidth={1}
              borderColor="var(--border)"
              rounded="$2"
              fontFamily="$body"
            />
          </YStack>
        </View>
      ) : null}
    </>
  );
}
