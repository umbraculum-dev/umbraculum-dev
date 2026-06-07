import { describe, expect, it, vi } from "vitest";

import { bearerTokenAuth } from "../auth.js";
import { createApiClient } from "../client.js";
import {
  createAiUpgradeBillingIntent,
  getWorkspaceAiSettings,
  getWorkspaceAiUsage,
  patchWorkspaceAiSettings,
} from "./ai.js";

describe("platform ai facades", () => {
  const workspaceId = "w1";

  it("getWorkspaceAiSettings parses settings response", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              ok: true,
              settings: {
                workspaceId,
                provider: "anthropic",
                hasKey: false,
                enabled: true,
                roleLimits: {},
                perUserDailyCap: 1000,
                dataEgressAccepted: false,
                dataEgressAcceptedAt: null,
                createdAt: "2026-01-01T00:00:00.000Z",
                updatedAt: "2026-01-01T00:00:00.000Z",
              },
            }),
          ),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await getWorkspaceAiSettings(client, workspaceId);
    expect(res["settings"]["enabled"]).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      `http://test/api/workspaces/${workspaceId}/ai/settings`,
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("patchWorkspaceAiSettings PUTs and parses response", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              ok: true,
              settings: {
                workspaceId,
                provider: "anthropic",
                hasKey: true,
                enabled: false,
                roleLimits: { member: 500 },
                perUserDailyCap: 500,
                dataEgressAccepted: true,
                dataEgressAcceptedAt: "2026-01-01T00:00:00.000Z",
                createdAt: "2026-01-01T00:00:00.000Z",
                updatedAt: "2026-01-02T00:00:00.000Z",
              },
            }),
          ),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await patchWorkspaceAiSettings(client, workspaceId, { enabled: false });
    expect(res["settings"]["enabled"]).toBe(false);
    expect(fetch).toHaveBeenCalledWith(
      `http://test/api/workspaces/${workspaceId}/ai/settings`,
      expect.objectContaining({ method: "PUT" }),
    );
  });

  it("getWorkspaceAiUsage parses usage dashboard", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              ok: true,
              monthly: { tokensIn: 0, tokensOut: 0, costMicroUsd: 0, callCount: 0 },
              dailySeries: [],
              roleLimits: {},
              roleUsage: {},
              perUserDailyCap: 1000,
              byUser: [],
              alerts: { roleAlerts: [], userAlerts: [] },
            }),
          ),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await getWorkspaceAiUsage(client, workspaceId);
    expect(res["monthly"]["callCount"]).toBe(0);
  });

  it("createAiUpgradeBillingIntent POSTs billing intent", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              ok: true,
              billingIntentId: "bi1",
              workspaceId,
              planCode: "premium",
              provider: "stripe",
              mode: "purchase",
              expiresAt: "2026-01-02T00:00:00.000Z",
              clientReferenceId: "ref1",
              stripePricingTableId: null,
              stripePublishableKey: null,
            }),
          ),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await createAiUpgradeBillingIntent(client, workspaceId, {
      planCode: "premium",
      provider: "stripe",
      mode: "purchase",
    });
    expect(res["billingIntentId"]).toBe("bi1");
  });
});
