/**
 * Contract snapshot: GET /auth/me
 *
 * Native consumes this payload to decide which workspace is active and what
 * preferences to apply. Snapshot is shape-based (keys + JSON types) so it
 * doesn't drift on UUIDs/emails but DOES flag any key/type change.
 *
 * To intentionally update: UPDATE_CONTRACTS=1 npm test -w @brewery/api -- contracts/auth.contract.test.ts
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../../app.js";
import { createSessionForTestUser } from "../helpers/session.js";
import { assertSnapshotShape } from "./shapeHelpers.js";

describe("contract: GET /auth/me", () => {
  const app = buildApp();
  let cookie = "";

  beforeAll(async () => {
    await app.ready();
    const sess = await createSessionForTestUser(app, { activeWorkspace: true });
    cookie = sess.cookie;
  });

  afterAll(async () => {
    await app.close();
  });

  it("shape is stable for an authenticated session with an active workspace", async () => {
    const res = await app.inject({ method: "GET", url: "/auth/me", headers: { cookie } });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    assertSnapshotShape("auth.me.activeWorkspace", body);
  });
});
