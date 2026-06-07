/** Docs-site consumer entry — announcement SoT + Docusaurus mapping. */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { toDocusaurusAnnouncementBar } from "../scripts/announcement-theme.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

export const announcementConfig = JSON.parse(
  readFileSync(join(root, "announcement.config.json"), "utf8"),
);

export { toDocusaurusAnnouncementBar };
