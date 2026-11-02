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

// src/native.ts
var native_exports = {};
__export(native_exports, {
  aggregateNativeAvailableRouteIds: () => aggregateNativeAvailableRouteIds,
  clearNativeModuleRegistryForTests: () => clearNativeModuleRegistryForTests,
  listRegisteredNativeModules: () => listRegisteredNativeModules,
  registerNativeModule: () => registerNativeModule
});
module.exports = __toCommonJS(native_exports);

// src/moduleRegistry.ts
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  aggregateNativeAvailableRouteIds,
  clearNativeModuleRegistryForTests,
  listRegisteredNativeModules,
  registerNativeModule
});
