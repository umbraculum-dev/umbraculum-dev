"use client";

import { SizableText, YStack } from "tamagui";

import { CodeInline } from "../../../../../_shell/_components/CodeInline";
import type { UseFermDataIntegrationPageModel } from "../../_hooks/useFermDataIntegrationPage";
import { FermIntegrationChartSection } from "./FermIntegrationChartSection";
import { FermIntegrationSessionsSection } from "./FermIntegrationSessionsSection";

type Model = UseFermDataIntegrationPageModel;

export function FermIntegrationDevicesSection(props: { model: Model }) {
  const { model } = props;
  const { t, tiltDevices, deviceWorkingId } = model;

  return (
    <YStack gap="$2" mt="$3">
      <SizableText size="$3" fontFamily="$body">
        {t("sections.integration.devicesTitle")}
      </SizableText>

      {!tiltDevices.length ? (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("sections.integration.noDevices")}
        </SizableText>
      ) : (
        <YStack gap="$2">
          {tiltDevices.map((d) => {
            const working = deviceWorkingId === d.id;
            const last = d.lastReading ?? null;
            const recentReadings = Array.isArray(d.recentReadings) ? d.recentReadings : [];

            return (
              <YStack
                key={d.id}
                gap="$2"
                p="$3"
                borderWidth={1}
                borderColor="var(--border)"
                borderRadius="$3"
                backgroundColor="var(--surface)"
              >
                <YStack gap="$1">
                  <SizableText size="$3" fontFamily="$body">
                    {d.displayName ? `${t("sections.integration.device")} ${d.displayName}` : t("sections.integration.device")}
                  </SizableText>
                  <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                    {t("sections.integration.deviceKey")}: <CodeInline>{d.deviceKey}</CodeInline>
                  </SizableText>
                </YStack>

                {last ? (
                  <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                    {t("sections.integration.lastReading")}:{" "}
                    <CodeInline>
                      {typeof last.temperatureC === "number" ? `${last.temperatureC.toFixed(2)} °C` : "—"},{" "}
                      {typeof last.gravitySg === "number" ? `SG ${last.gravitySg.toFixed(3)}` : "—"}
                    </CodeInline>
                  </SizableText>
                ) : (
                  <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                    {t("sections.integration.noReadingsYet")}
                  </SizableText>
                )}

                <FermIntegrationChartSection model={model} recentReadings={recentReadings} />

                <FermIntegrationSessionsSection model={model} device={d} working={working} />
              </YStack>
            );
          })}
        </YStack>
      )}
    </YStack>
  );
}
