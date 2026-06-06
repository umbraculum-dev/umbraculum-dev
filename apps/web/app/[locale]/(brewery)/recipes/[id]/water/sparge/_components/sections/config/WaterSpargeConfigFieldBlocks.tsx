import { Input, View, XStack, YStack } from "tamagui";

import { BrewSelect } from "../../../../../../../_components/BrewSelect";
import { RecipeEditFieldLabel } from "../../../../../../../_components/recipe-edit";
import { formatFixed } from "../../../../../../../../../../src/i18n/format";
import type { WaterSpargePageModel } from "../../../_hooks/useWaterSpargePage";

export function WaterSpargeConfigFieldsBlock({ model }: { model: WaterSpargePageModel }) {
  const { locale, t, tEdit, tUnits, spargeStepTimeMin, setSpargeStepTimeMin, spargeStepRampMin, setSpargeStepRampMin, spargeMethodType, setSpargeMethodType, spargeStepTemp, setSpargeStepTemp } = model;

  return (
    <XStack gap="$3" flexWrap="wrap" ai="flex-end">
      <View flex={1} minWidth={120}>
        <YStack gap="$1.5">
          <RecipeEditFieldLabel htmlFor="sparge-step-time">
            {tEdit("mashingStepTime", { unit: "min" })}
          </RecipeEditFieldLabel>
          <Input
            id="sparge-step-time"
            keyboardType="decimal-pad"
            value={String(spargeStepTimeMin)}
            onChangeText={(text) => setSpargeStepTimeMin(Math.max(0, Math.min(600, Number(text) || 0)))}
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
      <View flex={1} minWidth={120}>
        <YStack gap="$1.5">
          <RecipeEditFieldLabel htmlFor="sparge-step-ramp">
            {tEdit("mashingStepRamp", { unit: "min" })}
          </RecipeEditFieldLabel>
          <Input
            id="sparge-step-ramp"
            keyboardType="decimal-pad"
            value={String(spargeStepRampMin)}
            onChangeText={(text) => setSpargeStepRampMin(Math.max(0, Math.min(120, Number(text) || 0)))}
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
      <View flex={1} minWidth={120}>
        <YStack gap="$1.5">
          <RecipeEditFieldLabel htmlFor="sparge-method-type">
            {tEdit("mashingStepType")}
          </RecipeEditFieldLabel>
          <BrewSelect
            id="sparge-method-type"
            value={spargeMethodType}
            onValueChange={(v) => setSpargeMethodType(v as "fly_sparge" | "batch_sparge")}
            options={[
              { value: "fly_sparge", label: t("spargeMethodFlySparge") },
              { value: "batch_sparge", label: t("spargeMethodBatchSparge") },
            ]}
            width="full"
          />
        </YStack>
      </View>
      <View flex={1} minWidth={120}>
        <YStack gap="$1.5">
          <RecipeEditFieldLabel htmlFor="sparge-step-temp">
            {tEdit("mashingStepTemp", { unit: tUnits("C") })}
          </RecipeEditFieldLabel>
          <Input
            id="sparge-step-temp"
            keyboardType="decimal-pad"
            value={formatFixed(locale, spargeStepTemp, 1)}
            onChangeText={(text) => {
              const parsed = Number(String(text).replace(",", "."));
              setSpargeStepTemp(Math.max(0, Math.min(100, Number.isFinite(parsed) ? parsed : 0)));
            }}
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
    </XStack>
  );
}
