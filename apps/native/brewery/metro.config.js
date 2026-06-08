const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { mergeConfig } = require("metro-config");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../../..");
const appNodeModules = path.join(projectRoot, "node_modules");

/**
 * Expo SDK 54+ configures monorepo watchFolders and nodeModulesPaths automatically
 * (see https://docs.expo.dev/guides/monorepos/). Start from getDefaultConfig, then
 * merge only the resolver overrides we still need for a single React copy and
 * workspace package paths — see docs/NATIVE-STRATEGY-AND-CI.md §6.1.
 *
 * @type {import('expo/metro-config').MetroConfig}
 */
const expoConfig = getDefaultConfig(projectRoot);

const monorepoResolverOverrides = {
  resolver: {
    extraNodeModules: {
      // Pin Expo Go ABI react@19.1.0 from the brewery workspace (not root hoisted copy).
      react: path.join(appNodeModules, "react"),
      "react/jsx-runtime": path.join(appNodeModules, "react", "jsx-runtime.js"),
      "react/jsx-dev-runtime": path.join(appNodeModules, "react", "jsx-dev-runtime.js"),
      scheduler: path.join(appNodeModules, "scheduler"),
      "react-native": path.join(appNodeModules, "react-native"),
      "@umbraculum/brewery-recipes-ui": path.join(workspaceRoot, "packages", "verticals", "brewery", "recipes-ui"),
    },
  },
};

module.exports = mergeConfig(expoConfig, monorepoResolverOverrides);
