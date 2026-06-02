import {
  getParsed,
  toClientPath
} from "../chunk-67WUASDX.js";

// src/automation/vessels.ts
import {
  VesselListResponseSchema,
  VesselStateResponseSchema
} from "@umbraculum/automation-contracts";
async function listVessels(client) {
  return getParsed(
    client,
    toClientPath("/automation/vessels"),
    (data) => VesselListResponseSchema.parse(data)
  );
}
async function getVessel(client, code) {
  return getParsed(
    client,
    toClientPath(`/automation/vessels/${encodeURIComponent(code)}`),
    (data) => VesselStateResponseSchema.parse(data)
  );
}
export {
  getVessel,
  listVessels
};
