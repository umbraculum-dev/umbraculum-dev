"use client";

import { Accordion, Button, H2, Input, SizableText, View, XStack, YStack } from "tamagui";

import { BrewSelect } from "../../../../_components/BrewSelect";
import { ErrorBox, RecipeEditFieldLabel } from "../../../../_components/recipe-edit";
import type { useWaterProfilesPage } from "../_hooks/useWaterProfilesPage";

type Model = ReturnType<typeof useWaterProfilesPage>;

export function WaterProfileCreateForm(props: { model: Model }) {
  const {
    t,
    tUnits,
    openSections,
    createName,
    setCreateName,
    createScope,
    setCreateScope,
    createType,
    setCreateType,
    createPh,
    setCreatePh,
    createIon,
    setCreateIon,
    createError,
    createSubmitting,
    onCreateProfile,
  } = props.model;

  return (
    <Accordion.Item value="admin" mt="$3">
      <View className="brew-panel" aria-labelledby="admin-profiles-heading">
        <Accordion.Header>
          <Accordion.Trigger unstyled cursor="pointer">
            <XStack alignItems="center" justifyContent="space-between" width="100%">
              <H2 id="admin-profiles-heading" mt={0}>
                {t("adminAddTitle")}
              </H2>
              <SizableText size="$2" opacity={0.7}>
                {openSections.includes("admin") ? "▾" : "▸"}
              </SizableText>
            </XStack>
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
            {t("createdProfilesStartUnverified")}
          </SizableText>

          <form onSubmit={(...a) => { void onCreateProfile(...(a as Parameters<typeof onCreateProfile>)); }} aria-describedby={createError ? "create-error" : undefined}>
            <XStack gap="$3" flexWrap="wrap" ai="flex-end">
              <View width="100%" flexBasis="100%">
                <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="create-name">Profile name</RecipeEditFieldLabel>
                  <Input
                    id="create-name"
                    value={createName}
                    onChangeText={setCreateName}
                    size="$3"
                    w="100%"
                    bg="var(--surface)"
                    borderWidth={1}
                    borderColor="var(--border)"
                    rounded="$2"
                    fontFamily="$body"
                    required
                  />
                </YStack>
              </View>
              <View flex={1} minWidth={200}>
                <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="create-scope">Scope</RecipeEditFieldLabel>
                  <BrewSelect
                    id="create-scope"
                    value={createScope}
                    onValueChange={(v) => setCreateScope(v as "account" | "public")}
                    options={[
                      { value: "public", label: "Public" },
                      { value: "account", label: "Account" },
                    ]}
                    width="full"
                  />
                </YStack>
              </View>
              <View flex={1} minWidth={200}>
                <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="create-type">Type</RecipeEditFieldLabel>
                  <BrewSelect
                    id="create-type"
                    value={createType}
                    onValueChange={(v) => setCreateType(v as "water" | "dilution")}
                    options={[
                      { value: "water", label: "Water" },
                      { value: "dilution", label: "Dilution" },
                    ]}
                    width="full"
                  />
                </YStack>
              </View>
              <View width="100%" flexBasis="100%">
                <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="create-ph">pH (optional)</RecipeEditFieldLabel>
                  <Input
                    id="create-ph"
                    keyboardType="decimal-pad"
                    value={createPh}
                    onChangeText={setCreatePh}
                    size="$3"
                    w="100%"
                    bg="var(--surface)"
                    borderWidth={1}
                    borderColor="var(--border)"
                    rounded="$2"
                    fontFamily="$body"
                    placeholder={t("phPlaceholder")}
                  />
                </YStack>
              </View>
            </XStack>

            <fieldset className="brew-fieldset-noborder">
              <legend className="brew-fieldset-legend">
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" as="span">
                  {t("ionsLegend", { unit: tUnits("ppm") })}
                </SizableText>
              </legend>
              <XStack gap="$3" flexWrap="wrap" ai="flex-end">
                {(
                  [
                    ["calcium", "Calcium (Ca)"],
                    ["magnesium", "Magnesium (Mg)"],
                    ["sodium", "Sodium (Na)"],
                    ["sulfate", "Sulfate (SO4)"],
                    ["chloride", "Chloride (Cl)"],
                    ["bicarbonate", "Bicarbonate (HCO3)"],
                  ] as const
                ).map(([k, label]) => (
                  <View key={k} flex={1} minWidth={180}>
                    <YStack gap="$1.5">
                      <RecipeEditFieldLabel htmlFor={`ion-${k}`}>{label}</RecipeEditFieldLabel>
                      <Input
                        id={`ion-${k}`}
                        keyboardType="decimal-pad"
                        value={String((createIon as Record<string, number>)[k])}
                        onChangeText={(text) => setCreateIon((prev) => ({ ...prev, [k]: Number(text) || 0 }))}
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
                ))}
              </XStack>
            </fieldset>

            <XStack gap="$3" mt="$3" alignItems="center">
              <Button as="button" type="submit" size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" disabled={!createName.trim() || createSubmitting}>
                {createSubmitting ? "Creating…" : "Create profile"}
              </Button>
            </XStack>

            {createError ? (
              <ErrorBox id="create-error" mt="$3">{createError}</ErrorBox>
            ) : null}
          </form>
        </Accordion.Content>
      </View>
    </Accordion.Item>
  );
}
