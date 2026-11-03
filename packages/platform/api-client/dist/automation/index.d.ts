import { VesselStateResponse, VesselListResponse } from '@umbraculum/automation-contracts';
import { A as ApiClient } from '../client-zbAgg_TE.js';
import { p as paths } from '../platform.openapi-DFK6FUu2.js';

type AutomationVesselsListPath = "/automation/vessels";
type AutomationVesselsListGet = paths[AutomationVesselsListPath]["get"];
type AutomationVesselDetailPath = "/automation/vessels/{code}";
type AutomationVesselDetailGet = paths[AutomationVesselDetailPath]["get"];

declare function listVessels(client: ApiClient): Promise<VesselListResponse>;
declare function getVessel(client: ApiClient, code: string): Promise<VesselStateResponse>;

export { type AutomationVesselDetailGet, type AutomationVesselsListGet, getVessel, listVessels };
