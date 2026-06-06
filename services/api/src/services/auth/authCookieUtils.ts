import { createHash, randomBytes } from "node:crypto";

export const SESSION_TTL_DAYS = 14;
export const WEBVIEW_EXCHANGE_TTL_SECONDS = 60;

export function nowPlusDays(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export function nowPlusSeconds(seconds: number) {
  return new Date(Date.now() + seconds * 1000);
}

export function makeOpaqueId(bytes = 32) {
  return randomBytes(bytes).toString("hex");
}

export function sha256Hex(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env["NODE_ENV"] === "production",
  };
}
