import { describe, expect, it } from "vitest";

import { createKeyVault } from "../../services/ai/keyVault.js";

const VALID_KEY_HEX = "0".repeat(64); // 32 zero bytes — for tests only.
const VALID_KEY_HEX_ALT = "1".repeat(64);

describe("keyVault (AES-256-GCM)", () => {
  it("round-trips short and long plaintext", () => {
    const v = createKeyVault(VALID_KEY_HEX);
    for (const plaintext of ["sk-ant-abc", "x".repeat(1024), "🍺 unicode 漢字"]) {
      const ct = v.encrypt(plaintext);
      expect(v.decrypt(ct)).toBe(plaintext);
    }
  });

  it("produces a distinct nonce per encryption (different ciphertext for same input)", () => {
    const v = createKeyVault(VALID_KEY_HEX);
    const a = v.encrypt("hello");
    const b = v.encrypt("hello");
    expect(a).not.toBe(b);
    expect(v.decrypt(a)).toBe("hello");
    expect(v.decrypt(b)).toBe("hello");
  });

  it("uses the documented 3-part base64 wire format", () => {
    const v = createKeyVault(VALID_KEY_HEX);
    const ct = v.encrypt("hello");
    const parts = ct.split(":");
    expect(parts).toHaveLength(3);
    // 12-byte nonce → 16 base64 chars; 16-byte auth tag → 24 base64 chars (with padding).
    expect(Buffer.from(parts[0], "base64")).toHaveLength(12);
    expect(Buffer.from(parts[2], "base64")).toHaveLength(16);
  });

  it("rejects keys of the wrong length", () => {
    expect(() => createKeyVault("abc")).toThrow();
    expect(() => createKeyVault("0".repeat(63))).toThrow();
    expect(() => createKeyVault("0".repeat(65))).toThrow();
  });

  it("decryption with the wrong key fails (authenticity)", () => {
    const a = createKeyVault(VALID_KEY_HEX);
    const b = createKeyVault(VALID_KEY_HEX_ALT);
    const ct = a.encrypt("secret");
    expect(() => b.decrypt(ct)).toThrow();
  });

  it("decryption of tampered ciphertext fails", () => {
    const v = createKeyVault(VALID_KEY_HEX);
    const ct = v.encrypt("secret");
    const parts = ct.split(":");
    // Flip the last bit of the ciphertext.
    const buf = Buffer.from(parts[1], "base64");
    buf[0] = buf[0] ^ 0x01;
    parts[1] = buf.toString("base64");
    expect(() => v.decrypt(parts.join(":"))).toThrow();
  });

  it("decryption rejects malformed wire formats", () => {
    const v = createKeyVault(VALID_KEY_HEX);
    expect(() => v.decrypt("not-three-parts")).toThrow();
    expect(() => v.decrypt("a:b")).toThrow();
    expect(() => v.decrypt("a:b:c:d")).toThrow();
  });
});
