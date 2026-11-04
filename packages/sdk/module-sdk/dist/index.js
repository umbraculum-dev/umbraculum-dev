import {
  BUILTIN_WEB_MODULE_SEGMENT_OWNERSHIP,
  getBuiltinSegmentOwnerEdge,
  isModuleOwnedPathDenied,
  resolveEnabledModuleCodesEdge
} from "./chunk-QV3HV36Y.js";
import {
  AI_PROMPT_KNOWLEDGE_MAX_LENGTH,
  AI_PROMPT_MODULE_MAX_LENGTH,
  AI_PROMPT_ROUTE_MAX_LENGTH,
  AddonCodeAlreadyRegisteredError,
  AiPromptRouteKeyAlreadyRegisteredError,
  DocumentTemplateRefAlreadyRegisteredError,
  InvalidAddonCodeError,
  InvalidAiPromptOverlayError,
  InvalidDocumentTemplateRefError,
  InvalidModuleCodeError,
  InvalidTierLimitKeyError,
  InvalidTierLimitValueError,
  ModuleCodeAlreadyRegisteredError,
  PLATFORM_RESERVED_ADDON_CODE_PREFIX,
  PLATFORM_RESERVED_TIER_LIMIT_KEYS,
  RESERVED_CANONICAL_MODULE_CODES,
  ReservedTierLimitKeyError,
  TierLimitKeyCollisionError,
  aggregateNativeAvailableRouteIds,
  assertModuleCodeAvailable,
  assertValidModuleCode,
  clearAddonCodeRegistryForTests,
  clearModuleRegistryForTests,
  clearNativeModuleRegistryForTests,
  collectModuleKnowledgeSnippets,
  collectModulePromptOverlayTexts,
  collectRegisteredModulePromptOverlays,
  composeModuleTierLimitSlices,
  getRegisteredDocumentTemplate,
  isCanonicalModuleCode,
  listRegisteredAddonCodes,
  listRegisteredDocumentTemplates,
  listRegisteredModules,
  listRegisteredNativeModules,
  listRegisteredTierLimitKeys,
  recordModuleRegistration,
  registerNativeModule,
  registerRegisteredModuleAiTools,
  resolveRoutePromptOverlay,
  snapshotAddonCodeOwnership,
  snapshotModule
} from "./chunk-WYOH6NS2.js";

// src/registerModule.ts
function registerModule(app, options) {
  const snapshot = recordModuleRegistration(options);
  for (const registerRoutes of options.routes ?? []) {
    const result = registerRoutes(app);
    if (result instanceof Promise) {
      throw new Error(
        `registerModule(${options.code}): async route registrars are not supported in v0; use sync functions`
      );
    }
  }
  return snapshot;
}

// src/registerWebModuleTypes.ts
var UrlSegmentAlreadyOwnedError = class extends Error {
  segment;
  attemptingCode;
  existingOwnerCode;
  constructor(segment, attemptingCode, existingOwnerCode) {
    super(
      `registerWebModule(${attemptingCode}): URL segment "${segment}" is already owned by module "${existingOwnerCode}"`
    );
    this.name = "UrlSegmentAlreadyOwnedError";
    this.segment = segment;
    this.attemptingCode = attemptingCode;
    this.existingOwnerCode = existingOwnerCode;
  }
};
var InvalidUrlSegmentError = class extends Error {
  segment;
  code;
  constructor(segment, code) {
    super(
      `registerWebModule(${code}): invalid URL segment "${segment}" (expected kebab-case starting with a letter, matching /^[a-z][a-z0-9-]*$/)`
    );
    this.name = "InvalidUrlSegmentError";
    this.segment = segment;
    this.code = code;
  }
};
var NavEntryPrimarySegmentNotOwnedError = class extends Error {
  code;
  primarySegment;
  constructor(code, primarySegment) {
    super(
      `registerWebModule(${code}): nav entry primarySegment "${primarySegment}" must appear in ownedUrlSegments`
    );
    this.name = "NavEntryPrimarySegmentNotOwnedError";
    this.code = code;
    this.primarySegment = primarySegment;
  }
};
function normalizeNavEntries(options) {
  if (options.navEntries !== void 0 && options.navEntry !== void 0) {
    throw new Error(
      `registerWebModule(${options.code}): specify navEntries or navEntry, not both`
    );
  }
  if (options.navEntries !== void 0) {
    return options.navEntries.map((entry) => ({
      primarySegment: entry.primarySegment,
      labelKey: entry.labelKey,
      ...entry.order !== void 0 ? { order: entry.order } : {}
    }));
  }
  if (options.navEntry !== void 0) {
    return [
      {
        primarySegment: options.navEntry.primarySegment,
        labelKey: options.navEntry.labelKey,
        ...options.navEntry.order !== void 0 ? { order: options.navEntry.order } : {}
      }
    ];
  }
  return [];
}
var URL_SEGMENT_PATTERN = /^[a-z][a-z0-9-]*$/;

// src/registerWebModule.ts
var webModulesByCode = /* @__PURE__ */ new Map();
var segmentOwnership = /* @__PURE__ */ new Map();
function registerWebModule(options) {
  assertValidModuleCode(options.code);
  if (webModulesByCode.has(options.code)) {
    throw new Error(`registerWebModule: module code "${options.code}" is already registered`);
  }
  const ownedUrlSegments = options.ownedUrlSegments ?? [];
  const navEntries = normalizeNavEntries(options);
  for (const segment of ownedUrlSegments) {
    if (!URL_SEGMENT_PATTERN.test(segment)) {
      throw new InvalidUrlSegmentError(segment, options.code);
    }
    const existingOwner = segmentOwnership.get(segment);
    if (existingOwner !== void 0) {
      throw new UrlSegmentAlreadyOwnedError(segment, options.code, existingOwner);
    }
  }
  const owned = new Set(ownedUrlSegments);
  for (const entry of navEntries) {
    if (!owned.has(entry.primarySegment)) {
      throw new NavEntryPrimarySegmentNotOwnedError(options.code, entry.primarySegment);
    }
  }
  for (const segment of ownedUrlSegments) {
    segmentOwnership.set(segment, options.code);
  }
  const snapshot = {
    code: options.code,
    ownedUrlSegments: [...ownedUrlSegments],
    navEntries,
    ...navEntries[0] !== void 0 ? { navEntry: navEntries[0] } : {}
  };
  webModulesByCode.set(options.code, snapshot);
  return snapshot;
}
function listRegisteredWebModules() {
  return Array.from(webModulesByCode.keys()).sort().map((code) => {
    const snapshot = webModulesByCode.get(code);
    if (snapshot === void 0) {
      throw new Error(`listRegisteredWebModules: registry inconsistency for code "${code}"`);
    }
    return snapshot;
  });
}
function listOwnedUrlSegments(code) {
  const snapshot = webModulesByCode.get(code);
  return snapshot?.ownedUrlSegments ?? [];
}
function getSegmentOwner(segment) {
  return segmentOwnership.get(segment);
}
function snapshotSegmentOwnership() {
  return Array.from(segmentOwnership.entries()).sort(([a], [b]) => a.localeCompare(b));
}
function clearWebModuleRegistryForTests() {
  webModulesByCode.clear();
  segmentOwnership.clear();
}

// src/validatedSchema.ts
function fromParser(parser) {
  return {
    parse(input) {
      return parser(input);
    }
  };
}

// src/installProfile.ts
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
var InvalidModuleProfileError = class extends Error {
  constructor(value) {
    super(
      `Invalid UMBRACULUM_MODULE_PROFILE: "${value}". Expected "platform" or "reference".`
    );
    this.name = "InvalidModuleProfileError";
  }
};
var DEFAULT_REPO_ROOT_CANDIDATES = [
  process.env["UMBRACULUM_REPO_ROOT"],
  process.cwd(),
  resolve(process.cwd(), "../.."),
  resolve(process.cwd(), "../../..")
].filter(Boolean);
function resolveRepoRoot(env = process.env) {
  const explicit = env["UMBRACULUM_REPO_ROOT"]?.trim();
  if (explicit) return explicit;
  for (const candidate of DEFAULT_REPO_ROOT_CANDIDATES) {
    if (existsSync(resolve(candidate, ".umbraculum/install.core.json"))) {
      return candidate;
    }
  }
  return process.cwd();
}
function resolveInstallManifestPath(env = process.env) {
  const override = env["UMBRACULUM_INSTALL_MANIFEST"]?.trim();
  if (override) {
    return resolve(override);
  }
  const repoRoot = resolveRepoRoot(env);
  const profileRaw = env["UMBRACULUM_MODULE_PROFILE"]?.trim();
  if (profileRaw) {
    const profile = profileRaw === "reference" ? "reference" : profileRaw === "platform" ? "platform" : null;
    if (profile === "reference") {
      return resolve(repoRoot, ".umbraculum/install.reference.json");
    }
    if (profile === "platform") {
      return resolve(repoRoot, ".umbraculum/install.core.json");
    }
    throw new InvalidModuleProfileError(profileRaw);
  }
  const active = resolve(repoRoot, ".umbraculum/install.json");
  if (existsSync(active)) {
    return active;
  }
  return resolve(repoRoot, ".umbraculum/install.core.json");
}
function resolveModuleProfileFromEnv(env = process.env) {
  const raw = env["UMBRACULUM_MODULE_PROFILE"]?.trim();
  if (!raw) return "platform";
  if (raw === "platform" || raw === "reference") return raw;
  throw new InvalidModuleProfileError(raw);
}
function loadInstallationProfileManifest(env = process.env) {
  const path = resolveInstallManifestPath(env);
  if (!existsSync(path)) {
    return fallbackManifestFromProfile(resolveModuleProfileFromEnv(env));
  }
  const raw = JSON.parse(readFileSync(path, "utf8"));
  return normalizeManifest(raw, resolveModuleProfileFromEnv(env));
}
function fallbackManifestFromProfile(profile) {
  if (profile === "reference") {
    return {
      id: "reference",
      verticals: ["brewery"],
      canonical: ["automation", "pim", "mrp", "crp"],
      nativeApps: ["brewery"]
    };
  }
  return {
    id: "core",
    verticals: [],
    canonical: ["automation", "pim", "mrp", "crp"],
    nativeApps: ["blank"]
  };
}
function normalizeManifest(raw, profile) {
  const id = raw.id ?? (profile === "reference" ? "reference" : "core");
  const canonical = raw.canonical?.length ? raw.canonical : ["automation", "pim", "mrp", "crp"];
  const verticals = raw.verticals ?? (id === "reference" ? ["brewery"] : []);
  const nativeApps = raw.nativeApps?.length ? raw.nativeApps : id === "reference" ? ["brewery"] : ["blank"];
  return {
    id,
    ...raw.description !== void 0 ? { description: raw.description } : {},
    verticals,
    canonical,
    nativeApps
  };
}
function resolveEnabledModuleCodesFromManifest(env = process.env) {
  const manifest = loadInstallationProfileManifest(env);
  return /* @__PURE__ */ new Set([...manifest.canonical, ...manifest.verticals]);
}
function isVerticalInstalled(code, env = process.env) {
  return loadInstallationProfileManifest(env).verticals.includes(code);
}
function resolveNativeAppCodes(env = process.env) {
  return loadInstallationProfileManifest(env).nativeApps;
}
function resolvePrimaryNativeAppCode(env = process.env) {
  const apps = resolveNativeAppCodes(env);
  if (apps.length === 0) return "blank";
  return apps[0] ?? "blank";
}

// src/enabledModules.ts
var BUILTIN_MODULE_CODES = [
  "automation",
  "brewery",
  "crp",
  "mrp",
  "pim"
];
function resolveModuleProfile(env = process.env) {
  try {
    return resolveModuleProfileFromEnv(env);
  } catch (err) {
    if (err instanceof InvalidModuleProfileError) throw err;
    const raw = env["UMBRACULUM_MODULE_PROFILE"]?.trim() ?? "";
    throw new InvalidModuleProfileError(raw);
  }
}
function resolveEnabledModuleCodes(env = process.env) {
  return resolveEnabledModuleCodesFromManifest(env);
}
function isModuleEnabled(code, env = process.env) {
  return resolveEnabledModuleCodes(env).has(code);
}

// src/builtinWebModules.ts
var BUILTIN_WEB_MODULE_REGISTRATIONS = [
  {
    code: "automation",
    ownedUrlSegments: ["vessels"],
    navEntries: [
      { primarySegment: "vessels", labelKey: "nav.automation", order: 4 }
    ]
  },
  {
    code: "brewery",
    ownedUrlSegments: [
      "recipes",
      "inventory",
      "equipment",
      "water-profiles",
      "brewday-steps-settings",
      "ferm-data-integration"
    ],
    navEntries: [
      { primarySegment: "recipes", labelKey: "nav.recipes", order: 1 },
      { primarySegment: "equipment", labelKey: "nav.equipment", order: 2 }
    ]
  },
  {
    code: "crp",
    ownedUrlSegments: ["capacity", "schedule", "resources"],
    navEntries: [
      { primarySegment: "capacity", labelKey: "nav.crp", order: 7 }
    ]
  },
  {
    code: "mrp",
    ownedUrlSegments: ["production-orders", "work-orders", "material-requirements"],
    navEntries: [
      { primarySegment: "production-orders", labelKey: "nav.mrp", order: 6 }
    ]
  },
  {
    code: "pim",
    ownedUrlSegments: ["products", "categories", "attribute-sets"],
    navEntries: [{ primarySegment: "products", labelKey: "nav.pim", order: 5 }]
  }
];
var PLATFORM_WEB_SHARED_LAYOUT_NAV_ENTRIES = [
  { href: "/", labelKey: "nav.dashboard", order: 0 },
  { href: "/ai", labelKey: "nav.ai", order: 80 },
  { href: "/about", labelKey: "nav.about", order: 90 }
];
function registerBuiltinWebModulesIfAbsent(options) {
  const enabled = options?.enabledCodes ?? resolveEnabledModuleCodes();
  const registered = new Set(listRegisteredWebModules().map((m) => m.code));
  for (const entry of BUILTIN_WEB_MODULE_REGISTRATIONS) {
    if (!enabled.has(entry.code)) continue;
    if (!registered.has(entry.code)) {
      registerWebModule(entry);
    }
  }
}

// src/composeWebSharedLayoutNav.ts
function composeWebSharedLayoutNavItems() {
  const moduleItems = [];
  for (const snapshot of listRegisteredWebModules()) {
    if (snapshot.code === "platform") continue;
    for (const entry of snapshot.navEntries) {
      moduleItems.push({
        href: `/${entry.primarySegment}`,
        labelKey: entry.labelKey,
        order: entry.order ?? 50
      });
    }
  }
  const platformItems = PLATFORM_WEB_SHARED_LAYOUT_NAV_ENTRIES.map(
    (entry) => ({
      href: entry.href,
      labelKey: entry.labelKey,
      order: entry.order
    })
  );
  return [...platformItems, ...moduleItems].sort(
    (a, b) => a.order - b.order || a.href.localeCompare(b.href)
  );
}

// src/resolveWebSharedLayoutNotice.ts
var WEB_SHARED_LAYOUT_NOTICE_IDS = ["demo"];
var DEMO_NOTICE_CONFIG = {
  id: "demo",
  variant: "notice",
  dismissible: false
};
function isWebSharedLayoutNoticeId(value) {
  return WEB_SHARED_LAYOUT_NOTICE_IDS.includes(value);
}
function resolveWebSharedLayoutNotice(env = process.env) {
  const raw = env["NEXT_PUBLIC_WEB_SHARED_LAYOUT_NOTICE_ID"]?.trim();
  if (!raw || !isWebSharedLayoutNoticeId(raw)) {
    return null;
  }
  if (raw === "demo") {
    return DEMO_NOTICE_CONFIG;
  }
  return null;
}
export {
  AI_PROMPT_KNOWLEDGE_MAX_LENGTH,
  AI_PROMPT_MODULE_MAX_LENGTH,
  AI_PROMPT_ROUTE_MAX_LENGTH,
  AddonCodeAlreadyRegisteredError,
  AiPromptRouteKeyAlreadyRegisteredError,
  BUILTIN_MODULE_CODES,
  BUILTIN_WEB_MODULE_REGISTRATIONS,
  BUILTIN_WEB_MODULE_SEGMENT_OWNERSHIP,
  DocumentTemplateRefAlreadyRegisteredError,
  InvalidAddonCodeError,
  InvalidAiPromptOverlayError,
  InvalidDocumentTemplateRefError,
  InvalidModuleCodeError,
  InvalidModuleProfileError,
  InvalidTierLimitKeyError,
  InvalidTierLimitValueError,
  InvalidUrlSegmentError,
  ModuleCodeAlreadyRegisteredError,
  NavEntryPrimarySegmentNotOwnedError,
  PLATFORM_RESERVED_ADDON_CODE_PREFIX,
  PLATFORM_RESERVED_TIER_LIMIT_KEYS,
  PLATFORM_WEB_SHARED_LAYOUT_NAV_ENTRIES,
  RESERVED_CANONICAL_MODULE_CODES,
  ReservedTierLimitKeyError,
  TierLimitKeyCollisionError,
  UrlSegmentAlreadyOwnedError,
  WEB_SHARED_LAYOUT_NOTICE_IDS,
  aggregateNativeAvailableRouteIds,
  assertModuleCodeAvailable,
  assertValidModuleCode,
  clearAddonCodeRegistryForTests,
  clearModuleRegistryForTests,
  clearNativeModuleRegistryForTests,
  clearWebModuleRegistryForTests,
  collectModuleKnowledgeSnippets,
  collectModulePromptOverlayTexts,
  collectRegisteredModulePromptOverlays,
  composeModuleTierLimitSlices,
  composeWebSharedLayoutNavItems,
  fromParser,
  getBuiltinSegmentOwnerEdge,
  getRegisteredDocumentTemplate,
  getSegmentOwner,
  isCanonicalModuleCode,
  isModuleEnabled,
  isModuleOwnedPathDenied,
  isVerticalInstalled,
  listOwnedUrlSegments,
  listRegisteredAddonCodes,
  listRegisteredDocumentTemplates,
  listRegisteredModules,
  listRegisteredNativeModules,
  listRegisteredTierLimitKeys,
  listRegisteredWebModules,
  loadInstallationProfileManifest,
  recordModuleRegistration,
  registerBuiltinWebModulesIfAbsent,
  registerModule,
  registerNativeModule,
  registerRegisteredModuleAiTools,
  registerWebModule,
  resolveEnabledModuleCodes,
  resolveEnabledModuleCodesEdge,
  resolveInstallManifestPath,
  resolveModuleProfile,
  resolveNativeAppCodes,
  resolvePrimaryNativeAppCode,
  resolveRepoRoot,
  resolveRoutePromptOverlay,
  resolveWebSharedLayoutNotice,
  snapshotAddonCodeOwnership,
  snapshotModule,
  snapshotSegmentOwnership
};
