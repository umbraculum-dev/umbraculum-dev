/**
 * EAS profiles set EXPO_PUBLIC_* in eas.json `env` at build time.
 * Copy them into `expo.extra` so release APKs read demo (or staging) URLs via
 * Constants.expoConfig.extra — see native-shell auth/apiBaseUrl.ts.
 * Without this, preview builds can fall back to DEFAULT_API_BASE_URL (dev LAN IP).
 *
 * Static base values live in app.json; Expo merges them into `config` before this runs.
 */
module.exports = ({ config }) => {
  const api = process.env.EXPO_PUBLIC_API_BASE_URL;
  const media = process.env.EXPO_PUBLIC_MEDIA_BASE_URL;

  return {
    ...config,
    experiments: {
      ...config.experiments,
      autolinkingModuleResolution: true,
    },
    extra: {
      ...config.extra,
      ...(api ? { EXPO_PUBLIC_API_BASE_URL: api } : {}),
      ...(media ? { EXPO_PUBLIC_MEDIA_BASE_URL: media } : {}),
    },
  };
};
