import { mediaManifest } from "./manifest.generated";

export interface MediaAsset {
  /**
   * Stable key derived from the source path under `assets/**`.
   * Example: `yeast/dilution-1-100.png`.
   */
  key: string;
  /**
   * Public path under `/media/**` (hashed filename).
   * Example: `/media/yeast/dilution-1-100.<hash>.png`.
   */
  publicPath: string;
  /**
   * Hex-encoded SHA-256 of the file contents.
   */
  sha256: string;
  /**
   * File size in bytes.
   */
  bytes: number;
}

export type MediaAssetKey = keyof typeof mediaManifest;

const manifestByKey = mediaManifest as unknown as Record<string, MediaAsset>;

export function isMediaAssetKey(value: string): value is MediaAssetKey {
  return Object.prototype.hasOwnProperty.call(mediaManifest, value);
}

export function getMediaPublicPath(key: MediaAssetKey): string {
  const entry = manifestByKey[key as string];
  if (!entry) {
    throw new Error(`Unknown media asset key: ${String(key)}`);
  }
  return entry.publicPath;
}

export function getMediaUrl(key: MediaAssetKey, options: { baseUrl: string }): string {
  const base = options.baseUrl.replace(/\/+$/, "");
  const path = getMediaPublicPath(key);
  return `${base}${path}`;
}

export { mediaManifest };

