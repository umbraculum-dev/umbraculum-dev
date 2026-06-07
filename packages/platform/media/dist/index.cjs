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
  getMediaPublicPath: () => getMediaPublicPath,
  getMediaUrl: () => getMediaUrl,
  isMediaAssetKey: () => isMediaAssetKey,
  mediaManifest: () => mediaManifest
});
module.exports = __toCommonJS(index_exports);

// src/manifest.generated.ts
var mediaManifest = {};

// src/manifest.ts
var manifestByKey = mediaManifest;
function isMediaAssetKey(value) {
  return Object.prototype.hasOwnProperty.call(mediaManifest, value);
}
function getMediaPublicPath(key) {
  const entry = manifestByKey[key];
  if (!entry) {
    throw new Error(`Unknown media asset key: ${String(key)}`);
  }
  return entry.publicPath;
}
function getMediaUrl(key, options) {
  const base = options.baseUrl.replace(/\/+$/, "");
  const path = getMediaPublicPath(key);
  return `${base}${path}`;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getMediaPublicPath,
  getMediaUrl,
  isMediaAssetKey,
  mediaManifest
});
