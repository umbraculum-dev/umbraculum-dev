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

// src/automation/index.ts
var automation_exports = {};
__export(automation_exports, {
  getVessel: () => getVessel,
  listVessels: () => listVessels
});
module.exports = __toCommonJS(automation_exports);

// src/automation/vessels.ts
var import_automation_contracts = require("@umbraculum/automation-contracts");

// src/internal/clientPath.ts
function toClientPath(openApiPath) {
  return `/api${openApiPath}`;
}

// src/errors.ts
function messageFromApiResponse(res) {
  const data = res.data;
  if (typeof data === "string") {
    const trimmed = data.trim();
    if (/^<!DOCTYPE html/i.test(trimmed) || /^<html[\s>]/i.test(trimmed)) {
      const title = trimmed.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim();
      const h1 = trimmed.match(/<h1>([^<]*)<\/h1>/i)?.[1]?.trim();
      const label = title || h1 || "upstream error";
      return `API unavailable (${res.status}): ${label}`;
    }
    if (trimmed.length > 500) {
      return `API request failed (${res.status})`;
    }
    return trimmed || `API request failed (${res.status})`;
  }
  if (data && typeof data === "object") {
    const rec = data;
    const message = rec["message"];
    if (typeof message === "string" && message.trim()) return message.trim();
    const error = rec["error"];
    if (typeof error === "string" && error.trim()) return error.trim();
  }
  try {
    const json = JSON.stringify(data);
    if (json && json !== "null" && json !== "{}") return json;
  } catch {
  }
  return `API request failed (${res.status})`;
}
var ApiClientError = class extends Error {
  status;
  body;
  constructor(res) {
    super(messageFromApiResponse(res));
    this.name = "ApiClientError";
    this.status = res.status;
    this.body = res.data;
  }
};

// src/internal/httpJson.ts
function assertOk(res, expectedStatus = 200) {
  if (res.status !== expectedStatus || !res.ok) {
    throw new ApiClientError(res);
  }
}
async function getParsed(client, path, parse, expectedStatus = 200) {
  const res = await client.get(path);
  assertOk(res, expectedStatus);
  return parse(res.data);
}

// src/automation/vessels.ts
async function listVessels(client) {
  return getParsed(
    client,
    toClientPath("/automation/vessels"),
    (data) => import_automation_contracts.VesselListResponseSchema.parse(data)
  );
}
async function getVessel(client, code) {
  return getParsed(
    client,
    toClientPath(`/automation/vessels/${encodeURIComponent(code)}`),
    (data) => import_automation_contracts.VesselStateResponseSchema.parse(data)
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getVessel,
  listVessels
});
