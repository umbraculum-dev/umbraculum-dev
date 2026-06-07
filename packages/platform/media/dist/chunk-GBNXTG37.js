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

export {
  mediaManifest,
  isMediaAssetKey,
  getMediaPublicPath,
  getMediaUrl
};
