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

// src/theme/index.ts
var theme_exports = {};
__export(theme_exports, {
  FIELD_COMPUTED_BG: () => FIELD_COMPUTED_BG,
  FIELD_COMPUTED_BORDER: () => FIELD_COMPUTED_BORDER,
  FIELD_READONLY_BG: () => FIELD_READONLY_BG,
  FIELD_READONLY_BORDER: () => FIELD_READONLY_BORDER,
  SURFACE_BACKGROUND: () => SURFACE_BACKGROUND,
  SURFACE_BACKGROUND_SEMI: () => SURFACE_BACKGROUND_SEMI,
  SURFACE_BORDER: () => SURFACE_BORDER,
  SURFACE_CARD: () => SURFACE_CARD
});
module.exports = __toCommonJS(theme_exports);

// src/theme/colors.ts
var import_ui = require("@umbraculum/ui");
var SURFACE_BACKGROUND = "#1a1d22";
var SURFACE_BORDER = "#2a2f3a";
var SURFACE_BACKGROUND_SEMI = "rgba(26, 29, 34, 0.45)";
var FIELD_COMPUTED_BG = "#1e2e22";
var FIELD_COMPUTED_BORDER = "#2d5a3d";
var SURFACE_CARD = "#222734";
var FIELD_READONLY_BG = import_ui.FIELD_READONLY_BG;
var FIELD_READONLY_BORDER = import_ui.FIELD_READONLY_BORDER;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FIELD_COMPUTED_BG,
  FIELD_COMPUTED_BORDER,
  FIELD_READONLY_BG,
  FIELD_READONLY_BORDER,
  SURFACE_BACKGROUND,
  SURFACE_BACKGROUND_SEMI,
  SURFACE_BORDER,
  SURFACE_CARD
});
