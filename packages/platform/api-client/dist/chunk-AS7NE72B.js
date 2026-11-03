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

// src/internal/clientPath.ts
function toClientPath(openApiPath) {
  return `/api${openApiPath}`;
}

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
async function postParsed(client, path, body, parse, expectedStatus = 200) {
  const res = await client.post(path, body);
  assertOk(res, expectedStatus);
  return parse(res.data);
}
async function putParsed(client, path, body, parse, expectedStatus = 200) {
  const res = await client.put(path, body);
  assertOk(res, expectedStatus);
  return parse(res.data);
}
async function patchParsed(client, path, body, parse, expectedStatus = 200) {
  const res = await client.patch(path, body);
  assertOk(res, expectedStatus);
  return parse(res.data);
}
async function deleteParsed(client, path, parse, expectedStatus = 200) {
  const res = await client.delete(path);
  assertOk(res, expectedStatus);
  return parse(res.data);
}
async function getBytesParsed(client, path, parse, expectedStatus = 200) {
  const res = await client.get(path);
  assertOk(res, expectedStatus);
  return parse(res.data);
}

export {
  ApiClientError,
  toClientPath,
  assertOk,
  getParsed,
  postParsed,
  putParsed,
  patchParsed,
  deleteParsed,
  getBytesParsed
};
