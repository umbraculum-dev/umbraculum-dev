/**
 * Water profile DTOs. Shared by web and native clients.
 */

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

function isString(v: unknown): v is string {
  return typeof v === "string";
}

function isNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function isObject(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

const SCOPES = ["system", "account", "public"] as const;
const TYPES = ["water", "dilution"] as const;
const VERIFICATION_STATUSES = ["verified", "unverified"] as const;

function parseWaterProfile(v: unknown): WaterProfile {
  if (!isObject(v)) throw new Error("Invalid WaterProfile: expected object");
  const id = isString(v.id) ? v.id : "";
  const key = isString(v.key) ? v.key : "";
  const scope = isString(v.scope) && SCOPES.includes(v.scope as any) ? (v.scope as WaterProfile["scope"]) : "system";
  const type = isString(v.type) && TYPES.includes(v.type as any) ? (v.type as WaterProfile["type"]) : "water";
  const accountId = v.accountId === null ? null : isString(v.accountId) ? v.accountId : null;
  const name = isString(v.name) ? v.name : "";
  const ph = v.ph === null || v.ph === undefined ? undefined : isNumber(v.ph) ? v.ph : undefined;
  const calcium = isNumber(v.calcium) ? v.calcium : 0;
  const magnesium = isNumber(v.magnesium) ? v.magnesium : 0;
  const sodium = isNumber(v.sodium) ? v.sodium : 0;
  const sulfate = isNumber(v.sulfate) ? v.sulfate : 0;
  const chloride = isNumber(v.chloride) ? v.chloride : 0;
  const bicarbonate = isNumber(v.bicarbonate) ? v.bicarbonate : 0;
  const verificationStatus = isString(v.verificationStatus) && VERIFICATION_STATUSES.includes(v.verificationStatus as any)
    ? (v.verificationStatus as WaterProfile["verificationStatus"])
    : "unverified";
  const source = isString(v.source) ? v.source : "";
  if (!id || !key || !name) throw new Error("Invalid WaterProfile: id, key, name required");
  return {
    id,
    key,
    scope,
    type,
    accountId,
    name,
    ph,
    calcium,
    magnesium,
    sodium,
    sulfate,
    chloride,
    bicarbonate,
    verificationStatus,
    source,
  };
}

/**
 * Parse and validate WaterProfile. Throws on invalid payload.
 */
export function parseWaterProfileItem(payload: unknown): WaterProfile {
  return parseWaterProfile(payload);
}

function parseArray<T>(v: unknown, parse: (x: unknown) => T): T[] {
  if (!Array.isArray(v)) throw new Error("Expected array");
  return v.map((x, i) => {
    try {
      return parse(x);
    } catch (e) {
      throw new Error("Invalid array item[" + i + "]: " + (e instanceof Error ? e.message : String(e)));
    }
  });
}

/**
 * Parse and validate /water-profiles response. Throws on invalid payload.
 */
export function parseWaterProfilesResponse(payload: unknown): WaterProfilesResponse {
  if (!isObject(payload)) throw new Error("Invalid WaterProfilesResponse: expected object");
  if (payload.ok !== true) throw new Error("Invalid WaterProfilesResponse: ok must be true");
  const system = parseArray(payload.system, parseWaterProfile);
  const publicProfiles = parseArray(payload.public, parseWaterProfile);
  const account = parseArray(payload.account, parseWaterProfile);
  return { ok: true, system, public: publicProfiles, account };
}
