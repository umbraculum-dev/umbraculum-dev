import {ScrollView, View} from "react-native";
import {Button, Text} from "@umbraculum/ui";

import {Input} from "../../../../../../components/AppInput";
import type {RecipeEditScreenModel} from "../../../../hooks/useRecipeEditScreen";

export function RecipeEditFermentablesSearchSection({ model }: { model: RecipeEditScreenModel }) {
  const {
    t,
    fermentableQuery,
    setFermentableQuery,
    fermentableResults,
    setFermentableResults,
    fermentableSearching,
    fermentableSearchError,
    searchFermentables,
    addFermentableFromDb,
    addGristRow,
  } = model;

  return (
    <>
      <Text fontSize={12} opacity={0.8} mb="$2">
        Enter your grist here.
      </Text>
      <View style={{ gap: 8, marginBottom: 12 }}>
        <Input
          value={fermentableQuery}
          onChangeText={setFermentableQuery}
          placeholder="Search fermentables"
          size="$3"
          background="$background"
          borderWidth={1}
          borderColor="$borderColor"
        />
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Button onPress={() => void searchFermentables()} disabled={fermentableSearching} size="$3">
            <Text>{fermentableSearching ? "Searching…" : "Search"}</Text>
          </Button>
          <Button
            onPress={() => {
              setFermentableQuery("");
              setFermentableResults([]);
            }}
            disabled={fermentableSearching}
            size="$3"
            chromeless
          >
            <Text>{t("buttons.clear")}</Text>
          </Button>
        </View>
      </View>
      {fermentableSearchError ? (
        <Text fontSize={12} color="$red10" mb="$2">
          {fermentableSearchError}
        </Text>
      ) : null}
      {fermentableResults.length > 0 ? (
        <ScrollView horizontal style={{ marginBottom: 12 }} showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            {fermentableResults.slice(0, 20).map((it) => (
              <Button
                key={it.id}
                onPress={() => addFermentableFromDb(it)}
                size="$2"
                background="$background"
                borderWidth={1}
                borderColor="$borderColor"
              >
                <Text fontSize={12}>
                  {it.name} {it.producer ? `(${it.producer})` : ""} — Add
                </Text>
              </Button>
            ))}
          </View>
        </ScrollView>
      ) : null}
      <View style={{ marginTop: 8 }}>
        <Button onPress={addGristRow} size="$3" background="$background" borderWidth={1} borderColor="$borderColor">
          <Text>{t("buttons.addCustomFermentable")}</Text>
        </Button>
      </View>
    </>
  );
}
