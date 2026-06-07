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

// src/tamagui/config.web.ts
var config_web_exports = {};
__export(config_web_exports, {
  config: () => config,
  default: () => config_web_default
});
module.exports = __toCommonJS(config_web_exports);
var import_animations_css = require("@tamagui/animations-css");
var import_v5 = require("@tamagui/config/v5");
var import_tamagui = require("tamagui");
var config = (0, import_tamagui.createTamagui)({
  ...import_v5.defaultConfig,
  animations: (0, import_animations_css.createAnimations)({
    quick: "ease-out 150ms",
    medium: "ease-in 300ms",
    slow: "ease-in 450ms"
  }),
  media: {
    ...import_v5.defaultConfig.media,
    narrow: { maxWidth: 880 },
    gtNarrow: { minWidth: 881 },
    mobile: { maxWidth: 520 },
    touch: { pointer: "coarse" }
  }
});
var config_web_default = config;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  config
});
