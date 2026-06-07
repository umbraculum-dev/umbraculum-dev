import React from "react";
import { Modal, Pressable, View } from "react-native";
import type { RouteRef } from "@umbraculum/navigation";
import { locales, type SupportedLocale } from "@umbraculum/i18n";
import { Button, Card, Heading, Text } from "@umbraculum/ui";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { AdSlot } from "../../components/AdSlot";
import type { AuthContextValue } from "../../auth/AuthProvider";
import type { RootStackParamList, TabParamList } from "../../navigation/types";

export function DashboardScreenTopAd() {
  return <AdSlot placement="global_top" />;
}

type DashboardNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, "Dashboard">,
  NativeStackNavigationProp<RootStackParamList>
>;

export function DashboardScreenSections(props: {
  t: (key: string) => string;
  tNav: (key: string) => string;
  tCommon: (key: string) => string;
  tLocales: (key: string) => string;
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  navigation: DashboardNavigationProp;
  auth: AuthContextValue;
  links: readonly { key: string; label: string; route: RouteRef }[];
  breweryLinks: readonly { key: string; label: string; route: RouteRef }[];
  openWeb: (route: RouteRef) => Promise<void>;
  openWebState: { status: "idle" | "opening"; error?: string };
  languagePickerOpen: boolean;
  setLanguagePickerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const {
    t,
    tNav,
    tCommon,
    tLocales,
    locale,
    setLocale,
    navigation,
    auth,
    links,
    breweryLinks,
    openWeb,
    openWebState,
    languagePickerOpen,
    setLanguagePickerOpen,
  } = props;

  return (
    <>
      <Card gap="$2" aria-label={t("importExport.title")}>
        <Heading fontSize={18}>{t("importExport.title")}</Heading>
        <Text fontSize={12} opacity={0.85}>
          {t("importExport.supportedNote")}
        </Text>
        <Text fontSize={12} opacity={0.85}>
          {t("importExport.actionsLiveInRecipes")}
        </Text>
        <Button
          onPress={() => navigation.navigate("Recipes")}
          accessibilityRole="button"
          accessibilityLabel={t("importExport.actionsCta")}
        >
          <Text>{t("importExport.actionsCta")}</Text>
        </Button>
        {openWebState.error ? (
          <Text color="$red10" fontSize={12}>
            {openWebState.error}
          </Text>
        ) : null}
      </Card>

      <Card gap="$2" aria-label={t("links.title")}>
        <Heading fontSize={18}>{t("links.title")}</Heading>
        <View style={{ gap: 8, marginTop: 4 }}>
          {links.map((l) => (
            <Button
              key={l.key}
              onPress={() =>
                l.key === "waterProfiles"
                  ? navigation.navigate("WaterProfiles")
                  : l.key === "fermDataIntegration"
                    ? navigation.navigate("FermDataIntegration")
                    : l.key === "brewdayStepsSettings"
                      ? navigation.navigate("BrewdayStepsSettings")
                      : l.key === "ai"
                        ? navigation.navigate("Ai")
                        : void openWeb(l.route)
              }
              accessibilityRole="button"
              accessibilityLabel={l.label}
            >
              <Text>{l.label}</Text>
            </Button>
          ))}
          <Button
            onPress={() => navigation.navigate("About")}
            accessibilityRole="button"
            accessibilityLabel={tNav("about")}
          >
            <Text>{tNav("about")}</Text>
          </Button>
        </View>
      </Card>

      <Card gap="$2" aria-label={t("links.brewery")}>
        <Heading fontSize={18}>{t("links.brewery")}</Heading>
        <View style={{ gap: 8, marginTop: 4 }}>
          {breweryLinks.map((l) => (
            <Button
              key={l.key}
              onPress={() =>
                l.key === "equipment"
                  ? navigation.navigate("Equipment")
                  : void openWeb(l.route)
              }
              accessibilityRole="button"
              accessibilityLabel={l.label}
            >
              <Text>{l.label}</Text>
            </Button>
          ))}
        </View>
      </Card>

      <Card gap="$2" aria-label={tNav("language")}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Text fontSize={14}>
            {tCommon("localeLabel")}: {tLocales(locale)}
          </Text>
          <Button
            onPress={() => setLanguagePickerOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={tCommon("toggleLanguage")}
          >
            <Text>{tCommon("changeLanguage")}</Text>
          </Button>
        </View>
      </Card>

      <Modal
        visible={languagePickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setLanguagePickerOpen(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" }}
          onPress={() => setLanguagePickerOpen(false)}
          accessibilityRole="button"
          accessibilityLabel={tCommon("close")}
        >
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: "#141820",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              padding: 16,
              borderTopWidth: 1,
              borderTopColor: "#2a2f3a",
            }}
            accessibilityRole="none"
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <Heading fontSize={18}>{tNav("language")}</Heading>
              <Button
                onPress={() => setLanguagePickerOpen(false)}
                accessibilityRole="button"
                accessibilityLabel={tCommon("close")}
              >
                <Text>{tCommon("close")}</Text>
              </Button>
            </View>

            <View style={{ gap: 10, marginTop: 12 }}>
              {(locales as readonly SupportedLocale[]).map((l) => {
                const selected = l === locale;
                return (
                  <Button
                    key={l}
                    onPress={() => {
                      setLocale(l);
                      setLanguagePickerOpen(false);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={tLocales(l)}
                    background={selected ? "$color4" : "$background"}
                    borderWidth={1}
                    borderColor="$borderColor"
                  >
                    <Text fontWeight={selected ? "700" : "400"}>
                      {tLocales(l)}
                      {selected ? " ✓" : ""}
                    </Text>
                  </Button>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Button
        onPress={() => void auth.logout()}
        accessibilityRole="button"
        accessibilityLabel={tNav("logout")}
      >
        <Text>{tNav("logout")}</Text>
      </Button>

      <AdSlot placement="global_bottom" />
    </>
  );
}
