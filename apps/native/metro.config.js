const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { mergeConfig } = require("metro-config");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");
const appNodeModules = path.join(projectRoot, "node_modules");
const rootNodeModules = path.join(workspaceRoot, "node_modules");

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
      react: path.join(rootNodeModules, "react"),
      "react/jsx-runtime": path.join(rootNodeModules, "react", "jsx-runtime.js"),
      "react/jsx-dev-runtime": path.join(rootNodeModules, "react", "jsx-dev-runtime.js"),
      scheduler: path.join(rootNodeModules, "scheduler"),
      "react-native": path.join(appNodeModules, "react-native"),
      "@umbraculum/brewery-recipes-ui": path.join(workspaceRoot, "packages", "recipes-ui"),
    },
  },
};

module.exports = mergeConfig(expoConfig, monorepoResolverOverrides);
