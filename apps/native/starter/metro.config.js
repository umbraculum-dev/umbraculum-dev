const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { mergeConfig } = require("metro-config");

const projectRoot = __dirname;
const appNodeModules = path.join(projectRoot, "node_modules");

const expoConfig = getDefaultConfig(projectRoot);

const monorepoResolverOverrides = {
  resolver: {
    extraNodeModules: {
      react: path.join(appNodeModules, "react"),
      "react/jsx-runtime": path.join(appNodeModules, "react", "jsx-runtime.js"),
      "react/jsx-dev-runtime": path.join(appNodeModules, "react", "jsx-dev-runtime.js"),
      scheduler: path.join(appNodeModules, "scheduler"),
      "react-native": path.join(appNodeModules, "react-native"),
    },
  },
};

module.exports = mergeConfig(expoConfig, monorepoResolverOverrides);
