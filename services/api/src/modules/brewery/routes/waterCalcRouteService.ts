import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { ErrorResponseSchema } from "@umbraculum/contracts";
import { WaterCalcRequestSchema, WaterCalcResultOnlyResponseSchema, WaterCalcWithDerivationResponseSchema } from "@umbraculum/brewery-contracts";

import { requireActiveWorkspace } from "../../../plugins/requestContext.js";
import { WaterCalcService } from "../services/waterCalcService.js";

export class WaterCalcRouteService {
  constructor(private readonly svc = new WaterCalcService()) {}

  registerRoutes(app: FastifyInstance): void {
    const zodApp = app.withTypeProvider<ZodTypeProvider>();

    zodApp.post(
      "/water-calc/sparge-acidification",
      {
        schema: {
          tags: ["brewery"],
          body: WaterCalcRequestSchema,
          response: {
            200: WaterCalcWithDerivationResponseSchema,
            401: ErrorResponseSchema,
          },
        },
      },
      (req) => {
        requireActiveWorkspace(req);
        return this.svc.spargeAcidification((req.body ?? {}) as Record<string, unknown>);
      },
    );

    zodApp.post(
      "/water-calc/sparge-acidification-manual",
      {
        schema: {
          tags: ["brewery"],
          body: WaterCalcRequestSchema,
          response: {
            200: WaterCalcWithDerivationResponseSchema,
            401: ErrorResponseSchema,
          },
        },
      },
      (req) => {
        requireActiveWorkspace(req);
        return this.svc.spargeAcidificationManual((req.body ?? {}) as Record<string, unknown>);
      },
    );

    zodApp.post(
      "/water-calc/mash-acidification",
      {
        schema: {
          tags: ["brewery"],
          body: WaterCalcRequestSchema,
          response: {
            200: WaterCalcWithDerivationResponseSchema,
            401: ErrorResponseSchema,
          },
        },
      },
      (req) => {
        requireActiveWorkspace(req);
        return this.svc.mashAcidification((req.body ?? {}) as Record<string, unknown>);
      },
    );

    zodApp.post(
      "/water-calc/mash-acidification-manual",
      {
        schema: {
          tags: ["brewery"],
          body: WaterCalcRequestSchema,
          response: {
            200: WaterCalcWithDerivationResponseSchema,
            401: ErrorResponseSchema,
          },
        },
      },
      (req) => {
        requireActiveWorkspace(req);
        return this.svc.mashAcidificationManual((req.body ?? {}) as Record<string, unknown>);
      },
    );

    zodApp.post(
      "/water-calc/mash-ph-estimate",
      {
        schema: {
          tags: ["brewery"],
          body: WaterCalcRequestSchema,
          response: {
            200: WaterCalcResultOnlyResponseSchema,
            401: ErrorResponseSchema,
          },
        },
      },
      (req) => {
        requireActiveWorkspace(req);
        return this.svc.mashPhEstimate((req.body ?? {}) as Record<string, unknown>);
      },
    );

    zodApp.post(
      "/water-calc/mash-acidification-target-mash-ph",
      {
        schema: {
          tags: ["brewery"],
          body: WaterCalcRequestSchema,
          response: {
            200: WaterCalcResultOnlyResponseSchema,
            401: ErrorResponseSchema,
          },
        },
      },
      (req) => {
        requireActiveWorkspace(req);
        return this.svc.mashAcidificationTargetMashPh((req.body ?? {}) as Record<string, unknown>);
      },
    );

    zodApp.post(
      "/water-calc/salt-additions",
      {
        schema: {
          tags: ["brewery"],
          body: WaterCalcRequestSchema,
          response: {
            200: WaterCalcWithDerivationResponseSchema,
            401: ErrorResponseSchema,
          },
        },
      },
      (req) => {
        requireActiveWorkspace(req);
        return this.svc.saltAdditions((req.body ?? {}) as Record<string, unknown>);
      },
    );

    zodApp.post(
      "/water-calc/mash-overall",
      {
        schema: {
          tags: ["brewery"],
          body: WaterCalcRequestSchema,
          response: {
            200: WaterCalcWithDerivationResponseSchema,
            401: ErrorResponseSchema,
          },
        },
      },
      (req) => {
        requireActiveWorkspace(req);
        return this.svc.mashOverall((req.body ?? {}) as Record<string, unknown>);
      },
    );

    zodApp.post(
      "/water-calc/sparge-overall",
      {
        schema: {
          tags: ["brewery"],
          body: WaterCalcRequestSchema,
          response: {
            200: WaterCalcWithDerivationResponseSchema,
            401: ErrorResponseSchema,
          },
        },
      },
      (req) => {
        requireActiveWorkspace(req);
        return this.svc.spargeOverall((req.body ?? {}) as Record<string, unknown>);
      },
    );

    zodApp.post(
      "/water-calc/boil-overall",
      {
        schema: {
          tags: ["brewery"],
          body: WaterCalcRequestSchema,
          response: {
            200: WaterCalcWithDerivationResponseSchema,
            401: ErrorResponseSchema,
          },
        },
      },
      (req) => {
        requireActiveWorkspace(req);
        return this.svc.boilOverall((req.body ?? {}) as Record<string, unknown>);
      },
    );
  }
}
