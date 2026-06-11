import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const DOCS_URL = "https://github.com/umbraculum-dev/umbraculum-dev/blob/master/docs/BUILDING-YOUR-VERTICAL.md";

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Umbraculum native starter</Text>
          <Text style={styles.body}>
            This is the minimal native shell for the core installation profile. It proves Expo
            monorepo bootstrap without any vertical packages.
          </Text>
          <Text style={styles.body}>
            For a full product example, opt in to a reference or custom vertical (brewery is the
            first reference vertical).
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
