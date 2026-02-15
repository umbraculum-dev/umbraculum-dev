/**
 * Shared web-app API types (DTOs).
 *
 * Coding standard:
 * - Prefer `interface` for DTO/object contracts (extensible, clear errors).
 * - Prefer `type` for unions/compositions.
 *
 * These shapes represent our own API responses (served under `/api/*` via nginx).
 * For *external* APIs, still define interfaces, but always validate at runtime.
 */

export interface MeResponse {
  ok: true;
  userId: string;
  activeAccountId: string | null;
  role: string | null;
}

export interface WaterProfile {
  id: string;
  key: string;
  scope: "system" | "account" | "public";
  type: "water" | "dilution";
  accountId: string | null;
  name: string;
  /** Optional: may be missing/unknown for some sources. Range 0–14. */
  ph?: number | null;
  /** ppm */
  calcium: number;
  /** ppm */
  magnesium: number;
  /** ppm */
  sodium: number;
  /** ppm */
  sulfate: number;
  /** ppm */
  chloride: number;
  /** ppm (as HCO3) */
  bicarbonate: number;
  verificationStatus: "verified" | "unverified";
  source: string;
}

export interface WaterProfilesResponse {
  ok: true;
  system: WaterProfile[];
  public: WaterProfile[];
  account: WaterProfile[];
}

