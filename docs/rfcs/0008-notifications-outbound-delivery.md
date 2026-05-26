# RFC-0008 — Notifications and outbound delivery

**Tier:** Public
**Status:** Accepted 2026-05-25 (pre-public-flip solo-author + core-team approval recorded; this is a living RFC — see §10 Resolution for the change procedure)
**Audience:** prospective module developers, vertical-configuration authors, self-hosters, hosted-service customers, future maintainers, and anyone evaluating what Umbraculum does or does not allow modules to send on behalf of a workspace.
**Document role:** outbound communication / notification delivery contract for modules and vertical configurations.

> **Disclaimer.** This RFC commits the ownership boundary before the July 2026 public alpha so module authors do not infer from [RFC-0007](0007-canonical-document-rendering.md)'s eta + MJML engine picks that modules may bring their own SMTP, provider clients, unsubscribe logic, audit logs, or delivery queues. The implementation is intentionally deferred; the contract is not.

---

## 1. Summary

This RFC commits to five decisions:

- **Decision A — Notifications and outbound delivery are a horizontal platform service.** Modules and vertical configurations MUST NOT ship parallel email / push / in-app / webhook / SMS delivery stacks. They MUST consume the platform-owned outbound-delivery surface once it exists.

- **Decision B — Rendering is composition, not transport.** RFC-0007 commits `eta` and MJML for producing email-ready HTML and attachments through the rendering pipeline. It does not commit SMTP/provider transport, recipient policy, unsubscribe/compliance handling, delivery audit, or abuse limits.

- **Decision C — Modules contribute notification intent, not delivery infrastructure.** A module may contribute typed notification templates, workflow triggers, recipient-selection rules, and domain-specific copy. The platform owns provider selection, queues, preference checks, unsubscribe/compliance enforcement, rate limits, audit logs, and billing controls.

- **Decision D — Email is the first concrete transport; the service family is broader.** Email is the public-alpha concern because RFC-0007 already exposes `delivery.mode: "email"` as a future delivery intent. The same platform service family can later own push, in-app notifications, webhooks, SMS, or other outbound transports without changing the module-ownership boundary.

- **Decision E — Public alpha may ship without email delivery, but not without this contract.** The alpha boundary is explicit: email delivery is disabled until the horizontal service lands. Existing auth/security emails are platform-owned special cases, not precedent for module-owned email transport.

---

## 2. Motivation

The failure mode is predictable: once CRM, WMS, MRP, brewery, and third-party verticals need to send messages, each module reaches for a provider SDK (`nodemailer`, SES, Postmark, Mailgun, Resend, Twilio, FCM), adds a private queue, stores recipient state differently, and invents its own audit trail. That is the same WordPress-hell pattern [RFC-0001](0001-modules-tiers-governance-and-automation-placement.md) Decision F exists to prevent.

Outbound communication has three properties that make platform ownership mandatory:

1. **Every module participates uniformly.** CRM sends quotes, WMS sends pick-list notifications, MRP sends schedule changes, brewery sends brew-day reminders, auth sends verification messages, and billing sends account notices.
2. **Policy is cross-cutting.** Preferences, unsubscribe rules, bounce/complaint handling, rate limits, abuse prevention, audit logs, provider credentials, and billing controls are workspace-level or platform-level concerns.
3. **Delivery risk is shared.** One module with poor recipient validation or an unbounded retry loop can damage the sender reputation, cost model, and compliance posture of the whole hosted service.

This is why RFC-0001 already names `notifications` as a horizontal concern in §4.3. This RFC turns that framing into a concrete §8.2 obligation row and clarifies how it interacts with RFC-0007.

---

## 3. Decision A — Horizontal ownership (commit)

Notifications and outbound delivery are owned by the horizontal platform.

The platform owns:

- provider configuration and provider adapters,
- queueing, retry, dead-letter, and idempotency policy,
- recipient validation and deduplication,
- unsubscribe / preferences / compliance policy,
- audit logs and delivery events,
- bounce and complaint handling,
- abuse, rate-limit, and cost controls,
- workspace/provider credential storage,
- delivery-status surfaces for operators and admins.

Modules MUST NOT:

- import provider SDKs directly for outbound delivery,
- create parallel SMTP/API delivery clients,
- run module-private delivery queues,
- store module-private unsubscribe or preference state,
- bypass platform audit logs for delivered outbound messages,
- make network calls to third-party delivery providers from module code.

---

## 4. Decision B — Rendering vs delivery (commit)

RFC-0007 owns **composition**:

- template syntax (`eta`),
- responsive email HTML composition (MJML -> HTML),
- document / attachment rendering,
- registered `DocumentTemplate<TData>` definitions,
- async render jobs and signed artifact retrieval.

This RFC owns **delivery**:

- deciding whether a rendered artifact or message may be sent,
- selecting and configuring the transport,
- applying workspace/user preferences and compliance policy,
- writing delivery audit records,
- enforcing limits,
- surfacing delivery status.

In concrete terms: a module can register `crm:quote-email@v1` or `brewery:brewday-reminder-email@v1` as a template/intent, but it cannot decide how SMTP/API credentials are stored, which provider sends the message, how unsubscribe is enforced, or how delivery is retried.

---

## 5. Decision C — Module extension shape (commit)

The future platform surface is expected to look like an SDK-declared extension point, not a free-form module convention. Exact TypeScript names are deferred to implementation, but the committed shape is:

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

The module contributes:

- stable intent refs (`<module>:<intent>@vN`),
- template refs backed by RFC-0007 rendering templates,
- domain-specific trigger points,
- typed payload schemas,
- recipient-selection logic expressed through platform-approved hooks,
- default copy and localization keys.

The platform validates and executes delivery.

If the implementation requires new public SDK types or slots (`notificationIntents`, `notificationTemplates`, `recipientSelectors`, or similar), that implementation must either land under this RFC's change procedure or explicitly amend this RFC with the final names.

---

## 6. Decision D — Transport family (commit)

Email is the first concrete transport because:

- RFC-0007 already reserves email composition through eta + MJML.
- CRM quotes, account notices, verification flows, and document delivery all naturally start with email.
- Email has the sharpest compliance and reputation-risk surface, so documenting the boundary before public alpha prevents early ecosystem drift.

The platform service family is broader than email. Future transports can include:

- in-app notifications,
- mobile push notifications,
- webhooks,
- SMS,
- chat / collaboration connectors.

Adding a transport is an implementation decision if it preserves this RFC's ownership boundary. Replacing the ownership boundary or allowing module-owned transports requires an RFC amendment.

---

## 7. Decision E — Alpha boundary and existing special cases (commit)

The July 2026 public alpha may ship with no general outbound-delivery implementation. That is acceptable only because this RFC makes the boundary explicit:

- `delivery.mode: "email"` remains disabled in the rendering pipeline until the platform service exists.
- Modules may prepare templates/intents, but cannot send email themselves.
- Documentation must state that email delivery is deferred and platform-owned.

Existing auth/security email surfaces, such as email verification or magic-link style messages, are platform-owned special cases. They do not authorize module-owned delivery. When the general outbound-delivery service lands, those platform-auth flows may migrate into it, but they remain horizontal either way.

---

## 8. Consumption-contract row

This RFC extends [RFC-0001](0001-modules-tiers-governance-and-automation-placement.md) §8.2 with a new row:

| Concern | Platform service / convention | Module obligation | Extension point if module needs more |
|---|---|---|---|
| Notifications / outbound delivery | Platform-owned outbound-delivery service for email first, later push / in-app / webhooks / SMS as needed. Owns provider config, queues, recipient validation, preferences / unsubscribe, audit logs, delivery events, bounce/complaint handling, rate limits, abuse controls, and billing/cost controls. | Register notification intents/templates/triggers via the SDK once the service exists; never import provider SDKs or ship parallel SMTP/API clients, delivery queues, unsubscribe state, or delivery audit logs from module code. | Module-contributed notification intents, typed payload schemas, template refs, recipient selectors, workflow triggers, default copy, and localization keys. |

---

## 9. Impact

### 9.1 Module and vertical authors

The rule is simple: build the domain event and template; do not build the delivery service. A brewery vertical can define a brew-day reminder; WMS can define a pick-list-ready notice; CRM can define quote-ready email copy. All of them use the same platform delivery policy.

### 9.2 Self-hosters

No immediate infrastructure is required by this RFC. When delivery ships, self-hosters should expect explicit provider configuration and a clear disabled-by-default posture if no provider is configured.

### 9.3 Hosted customers

Hosted customers gain a coherent delivery story over time: one place for provider status, preferences, audit records, and limits instead of per-module settings.

### 9.4 Public-alpha evaluators

The public alpha can honestly say: email-ready rendering exists, general email delivery does not, and modules are not allowed to fill that gap privately. That clarity is the deliverable of this RFC.

---

## 10. Resolution

**Status: Accepted 2026-05-25.**

This RFC commits the ownership boundary and public-alpha clarity requirement. It does not commit an implementation date, provider, schema, or package name for the outbound-delivery service.

Future amendments follow the same RFC process documented in [`docs/LICENSING.md`](../LICENSING.md) §10 and [RFC-0001](0001-modules-tiers-governance-and-automation-placement.md) §13. Amendments that allow module-owned provider clients, module-private delivery queues, or module-private unsubscribe/preference state are especially consequential and should be treated as reversals of this RFC's core decision.
