"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  AI_PROMPT_KNOWLEDGE_MAX_LENGTH: () => AI_PROMPT_KNOWLEDGE_MAX_LENGTH,
  AI_PROMPT_MODULE_MAX_LENGTH: () => AI_PROMPT_MODULE_MAX_LENGTH,
  AI_PROMPT_ROUTE_MAX_LENGTH: () => AI_PROMPT_ROUTE_MAX_LENGTH,
  AddonCodeAlreadyRegisteredError: () => AddonCodeAlreadyRegisteredError,
  AiPromptRouteKeyAlreadyRegisteredError: () => AiPromptRouteKeyAlreadyRegisteredError,
  BUILTIN_MODULE_CODES: () => BUILTIN_MODULE_CODES,
  BUILTIN_WEB_MODULE_REGISTRATIONS: () => BUILTIN_WEB_MODULE_REGISTRATIONS,
  DocumentTemplateRefAlreadyRegisteredError: () => DocumentTemplateRefAlreadyRegisteredError,
  InvalidAddonCodeError: () => InvalidAddonCodeError,
  InvalidAiPromptOverlayError: () => InvalidAiPromptOverlayError,
  InvalidDocumentTemplateRefError: () => InvalidDocumentTemplateRefError,
  InvalidModuleCodeError: () => InvalidModuleCodeError,
  InvalidModuleProfileError: () => InvalidModuleProfileError,
  InvalidTierLimitKeyError: () => InvalidTierLimitKeyError,
  InvalidTierLimitValueError: () => InvalidTierLimitValueError,
  InvalidUrlSegmentError: () => InvalidUrlSegmentError,
  ModuleCodeAlreadyRegisteredError: () => ModuleCodeAlreadyRegisteredError,
  NavEntryPrimarySegmentNotOwnedError: () => NavEntryPrimarySegmentNotOwnedError,
  PLATFORM_RESERVED_ADDON_CODE_PREFIX: () => PLATFORM_RESERVED_ADDON_CODE_PREFIX,
  PLATFORM_RESERVED_TIER_LIMIT_KEYS: () => PLATFORM_RESERVED_TIER_LIMIT_KEYS,
  PLATFORM_WEB_SHARED_LAYOUT_NAV_ENTRIES: () => PLATFORM_WEB_SHARED_LAYOUT_NAV_ENTRIES,
  RESERVED_CANONICAL_MODULE_CODES: () => RESERVED_CANONICAL_MODULE_CODES,
  ReservedTierLimitKeyError: () => ReservedTierLimitKeyError,
  TierLimitKeyCollisionError: () => TierLimitKeyCollisionError,
  UrlSegmentAlreadyOwnedError: () => UrlSegmentAlreadyOwnedError,
  WEB_SHARED_LAYOUT_NOTICE_IDS: () => WEB_SHARED_LAYOUT_NOTICE_IDS,
  aggregateNativeAvailableRouteIds: () => aggregateNativeAvailableRouteIds,
  assertModuleCodeAvailable: () => assertModuleCodeAvailable,
  assertValidModuleCode: () => assertValidModuleCode,
  clearAddonCodeRegistryForTests: () => clearAddonCodeRegistryForTests,
  clearModuleRegistryForTests: () => clearModuleRegistryForTests,
  clearNativeModuleRegistryForTests: () => clearNativeModuleRegistryForTests,
  clearWebModuleRegistryForTests: () => clearWebModuleRegistryForTests,
  collectModuleKnowledgeSnippets: () => collectModuleKnowledgeSnippets,
  collectModulePromptOverlayTexts: () => collectModulePromptOverlayTexts,
  collectRegisteredModulePromptOverlays: () => collectRegisteredModulePromptOverlays,
  composeModuleTierLimitSlices: () => composeModuleTierLimitSlices,
  composeWebSharedLayoutNavItems: () => composeWebSharedLayoutNavItems,
  fromParser: () => fromParser,
  getRegisteredDocumentTemplate: () => getRegisteredDocumentTemplate,
  getSegmentOwner: () => getSegmentOwner,
  isCanonicalModuleCode: () => isCanonicalModuleCode,
  isModuleEnabled: () => isModuleEnabled,
  isVerticalInstalled: () => isVerticalInstalled,
  listOwnedUrlSegments: () => listOwnedUrlSegments,
  listRegisteredAddonCodes: () => listRegisteredAddonCodes,
  listRegisteredDocumentTemplates: () => listRegisteredDocumentTemplates,
  listRegisteredModules: () => listRegisteredModules,
  listRegisteredNativeModules: () => listRegisteredNativeModules,
  listRegisteredTierLimitKeys: () => listRegisteredTierLimitKeys,
  listRegisteredWebModules: () => listRegisteredWebModules,
  loadInstallationProfileManifest: () => loadInstallationProfileManifest,
  recordModuleRegistration: () => recordModuleRegistration,
  registerBuiltinWebModulesIfAbsent: () => registerBuiltinWebModulesIfAbsent,
  registerModule: () => registerModule,
  registerNativeModule: () => registerNativeModule,
  registerRegisteredModuleAiTools: () => registerRegisteredModuleAiTools,
  registerWebModule: () => registerWebModule,
  resolveEnabledModuleCodes: () => resolveEnabledModuleCodes,
  resolveInstallManifestPath: () => resolveInstallManifestPath,
  resolveModuleProfile: () => resolveModuleProfile,
  resolveNativeAppCodes: () => resolveNativeAppCodes,
  resolvePrimaryNativeAppCode: () => resolvePrimaryNativeAppCode,
  resolveRepoRoot: () => resolveRepoRoot,
  resolveRoutePromptOverlay: () => resolveRoutePromptOverlay,
  resolveWebSharedLayoutNotice: () => resolveWebSharedLayoutNotice,
  snapshotAddonCodeOwnership: () => snapshotAddonCodeOwnership,
  snapshotModule: () => snapshotModule,
  snapshotSegmentOwnership: () => snapshotSegmentOwnership
});
module.exports = __toCommonJS(index_exports);

// src/reservedCodes.ts
var RESERVED_CANONICAL_MODULE_CODES = [
  "mrp",
  "wms",
  "crm",
  "crp",
  "automation",
  "pim"
];
function isCanonicalModuleCode(code) {
  return RESERVED_CANONICAL_MODULE_CODES.includes(code);
}

// src/addonCodes.ts
var PLATFORM_RESERVED_ADDON_CODE_PREFIX = "managed_ai_credits_";
var ADDON_CODE_PATTERN = /^[a-z][a-z0-9_]*$/;
var addonCodeOwnerByCode = /* @__PURE__ */ new Map();
var AddonCodeAlreadyRegisteredError = class extends Error {
  addonCode;
  attemptingModuleCode;
  existingOwnerModuleCode;
  constructor(addonCode, attemptingModuleCode, existingOwnerModuleCode) {
    super(
      `registerModule(${attemptingModuleCode}): addonCode "${addonCode}" is already owned by module "${existingOwnerModuleCode}"`
    );
    this.name = "AddonCodeAlreadyRegisteredError";
    this.addonCode = addonCode;
    this.attemptingModuleCode = attemptingModuleCode;
    this.existingOwnerModuleCode = existingOwnerModuleCode;
  }
};
var InvalidAddonCodeError = class extends Error {
  addonCode;
  moduleCode;
  constructor(addonCode, moduleCode, reason) {
    super(`registerModule(${moduleCode}): invalid addonCode "${addonCode}" (${reason})`);
    this.name = "InvalidAddonCodeError";
    this.addonCode = addonCode;
    this.moduleCode = moduleCode;
  }
};
function assertValidAddonCode(moduleCode, addonCode) {
  if (!ADDON_CODE_PATTERN.test(addonCode)) {
    throw new InvalidAddonCodeError(
      addonCode,
      moduleCode,
      "expected lowercase alphanumeric with optional underscores"
    );
  }
  if (addonCode.startsWith(PLATFORM_RESERVED_ADDON_CODE_PREFIX)) {
    throw new InvalidAddonCodeError(
      addonCode,
      moduleCode,
      `prefix "${PLATFORM_RESERVED_ADDON_CODE_PREFIX}" is platform-reserved (RFC-0009 managed-AI credits)`
    );
  }
}
function validateAndIndexAddonCodes(moduleCode, addonCodes) {
  if (!addonCodes?.length) return;
  const seenInModule = /* @__PURE__ */ new Set();
  for (const addonCode of addonCodes) {
    assertValidAddonCode(moduleCode, addonCode);
    if (seenInModule.has(addonCode)) {
      throw new AddonCodeAlreadyRegisteredError(addonCode, moduleCode, moduleCode);
    }
    seenInModule.add(addonCode);
    const existingOwner = addonCodeOwnerByCode.get(addonCode);
    if (existingOwner !== void 0) {
      throw new AddonCodeAlreadyRegisteredError(addonCode, moduleCode, existingOwner);
    }
    addonCodeOwnerByCode.set(addonCode, moduleCode);
  }
}
function clearAddonCodeRegistryForTests() {
  addonCodeOwnerByCode.clear();
}
function snapshotAddonCodeOwnership() {
  return new Map(addonCodeOwnerByCode);
}
function listRegisteredAddonCodes(moduleCode) {
  const codes = [];
  for (const [addonCode, owner] of addonCodeOwnerByCode.entries()) {
    if (owner === moduleCode) codes.push(addonCode);
  }
  return codes.sort();
}

// src/tierLimits.ts
var PLATFORM_RESERVED_TIER_LIMIT_KEYS = ["aiEnabled"];
var TIER_LIMIT_KEY_PATTERN = /^[a-z][a-zA-Z0-9]*$/;
var tierLimitKeyOwnerByKey = /* @__PURE__ */ new Map();
var tierLimitKeysByModule = /* @__PURE__ */ new Map();
var TierLimitKeyCollisionError = class extends Error {
  key;
  attemptingModuleCode;
  existingOwnerModuleCode;
  constructor(key, attemptingModuleCode, existingOwnerModuleCode) {
    super(
      `registerModule(${attemptingModuleCode}): tierLimits key "${key}" is already owned by module "${existingOwnerModuleCode}"`
    );
    this.name = "TierLimitKeyCollisionError";
    this.key = key;
    this.attemptingModuleCode = attemptingModuleCode;
    this.existingOwnerModuleCode = existingOwnerModuleCode;
  }
};
var ReservedTierLimitKeyError = class extends Error {
  key;
  moduleCode;
  constructor(key, moduleCode) {
    super(
      `registerModule(${moduleCode}): tierLimits key "${key}" is reserved for the platform (${PLATFORM_RESERVED_TIER_LIMIT_KEYS.join(", ")})`
    );
    this.name = "ReservedTierLimitKeyError";
    this.key = key;
    this.moduleCode = moduleCode;
  }
};
var InvalidTierLimitKeyError = class extends Error {
  key;
  moduleCode;
  constructor(key, moduleCode) {
    super(
      `registerModule(${moduleCode}): invalid tierLimits key "${key}" (expected camelCase starting with a lowercase letter)`
    );
    this.name = "InvalidTierLimitKeyError";
    this.key = key;
    this.moduleCode = moduleCode;
  }
};
var InvalidTierLimitValueError = class extends Error {
  key;
  moduleCode;
  constructor(key, moduleCode, value) {
    super(
      `registerModule(${moduleCode}): tierLimits["${key}"] must be number or boolean (got ${typeof value})`
    );
    this.name = "InvalidTierLimitValueError";
    this.key = key;
    this.moduleCode = moduleCode;
  }
};
function isReservedPlatformTierLimitKey(key) {
  return PLATFORM_RESERVED_TIER_LIMIT_KEYS.includes(key);
}
function assertValidTierLimitSlice(moduleCode, slice) {
  const keys = [];
  for (const [key, value] of Object.entries(slice)) {
    if (!TIER_LIMIT_KEY_PATTERN.test(key)) {
      throw new InvalidTierLimitKeyError(key, moduleCode);
    }
    if (typeof value !== "number" && typeof value !== "boolean") {
      throw new InvalidTierLimitValueError(key, moduleCode, value);
    }
    if (isReservedPlatformTierLimitKey(key)) {
      throw new ReservedTierLimitKeyError(key, moduleCode);
    }
    const existingOwner = tierLimitKeyOwnerByKey.get(key);
    if (existingOwner !== void 0) {
      throw new TierLimitKeyCollisionError(key, moduleCode, existingOwner);
    }
    keys.push(key);
  }
  return keys;
}
function validateAndIndexTierLimits(moduleCode, tierLimits) {
  const keys = assertValidTierLimitSlice(moduleCode, tierLimits("free"));
  for (const key of keys) {
    tierLimitKeyOwnerByKey.set(key, moduleCode);
  }
  tierLimitKeysByModule.set(moduleCode, keys);
}
function clearTierLimitRegistryForTests() {
  tierLimitKeyOwnerByKey.clear();
  tierLimitKeysByModule.clear();
}
function listRegisteredTierLimitKeys(moduleCode) {
  return tierLimitKeysByModule.get(moduleCode) ?? [];
}

// src/moduleRegistry.ts
var modulesByCode = /* @__PURE__ */ new Map();
var documentTemplatesByRef = /* @__PURE__ */ new Map();
var routePromptOverlayByRouteId = /* @__PURE__ */ new Map();
var AI_PROMPT_MODULE_MAX_LENGTH = 4e3;
var AI_PROMPT_ROUTE_MAX_LENGTH = 1500;
var AI_PROMPT_KNOWLEDGE_MAX_LENGTH = 2048;
var InvalidAiPromptOverlayError = class extends Error {
  moduleCode;
  constructor(moduleCode, message) {
    super(`registerModule: invalid aiPrompts for module "${moduleCode}" (${message})`);
    this.name = "InvalidAiPromptOverlayError";
    this.moduleCode = moduleCode;
  }
};
var AiPromptRouteKeyAlreadyRegisteredError = class extends Error {
  routeId;
  existingModuleCode;
  conflictingModuleCode;
  constructor(routeId, existingModuleCode, conflictingModuleCode) {
    super(
      `registerModule: aiPrompts.routes key "${routeId}" is already registered by module "${existingModuleCode}" (conflict from "${conflictingModuleCode}")`
    );
    this.name = "AiPromptRouteKeyAlreadyRegisteredError";
    this.routeId = routeId;
    this.existingModuleCode = existingModuleCode;
    this.conflictingModuleCode = conflictingModuleCode;
  }
};
var ModuleCodeAlreadyRegisteredError = class extends Error {
  code;
  constructor(code) {
    super(`registerModule: module code "${code}" is already registered`);
    this.name = "ModuleCodeAlreadyRegisteredError";
    this.code = code;
  }
};
var InvalidModuleCodeError = class extends Error {
  code;
  constructor(code) {
    super(
      `registerModule: invalid module code "${code}" (expected lowercase alphanumeric, optional underscores; must start with a letter)`
    );
    this.name = "InvalidModuleCodeError";
    this.code = code;
  }
};
var InvalidDocumentTemplateRefError = class extends Error {
  ref;
  moduleCode;
  constructor(ref, moduleCode, reason) {
    super(
      `registerModule: invalid document template ref "${ref}" for module "${moduleCode}" (${reason})`
    );
    this.name = "InvalidDocumentTemplateRefError";
    this.ref = ref;
    this.moduleCode = moduleCode;
  }
};
var DocumentTemplateRefAlreadyRegisteredError = class extends Error {
  ref;
  constructor(ref) {
    super(`registerModule: document template ref "${ref}" is already registered`);
    this.name = "DocumentTemplateRefAlreadyRegisteredError";
    this.ref = ref;
  }
};
var MODULE_CODE_PATTERN = /^[a-z][a-z0-9_]*$/;
var DOCUMENT_TEMPLATE_REF_PATTERN = /^([a-z][a-z0-9_]*):([a-z][a-z0-9-]*)@(v[1-9][0-9]*)$/;
function assertValidModuleCode(code) {
  if (!MODULE_CODE_PATTERN.test(code)) {
    throw new InvalidModuleCodeError(code);
  }
}
function assertModuleCodeAvailable(code) {
  assertValidModuleCode(code);
  if (modulesByCode.has(code)) {
    throw new ModuleCodeAlreadyRegisteredError(code);
  }
}
function assertNonEmptyOverlayText(moduleCode, field, value, maxLength) {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new InvalidAiPromptOverlayError(moduleCode, `${field} must not be empty or whitespace`);
  }
  if (value.length > maxLength) {
    throw new InvalidAiPromptOverlayError(
      moduleCode,
      `${field} exceeds max length ${maxLength} (got ${value.length})`
    );
  }
}
function validateAndIndexAiPrompts(moduleCode, aiPrompts) {
  if (!aiPrompts) return;
  if (aiPrompts.module !== void 0) {
    assertNonEmptyOverlayText(moduleCode, "aiPrompts.module", aiPrompts.module, AI_PROMPT_MODULE_MAX_LENGTH);
  }
  if (aiPrompts.knowledge !== void 0) {
    assertNonEmptyOverlayText(
      moduleCode,
      "aiPrompts.knowledge",
      aiPrompts.knowledge,
      AI_PROMPT_KNOWLEDGE_MAX_LENGTH
    );
  }
  if (aiPrompts.routes) {
    for (const [routeId, overlay] of Object.entries(aiPrompts.routes)) {
      assertNonEmptyOverlayText(
        moduleCode,
        `aiPrompts.routes.${routeId}`,
        overlay,
        AI_PROMPT_ROUTE_MAX_LENGTH
      );
      const existingOwner = routePromptOverlayByRouteId.get(routeId);
      if (existingOwner !== void 0 && existingOwner !== moduleCode) {
        throw new AiPromptRouteKeyAlreadyRegisteredError(routeId, existingOwner, moduleCode);
      }
      routePromptOverlayByRouteId.set(routeId, moduleCode);
    }
  }
}
function recordModuleRegistration(options) {
  assertModuleCodeAvailable(options.code);
  const documentTemplates = validateDocumentTemplates(options.code, options.documentTemplates ?? []);
  validateAndIndexAiPrompts(options.code, options.aiPrompts);
  if (options.tierLimits !== void 0) {
    validateAndIndexTierLimits(options.code, options.tierLimits);
  }
  validateAndIndexAddonCodes(options.code, options.addonCodes);
  modulesByCode.set(options.code, options);
  for (const template of documentTemplates) {
    documentTemplatesByRef.set(template.ref, {
      moduleCode: options.code,
      template
    });
  }
  return snapshotModule(options.code);
}
function validateDocumentTemplates(moduleCode, templates) {
  const refsInThisModule = /* @__PURE__ */ new Set();
  for (const template of templates) {
    assertDocumentTemplateRefValid(moduleCode, template.ref);
    if (documentTemplatesByRef.has(template.ref) || refsInThisModule.has(template.ref)) {
      throw new DocumentTemplateRefAlreadyRegisteredError(template.ref);
    }
    refsInThisModule.add(template.ref);
  }
  return templates;
}
function assertDocumentTemplateRefValid(moduleCode, ref) {
  const match = DOCUMENT_TEMPLATE_REF_PATTERN.exec(ref);
  if (!match) {
    throw new InvalidDocumentTemplateRefError(
      ref,
      moduleCode,
      'expected "<module>:<template-name>@v<integer>"'
    );
  }
  const refModuleCode = match[1];
  if (refModuleCode !== moduleCode) {
    throw new InvalidDocumentTemplateRefError(
      ref,
      moduleCode,
      `module prefix "${refModuleCode}" does not match registered module code "${moduleCode}"`
    );
  }
}
function snapshotModule(code) {
  const entry = modulesByCode.get(code);
  if (!entry) {
    throw new Error(`moduleRegistry: unknown module code "${code}"`);
  }
  return {
    code: entry.code,
    ...entry.prismaSchema !== void 0 ? { prismaSchema: entry.prismaSchema } : {},
    addonCodes: entry.addonCodes ?? [],
    isCanonical: isCanonicalModuleCode(entry.code)
  };
}
function clearModuleRegistryForTests() {
  modulesByCode.clear();
  documentTemplatesByRef.clear();
  routePromptOverlayByRouteId.clear();
  clearTierLimitRegistryForTests();
  clearAddonCodeRegistryForTests();
}
function composeModuleTierLimitSlices(tier) {
  const merged = {};
  for (const [, entry] of Array.from(modulesByCode.entries()).sort(
    ([a], [b]) => a.localeCompare(b)
  )) {
    if (entry.tierLimits === void 0) continue;
    Object.assign(merged, entry.tierLimits(tier));
  }
  return merged;
}
function collectRegisteredModulePromptOverlays() {
  return Array.from(modulesByCode.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([code, entry]) => {
    const prompts = entry.aiPrompts;
    return {
      code,
      ...prompts?.module !== void 0 ? { module: prompts.module } : {},
      ...prompts?.knowledge !== void 0 ? { knowledge: prompts.knowledge } : {},
      routes: prompts?.routes ?? {}
    };
  });
}
function resolveRoutePromptOverlay(routeId) {
  const trimmed = routeId.trim();
  if (!trimmed) return void 0;
  const ownerCode = routePromptOverlayByRouteId.get(trimmed);
  if (!ownerCode) return void 0;
  const entry = modulesByCode.get(ownerCode);
  return entry?.aiPrompts?.routes?.[trimmed];
}
function collectModulePromptOverlayTexts() {
  const out = [];
  for (const snap of collectRegisteredModulePromptOverlays()) {
    if (snap.module && snap.module.trim().length > 0) {
      out.push(snap.module.trim());
    }
  }
  return out;
}
function collectModuleKnowledgeSnippets() {
  const out = [];
  for (const snap of collectRegisteredModulePromptOverlays()) {
    if (snap.knowledge && snap.knowledge.trim().length > 0) {
      out.push(snap.knowledge.trim());
    }
  }
  return out;
}
function listRegisteredModules() {
  return Array.from(modulesByCode.keys()).sort().map((code) => snapshotModule(code));
}
function getRegisteredDocumentTemplate(ref) {
  return documentTemplatesByRef.get(ref)?.template;
}
function listRegisteredDocumentTemplates() {
  return Array.from(documentTemplatesByRef.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([ref, entry]) => ({
    moduleCode: entry.moduleCode,
    ref,
    kind: entry.template.kind
  }));
}
function registerRegisteredModuleAiTools(registry, app) {
  const modules = Array.from(modulesByCode.entries()).sort(
    ([a], [b]) => a.localeCompare(b)
  );
  for (const [, options] of modules) {
    options.registerAiTools?.(registry, app);
  }
}

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

// src/registerNativeModule.ts
var nativeModulesByCode = /* @__PURE__ */ new Map();
function registerNativeModule(options) {
  assertValidModuleCode(options.code);
  if (nativeModulesByCode.has(options.code)) {
    throw new Error(`registerNativeModule: module code "${options.code}" is already registered`);
  }
  const snapshot = {
    code: options.code,
    availableRouteIds: [...options.availableRouteIds],
    ...options.tabEntry !== void 0 ? {
      tabEntry: {
        labelKey: options.tabEntry.labelKey,
        ...options.tabEntry.order !== void 0 ? { order: options.tabEntry.order } : {}
      }
    } : {}
  };
  nativeModulesByCode.set(options.code, snapshot);
  return snapshot;
}
function listRegisteredNativeModules() {
  return Array.from(nativeModulesByCode.keys()).sort().map((code) => {
    const snapshot = nativeModulesByCode.get(code);
    if (snapshot === void 0) {
      throw new Error(`listRegisteredNativeModules: registry inconsistency for code "${code}"`);
    }
    return snapshot;
  });
}
function aggregateNativeAvailableRouteIds() {
  const ids = /* @__PURE__ */ new Set();
  for (const mod of nativeModulesByCode.values()) {
    for (const id of mod.availableRouteIds) {
      ids.add(id);
    }
  }
  return Array.from(ids).sort();
}
function clearNativeModuleRegistryForTests() {
  nativeModulesByCode.clear();
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
var import_node_fs = require("fs");
var import_node_path = require("path");
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
  (0, import_node_path.resolve)(process.cwd(), "../.."),
  (0, import_node_path.resolve)(process.cwd(), "../../..")
].filter(Boolean);
function resolveRepoRoot(env = process.env) {
  const explicit = env["UMBRACULUM_REPO_ROOT"]?.trim();
  if (explicit) return explicit;
  for (const candidate of DEFAULT_REPO_ROOT_CANDIDATES) {
    if ((0, import_node_fs.existsSync)((0, import_node_path.resolve)(candidate, ".umbraculum/install.core.json"))) {
      return candidate;
    }
  }
  return process.cwd();
}
function resolveInstallManifestPath(env = process.env) {
  const override = env["UMBRACULUM_INSTALL_MANIFEST"]?.trim();
  if (override) {
    return (0, import_node_path.resolve)(override);
  }
  const repoRoot = resolveRepoRoot(env);
  const profileRaw = env["UMBRACULUM_MODULE_PROFILE"]?.trim();
  if (profileRaw) {
    const profile = profileRaw === "reference" ? "reference" : profileRaw === "platform" ? "platform" : null;
    if (profile === "reference") {
      return (0, import_node_path.resolve)(repoRoot, ".umbraculum/install.reference.json");
    }
    if (profile === "platform") {
      return (0, import_node_path.resolve)(repoRoot, ".umbraculum/install.core.json");
    }
    throw new InvalidModuleProfileError(profileRaw);
  }
  const active = (0, import_node_path.resolve)(repoRoot, ".umbraculum/install.json");
  if ((0, import_node_fs.existsSync)(active)) {
    return active;
  }
  return (0, import_node_path.resolve)(repoRoot, ".umbraculum/install.core.json");
}
function resolveModuleProfileFromEnv(env = process.env) {
  const raw = env["UMBRACULUM_MODULE_PROFILE"]?.trim();
  if (!raw) return "platform";
  if (raw === "platform" || raw === "reference") return raw;
  throw new InvalidModuleProfileError(raw);
}
function loadInstallationProfileManifest(env = process.env) {
  const path = resolveInstallManifestPath(env);
  if (!(0, import_node_fs.existsSync)(path)) {
    return fallbackManifestFromProfile(resolveModuleProfileFromEnv(env));
  }
  const raw = JSON.parse((0, import_node_fs.readFileSync)(path, "utf8"));
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
    nativeApps: ["starter"]
  };
}
function normalizeManifest(raw, profile) {
  const id = raw.id ?? (profile === "reference" ? "reference" : "core");
  const canonical = raw.canonical?.length ? raw.canonical : ["automation", "pim", "mrp", "crp"];
  const verticals = raw.verticals ?? (id === "reference" ? ["brewery"] : []);
  const nativeApps = raw.nativeApps?.length ? raw.nativeApps : id === "reference" ? ["brewery"] : ["starter"];
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
  if (apps.length === 0) return "starter";
  return apps[0] ?? "starter";
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AI_PROMPT_KNOWLEDGE_MAX_LENGTH,
  AI_PROMPT_MODULE_MAX_LENGTH,
  AI_PROMPT_ROUTE_MAX_LENGTH,
  AddonCodeAlreadyRegisteredError,
  AiPromptRouteKeyAlreadyRegisteredError,
  BUILTIN_MODULE_CODES,
  BUILTIN_WEB_MODULE_REGISTRATIONS,
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
  getRegisteredDocumentTemplate,
  getSegmentOwner,
  isCanonicalModuleCode,
  isModuleEnabled,
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
});
