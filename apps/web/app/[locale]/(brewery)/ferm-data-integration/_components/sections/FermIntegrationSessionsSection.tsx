"use client";

import { Button, SizableText, XStack, YStack } from "tamagui";

import { BrewSelect } from "../../../../../_components/BrewSelect";
import { CodeInline } from "../../../../../_components/CodeInline";
import type { UseFermDataIntegrationPageModel } from "../../_hooks/useFermDataIntegrationPage";
import type { IntegrationDevice } from "../../_lib/fermIntegrationTypes";

type Model = UseFermDataIntegrationPageModel;

export function FermIntegrationSessionsSection(props: {
  model: Model;
  device: IntegrationDevice;
  working: boolean;
}) {
  const { model, device, working } = props;
  const {
    t,
    attachSessionByDeviceId,
    setAttachSessionByDeviceId,
    brewSessionOptions,
    attachDevice,
    detachDevice,
  } = model;

  const attachId = `attach-${device.id}`;
  const selectedSessionId = attachSessionByDeviceId[device.id] ?? "";
  const active = device.activeAttachment?.brewSession ?? null;

  return (
    <YStack gap="$1">
      <SizableText size="$2" fontFamily="$body">
        {t("sections.integration.attachedTo")}{" "}
        {active ? (
          <CodeInline>{`${active.code} — ${active.recipe?.name ?? ""}`.trim()}</CodeInline>
        ) : (
          <CodeInline>{t("sections.integration.notAttached")}</CodeInline>
        )}
      </SizableText>

      <XStack gap="$2" flexWrap="wrap" alignItems="center">
        <SizableText id={attachId} size="$2" fontFamily="$body">
          {t("sections.integration.attachLabel")}
        </SizableText>
        <BrewSelect
          value={selectedSessionId}
          onValueChange={(v) => setAttachSessionByDeviceId((prev) => ({ ...prev, [device.id]: v }))}
          options={brewSessionOptions}
          placeholder={t("sections.integration.attachPlaceholder")}
          aria-labelledby={attachId}
          disabled={working}
          width="full"
        />
        <Button onPress={() => { void attachDevice(device.id); }} disabled={working || !selectedSessionId}>
          {t("sections.integration.attach")}
        </Button>
        <Button onPress={() => { void detachDevice(device.id); }} disabled={working || !active}>
          {t("sections.integration.detach")}
        </Button>
      </XStack>
    </YStack>
  );
}
