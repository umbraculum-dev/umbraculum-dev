# Web auth hardening assessment

Assessment of cookie-based web auth before adding token-based native auth. Gate: Native login (TODOs.md).

## Summary

| Area | Recommendation |
|------|----------------|
| **CSRF** | No change required. SameSite=Lax is sufficient. |
| **Secure flags** | No change required. |
| **Session cleanup** | Schedule required. Job exists; document production scheduling. |

## Current state

| Area | Implementation | Location |
|------|----------------|----------|
| Cookie | `sid` httpOnly, path `/`, SameSite `lax`, Secure = `NODE_ENV === "production"` | `services/api/src/routes/auth.ts` |
| CSRF | None. Relies on SameSite=Lax | — |
| Session cleanup | Job exists (`job:session-cleanup`), manual run only | `services/api/src/jobs/sessionCleanup.ts` |
| Session TTL | 14 days; expired sessions rejected on request and deleted best-effort | `services/api/src/plugins/sessionAuth.ts`, `auth.ts` |
| Web requests | `credentials: "same-origin"` on all API fetches | `apps/web/app/_lib/apiClient.ts` |
| Architecture | Web and API same-origin via nginx proxy (`/` and `/api/`) | `infra/nginx/dev.conf` |

## Recommendations and rationale

### CSRF

**Risk**: Cross-site request forgery — attacker tricks user into submitting a request that uses the victim's session.

**Mitigation in place**: `SameSite=Lax` — cookie is not sent on cross-site POST/PUT/DELETE/PATCH. Same-origin API.

**Residual risk**: Low. SameSite=Lax is effective for most CSRF scenarios.

**Recommendation**: No change required for gate. Optional future: CSRF tokens for defense-in-depth.

### Secure flags

**Current**: `secure: process.env.NODE_ENV === "production"`.

**Recommendation**: No change required. Cookie is set with Secure when NODE_ENV=production; browser sends it only over HTTPS.

### Session cleanup

**Current**: Job exists; must be run manually. Expired sessions accumulate without scheduling.

**Recommendation**: Schedule the job daily in production. See `docs/AUTH-STRATEGY.md` for instructions.

---

**Gate complete for native auth.**
