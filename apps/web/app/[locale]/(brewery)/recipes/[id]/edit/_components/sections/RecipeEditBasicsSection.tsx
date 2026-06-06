import {Button, Input, SizableText, View, XStack, YStack} from "tamagui";

import {CodeInline} from "../../../../../../../_shell/_components/CodeInline";
import {BrewSelect} from "../../../../../_components/BrewSelect";
import {ErrorBox, RecipeEditField, RecipeEditSection} from "../../../../../_components/recipe-edit";
import type {RecipeEditPageModel} from "../../_hooks/useRecipeEditPage";

export function RecipeEditBasicsSection({ model }: { model: RecipeEditPageModel }) {
  const {
    t,
    openSections,
    setSectionOpen,
    saving,
    recipe,
    versions,
    versionsError,
    creatingVersion,
    createVersionError,
    duplicatingRecipe,
    duplicateRecipeError,
    name,
    setName,
    styleKey,
    setStyleKey,
    styles,
    stylesLoading,
    stylesError,
    canCallAccountScoped,
    onSave,
    onCreateAnotherVersion,
    onDuplicateRecipe
  } = model;

  return (
          <RecipeEditSection
            id="basics"
            headingId="basics-heading"
            label={t("sections.basics")}
            open={openSections['basics']}
            onOpenChange={(open) => setSectionOpen("basics", open)}
          >
            <XStack
              gap="$3"
              mt="$2"
              flexWrap="wrap"
              $gtNarrow={{ flexWrap: "nowrap" }}
            >
              <View flex={1} minW={200}>
                <RecipeEditField id="recipe-name" label="Name">
                  <XStack gap="$2" items="center" flexWrap="wrap">
                    <Input
                      id="recipe-name"
                      value={name}
                      onChangeText={setName}
                      size="$3"
                      flex={1}
                      minW={180}
                      bg="var(--surface)"
                      borderWidth={1}
                      borderColor="var(--border)"
                      rounded="$2"
                      fontFamily="$body"
                    />
                    <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                      {t("versionLabel")}{" "}
                      <SizableText
                        size="$2"
                        color="var(--text-muted)"
                        fontFamily="$body"
                        fontWeight="bold"
                        as="span"
                      >
                        {typeof recipe?.version === "number"
                          ? String(recipe.version).padStart(2, "0")
                          : "—"}
                      </SizableText>
                    </SizableText>
                  </XStack>
                </RecipeEditField>
              </View>
              <View flex={1} minW={200}>
                <RecipeEditField id="recipe-style" label="Style">
                  <BrewSelect
                    id="recipe-style"
                    value={styleKey}
                    onValueChange={setStyleKey}
                    options={styles.map((s) => ({
                      value: s.key,
                      label: s.key === "custom" ? s.name : `${s.code} — ${s.name}`,
                    }))}
                    disabled={stylesLoading || styles.length === 0}
                    width="full"
                  />
                {stylesError ? (
                  <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$1.5">
                    {String(stylesError)}
                  </SizableText>
                ) : null}
                </RecipeEditField>
              </View>
            </XStack>

            <YStack gap="$2" mt="$3">
              <XStack gap="$3" items="center" flexWrap="wrap">
                <Button
                  onPress={() => { void onSave(); }}
                  disabled={!canCallAccountScoped || saving}
                  size="$3"
                  bg="var(--surface-2)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  color="var(--text)"
                  fontFamily="$body"
                >
                  {saving ? "Saving…" : "Save"}
                </Button>
                {recipe ? (
                  <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                    Updated: <CodeInline>{recipe.updatedAt}</CodeInline>
                  </SizableText>
                ) : null}
              </XStack>
            </YStack>

            <YStack gap="$2" mt="$3">
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
                {t("versionCreateNote")}
              </SizableText>
              <Button
                onPress={() => { void onCreateAnotherVersion(); }}
                disabled={
                  !canCallAccountScoped ||
                  creatingVersion ||
                  (Array.isArray(versions) && versions.some((v) => v.version >= 99))
                }
                size="$3"
                bg="var(--surface-2)"
                borderWidth={1}
                borderColor="var(--border)"
                color="var(--text)"
                fontFamily="$body"
              >
                {creatingVersion ? t("versionCreateWorking") : t("versionCreateButton")}
              </Button>
              {Array.isArray(versions) && versions.some((v) => v.version >= 99) ? (
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
                  {t("versionLimitReached")}
                </SizableText>
              ) : null}
              {(versionsError || createVersionError) ? (
                <ErrorBox mt="$1.5">
                  {createVersionError ? createVersionError : versionsError}
                </ErrorBox>
              ) : null}
            </YStack>

            <YStack gap="$2" mt="$3">
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
                {t("duplicateRecipeNote")}
              </SizableText>
              <Button
                onPress={() => { void onDuplicateRecipe(); }}
                disabled={!canCallAccountScoped || duplicatingRecipe}
                size="$3"
                bg="var(--surface-2)"
                borderWidth={1}
                borderColor="var(--border)"
                color="var(--text)"
                fontFamily="$body"
              >
                {duplicatingRecipe ? t("duplicateRecipeWorking") : t("duplicateRecipeButton")}
              </Button>
              {duplicateRecipeError ? (
                <ErrorBox mt="$1.5">{duplicateRecipeError}</ErrorBox>
              ) : null}
            </YStack>
          </RecipeEditSection>
  );
}
