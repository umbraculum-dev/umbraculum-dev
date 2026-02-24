import importedConfig from "@brewery/ui/tamagui-config-native";

export const config = importedConfig;

export type AppConfig = typeof config;

declare module "tamagui" {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;

