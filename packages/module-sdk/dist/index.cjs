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
  InvalidModuleCodeError: () => InvalidModuleCodeError,
  ModuleCodeAlreadyRegisteredError: () => ModuleCodeAlreadyRegisteredError,
  RESERVED_CANONICAL_MODULE_CODES: () => RESERVED_CANONICAL_MODULE_CODES,
  assertModuleCodeAvailable: () => assertModuleCodeAvailable,
  assertValidModuleCode: () => assertValidModuleCode,
  clearModuleRegistryForTests: () => clearModuleRegistryForTests,
  clearWebModuleRegistryForTests: () => clearWebModuleRegistryForTests,
  fromParser: () => fromParser,
  isCanonicalModuleCode: () => isCanonicalModuleCode,
  listRegisteredModules: () => listRegisteredModules,
  recordModuleRegistration: () => recordModuleRegistration,
  registerModule: () => registerModule,
  registerWebModule: () => registerWebModule,
  snapshotModule: () => snapshotModule
});
module.exports = __toCommonJS(index_exports);

// src/reservedCodes.ts
var RESERVED_CANONICAL_MODULE_CODES = [
  "mrp",
  "wms",
  "crm",
  "crp",
  "automation"
];
function isCanonicalModuleCode(code) {
  return RESERVED_CANONICAL_MODULE_CODES.includes(code);
}

// src/moduleRegistry.ts
var modulesByCode = /* @__PURE__ */ new Map();
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
var MODULE_CODE_PATTERN = /^[a-z][a-z0-9_]*$/;
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
  modulesByCode.set(options.code, options);
  return snapshotModule(options.code);
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
}
function listRegisteredModules() {
  return Array.from(modulesByCode.keys()).sort().map((code) => snapshotModule(code));
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
var webModulesByCode = /* @__PURE__ */ new Set();
function registerWebModule(options) {
  assertValidModuleCode(options.code);
  if (webModulesByCode.has(options.code)) {
    throw new Error(`registerWebModule: module code "${options.code}" is already registered`);
  }
  webModulesByCode.add(options.code);
  return { code: options.code };
}
function clearWebModuleRegistryForTests() {
  webModulesByCode.clear();
}

// src/validatedSchema.ts
function fromParser(parser) {
  return {
    parse(input) {
      return parser(input);
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  InvalidModuleCodeError,
  ModuleCodeAlreadyRegisteredError,
  RESERVED_CANONICAL_MODULE_CODES,
  assertModuleCodeAvailable,
  assertValidModuleCode,
  clearModuleRegistryForTests,
  clearWebModuleRegistryForTests,
  fromParser,
  isCanonicalModuleCode,
  listRegisteredModules,
  recordModuleRegistration,
  registerModule,
  registerWebModule,
  snapshotModule
});
