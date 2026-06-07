import type { ModuleNavLabelKey } from "@umbraculum/i18n-keys";

import { resolveEnabledModuleCodes } from "./enabledModules.js";
import {
  listRegisteredWebModules,
  registerWebModule,
  type RegisterWebModuleOptions,
} from "./registerWebModule.js";

/**
 * Canonical web-module registrations for first-party modules shipped in the
 * monorepo. Single source of truth for URL-segment ownership and primary-nav
 * metadata — consumed by `services/api` (tests/CI parity) and `apps/web`
 * (registry-driven shell nav).
 *
 * Third-party modules register their own slices at runtime; they are not listed
 * here.
 */
export const BUILTIN_WEB_MODULE_REGISTRATIONS: readonly RegisterWebModuleOptions[] =
  [
    {
      code: "automation",
      ownedUrlSegments: ["vessels"],
      navEntries: [
        { primarySegment: "vessels", labelKey: "nav.automation", order: 4 },
      ],
    },
    {
      code: "brewery",
      ownedUrlSegments: [
        "recipes",
        "inventory",
        "equipment",
        "water-profiles",
        "brewday-steps-settings",
        "ferm-data-integration",
      ],
      navEntries: [
        { primarySegment: "recipes", labelKey: "nav.recipes", order: 1 },
        { primarySegment: "equipment", labelKey: "nav.equipment", order: 2 },
      ],
    },
    {
      code: "crp",
      ownedUrlSegments: ["capacity", "schedule", "resources"],
      navEntries: [
        { primarySegment: "capacity", labelKey: "nav.crp", order: 7 },
      ],
    },
    {
      code: "mrp",
      ownedUrlSegments: ["production-orders", "work-orders", "material-requirements"],
      navEntries: [
        { primarySegment: "production-orders", labelKey: "nav.mrp", order: 6 },
      ],
    },
    {
      code: "pim",
      ownedUrlSegments: ["products", "categories", "attribute-sets"],
      navEntries: [{ primarySegment: "products", labelKey: "nav.pim", order: 5 }],
    },
  ] as const satisfies readonly RegisterWebModuleOptions[];

/** Platform-owned primary nav entries (not tied to a canonical module code). */
export const PLATFORM_WEB_SHARED_LAYOUT_NAV_ENTRIES: readonly {
  href: string;
  labelKey: ModuleNavLabelKey;
  order: number;
}[] = [
  { href: "/", labelKey: "nav.dashboard", order: 0 },
  { href: "/ai", labelKey: "nav.ai", order: 80 },
  { href: "/about", labelKey: "nav.about", order: 90 },
] as const;

/**
 * Idempotently registers every built-in web module. Safe to call from both
 * `services/api` boot and `apps/web` layout bootstrap.
 */
export function registerBuiltinWebModulesIfAbsent(options?: {
  enabledCodes?: ReadonlySet<string>;
}): void {
  const enabled = options?.enabledCodes ?? resolveEnabledModuleCodes();
  const registered = new Set(listRegisteredWebModules().map((m) => m.code));
  for (const entry of BUILTIN_WEB_MODULE_REGISTRATIONS) {
    if (!enabled.has(entry.code)) continue;
    if (!registered.has(entry.code)) {
      registerWebModule(entry);
    }
  }
}
