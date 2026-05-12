/**
 * brew-session.spec.ts - start a brew session against the seeded E2E recipe,
 * advance it through running -> stopped, and assert the workspace-scoped list
 * still shows it.
 *
 * The session is created fresh per spec run (not reusing the seeded one) so
 * that the spec is deterministic even when re-run repeatedly.
 */
import { test, expect } from "../support/auth-fixture";
import { getFixtureIdentities } from "../support/personas";

test.describe("brew session lifecycle (API round-trip)", () => {
  test("creates, starts, and stops a brew session for the seeded recipe", async ({ authenticatedContext }) => {
    const fixture = getFixtureIdentities();

    const createResponse = await authenticatedContext.request.post(
      `/api/recipes/${fixture.recipeId}/brew-sessions`,
      { data: { code: `E2E-PW-${Date.now()}` } },
    );
    expect(createResponse.status(), `unexpected create status: ${await createResponse.text().catch(() => "")}`).toBe(200);
    const created = (await createResponse.json()) as { ok: boolean; brewSession: { id: string; status: string } };
    expect(created.ok).toBe(true);
    expect(created.brewSession.status).toBe("draft");
    const sessionId = created.brewSession.id;

    try {
      const startResponse = await authenticatedContext.request.post(
        `/api/brew-sessions/${sessionId}/start`,
      );
      expect(startResponse.status()).toBe(200);
      const started = (await startResponse.json()) as { ok: boolean; brewSession: { status: string } };
      expect(started.ok).toBe(true);
      expect(["running", "draft"]).toContain(started.brewSession.status);

      const stopResponse = await authenticatedContext.request.post(
        `/api/brew-sessions/${sessionId}/stop`,
      );
      expect(stopResponse.status()).toBe(200);
      const stopped = (await stopResponse.json()) as { ok: boolean; brewSession: { status: string } };
      expect(stopped.ok).toBe(true);
      expect(["stopped"]).toContain(stopped.brewSession.status);

      const listResponse = await authenticatedContext.request.get(
        `/api/recipes/${fixture.recipeId}/brew-sessions`,
      );
      expect(listResponse.status()).toBe(200);
      const list = (await listResponse.json()) as { ok: boolean; brewSessions: Array<{ id: string }> };
      expect(list.ok).toBe(true);
      expect(list.brewSessions.some((s) => s.id === sessionId)).toBe(true);
    } finally {
      await authenticatedContext.request
        .delete(`/api/brew-sessions/${sessionId}`)
        .catch(() => undefined);
    }
  });
});
