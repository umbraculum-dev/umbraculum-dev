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
  InvalidMessageSubkeySegmentError: () => InvalidMessageSubkeySegmentError,
  InvalidModuleMessageRootError: () => InvalidModuleMessageRootError,
  MESSAGE_SUBKEY_SEGMENT_PATTERN: () => MESSAGE_SUBKEY_SEGMENT_PATTERN,
  MODULE_MESSAGE_ROOT_PATTERN: () => MODULE_MESSAGE_ROOT_PATTERN,
  NAV_MESSAGE_PREFIX: () => NAV_MESSAGE_PREFIX,
  RESERVED_PLATFORM_MESSAGE_ROOTS: () => RESERVED_PLATFORM_MESSAGE_ROOTS,
  ReservedPlatformMessageRootError: () => ReservedPlatformMessageRootError,
  assertValidModuleMessageRoot: () => assertValidModuleMessageRoot,
  composeModuleMessageKey: () => composeModuleMessageKey,
  defaultModuleNavLabelKey: () => defaultModuleNavLabelKey,
  isModuleNavLabelKey: () => isModuleNavLabelKey,
  isReservedPlatformMessageRoot: () => isReservedPlatformMessageRoot,
  isValidModuleMessageRoot: () => isValidModuleMessageRoot,
  moduleMessageRoot: () => moduleMessageRoot
});
module.exports = __toCommonJS(index_exports);

// src/messageKeys.ts
var MODULE_MESSAGE_ROOT_PATTERN = /^[a-z][a-z0-9_]*$/;
var MESSAGE_SUBKEY_SEGMENT_PATTERN = /^[a-z][a-zA-Z0-9]*$/;
var NAV_MESSAGE_PREFIX = "nav";
var RESERVED_PLATFORM_MESSAGE_ROOTS = [
  "about",
  "accessibility",
  "ads",
  "ai",
  "auth",
  "common",
  "contact",
  "contributing",
  "dashboard",
  "devDashboard",
  "health",
  "i18nContributing",
  "locales",
  "math",
  "nav",
  "platform",
  "platformAds",
  "platformRecipes",
  "salts",
  "ui",
  "units",
  "waterHub"
];
var InvalidModuleMessageRootError = class extends Error {
  root;
  constructor(root) {
    super(
      `Invalid module message root "${root}" (expected lowercase alphanumeric with optional underscores, starting with a letter \u2014 same shape as registerModule({ code }))`
    );
    this.name = "InvalidModuleMessageRootError";
    this.root = root;
  }
};
var ReservedPlatformMessageRootError = class extends Error {
  root;
  constructor(root) {
    super(
      `Message root "${root}" is reserved for platform-owned locale namespaces (see RESERVED_PLATFORM_MESSAGE_ROOTS in @umbraculum/i18n-keys)`
    );
    this.name = "ReservedPlatformMessageRootError";
    this.root = root;
  }
};
var InvalidMessageSubkeySegmentError = class extends Error {
  segment;
  constructor(segment) {
    super(
      `Invalid message sub-key segment "${segment}" (expected camelCase starting with a lowercase letter, matching MESSAGE_SUBKEY_SEGMENT_PATTERN)`
    );
    this.name = "InvalidMessageSubkeySegmentError";
    this.segment = segment;
  }
};
function isValidModuleMessageRoot(root) {
  return MODULE_MESSAGE_ROOT_PATTERN.test(root);
}
function isReservedPlatformMessageRoot(root) {
  return RESERVED_PLATFORM_MESSAGE_ROOTS.includes(root);
}
function assertValidModuleMessageRoot(root) {
  if (!isValidModuleMessageRoot(root)) {
    throw new InvalidModuleMessageRootError(root);
  }
  if (isReservedPlatformMessageRoot(root)) {
    throw new ReservedPlatformMessageRootError(root);
  }
}
function moduleMessageRoot(code) {
  assertValidModuleMessageRoot(code);
  return code;
}
function defaultModuleNavLabelKey(code) {
  assertValidModuleMessageRoot(code);
  return `${NAV_MESSAGE_PREFIX}.${code}`;
}
function composeModuleMessageKey(root, ...segments) {
  for (const segment of segments) {
    if (!MESSAGE_SUBKEY_SEGMENT_PATTERN.test(segment)) {
      throw new InvalidMessageSubkeySegmentError(segment);
    }
  }
  if (segments.length === 0) {
    return root;
  }
  return [root, ...segments].join(".");
}
function isModuleNavLabelKey(key) {
  return key.startsWith(`${NAV_MESSAGE_PREFIX}.`) && key.length > NAV_MESSAGE_PREFIX.length + 1;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  InvalidMessageSubkeySegmentError,
  InvalidModuleMessageRootError,
  MESSAGE_SUBKEY_SEGMENT_PATTERN,
  MODULE_MESSAGE_ROOT_PATTERN,
  NAV_MESSAGE_PREFIX,
  RESERVED_PLATFORM_MESSAGE_ROOTS,
  ReservedPlatformMessageRootError,
  assertValidModuleMessageRoot,
  composeModuleMessageKey,
  defaultModuleNavLabelKey,
  isModuleNavLabelKey,
  isReservedPlatformMessageRoot,
  isValidModuleMessageRoot,
  moduleMessageRoot
});
