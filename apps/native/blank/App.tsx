import { Linking, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const DOCS_URL = "https://github.com/umbraculum-dev/umbraculum-dev/blob/master/docs/BUILDING-YOUR-VERTICAL.md";

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Umbraculum Blank</Text>
          <Text style={styles.body}>
            Blank native app for the core installation profile — no vertical packages and no
            canonical module screens yet. It proves the Expo monorepo bootstrap for self-hosters
            and CI.
          </Text>
          <Text style={styles.body}>
            Product native apps (brew-day, floor PIM, scanners, and similar) ship as separate
            binaries under apps/native/. Opt in to the brewery reference vertical or add your own
            vertical when you need a full example.
          </Text>
          <Text
            accessibilityRole="link"
            style={styles.link}
            onPress={() => {
              void Linking.openURL(DOCS_URL);
            }}
          >
            Building your vertical →
          </Text>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  title: {
    color: "#f8fafc",
    fontSize: 24,
    fontWeight: "700",
  },
  body: {
    color: "#cbd5e1",
    fontSize: 16,
    lineHeight: 24,
  },
  link: {
    color: "#38bdf8",
    fontSize: 16,
    marginTop: 8,
  },
});
