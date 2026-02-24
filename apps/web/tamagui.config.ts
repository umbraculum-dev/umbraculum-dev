import importedConfig from "@brewery/ui/tamagui-config-web";

export const config = importedConfig;

export type AppConfig = typeof config;

declare module "tamagui" {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
