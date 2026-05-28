/** Shared announcement styling for Docusaurus themeConfig (reads brochure config). */

const VARIANT_THEME = {
  info: { backgroundColor: "#1e3a5f", textColor: "#e8e8e8" },
  warning: { backgroundColor: "#4a3a12", textColor: "#f5e6c8" },
  critical: { backgroundColor: "#4a1a1a", textColor: "#fde8e8" },
};

/**
 * @typedef {object} AnnouncementConfig
 * @property {boolean} enabled
 * @property {string} id
 * @property {'info' | 'warning' | 'critical' | undefined} [variant]
 * @property {boolean | undefined} [dismissible]
 * @property {string} html
 */

/**
 * @param {AnnouncementConfig} config
 * @returns {import('@docusaurus/preset-classic').ThemeConfig['announcementBar'] | undefined}
 */
export function toDocusaurusAnnouncementBar(config) {
  if (!config?.enabled || !config.id || !config.html) {
    return undefined;
  }

  const theme = VARIANT_THEME[config.variant] ?? VARIANT_THEME.info;

  return {
    id: config.id,
    content: config.html,
    backgroundColor: theme.backgroundColor,
    textColor: theme.textColor,
    isCloseable: config.dismissible !== false,
  };
}
