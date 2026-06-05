import { BrewSelect } from "../../../../_components/BrewSelect";
import { ErrorBox, RecipeEditFieldLabel } from "../../../../_components/recipe-edit";
import { BrewAccordionSection } from "../../../../_components/BrewAccordionSection";
import { Button, Input, SizableText, View, XStack, YStack } from "tamagui";

import type { useRecipesPage } from "../../_hooks/useRecipesPage";

type RecipesPageModel = ReturnType<typeof useRecipesPage>;

export function RecipesCreateSection({ model }: { model: RecipesPageModel }) {
  const {
    t,
    openSections,
    canCall,
    newName,
    setNewName,
    newStyleKey,
    setNewStyleKey,
    styles,
    stylesLoading,
    stylesError,
    creating,
    loading,
    error,
    onCreate,
    refresh,
  } = model;

  return (
    <BrewAccordionSection
      value="create"
      headingId="recipes-create-heading"
      title={t("createTitle")}
      open={openSections.includes("create")}
    >
      <form
        onSubmit={(...a) => {
          void onCreate(...(a as Parameters<typeof onCreate>));
        }}
      >
        <XStack gap="$3" flexWrap="wrap" ai="flex-end">
          <View flex={1} minWidth={200}>
            <YStack gap="$1.5">
              <RecipeEditFieldLabel htmlFor="recipe-name">{t("nameLabel")}</RecipeEditFieldLabel>
              <Input
                id="recipe-name"
                value={newName}
                onChangeText={setNewName}
                required
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
          <YStack gap="$1.5">
            <RecipeEditFieldLabel htmlFor="recipe-style">{t("styleLabel")}</RecipeEditFieldLabel>
            <BrewSelect
              id="recipe-style"
              value={newStyleKey}
              onValueChange={setNewStyleKey}
              options={[
                { value: "", label: stylesLoading ? t("stylesLoading") : t("stylePlaceholder") },
                ...styles.map((s) => ({
                  value: s.key,
                  label: s.key === "custom" ? s.name : `${s.code} — ${s.name}`,
                })),
              ]}
              disabled={!canCall || stylesLoading || styles.length === 0}
              width="full"
            />
            {stylesError ? (
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$1.5">
                {String(stylesError)}
              </SizableText>
            ) : null}
          </YStack>
        </XStack>
        <XStack gap="$3" mt="$3" alignItems="center">
          <Button
            as="button"
            type="submit"
            size="$3"
            bg="var(--surface-2)"
            borderWidth={1}
            borderColor="var(--border)"
            color="var(--text)"
            disabled={!canCall || creating || !newName.trim() || !newStyleKey.trim()}
          >
            {creating ? t("creating") : t("createButton")}
          </Button>
          <Button
            size="$3"
            bg="var(--surface-2)"
            borderWidth={1}
            borderColor="var(--border)"
            color="var(--text)"
            onPress={() => void refresh()}
            disabled={!canCall || loading}
          >
            {loading ? t("refreshing") : t("refresh")}
          </Button>
        </XStack>
      </form>
      {error ? <ErrorBox mt="$3">{error}</ErrorBox> : null}
    </BrewAccordionSection>
  );
}
