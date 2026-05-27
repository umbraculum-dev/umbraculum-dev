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

// src/moduleRegistry.ts
var modulesByCode = /* @__PURE__ */ new Map();
var documentTemplatesByRef = /* @__PURE__ */ new Map();
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
function recordModuleRegistration(options) {
  assertModuleCodeAvailable(options.code);
  const documentTemplates = validateDocumentTemplates(options.code, options.documentTemplates ?? []);
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

// src/registerWebModule.ts
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
      `registerWebModule(${code}): navEntry.primarySegment "${primarySegment}" must appear in ownedUrlSegments`
    );
    this.name = "NavEntryPrimarySegmentNotOwnedError";
    this.code = code;
    this.primarySegment = primarySegment;
  }
};
var URL_SEGMENT_PATTERN = /^[a-z][a-z0-9-]*$/;
var webModulesByCode = /* @__PURE__ */ new Map();
var segmentOwnership = /* @__PURE__ */ new Map();
function registerWebModule(options) {
  assertValidModuleCode(options.code);
  if (webModulesByCode.has(options.code)) {
    throw new Error(`registerWebModule: module code "${options.code}" is already registered`);
  }
  const ownedUrlSegments = options.ownedUrlSegments ?? [];
  for (const segment of ownedUrlSegments) {
    if (!URL_SEGMENT_PATTERN.test(segment)) {
      throw new InvalidUrlSegmentError(segment, options.code);
    }
    const existingOwner = segmentOwnership.get(segment);
    if (existingOwner !== void 0) {
      throw new UrlSegmentAlreadyOwnedError(segment, options.code, existingOwner);
    }
  }
  if (options.navEntry !== void 0) {
    const owned = new Set(ownedUrlSegments);
    if (!owned.has(options.navEntry.primarySegment)) {
      throw new NavEntryPrimarySegmentNotOwnedError(
        options.code,
        options.navEntry.primarySegment
      );
    }
  }
  for (const segment of ownedUrlSegments) {
    segmentOwnership.set(segment, options.code);
  }
  const snapshot = {
    code: options.code,
    ownedUrlSegments: [...ownedUrlSegments],
    ...options.navEntry !== void 0 ? {
      navEntry: {
        primarySegment: options.navEntry.primarySegment,
        labelKey: options.navEntry.labelKey,
        ...options.navEntry.order !== void 0 ? { order: options.navEntry.order } : {}
      }
    } : {}
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
export {
  DocumentTemplateRefAlreadyRegisteredError,
  InvalidDocumentTemplateRefError,
  InvalidModuleCodeError,
  InvalidUrlSegmentError,
  ModuleCodeAlreadyRegisteredError,
  NavEntryPrimarySegmentNotOwnedError,
  RESERVED_CANONICAL_MODULE_CODES,
  UrlSegmentAlreadyOwnedError,
  aggregateNativeAvailableRouteIds,
  assertModuleCodeAvailable,
  assertValidModuleCode,
  clearModuleRegistryForTests,
  clearNativeModuleRegistryForTests,
  clearWebModuleRegistryForTests,
  fromParser,
  getRegisteredDocumentTemplate,
  getSegmentOwner,
  isCanonicalModuleCode,
  listOwnedUrlSegments,
  listRegisteredDocumentTemplates,
  listRegisteredModules,
  listRegisteredNativeModules,
  listRegisteredWebModules,
  recordModuleRegistration,
  registerModule,
  registerNativeModule,
  registerRegisteredModuleAiTools,
  registerWebModule,
  snapshotModule,
  snapshotSegmentOwnership
};
