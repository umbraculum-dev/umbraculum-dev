// src/errors.ts
var ApiClientError = class extends Error {
  status;
  body;
  constructor(res) {
    const detail = typeof res.data === "string" ? res.data : JSON.stringify(res.data);
    super(detail || `API request failed (${res.status})`);
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

export {
  ApiClientError,
  toClientPath,
  assertOk,
  getParsed,
  postParsed,
  putParsed,
  patchParsed,
  deleteParsed
};
