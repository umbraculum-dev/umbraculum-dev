import {ScrollView, View} from "react-native";
import {Button, Text} from "@umbraculum/ui";

import { Input } from "@umbraculum/native-shell/components";
import type {RecipeEditScreenModel} from "../../../../hooks/useRecipeEditScreen";

export function RecipeEditHopsSearchSection({ model }: { model: RecipeEditScreenModel }) {
  const {
    t,
    hopQuery,
    setHopQuery,
    hopResults,
    setHopResults,
    hopSearching,
    hopSearchError,
    searchHops,
    addHopFromDb,
    addHopRow,
  } = model;

  return (
    <>
      <Text fontSize={12} opacity={0.8} mb="$2">
        {t("hopsHelp")}
      </Text>
      <View style={{ gap: 8, marginBottom: 12 }}>
        <Input
          value={hopQuery}
          onChangeText={setHopQuery}
          placeholder="Search hops"
          size="$3"
          background="$background"
          borderWidth={1}
          borderColor="$borderColor"
        />
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Button onPress={() => void searchHops()} disabled={hopSearching} size="$3">
            <Text>{hopSearching ? "Searching…" : "Search"}</Text>
          </Button>
          <Button
            onPress={() => {
              setHopQuery("");
              setHopResults([]);
            }}
            disabled={hopSearching}
            size="$3"
            chromeless
          >
            <Text>{t("buttons.clear")}</Text>
          </Button>
        </View>
      </View>
      {hopSearchError ? (
        <Text fontSize={12} color="$red10" mb="$2">
          {hopSearchError}
        </Text>
      ) : null}
      {hopResults.length > 0 ? (
        <ScrollView horizontal style={{ marginBottom: 12 }} showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            {hopResults.slice(0, 20).map((it) => (
              <Button
                key={it.id}
                onPress={() => addHopFromDb(it)}
                size="$2"
                background="$background"
                borderWidth={1}
                borderColor="$borderColor"
              >
                <Text fontSize={12}>
                  {it.name} {it.country ? `(${it.country})` : ""} — Add
                </Text>
              </Button>
            ))}
          </View>
        </ScrollView>
      ) : null}
      <Button onPress={addHopRow} size="$3" background="$background" borderWidth={1} borderColor="$borderColor" mb="$2">
        <Text>Add hop</Text>
      </Button>
    </>
  );
}
