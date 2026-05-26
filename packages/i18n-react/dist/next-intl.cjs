"use strict";
"use client";
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

// src/next-intl.ts
var next_intl_exports = {};
__export(next_intl_exports, {
  useT: () => useT
});
module.exports = __toCommonJS(next_intl_exports);
var import_next_intl = require("next-intl");
function useT(namespace) {
  const t = (0, import_next_intl.useTranslations)(namespace);
  return {
    t: (key, values) => t(key, values),
    rich: (key, values) => (
      // Cast through `unknown` because next-intl's RichTranslationValues is a
      // narrower shape than ours (it requires React-specific tag functions).
      // Our type is intentionally looser for cross-platform use.
      t.rich(key, values)
    )
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  useT
});
