import type { ModuleNavLabelKey } from "@umbraculum/i18n-keys";

import { PLATFORM_WEB_SHARED_LAYOUT_NAV_ENTRIES } from "./builtinWebModules.js";
import { listRegisteredWebModules } from "./registerWebModule.js";

export interface WebSharedLayoutNavItem {
  href: string;
  labelKey: ModuleNavLabelKey;
  order: number;
}

/**
 * Compose primary-shell navigation items from the web-module registry plus
 * platform-owned entries.
 *
 * Caller must ensure built-in modules and platform segments are registered
 * first (`registerBuiltinWebModulesIfAbsent()` + `registerPlatformSegments()`
 * on web; API boot calls the built-in registrar before reading).
 */
export function composeWebSharedLayoutNavItems(): WebSharedLayoutNavItem[] {
  const moduleItems: WebSharedLayoutNavItem[] = [];
  for (const snapshot of listRegisteredWebModules()) {
    if (snapshot.code === "platform") continue;
    for (const entry of snapshot.navEntries) {
      moduleItems.push({
        href: `/${entry.primarySegment}`,
        labelKey: entry.labelKey,
        order: entry.order ?? 50,
      });
    }
  }

  const platformItems: WebSharedLayoutNavItem[] = PLATFORM_WEB_SHARED_LAYOUT_NAV_ENTRIES.map(
    (entry) => ({
      href: entry.href,
      labelKey: entry.labelKey,
      order: entry.order,
    }),
  );

  return [...platformItems, ...moduleItems].sort(
    (a, b) => a.order - b.order || a.href.localeCompare(b.href),
  );
}
