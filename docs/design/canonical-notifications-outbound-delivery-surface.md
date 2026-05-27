# Notifications and outbound delivery — horizontal boundary surface

**Tier:** Public  
**Status:** Contract documented; **implementation deferred** (accepted 2026-05-25)  
**Audience:** module authors, vertical-configuration authors, hosted-service operators  
**Resolves:** [RFC-0008](../rfcs/0008-notifications-outbound-delivery.md) — pre-implementation boundary (RFC-0007 §2.3 / RFC-0004 module-surface shape)  
**Related:** [RFC-0007](../rfcs/0007-canonical-document-rendering.md), [`canonical-document-rendering-surface.md`](canonical-document-rendering-surface.md)

> **Disclaimer.** No notifications service, queue, or provider adapters ship in the public-alpha tranche. This document exists so modules do not infer from MJML/eta in RFC-0007 that they may add SMTP, nodemailer, or private delivery queues. Auth/security emails remain platform-owned special cases, not precedent for module-owned transport.

---

## 1. Summary

| Layer | Owner | Status |
|-------|-------|--------|
| **Composition** (HTML, attachments, template refs) | RFC-0007 rendering | Shipped |
| **Transport** (SMTP/API, queues, compliance, audit) | RFC-0008 notifications | **Not shipped** |
| **Module contribution** | Intents, templates, triggers, recipient selectors | Contract only |
| **Platform execution** | Provider config, delivery, preferences, limits | Future |

Public alpha MAY ship without general email delivery; it MUST NOT ship without this boundary being documented ([RFC-0008](../rfcs/0008-notifications-outbound-delivery.md) Decision E).

---

## 2. What modules MAY contribute (future SDK shape)

Committed extension shape (names may change at implementation):

```ts
registerModule({
  code: "crm",
  notificationIntents: [
    {
      ref: "crm:quote-ready@v1",
      transports: ["email"],
      templateRef: "crm:quote-email@v1",
      recipientSelector: "crm.quotePrimaryContact",
      defaultPolicy: "transactional",
    },
  ],
});
```

Modules MAY:

- Register stable intent refs (`<module>:<intent>@vN`).
- Point `templateRef` at RFC-0007 `DocumentTemplate` refs (eta + MJML for email HTML).
- Declare domain triggers and typed payload schemas.
- Supply recipient-selection hooks approved by the platform.

Modules MUST NOT (today and after implementation):

- Import provider SDKs (nodemailer, SES, Postmark, Resend, Twilio, FCM, etc.).
- Run module-private delivery queues.
- Store module-private unsubscribe or preference state.
- Bypass platform audit logs for outbound messages.

---

## 3. What the platform MUST own (implementation backlog)

When the horizontal service lands, the platform owns:

- Provider configuration and adapters  
- Queueing, retry, dead-letter, idempotency  
- Recipient validation and deduplication  
- Unsubscribe / preferences / compliance  
- Audit logs and delivery events  
- Bounce and complaint handling  
- Abuse, rate-limit, and cost controls  
- Workspace/provider credential storage  
- Operator-facing delivery status  

---

## 4. Interaction with document rendering

| Question | Answer |
|----------|--------|
| Can a module send email by setting `delivery.mode: "email"` on a render job? | **No** — rejected until RFC-0008 implementation; see [`canonical-document-rendering-surface.md`](canonical-document-rendering-surface.md) §3 |
| Can a module register an email HTML template? | **Yes** — via `documentTemplates` (MJML → HTML); transport is separate |
| Where is the rendering vs delivery line? | RFC-0007 §4 Decision B; RFC-0008 §4 |

---

## 5. Public-alpha posture

- **Enabled:** `stream-response`, `persist-to-media` rendering delivery modes.  
- **Disabled:** general module-triggered email delivery; `delivery.mode: "email"` on render jobs.  
- **Special cases:** platform auth/security emails (not module-extensible transport).  

---

## 6. Cross-references

- [RFC-0008](../rfcs/0008-notifications-outbound-delivery.md) — full commitment text  
- [RFC-0001 §8.2](../rfcs/0001-modules-tiers-governance-and-automation-placement.md) — consumption contract row  
- [`rfc-companion-documentation-audit.md`](rfc-companion-documentation-audit.md) — matrix row 0008  
- [`docs/ROADMAP.md`](../ROADMAP.md) — public-alpha outbound-delivery clarity  
