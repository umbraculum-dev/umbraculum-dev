# Project rename diligence report

**Tier:** Public
**Status:** Resolved 2026-05-18
**Audience:** project maintainers, contributors, future trademark counsel
**Document role:** durable artifact justifying the project's wordmark + namespace + domain resolution; companion to umbrella plan §10 and PLATFORM-ARCHITECTURE.md §10.

---

## 1. Resolution at a glance

The project's `<PLATFORM_NAME>` placeholder (per [PLATFORM-ARCHITECTURE.md §10](PLATFORM-ARCHITECTURE.md)) resolves to the following set of values across surfaces:

| Surface | Resolved value |
|---|---|
| Wordmark (logo, headers, marketing prose, trademark filing) | **Umbraculum** |
| Marketing short / CLI / casual usage | **UMB** |
| Tagline candidate (working) | "open-source process-manufacturing platform" |
| Logo concept | Red umbrella (heritage-aligned with the heraldic gold-and-red umbraculum tradition; the wordmark itself does not carry the trademark conflict that "Red Umbrella" did) |
| Mascot | **Umbi** — character expression of the brand; canonical asset at [`docs/media/umbi.png`](media/umbi.png). The diminutive form mirrors the wordmark's own diminutive Latin morphology (*umbraculum* = "small parasol"; *umbi* = the mascot's first-name-style short form). |
| Primary domain (canonical) | `umbraculum.dev` |
| Defensive domains (recommended) | `umbraculum.net` (cheap defensive against `.com`-reflex typing); `umbraculum.app` (future native-app surface, optional) |
| Domains explicitly skipped | `umbraculum.io` (4× the cost of `.dev` with no positioning advantage; ccTLD-retirement risk pending Chagos cession to Mauritius) |
| Future acquisition target | `umbraculum.com` from DOMAINRECOVER squatter (~$1k-2k one-time) when project revenue justifies |
| npm scope | `@umbraculum` |
| Composer (Packagist) vendor | `umbraculum` |
| PyPI top-level | `umbraculum` |
| crates.io top-level | `umbraculum` |
| GitHub org | `umbraculum-dev` (mirrors `.dev` domain, reinforces developer-first positioning) |
| Trademark filing (when ready) | `UMBRACULUM` in USPTO Class 9 (computer software) + Class 42 (SaaS / software services); EUIPO equivalent classes |

The decision to use **Umbraculum** as the wordmark was reached after the originally-proposed wordmark `RedUmbrella` failed diligence (§3 of this report) and an intermediate Latin candidate `Umbra` was also rejected (§5). The Latin diminutive **Umbraculum** — literally "small parasol / shelter" and the etymological root of the English word "umbrella" via Italian *ombrella* / *ombrello* — passes diligence cleanly across all surfaces (§6).

---

## 2. Background — why this report exists

The umbrella plan ([`~/.cursor/plans/umbrella_ecosystem_architecture_443198a8.plan.md`](#) §10) tentatively resolved the wordmark to **`RedUmbrella`** with the `red-umbrella` namespace, listing trademark / namespace / domain availability verification as the rename sub-plan's responsibility. The umbrella plan §10 explicitly anticipated that the rename sub-plan "returns to revisit only if a hard blocker surfaces during diligence — trademark conflict, namespace already taken by an active project of substance, etc."

This report records:

1. The diligence findings that triggered the umbrella-plan §10 stop condition for `RedUmbrella` (§3 below)
2. The variant explorations attempted to fix the blocker without abandoning the wordmark (§4 below)
3. The Latin-direction pivot (§5 below)
4. The clean diligence findings for `Umbraculum` that justify it as the resolved wordmark (§6 below)
5. Risks and trade-offs explicitly accepted with the resolution (§7 below)
6. Decisions deferred to follow-on work (§8 below)

The report is durable so future contributors reading the codebase years from now understand why we are not "RedUmbrella" — without that record, the obvious-in-hindsight question "why didn't they pick a more memorable name?" lacks an authoritative answer.

---

## 3. Why `RedUmbrella` failed diligence (the hard blocker)

### 3.1 The Travelers Companies, Inc. trademark on RED UMBRELLA

The decisive finding. The Travelers Companies, Inc. (NYSE: TRV) — one of the largest property-and-casualty insurers in North America — owns the **RED UMBRELLA** trademark and has owned variants of it since 1959–1960. From [Travelers' own investor-relations announcement](https://investor.travelers.com/newsroom/press-releases/news-details/2007/St-Paul-Travelers-To-Change-Company-Name-To-Travelers-And-Bring-Back-Iconic-Red-Umbrella/default.aspx) and the [Insurance Journal's coverage of the 2011 trademark show](https://www.insurancejournal.com/news/national/2011/10/18/220443.htm):

- The red umbrella is Travelers' literal core brand identity, not a peripheral mark. Their entire visual identity is built on it.
- The mark dates to 1959 (visual mark) / 1960 (formal registration). Insurance Journal describes it as "one of the great American business icons."
- In 1998 the mark passed to Citigroup via the Citigroup–Travelers merger; in February 2007, St. Paul Travelers signed an agreement to reacquire the worldwide rights, and the company renamed itself "The Travelers Companies, Inc." in March 2007 specifically to anchor its identity to the regained mark.
- **Canadian trademark TMA1089481 covers mobile application software (Class 9) and insurance/financial services (Classes 36, 38, 41).** This is the software-trademark angle directly relevant to a software platform wordmark.
- Travelers' [own homepage](https://www.travelers.com) lists their target customer verticals as: manufacturing, energy, financial institutions, technology. **That is our exact target customer base.** A "RedUmbrella" software platform sold to manufacturers would directly create customer confusion with their existing insurer.

### 3.2 The `redumbrella.com` defensive holding

`redumbrella.com` is registered through **CSC DNS** (Corporate Services Company — a Fortune-500-grade brand-protection registrar used by major corporations to defensively hold brand-aligned domains). The domain returns 503 with no content. The combination — CSC registrar + zero content + Travelers' trademark on the literal wordmark — is consistent with a defensive corporate holding by Travelers. This means we cannot acquire `redumbrella.com` at any reasonable price; it is not for sale.

### 3.3 Active-project-of-substance collisions in our space

Beyond Travelers, the "Red Umbrella" wordmark is highly crowded with active-project-of-substance entities the umbrella plan §10's stop condition explicitly named:

| Entity | Domain | Status | Collision severity |
|---|---|---|---|
| **redumbrella.pro** | `redumbrella.pro` | **Active CRM / business-data platform** (contacts, email tracking, calendar, financial tracking, automation) | High — `crm` is one of our reserved canonical-module codes; direct competitor in our exact target space |
| **redumbrella.dev** | `redumbrella.dev` | **Active digital-products + AI agency** (Spanish-language Delaware-USA business; "Red Umbrella — Soluciones digitales de alto impacto"; web + apps + AI; registered April 2026) | High — exact wordmark, adjacent service business, claims AI integrations |
| **Red Umbrella Fund** | `redumbrellafund.org` | International nonprofit; sex-worker-led grant-making fund; founded 2012, headquartered Amsterdam | Medium — activism cluster |
| **Red Umbrella Project** | (NYC-based 501(c)(3)) | Sex-worker rights advocacy | Medium — activism cluster |
| **Red Umbrella Greece** | `redumbrella.org.gr` | Sex-worker support / sexual-health services | Medium — activism cluster |
| **Red Umbrella UK** | `red-umbrella.co.uk` | Workplace mental-health training; ships proprietary Carecoins technology platform | Medium — adjacent service business with active technology product |
| **Red Umbrella House of Design** | `redumbrella.ch` | Custom web design + workshops, founded 2018 | Low — adjacent space |
| **"The Red Umbrella" (book)** | `red-umbrella.com` | Holocaust memoir of Danish-Jewish rescue, 1943-45 | Wordmark unusable for sensitivity reasons; this is not a domain we'd ever co-opt |

The international "Red Umbrella" symbol has been the recognized advocacy emblem for sex-worker rights since 2001 (Tadej Pogačar / Venice Biennale; the Red Umbrella Project and several international funds use it). The umbrella plan §10's earlier framing — "the activism reference exists but does not dominate" — was based on a casual surface read. The detailed diligence reveals three separate established organizations (Fund / Project / Greece) using the symbol as their core identity, plus the book, plus six adjacent-tech-space active competitors. The "acknowledge / coexist" strategy contemplated by §10 understated the depth of the existing-use landscape.

### 3.4 Verdict on `RedUmbrella`

The umbrella plan §10's stop condition fired on multiple grounds simultaneously:

1. **Trademark conflict** — The Travelers Companies' RED UMBRELLA mark in software classes
2. **Namespace already taken by active projects of substance** — `redumbrella.pro` (CRM platform), `redumbrella.dev` (digital agency), Red Umbrella UK (technology product)
3. **Defensive .com holding** — `redumbrella.com` not obtainable at any reasonable price
4. **Activism cluster** — three established organizations using the symbol as their core identity; co-opting reads as appropriative regardless of intent

Even if the project chose to absorb the legal risk (Travelers' C&D against an open-source project would be devastating regardless of the technical merits of the case), the SEO and brand-confusion costs of competing for "RedUmbrella" mindshare against six entities with prior use are meaningful and would not improve with time.

---

## 4. Variant explorations: `theredumbrella` / `the-red-umbrella`

The user proposed two article-prefixed variants in an attempt to preserve the wordmark while disambiguating from existing `RedUmbrella` users. Diligence findings:

| Variant | npm | GitHub | Trademark posture | Verdict |
|---|---|---|---|---|
| `theredumbrella` (npm scope `@theredumbrella`, GitHub org `theredumbrella`) | Available | Available | Does NOT resolve the Travelers mark issue (the article doesn't change the dominant element of the mark in trademark-similarity analysis); collides with Christina Diaz Gonzalez's award-winning 2010 children's novel **"The Red Umbrella"** (Knopf, ALA Notable Children's Book) which has a film adaptation in development as of 2024 | Reject |
| `the-red-umbrella` (npm scope `@the-red-umbrella`, hyphen variant) | Available | `the-red-umbrella` GitHub user exists (single individual, Andrew Smith, 0 followers — not blocking but signals the namespace is not "ours") | Same Travelers + book collision as above | Reject |

The article prefix does not solve the underlying problem. In trademark law, the "dominant element" of the mark is what counts for confusion analysis — `THE RED UMBRELLA` and `RED UMBRELLA` would be analyzed identically against Travelers' senior mark. And the children's book introduces a new collision in a literary-rights-active space (an adapted-to-film property whose rights-holder has incentive to police derivatives).

**This conclusion drove the pivot away from the "Red Umbrella" semantic field entirely** rather than attempting further variants within it.

---

## 5. The Latin pivot — why `Umbra` was considered and rejected

After abandoning the "Red Umbrella" semantic field, the Latin etymological root was attractive for several reasons:

1. **Conceptual continuity.** Latin *umbra* → Italian *ombrella* / *ombrello* → English *umbrella*. Anyone who looks up the word "umbrella" sees the Latin root. The wordmark stays semantically connected to the original "umbrella" concept (shelter, protection, gathering-under-a-canopy) without inheriting the trademark and brand-collision baggage of "Red Umbrella" as an English compound.
2. **Distinctiveness.** Latin words are largely outside the trademark crowding zone for English-speaking SaaS / dev-tools brands. Most Latin-rooted SaaS wordmarks (e.g. `Sentry`, `Vercel`, `Linear`, `Tabula`) succeed precisely because the wordmark is short, distinctive, and has a non-obvious connection to the product domain.
3. **Future-proofing for non-English markets.** A Latin wordmark is approximately equally pronounceable / spellable in Italian, Spanish, French, Portuguese, German, and English — the working languages most likely to dominate our contributor base.

### 5.1 `Umbra` — rejected

Diligence findings on **Umbra** as a wordmark:

- **USPTO Class 9 software trademark held by Amazon Technologies, Inc.** for the Umbra3D software product (acquired into the Amazon stack). This is a hard blocker on the same axis that killed `RedUmbrella`: a Fortune-class trademark holder with the literal wordmark in Class 9.
- **`umbra.com`** held by Umbra Ltd., a Canadian housewares / home-goods brand of substantial size — not a software competitor, but they would defend the wordmark and the .com is unobtainable.
- **Numerous active "Umbra" tech projects** — multiple GitHub repos (Umbra game engine, Umbra security tooling, Umbra UI libraries) and the `Umbra` npm package taken. The crowding rivals the "Red Umbrella" cluster.
- **`umbra.dev`** — held; the `.dev` we'd target is not available either.

`Umbra` was rejected for the same hard-blocker reasons that killed `RedUmbrella`: a Fortune-class software trademark plus deep namespace crowding.

---

## 6. `Umbraculum` — diligence findings (clean across all surfaces)

The Latin diminutive **umbraculum** (literally "small parasol / shelter / shaded place") is the most direct Latin precursor to the English word "umbrella" and is itself a well-attested historical wordmark in heraldry: the *umbraculum* (also *ombrellino* in Italian) is the gold-and-red striped basilican parasol used as an attribute of the Catholic basilica and historically associated with the papal court. The heraldic association explains why the **red umbrella as a visual logo remains heritage-aligned** with the wordmark even though the literal English compound "Red Umbrella" was unusable: the underlying historical artifact *is* a red-and-gold umbrella.

### 6.1 Trademark findings

- **USPTO TESS:** No live federal trademark registrations for `UMBRACULUM` in any class (Classes 9, 35, 41, 42 specifically searched). One historical / dead mark exists in unrelated goods classes; not a blocker.
- **EUIPO eSearch Plus:** No live Community Trade Marks for `UMBRACULUM` in software / IT / SaaS classes (Classes 9, 38, 42).
- **WIPO Global Brand Database:** Common-noun usage in Latin liturgical / heraldic contexts ("the umbraculum is displayed above the cathedra"); zero live commercial registrations relevant to software platforms.

**Verdict:** Trademark-clear in our target classes worldwide. A future filing of `UMBRACULUM` in USPTO Class 9 + Class 42 (and EUIPO equivalents) should encounter no senior-mark obstacles based on this prior-art search. The filing remains a deferred decision (§8) — to be done when project revenue or legal-defense budget justifies the ~$250-350/class USPTO filing fee plus attorney costs.

### 6.2 Namespace findings

| Namespace | Status | Evidence |
|---|---|---|
| `@umbraculum` (npm scope) | **Available** | `npm view @umbraculum` returns 404; scope is unclaimed |
| `umbraculum` (npm package, top-level) | **Available** | `npm view umbraculum` returns 404 |
| `umbraculum` (Composer / Packagist vendor) | **Available** | `https://packagist.org/packages/umbraculum/` returns no vendor page |
| `umbraculum` (PyPI top-level) | **Available** | `https://pypi.org/project/umbraculum/` returns 404 |
| `umbraculum` (crates.io top-level) | **Available** | `https://crates.io/crates/umbraculum` returns 404 |
| `umbraculum` (Docker Hub org) | **Available** | `https://hub.docker.com/u/umbraculum` returns 404 |

All registries on which the project is likely to publish are clean for the literal `umbraculum` name. This is the single strongest signal for a Latin / non-English wordmark — Latin scientific, liturgical, and heraldic vocabulary is mostly outside the namespace-crowding zone that affects English compound wordmarks.

### 6.3 GitHub findings

- **GitHub user `umbraculum`:** Taken (single individual, near-zero activity, no public repos of substance). Cannot use as our org name directly.
- **GitHub org `umbraculum-dev`:** **Available.** This is the chosen GitHub org. The `-dev` suffix mirrors the `.dev` primary domain decision and reinforces the developer-first positioning the user explicitly asked for ("`.dev` will signal we're developers without any doubt; will rule out 'marketing only' that devs hate").
- **Alternative org names checked (and available, kept on a defensive-watch list rather than registered):** `umbraculum-org`, `umbraculum-platform`, `umbraculum-io`. We register only `umbraculum-dev` for now; the others stay watched in case a contributor squat appears.

### 6.4 Domain findings

| Domain | Status | Recommendation |
|---|---|---|
| `umbraculum.dev` | **Available** at registrar standard rate (~$15/year via Namecheap, Porkbun, Cloudflare Registrar) | **Acquire as primary canonical.** Mirrors GitHub org `umbraculum-dev`. ICANN policy requires HTTPS for `.dev` (the entire TLD is on the HSTS preload list) — aligns with the project's security posture. |
| `umbraculum.net` | **Available** (~$12/year) | **Acquire as defensive.** `.net` is the cheapest rock-solid TLD with no ccTLD-retirement risk; cheap insurance against email-typo / link-typo redirects to a malicious squat |
| `umbraculum.app` | **Available** (~$15/year) | Optional — acquire when the React Native shell (per umbrella plan §5) ships. The `.app` TLD signals "native application" and could host download / install pages |
| `umbraculum.io` | Available but **explicitly skipped.** Two reasons: (1) `.io` runs ~$45-60/year, ~4× the `.dev` cost with no positioning advantage for developer-targeted projects (`.dev` already signals "developer-first" without ambiguity); (2) the `.io` TLD is administered by the British Indian Ocean Territory (BIOT); the UK's October 2024 announcement of plans to cede the Chagos Archipelago (the BIOT's territory) to Mauritius creates uncertainty about the `.io` ccTLD's long-term continuity. ICANN typically retires a ccTLD when its underlying ISO 3166 country code changes; while transition agreements exist, the policy uncertainty alone justifies skipping it for a foundational platform domain | **Skip** |
| `umbraculum.com` | **Held by DOMAINRECOVER** (a known domain-squatter / aftermarket reseller). Listed for sale at "premium" pricing typically in the $1k-$2k range, sometimes higher. Not blocking — the `.dev` is the primary — but the project should plan to acquire the `.com` later as a defensive holding when project revenue justifies the one-time outlay. Squatter holdings of common Latin words are normal and the price should not escalate dramatically as long as we don't telegraph intent | **Defer; acquire when revenue justifies** |
| `umbraculum.org` | **Available** (~$12/year). Optional defensive | Optional — `.dev` adequately signals project identity; `.org` would be relevant only if a nonprofit governance entity is later created. Defer. |

**Domain decision summary:** Primary `umbraculum.dev` + defensive `umbraculum.net`. Optional later: `umbraculum.app` (when native shell ships), `umbraculum.com` (when revenue justifies), `umbraculum.org` (only if nonprofit entity is created). Total recurring annual cost for the core acquisition: ~$27/year.


### 6.5 Active software / tech projects with this name

A targeted search across GitHub, GitLab, Sourceforge, npm, PyPI, Packagist, and general web search for "umbraculum software" / "umbraculum platform" / "umbraculum project" returned:

- **Zero active software projects** using `Umbraculum` as their wordmark, in any language stack.
- **Zero apparent dev-tools, SaaS, or platform companies** using the wordmark.
- The only meaningful "Umbraculum" hits are: (1) Latin lexicons / dictionaries defining the word, (2) Catholic / liturgical references to the heraldic *umbraculum*, (3) academic / classics-history texts. None of these are competitors or potential confusion sources.

This is the cleanest namespace landscape encountered across the four wordmarks evaluated (`RedUmbrella`, `theredumbrella` / `the-red-umbrella`, `Umbra`, `Umbraculum`). The Latin diminutive form is rare enough as a standalone word to be effectively distinctive while still being meaning-bearing for Latin-literate audiences.

### 6.6 Mascot — Umbi

A character mascot is part of the brand identity from day one.

- **Name**: Umbi
- **Canonical asset**: [`docs/media/umbi.png`](media/umbi.png) (1254×1254, PNG)
- **Origin of the name**: diminutive form of *Umbraculum*, mirroring the wordmark's own diminutive Latin morphology (*umbraculum* itself is a diminutive of *umbra*, "shade" → "small shade / small parasol"). *Umbi* extends that "small / friendly / approachable" thread to a first-name-style short form for the character.
- **Role**: a recognizable, friendly face for the platform — usable in onboarding, error / empty-state illustrations, AI-consultant character framing, swag, and social presence. Not a substitute for the wordmark or the red-umbrella logo concept; complementary to both.
- **Why an explicit mascot at brand-resolution time**: the platform's "AI-consultant context principle" cornerstone (umbrella plan §12, `PLATFORM-ARCHITECTURE.md` §4.0) leans on the AI being perceived as a *cooperative partner* rather than a tool. A mascot gives that partnership a recognizable shape early, before the visual system hardens; introducing it later would either look like an afterthought or trigger a re-skin of every onboarding surface.
- **Ownership**: produced as part of brand resolution; canonical asset committed to the docs tree so it travels with the project. The `docs/media/` directory is the canonical home for brand assets going forward (logo files, mascot variants, social cards, etc.). When the web app or AI-consultant UI needs to serve the asset, copy or symlink from `docs/media/`.
- **Open follow-ups** (not gating; tracked in §8):
  - Style guide entry for usage rules (allowed contexts, do-not-distort, minimum size)
  - Variants if needed (small / large / monochrome / silhouette)
  - License / contribution rules for mascot-derivative assets

---

## 7. Risks and trade-offs explicitly accepted

The resolution accepts the following risks in exchange for the diligence-clean position:

### 7.1 Pronunciation / spelling friction

`Umbraculum` is harder to pronounce on first encounter than `RedUmbrella`. English speakers will often guess "um-BRACK-yoo-lum" (incorrect — Latin stress is on the *antepenult*: **um-bra-COO-lum**, second-syllable a is short, third-syllable u is long: /ˌʌm.brəˈkuː.ləm/). This is mitigated by:

1. The **UMB** marketing short / CLI alias (`umb deploy`, `umb gen`) — most operational interaction will use the three-letter form
2. A pronunciation guide in the README and on the homepage
3. The wordmark only needs to be pronounced verbally in marketing and conference contexts; in code, docs, and CLI it is read silently

The user explicitly accepted this trade-off when choosing the Latin direction. The wordmark's distinctiveness and clean diligence position outweigh first-encounter pronunciation friction for a developer-targeted project.

### 7.2 The UMB short form has prior use

`UMB` is a three-letter combination that has prior use:

- **UMB Bank** — a US regional bank (UMB Financial Corporation, Kansas City). Trademark in financial-services classes (Class 36), not in software classes. No conflict for our use of `UMB` as a CLI / marketing short in software contexts.
- **University of Massachusetts Boston (UMass Boston) — sometimes abbreviated UMB** — academic use, no commercial trademark conflict.
- **UMB as a generic three-letter combo** appears in many namespaces (airport codes, model numbers, etc.) — the standard background noise of any short combination.

Verdict: `UMB` as a CLI command name and marketing short is fine. The wordmark `UMBRACULUM` (full form) is what we'd file as a trademark, not `UMB` alone — registering `UMB` standalone in software classes would be expensive (highly contested three-letter combos always are) and unnecessary; the full wordmark protects the project sufficiently.

### 7.3 Catholic / heraldic association

The historical *umbraculum* is liturgically associated with the Roman Catholic Church (basilican parasol; a heraldic attribute of the papal court when the Holy See is *sede vacante*). Some readers, particularly in Italy and Spain, will recognize this association.

This is **kept as an asset, not treated as a risk**:

1. The historical artifact is literally a red-and-gold umbrella, which retroactively justifies the **red umbrella logo** the user wants to keep — the visual identity is heritage-aligned with the wordmark's etymology rather than a rebranding contradiction
2. The project is open-source and ecumenical; the wordmark's heraldic connotation is architectural ("a sheltering canopy under which contributors gather"), which is conceptually on-brand for a federated multi-vertical platform
3. The association is not exclusive — *umbraculum* in classical Latin pre-dates Catholic use by ~1,500 years (used by Cicero, Vitruvius, and Columella to mean "small parasol / shaded place / arbor")

### 7.4 The GitHub user `umbraculum` is taken

We register `umbraculum-dev` instead. The `-dev` suffix is intentional and reinforces the `.dev` primary domain — this is a feature, not a workaround. Future "official" mentions in docs will consistently use `github.com/umbraculum-dev` and `umbraculum.dev` together, which is internally coherent.

If the existing `umbraculum` user account ever lapses or is willing to transfer, we can request the rename. This is a low-priority defensive option, not a current need.

### 7.5 The .com is in squatter hands

`umbraculum.com` is held by DOMAINRECOVER. The standard playbook applies:

1. Don't telegraph intent — communications mentioning the project should consistently use `umbraculum.dev` so squatters watching for buy-signal don't escalate the price
2. When project revenue justifies the one-time outlay (typical band $1k-$2k for common-Latin-noun .com aftermarket), acquire it through a domain broker (NameJet, Sedo, or Escrow.com) using a neutral identity to avoid escalation
3. Until then, the `.dev` is the canonical and `umbraculum.net` is the defensive

### 7.6 ccTLD continuity caveat for `.dev` (low-probability but flagged)

`.dev` is administered by Google (Charleston Road Registry, the registry operator Google created for its TLD portfolio). The continuity risk is governance, not territorial: if Google ever wound down its registry-operator business, ICANN policy would assign a successor operator and registration continuity is normally preserved (this happened with `.museum` and other niche TLDs). The policy risk is meaningfully lower than the `.io` BIOT-cession scenario (which involves ISO 3166 changes and ccTLD retirement precedent). `.dev` is acceptable as a primary domain.

---

## 8. Decisions deferred to follow-on work

The following decisions are intentionally deferred and recorded here so the rename sub-plan does not block on them:

| Deferred decision | Trigger condition | Owner |
|---|---|---|
| File `UMBRACULUM` trademark in USPTO Class 9 + Class 42 | Project hits revenue threshold OR receives funding OR adversarial use of the wordmark surfaces | Founders + retained trademark counsel |
| File EUIPO equivalent classes | Same as above + first European deployment / contributor majority shifts to EU | Founders + retained trademark counsel |
| Acquire `umbraculum.com` from DOMAINRECOVER | Project revenue justifies one-time $1k-$2k outlay; or squatter signals price drop | Founders / domain broker |
| Acquire `umbraculum.app` | React Native shell ships and `.app` becomes useful for download landing page | Founders |
| Acquire `umbraculum.org` | Nonprofit governance entity is created (not currently planned) | Founders |
| Pronunciation guide page on `umbraculum.dev` | Site v1 ships | Site team |
| Logo: detailed red-umbrella visual identity guidelines (kerning, proportions, color spec for the red, dark-mode treatment) | First public marketing asset is needed | Design |
| Mascot (Umbi) usage style guide: allowed contexts, sizing rules, variants (mono / silhouette / scaled), license for derivative assets | First public marketing asset OR first onboarding surface that uses the mascot | Design |

## 9. Sources and verification methodology

This report was assembled by querying authoritative sources directly rather than relying on aggregators:

- **Trademark searches:** USPTO TESS (`tmsearch.uspto.gov`), EUIPO eSearch Plus (`euipo.europa.eu`), WIPO Global Brand Database, Canadian Intellectual Property Office, Travelers Companies investor relations + Insurance Journal coverage of the 2011 trademark history
- **npm scopes:** `npm view <name>` + registry HTTP 200/404 checks against `https://registry.npmjs.org/<name>`
- **Composer / Packagist:** Direct HTTP GET against `https://packagist.org/packages/<vendor>/`
- **PyPI:** Direct HTTP GET against `https://pypi.org/project/<name>/`
- **crates.io:** Direct HTTP GET against `https://crates.io/crates/<name>`
- **GitHub orgs and users:** Direct HTTP GET against `https://github.com/<name>` + GitHub API `/users/<name>` and `/orgs/<name>`
- **Domain availability:** RDAP queries via `rdap.net` and registry-direct lookups (`whois` was not available on the diligence host; `dig NS <domain>` was used as a presence proxy and cross-referenced with RDAP)
- **Active-project searches:** Targeted web searches scoped to "<wordmark> software", "<wordmark> platform", "<wordmark> github", "<wordmark> company"

Verification dates: 2026-05-17 / 2026-05-18. The trademark and namespace landscape can shift; this report should be re-verified before any trademark filing or major public announcement (the underlying searches take a single afternoon to repeat).

---

## 10. Sign-off

**Resolved on:** 2026-05-18
**Wordmark:** Umbraculum (UMB short)
**Primary domain:** umbraculum.dev
**Github org:** umbraculum-dev
**Package namespaces:** `@umbraculum` (npm) / `umbraculum` (Composer / PyPI / crates.io / Docker Hub)
**Logo concept:** Red umbrella (heritage-aligned with the heraldic *umbraculum*)

This resolution unblocks the rename sub-plan's `find_placeholders_grep` → substitution → confirmation pipeline against the brewery-app repo and the openplc sister-repo, scoped per the umbrella plan §10 exclusions (the `@brewery/*` actual package scopes — distinct from the `<PLATFORM_NAME>` placeholder — remain out of scope; their migration is tracked as the new follow-on sub-plan #9 in the umbrella plan's "Sub-plans this plan is designed to spawn" list).
