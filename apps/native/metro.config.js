const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");
const appNodeModules = path.join(projectRoot, "node_modules");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

// Allow Metro to resolve files from the monorepo root (workspace packages).
config.watchFolders = [workspaceRoot];

// Prevent Metro from walking up the directory tree when resolving node_modules.
// This is the most common cause of "Invalid hook call" (multiple React copies) in monorepos.
config.resolver.disableHierarchicalLookup = true;

// Resolve dependencies from the app first, then fall back to workspace root.
const rootNodeModules = path.join(workspaceRoot, "node_modules");
config.resolver.nodeModulesPaths = [appNodeModules, rootNodeModules];

config.resolver.extraNodeModules = {
  // Pin React (and friends) to a single copy to avoid "Invalid hook call".
  // We resolve React from the workspace root, and keep React Native from the app.
  react: path.join(rootNodeModules, "react"),
  "react/jsx-runtime": path.join(rootNodeModules, "react", "jsx-runtime.js"),
  "react/jsx-dev-runtime": path.join(rootNodeModules, "react", "jsx-dev-runtime.js"),
  scheduler: path.join(rootNodeModules, "scheduler"),
  "react-native": path.join(appNodeModules, "react-native"),
  // Explicitly resolve workspace packages that may not be hoisted to root node_modules.
  "@brewery/recipes-ui": path.join(workspaceRoot, "packages", "recipes-ui"),
};

module.exports = config;

