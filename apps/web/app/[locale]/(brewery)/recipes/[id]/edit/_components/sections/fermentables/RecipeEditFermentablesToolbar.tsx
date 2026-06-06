import {Button, Input, SizableText, View, XStack, YStack} from "tamagui";

import {ErrorBox, RecipeEditFieldLabel} from "../../../../../../../../_components/recipe-edit";
import type {RecipeEditPageModel} from "../../../_hooks/useRecipeEditPage";

export function RecipeEditFermentablesToolbar({model}: {model: RecipeEditPageModel}) {
  const {
    t,
    fermentableQuery,
    setFermentableQuery,
    fermentableResults,
    fermentableSearching,
    fermentableSearchError,
    fermentableAddMessage,
    canCallAccountScoped,
    addGristRow,
    addFermentableFromDb,
    onSearchFermentables,
    clearFermentableSearchResults,
  } = model;

  return (
    <>
      <View mt="$3">
        <form onSubmit={(...a) => { void onSearchFermentables(...(a as Parameters<typeof onSearchFermentables>)); }}>
          <RecipeEditFieldLabel htmlFor="fermentable-search">
            Search fermentables database
          </RecipeEditFieldLabel>
          <XStack gap="$2" items="center" flexWrap="wrap">
            <Input
              id="fermentable-search"
              value={fermentableQuery}
              onChangeText={setFermentableQuery}
              flex={1}
              minW={200}
              autoComplete="off"
              size="$3"
              w="100%"
              bg="var(--surface)"
              borderWidth={1}
              borderColor="var(--border)"
              rounded="$2"
              fontFamily="$body"
            />
            <Button
              type="submit"
              disabled={!canCallAccountScoped || fermentableSearching}
              size="$3"
              bg="var(--surface-2)"
              borderWidth={1}
              borderColor="var(--border)"
              color="var(--text)"
              fontFamily="$body"
            >
              {fermentableSearching ? "Searching…" : "Search"}
            </Button>
            <Button
              type="button"
              onPress={clearFermentableSearchResults}
              disabled={fermentableSearching || (!fermentableSearchError && fermentableResults.length === 0)}
              size="$3"
              bg="var(--surface-2)"
              borderWidth={1}
              borderColor="var(--border)"
              color="var(--text)"
              fontFamily="$body"
            >
              {t("buttons.clear")}
            </Button>
          </XStack>
          {fermentableSearchError ? (
            <ErrorBox mt="$2">{fermentableSearchError}</ErrorBox>
          ) : null}
          {fermentableResults.length ? (
            <View overflowX="auto" mt="$2">
              <YStack gap="$1">
                <XStack gap="$2" ai="center" minW="max-content">
                  <View minW={140}><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">Name</SizableText></View>
                  <View minW={100}><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">Producer</SizableText></View>
                  <View minW={50} jc="flex-end"><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)" textAlign="right" width="100%">°L</SizableText></View>
                  <View minW={70} jc="flex-end"><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)" textAlign="right" width="100%">Yield %</SizableText></View>
                  <View minW={60} jc="flex-end"><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)" textAlign="right" width="100%">PPG</SizableText></View>
                  <View minW={60} />
                </XStack>
                {fermentableResults.slice(0, 20).map((it) => (
                  <XStack key={it.id} gap="$2" ai="center" minW="max-content">
                    <View minW={140}><SizableText size="$2" fontFamily="$body" color="var(--text)">{it.name}</SizableText></View>
                    <View minW={100}><SizableText size="$2" fontFamily="$body" color="var(--text)">{it.producer ?? ""}</SizableText></View>
                    <View minW={50}><SizableText size="$2" fontFamily="$body" color="var(--text)" textAlign="right">{typeof it.colorLovibond === "number" ? it.colorLovibond.toFixed(1) : ""}</SizableText></View>
                    <View minW={70}><SizableText size="$2" fontFamily="$body" color="var(--text)" textAlign="right">{typeof it.yieldPercent === "number" ? it.yieldPercent.toFixed(3) : ""}</SizableText></View>
                    <View minW={60}><SizableText size="$2" fontFamily="$body" color="var(--text)" textAlign="right">{typeof it.ppg === "number" ? it.ppg.toFixed(3) : ""}</SizableText></View>
                    <View minW={60}>
                      <Button
                        size="$2"
                        bg="var(--surface-2)"
                        borderWidth={1}
                        borderColor="var(--border)"
                        color="var(--text)"
                        fontFamily="$body"
                        onPress={() => addFermentableFromDb(it)}
                        disabled={!canCallAccountScoped}
                      >
                        Add
                      </Button>
                    </View>
                  </XStack>
                ))}
              </YStack>
            </View>
          ) : null}
        </form>
      </View>

      {fermentableAddMessage ? (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" aria-live="polite" mt="$2">
          {fermentableAddMessage}
        </SizableText>
      ) : null}

      <YStack gap="$2" mt="$3">
        <XStack gap="$3" items="center" flexWrap="wrap" mt="$1">
          <Button
            size="$3"
            bg="var(--surface-2)"
            borderWidth={1}
            borderColor="var(--border)"
            color="var(--text)"
            fontFamily="$body"
            onPress={addGristRow}
            disabled={!canCallAccountScoped}
          >
            {t("buttons.addCustomFermentable")}
          </Button>
        </XStack>
      </YStack>
    </>
  );
}
