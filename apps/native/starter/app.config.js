/**
 * EAS / release env passthrough — same pattern as apps/native/brewery.
 */
module.exports = ({ config }) => {
  const api = process.env.EXPO_PUBLIC_API_BASE_URL;

  return {
    ...config,
    experiments: {
      ...config.experiments,
      autolinkingModuleResolution: true,
    },
    extra: {
      ...config.extra,
      ...(api ? { EXPO_PUBLIC_API_BASE_URL: api } : {}),
    },
  };
};
