import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

/**
 * Key vault — symmetric AES-256-GCM helper used to protect customer-supplied
 * AI provider API keys at rest (BYOK).
 *
 * Wire format: `<nonceB64>:<ciphertextB64>:<authTagB64>` (three colon-separated
 * base64 chunks). 12-byte nonce, 16-byte authentication tag — matches NIST
 * SP 800-38D defaults. The master key MUST be 32 bytes (64 hex chars) and is
 * sourced from `APP_AI_KEY_SECRET` in production.
 *
 * Threat model the vault addresses:
 *   - DB dump or backup leak ⇒ stored ciphertext is useless without the
 *     master key, which lives in the app environment, not the DB.
 *
 * Threats it does NOT address (and must not pretend to):
 *   - Compromise of the running API process; the plaintext key is exposed
 *     in-process for the duration of an outbound provider call.
 *   - Compromise of the operator account that can read both DB and env.
 */

const ALGORITHM = "aes-256-gcm";
const NONCE_LEN = 12;
const AUTH_TAG_LEN = 16;
const MASTER_KEY_LEN = 32; // 256 bits

export interface KeyVault {
  /** Encrypt a UTF-8 string to the wire format described above. */
  encrypt(plaintext: string): string;
  /** Decrypt a wire-format ciphertext blob back to its UTF-8 plaintext. */
  decrypt(ciphertext: string): string;
}

/**
 * Build a vault from a hex-encoded 32-byte master key. Throws synchronously
 * if the key length is wrong — fail fast on misconfiguration.
 */
export function createKeyVault(masterKeyHex: string): KeyVault {
  if (typeof masterKeyHex !== "string" || masterKeyHex.length !== MASTER_KEY_LEN * 2) {
    throw new Error(
      `keyVault: master key must be ${MASTER_KEY_LEN * 2} hex chars (got ${
        typeof masterKeyHex === "string" ? masterKeyHex.length : typeof masterKeyHex
      })`,
    );
  }
  const masterKey = Buffer.from(masterKeyHex, "hex");
  if (masterKey.length !== MASTER_KEY_LEN) {
    throw new Error(`keyVault: master key must decode to ${MASTER_KEY_LEN} bytes`);
  }

  return {
    encrypt(plaintext: string): string {
      const nonce = randomBytes(NONCE_LEN);
      const cipher = createCipheriv(ALGORITHM, masterKey, nonce);
      const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
      const authTag = cipher.getAuthTag();
      return `${nonce.toString("base64")}:${ciphertext.toString("base64")}:${authTag.toString("base64")}`;
    },
    decrypt(blob: string): string {
      if (typeof blob !== "string") {
        throw new Error("keyVault.decrypt: input must be a string");
      }
      const parts = blob.split(":");
      if (parts.length !== 3) {
        throw new Error("keyVault.decrypt: expected 3 colon-separated parts");
      }
      const [nonceB64, ctB64, tagB64] = parts;
      const nonce = Buffer.from(nonceB64, "base64");
      const ciphertext = Buffer.from(ctB64, "base64");
      const authTag = Buffer.from(tagB64, "base64");
      if (nonce.length !== NONCE_LEN) {
        throw new Error(`keyVault.decrypt: nonce must be ${NONCE_LEN} bytes`);
      }
      if (authTag.length !== AUTH_TAG_LEN) {
        throw new Error(`keyVault.decrypt: auth tag must be ${AUTH_TAG_LEN} bytes`);
      }
      const decipher = createDecipheriv(ALGORITHM, masterKey, nonce);
      decipher.setAuthTag(authTag);
      const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
      return plaintext.toString("utf8");
    },
  };
}

/**
 * Resolve a vault from the process environment. In production, missing
 * `APP_AI_KEY_SECRET` is a hard failure. In `NODE_ENV !== "production"`,
 * a fixed dev default is used so developer environments boot without
 * ceremony — see `services/api/.env.sample` for the value (this default
 * protects nothing real; do NOT reuse it in production).
 */
export function getKeyVaultFromEnv(): KeyVault {
  const fromEnv = process.env.APP_AI_KEY_SECRET;
  if (fromEnv && fromEnv.length > 0) {
    return createKeyVault(fromEnv);
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "APP_AI_KEY_SECRET is required in production (32-byte hex). Generate one with `openssl rand -hex 32`.",
    );
  }
  // Dev-only default (32 zero bytes hex). Intentionally well-known to keep
  // encrypted blobs round-trippable across developer machines.
  return createKeyVault("00".repeat(MASTER_KEY_LEN));
}
