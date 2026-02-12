# DEVELOPMENT-ACCESSIBILITY.md
**Project:** Brewing SaaS (Next.js web + Expo/React Native mobile + Fastify API)  
**Status:** v0.1 (living document)  
**Last updated:** 2026-02-12  

This document defines **accessibility-first development rules** for the project. It is designed to be read by humans *and* used as a persistent constraint for Cursor planning/execution.

---

## 0) Why “accessibility-first”
Accessibility is:
- **Ethical**: inclusive product for all brewers.
- **Legal/regulatory**: EU market requires accessibility for many digital products/services (websites + mobile apps). The **European Accessibility Act (Directive 2019/882)** applies from **28 June 2025**. citeturn0search0
- **Product quality**: accessibility best practices make UX more robust, testable, and consistent.

---

## 1) Standards we target (practical)
### Web (desktop + mobile web)
- **WCAG 2.2 AA** as the main practical target. citeturn0search2turn0search6
- **EN 301 549** as the EU “ICT products and services” accessibility standard reference (covers web + mobile + software). citeturn0search1turn0search9

> Note: legal requirements can vary by product type and jurisdiction. The target above is our engineering baseline for “accessible by design.”

### Native mobile (iOS/Android)
- Same *outcome goals* as WCAG/EN 301 549 applied to native UI controls: screen reader support, focus order, contrast, touch targets, motion settings, etc. citeturn0search1

---

## 2) Definition of Done (DoD) for accessibility
A feature is “done” only if:
1. **Keyboard**: fully usable with keyboard (web) including focus visibility and logical tab order.
2. **Screen reader**: key flows are usable with a screen reader (web + native).
3. **Forms**: inputs have labels; errors are announced and understandable.
4. **Contrast**: text and essential UI meets contrast requirements.
5. **Motion**: respects user “reduced motion” preferences.
6. **Automation**: passes automated a11y checks (lint + axe rules) with no new critical issues.
7. **No regressions**: changes don’t break existing a11y test snapshots / e2e flows.

---

## 3) Web guidelines (Next.js / React)

### 3.1 Semantic HTML first
Prefer native elements over divs:
- Use `<button>`, `<a>`, `<input>`, `<label>`, `<fieldset>`, `<legend>`, `<main>`, `<nav>`, `<header>`, `<footer>`, `<section>`.
- Use headings in order (`h1` then `h2`...), never “fake” headings with styles.
- Use lists for lists, tables for tabular data.

### 3.2 Keyboard accessibility
- Everything interactive must be reachable and operable via keyboard.
- No “keyboard traps”.
- Don’t remove default focus outlines unless you replace them with an accessible focus style.
- Manage focus on route changes / dialogs (see 3.4 and 3.5).

### 3.3 ARIA: use only when needed
- **Rule**: “No ARIA is better than bad ARIA.”
- Prefer native semantics; only add ARIA to describe custom widgets.
- When you add ARIA, ensure:
  - correct `role`
  - required `aria-*` attributes for that role
  - state updates are reflected (`aria-expanded`, `aria-selected`, etc.)

### 3.4 Navigation and routing (Next.js)
- Ensure route transitions do not strand focus.
- Provide a “Skip to content” link.
- Ensure pages have a single `h1` that describes the view.

### 3.5 Dialogs, popovers, and menus
For modals/dialogs:
- focus moves into dialog when opened
- focus is trapped within dialog
- focus returns to triggering element when closed
- ESC closes (if appropriate)
- background content is inert/hidden from screen readers

For menus/popovers:
- trigger is a `<button>` with `aria-expanded`
- keyboard navigation is supported (arrows if it behaves like a menu)

### 3.6 Forms and validation
- Every input has an explicit `<label>` (or `aria-label` for icon-only cases).
- Errors are:
  - shown visually near the field
  - summarized near the top for long forms
  - programmatically associated (`aria-describedby`)
  - announced for screen readers (live region or focus management)

### 3.7 Content, images, and media
- Images require appropriate alt text:
  - decorative images: `alt=""`
  - informative: descriptive alt
- Charts: provide textual summary / table alternative for key insights.
- Any instructional video should have captions when we ship marketing content.

### 3.8 Color, contrast, and themes
- Don’t rely on color alone to convey meaning (also use icons/text).
- Ensure contrast for text and key UI elements meets WCAG AA targets.
- Support dark mode if we introduce it; keep contrast valid in both.

### 3.9 Motion and animation
- Respect `prefers-reduced-motion`.
- Avoid essential information conveyed only via animation.

### 3.10 Captcha / abuse protection (public recipe submission)
- Captcha must not block users with disabilities.
- Always provide an accessible alternative path (e.g., email verification, rate limits, challenge alternatives).
- Prefer “invisible” or privacy-friendly captcha solutions only if they remain accessible.

---

## 4) Native mobile guidelines (Expo / React Native)

### 4.1 Use accessible primitives
- Use built-in RN components when possible (`Pressable`, `TextInput`, `Switch`) and ensure:
  - `accessibilityRole` is correct
  - `accessibilityLabel` exists when text isn’t sufficient
  - `accessibilityHint` when needed

### 4.2 Touch targets and spacing
- Ensure touch targets are large enough and spaced to avoid accidental taps.
- Avoid tiny icon-only controls without labels.

### 4.3 Focus and screen readers
- Ensure logical reading order.
- For dynamic updates (e.g., “sync succeeded”), announce via accessibility APIs (polite announcements).
- When opening screens/modals, move focus appropriately.

### 4.4 Dynamic type / font scaling
- Support OS font scaling; avoid fixed pixel sizes that truncate content.
- Layouts must handle large fonts without clipping.

### 4.5 Reduced motion and haptics
- Respect reduced motion settings.
- Avoid essential feedback only via haptic/vibration; also show text.

### 4.6 Offline UX clarity
- When offline, clearly indicate status (without relying only on color).
- Ensure offline error messages are readable and announced.

---

## 5) Shared UX rules (Web + Mobile)
- **Clear language**: avoid jargon; use consistent labels (“Batch”, “Recipe”, “Water Profile”).
- **Error handling**: errors must be actionable (“Try again”, “Check connection”) not generic.
- **State**: loading/saving/sync states must be perceivable and announced where appropriate.
- **No duplicate sources of truth**: don’t make users edit the same data in two places (also reduces confusion for assistive tech).

---

## 6) Tooling and automation (Day 1)

### 6.1 Linting
- Web: enable `eslint-plugin-jsx-a11y`. Next.js includes it by default. citeturn0search7turn0search3
- Treat new a11y lint warnings as build blockers (or at least PR blockers) for main UI areas.

### 6.2 Automated checks
- Add **axe-core** checks in:
  - local dev (optional)
  - CI (recommended)
- Typical approach:
  - run Playwright E2E flows
  - after page load, run axe audit and fail on serious/critical violations
- Keep a small allowlist only when truly needed, and track it as tech debt.

### 6.3 E2E selectors and accessibility
We already use the “balanced `data-testid`” rule for Playwright reliability.
- `data-testid` must never replace accessibility labels.
- Prefer `getByRole/getByLabel` in tests when stable; use `data-testid` for custom widgets and dynamic lists.

### 6.4 Manual checks (PR checklist)
For any user-facing feature:
- Keyboard-only walkthrough
- Screen reader smoke (at least one of: VoiceOver, NVDA)
- Contrast spot-check of new UI
- Large-font / zoom check (web: 200% zoom; mobile: large text)

---

## 7) Component patterns (recommended)
### 7.1 Buttons and icon buttons
- Icon-only buttons must have `aria-label` (web) / `accessibilityLabel` (mobile).
- Use consistent component wrappers so Cursor adds labels consistently.

### 7.2 Forms
- Provide a standard `<Field>` component that enforces label + error wiring.
- Standardize error display and announcement.

### 7.3 Modals
- Provide a standard modal component that handles focus trap and ARIA correctly.

---

## 8) Governance: how Cursor should use this file
When planning or implementing UI changes, Cursor must:
- treat this document as a **hard constraint**
- prefer accessible primitives
- add a11y tests and lint compliance as part of the plan
- never “ship now, add accessibility later” for user-facing features

---

## Appendix A: Reference sources
- WCAG 2.2 (W3C): citeturn0search2
- What’s new in WCAG 2.2: citeturn0search6
- EN 301 549 overview (AccessibleEU): citeturn0search1
- EN 301 549 (ETSI PDF): citeturn0search9
- Next.js accessibility docs: citeturn0search7
- EAA application date (AccessibleEU): citeturn0search0
