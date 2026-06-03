const appJson = require("./app.json");

/**
 * EAS profiles set EXPO_PUBLIC_* in eas.json `env` at build time.
 * Copy them into `expo.extra` so release APKs read demo (or staging) URLs via
 * Constants.expoConfig.extra — see src/auth/apiBaseUrl.ts and src/media/mediaBaseUrl.ts.
 * Without this, preview builds can fall back to DEFAULT_API_BASE_URL (dev LAN IP).
 */
module.exports = () => {
  const api = process.env.EXPO_PUBLIC_API_BASE_URL;
  const media = process.env.EXPO_PUBLIC_MEDIA_BASE_URL;

  return {
    expo: {
      ...appJson.expo,
      experiments: {
        autolinkingModuleResolution: true,
      },
      extra: {
        ...appJson.expo.extra,
        ...(api ? { EXPO_PUBLIC_API_BASE_URL: api } : {}),
        ...(media ? { EXPO_PUBLIC_MEDIA_BASE_URL: media } : {}),
      },
    },
  };
};
