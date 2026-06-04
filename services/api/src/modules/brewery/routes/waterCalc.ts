import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  ErrorResponseSchema,
  WaterCalcRequestSchema,
  WaterCalcResultOnlyResponseSchema,
  WaterCalcWithDerivationResponseSchema,
} from "@umbraculum/contracts";

import { requireActiveWorkspace } from "../../../plugins/requestContext.js";
import { WaterCalcService } from "../services/waterCalcService.js";

export function waterCalcRoutes(app: FastifyInstance) {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  const svc = new WaterCalcService();

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
      return svc.spargeAcidification((req.body ?? {}) as Record<string, unknown>);
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
      return svc.spargeAcidificationManual((req.body ?? {}) as Record<string, unknown>);
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
      return svc.mashAcidification((req.body ?? {}) as Record<string, unknown>);
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
      return svc.mashAcidificationManual((req.body ?? {}) as Record<string, unknown>);
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
      return svc.mashPhEstimate((req.body ?? {}) as Record<string, unknown>);
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
      return svc.mashAcidificationTargetMashPh((req.body ?? {}) as Record<string, unknown>);
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
      return svc.saltAdditions((req.body ?? {}) as Record<string, unknown>);
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
      return svc.mashOverall((req.body ?? {}) as Record<string, unknown>);
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
      return svc.spargeOverall((req.body ?? {}) as Record<string, unknown>);
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
      return svc.boilOverall((req.body ?? {}) as Record<string, unknown>);
    },
  );
}
