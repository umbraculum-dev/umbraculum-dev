import { createHmac, timingSafeEqual } from "node:crypto";

export interface SignedArtifactUrlOptions {
  readonly secret: string;
  readonly ttlMs?: number;
  readonly basePath?: string;
  readonly now?: () => Date;
}

export interface SignedArtifactUrl {
  readonly url: string;
  readonly expiresAt: Date;
}

const DEFAULT_TTL_MS = 5 * 60 * 1000;

function digest(secret: string, artifactId: string, expiresAtMs: number): string {
  return createHmac("sha256", secret)
    .update(`${artifactId}.${expiresAtMs}`)
    .digest("hex");
}

export function createSignedArtifactUrl(
  artifactId: string,
  options: SignedArtifactUrlOptions,
): SignedArtifactUrl {
  const now = options.now?.() ?? new Date();
  const expiresAtMs = now.getTime() + (options.ttlMs ?? DEFAULT_TTL_MS);
  const signature = digest(options.secret, artifactId, expiresAtMs);
  const basePath = options.basePath ?? "/rendering/artifacts";

  return {
    url: `${basePath}/${encodeURIComponent(artifactId)}?expires=${expiresAtMs}&signature=${signature}`,
    expiresAt: new Date(expiresAtMs),
  };
}

export function verifySignedArtifactUrl(
  artifactId: string,
  expiresRaw: unknown,
  signatureRaw: unknown,
  options: SignedArtifactUrlOptions,
): boolean {
  if (typeof expiresRaw !== "string" || typeof signatureRaw !== "string") {
    return false;
  }
  const expiresAtMs = Number(expiresRaw);
  if (!Number.isSafeInteger(expiresAtMs)) return false;

  const now = options.now?.() ?? new Date();
  if (expiresAtMs <= now.getTime()) return false;

  const expected = digest(options.secret, artifactId, expiresAtMs);
  const expectedBytes = Buffer.from(expected, "hex");
  const actualBytes = Buffer.from(signatureRaw, "hex");
  if (expectedBytes.byteLength !== actualBytes.byteLength) return false;

  return timingSafeEqual(expectedBytes, actualBytes);
}
