"use client";

import { Button, SizableText, View, XStack, YStack } from "tamagui";

import { BrewSelect } from "../../../../../../../_components/BrewSelect";
import { MessageBox, RecipeEditFieldLabel } from "../../../../../../../_components/recipe-edit";
import type { IntegrationKind } from "../../../_lib/brewSessionDetailUi";
import type { BrewSessionDetailPageModel } from "../../../_hooks/useBrewSessionDetailPage";

export function BrewSessionHydrometerControlsBlock({ model }: { model: BrewSessionDetailPageModel }) {
  const {
    t,
    canCall,
    hydrometerKind,
    setHydrometerKind,
    hydrometerDevices,
    hydrometerSelectedDeviceId,
    setHydrometerSelectedDeviceId,
    hydrometerWorking,
    hydrometerKindOptions,
    hydrometerDeviceOptions,
    attachedHydrometer,
    attachHydrometer,
    detachHydrometer,
  } = model;

  return (
    <YStack gap="$2" mt="$2">
      <View minW={200}>
        <RecipeEditFieldLabel htmlFor="hydrometer-kind">
          {t("hydrometerKindLabel")}
        </RecipeEditFieldLabel>
        <BrewSelect
          id="hydrometer-kind"
          value={hydrometerKind}
          onValueChange={(v) => setHydrometerKind(v as IntegrationKind)}
          options={hydrometerKindOptions}
          width="full"
          aria-label={t("hydrometerKindLabel")}
        />
      </View>

      {hydrometerKind !== "tilt" ? (
        <MessageBox variant="warning">{t("hydrometerNotSupportedYet")}</MessageBox>
      ) : null}

      <View minW={260}>
        <RecipeEditFieldLabel htmlFor="hydrometer-device">
          {t("hydrometerDeviceLabel")}
        </RecipeEditFieldLabel>
        <BrewSelect
          id="hydrometer-device"
          value={hydrometerSelectedDeviceId}
          onValueChange={(v: string) => setHydrometerSelectedDeviceId(v)}
          options={hydrometerDeviceOptions}
          width="full"
          placeholder={t("hydrometerDevicePlaceholder")}
          aria-label={t("hydrometerDeviceLabel")}
          disabled={!hydrometerDevices.length}
        />
      </View>

      {!hydrometerDevices.length ? (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("hydrometerNoDevices")}
        </SizableText>
      ) : null}

      <XStack gap="$2" flexWrap="wrap" alignItems="center">
        <Button
          onPress={() => void attachHydrometer()}
          disabled={!canCall || hydrometerWorking !== null || !hydrometerSelectedDeviceId}
          size="$3"
          bg="var(--surface-2)"
          borderWidth={1}
          borderColor="var(--border)"
          color="var(--text)"
          fontFamily="$body"
        >
          {hydrometerWorking === "attach" ? t("working") : t("hydrometerAttach")}
        </Button>
        <Button
          onPress={() => void detachHydrometer()}
          disabled={!canCall || hydrometerWorking !== null || !attachedHydrometer}
          size="$3"
          bg="var(--surface-2)"
          borderWidth={1}
          borderColor="var(--border)"
          color="var(--text)"
          fontFamily="$body"
        >
          {hydrometerWorking === "detach" ? t("working") : t("hydrometerDetach")}
        </Button>
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {attachedHydrometer
            ? t("hydrometerAttachedTo", {
                device: attachedHydrometer.device.displayName ?? attachedHydrometer.device.deviceKey,
              })
            : t("hydrometerNotAttached")}
        </SizableText>
      </XStack>
    </YStack>
  );
}
