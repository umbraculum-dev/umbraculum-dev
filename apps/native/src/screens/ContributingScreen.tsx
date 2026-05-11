import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import { useT } from "@brewery/i18n-react";
import { Button, Card, Heading, Screen, Text } from "@brewery/ui";

// See comment in BrewdayStepsSettingsScreen.tsx: Tamagui v2 RC omits a few
// runtime-valid Button props from its TS surface. Local cast preserves the
// existing collapsible-section-header pattern without weakening shared types.
const SectionToggleButton = Button as unknown as React.ComponentType<
  React.ComponentProps<typeof Button> & {
    chromeless?: boolean;
    width?: number | string;
    justifyContent?: string;
  }
>;

type Topic = "i18n" | "raw-materials" | null;

function parseTopic(v: unknown): Topic {
  if (v === "i18n") return "i18n";
  if (v === "raw-materials") return "raw-materials";
  return null;
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: "row", gap: 8 }}>
      <Text fontSize={12} opacity={0.85}>
        {"•"}
      </Text>
      <View style={{ flex: 1 }}>
        <Text fontSize={12} opacity={0.85}>
          {children}
        </Text>
      </View>
    </View>
  );
}

export function ContributingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();

  const { t } = useT("contributing");
  const { t: tI18n } = useT("i18nContributing");

  const topic = useMemo(() => parseTopic((route.params as any)?.topic), [route.params]);
  const [openI18n, setOpenI18n] = useState(false);
  const [openRawMaterials, setOpenRawMaterials] = useState(false);

  useEffect(() => {
    navigation.setOptions({ headerTitle: t("title") });
  }, [navigation, t]);

  useEffect(() => {
    if (topic === "i18n") {
      setOpenI18n(true);
      setOpenRawMaterials(false);
      return;
    }
    if (topic === "raw-materials") {
      setOpenI18n(false);
      setOpenRawMaterials(true);
      return;
    }
    setOpenI18n(false);
    setOpenRawMaterials(false);
  }, [topic]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <View style={{ gap: 12 }}>
          <Text fontSize={14} opacity={0.85}>
            {t("subtitle")}
          </Text>

          <Card gap="$2">
            <SectionToggleButton
              chromeless
              size="$3"
              onPress={() => setOpenI18n((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel={t("sections.i18n.title")}
              width="100%"
              justifyContent="space-between"
            >
              <Heading fontSize={18}>{t("sections.i18n.title")}</Heading>
              <Text opacity={0.7}>{openI18n ? "▾" : "▸"}</Text>
            </SectionToggleButton>

            {openI18n ? (
              <View style={{ gap: 10 }}>
                <Text fontSize={12} opacity={0.8}>
                  {tI18n("subtitle")}
                </Text>

                <Heading fontSize={16}>{tI18n("howItWorksTitle")}</Heading>
                <View style={{ gap: 6 }}>
                  <Bullet>{tI18n("howItWorks1")}</Bullet>
                  <Bullet>
                    {tI18n("howItWorks2Prefix")}{" "}
                    <Text fontSize={12} opacity={0.9}>
                      packages/i18n/src/en.json
                    </Text>{" "}
                    {tI18n("howItWorks2Middle")}{" "}
                    <Text fontSize={12} opacity={0.9}>
                      packages/i18n/src/it.json
                    </Text>
                    .
                  </Bullet>
                  <Bullet>{tI18n("howItWorks3")}</Bullet>
                </View>

                <Heading fontSize={16}>{tI18n("recommendedToolTitle")}</Heading>
                <Text fontSize={12} opacity={0.85}>
                  {tI18n("recommendedToolBody")}
                </Text>
                <View style={{ gap: 6 }}>
                  <Bullet>{tI18n("recommendedTool1")}</Bullet>
                  <Bullet>{tI18n("recommendedTool2")}</Bullet>
                </View>

                <Heading fontSize={16}>{tI18n("githubFallbackTitle")}</Heading>
                <Text fontSize={12} opacity={0.8}>
                  {tI18n("githubFallbackBody")}
                </Text>

                <Heading fontSize={16}>{tI18n("rulesTitle")}</Heading>
                <View style={{ gap: 6 }}>
                  <Bullet>{tI18n("rule1", { url: "{url}" })}</Bullet>
                  <Bullet>{tI18n("rule2")}</Bullet>
                  <Bullet>{tI18n("rule3")}</Bullet>
                </View>
              </View>
            ) : null}
          </Card>

          <Card gap="$2">
            <SectionToggleButton
              chromeless
              size="$3"
              onPress={() => setOpenRawMaterials((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel={t("sections.rawMaterials.title")}
              width="100%"
              justifyContent="space-between"
            >
              <Heading fontSize={18}>{t("sections.rawMaterials.title")}</Heading>
              <Text opacity={0.7}>{openRawMaterials ? "▾" : "▸"}</Text>
            </SectionToggleButton>

            {openRawMaterials ? (
              <View style={{ gap: 10 }}>
                <Text fontSize={12} opacity={0.8}>
                  {t("sections.rawMaterials.subtitle")}
                </Text>
                <View style={{ gap: 6 }}>
                  <Bullet>{t("sections.rawMaterials.step1")}</Bullet>
                  <Bullet>{t("sections.rawMaterials.step2")}</Bullet>
                  <Bullet>{t("sections.rawMaterials.step3")}</Bullet>
                </View>
                <Text fontSize={12} opacity={0.8}>
                  {t("sections.rawMaterials.issueTemplateNote")}
                </Text>
              </View>
            ) : null}
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}

