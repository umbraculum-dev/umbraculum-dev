import {Button, Input, SizableText, View, XStack, YStack} from "tamagui";

import {ErrorBox, RecipeEditFieldLabel} from "../../../../../_components/recipe-edit";
import type {RecipeEditPageModel} from "../../_hooks/useRecipeEditPage";

export function RecipeEditHopsSearch({ model }: { model: RecipeEditPageModel }) {
  const {
    t,
    hopQuery,
    setHopQuery,
    hopResults,
    hopSearching,
    hopSearchError,
    canCallAccountScoped,
    addHopFromDb,
    onSearchHops,
    clearHopSearchResults
  } = model;

  return (
            <View mt="$3">
              <form onSubmit={(...a) => { void onSearchHops(...(a as Parameters<typeof onSearchHops>)); }}>
                <RecipeEditFieldLabel htmlFor="hop-search">Search hops database</RecipeEditFieldLabel>
              <XStack gap="$2" items="center" flexWrap="wrap">
                <Input
                  id="hop-search"
                  value={hopQuery}
                  onChangeText={setHopQuery}
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
                  disabled={!canCallAccountScoped || hopSearching}
                  size="$3"
                  bg="var(--surface-2)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  color="var(--text)"
                  fontFamily="$body"
                >
                  {hopSearching ? "Searching…" : "Search"}
                </Button>
                <Button
                  size="$3"
                  bg="var(--surface-2)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  color="var(--text)"
                  fontFamily="$body"
                  onPress={clearHopSearchResults}
                  disabled={hopSearching || (!hopSearchError && hopResults.length === 0)}
                >
                  {t("buttons.clear")}
                </Button>
              </XStack>
              {hopSearchError ? <ErrorBox mt="$2">{hopSearchError}</ErrorBox> : null}
              {hopResults.length ? (
                <View overflowX="auto" mt="$2">
                  <YStack gap="$1">
                    <XStack gap="$2" ai="center" minW="max-content">
                      <View minW={180}><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">Name</SizableText></View>
                      <View minW={80}><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">Country</SizableText></View>
                      <View minW={60}><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">α min</SizableText></View>
                      <View minW={60}><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">α max</SizableText></View>
                      <View minW={60} />
                    </XStack>
                    {hopResults.slice(0, 20).map((it) => (
                      <XStack key={it.id} gap="$2" ai="center" minW="max-content">
                        <View minW={180}><SizableText size="$2" fontFamily="$body" color="var(--text)">{it.name}</SizableText></View>
                        <View minW={80}><SizableText size="$2" fontFamily="$body" color="var(--text)">{it.country ?? ""}</SizableText></View>
                        <View minW={60}><SizableText size="$2" fontFamily="$body" color="var(--text)" textAlign="right">{typeof it.alphaMin === "number" ? it.alphaMin.toFixed(1) : ""}</SizableText></View>
                        <View minW={60}><SizableText size="$2" fontFamily="$body" color="var(--text)" textAlign="right">{typeof it.alphaMax === "number" ? it.alphaMax.toFixed(1) : ""}</SizableText></View>
                        <View minW={60}>
                          <Button
                            size="$2"
                            bg="var(--surface-2)"
                            borderWidth={1}
                            borderColor="var(--border)"
                            color="var(--text)"
                            fontFamily="$body"
                            onPress={() => addHopFromDb(it)}
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
  );
}
