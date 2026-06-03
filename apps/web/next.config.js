/** @type {import('next').NextConfig} */
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig = {
  // apps/web is not in ci-parity typecheck workspaces yet; Tamagui v2 RC shorthand
  // props (mt, maxWidth, …) fail `next build` while dev (`next dev`) is fine.
  // Demo VPS and production `next start` need this until web is typecheck-gated.
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: ["tamagui", "@tamagui/core", "@tamagui/config", "@umbraculum/ui", "@umbraculum/media", "@umbraculum/contracts"],
  webpack: (config) => {
    // Webpack builds must also alias react-native -> react-native-web.
    // Otherwise Webpack tries to parse react-native's Flow types (e.g. `import typeof`).
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "react-native$": "react-native-web",
      "react-native-svg": "@tamagui/react-native-svg",
    };
    return config;
  },
  turbopack: {
    resolveAlias: {
      "react-native": "react-native-web",
      "react-native-svg": "@tamagui/react-native-svg",
    },
  },
};

export default withNextIntl(nextConfig);

