# Sprint 03 — Implementation Plan & Contract (Foundation Track)

**Version:** 1.0.0
**Status:** Approved for execution. Milestone 12 (Implementation Plan &
Contract) is complete — this document is its deliverable, authored
after founder approval of Decisions J.1–J.7 (§3). **Milestone 13 has
not started.** Per the founder's explicit instruction, M13 may not
begin until this document has been reviewed and M13 is separately,
explicitly authorized.
**Owner:** Product Owner
**Last Updated:** 2026-08-13
**Phase:** Post-Sprint-02, foundation-track implementation planning.
Sprint 01 and Sprint 02 are both complete and permanently merged into
`main` — see `docs/sprints/sprint-01.md` and `docs/sprints/sprint-02.md`.

## Context

Sprint 02 (Architecture & Compliance Design Layer) produced eight new
ADRs ([ADR-0008](../decisions/ADR-0008-core-data-model-parent-family-child.md)–[ADR-0015](../decisions/ADR-0015-child-data-lifecycle-architecture.md))
and their companion architecture/module documents, all "design only" —
no schema, migration, authentication code, consent capture, AI
integration, or infrastructure was implemented. Six of those eight ADRs
reached **Accepted — Implementation Deferred** (0008, 0009, 0010, 0012,
0014, 0015); two remain **Proposed** (0011 Consent, 0013 AI-Provider
Boundary), each blocked on a named legal/business gate.

Sprint 03 Milestone 12 (Implementation Plan & Contract) was an
inspection-and-planning-only exercise: read every governing document,
determine exactly what Sprint 03 may implement, what must stay
deferred, and what depends on founder or legal action — without
inventing, reinterpreting, or silently resolving any open item. Its
single most important finding, easy to miss on a surface reading of the
ADR Index: **"Accepted — Implementation Deferred" does not itself
authorize writing code.** Every one of ADR-0008 through ADR-0015
contains an explicit Consequences clause stating it does not authorize
schema, migration, authentication, or any other implementation code by
itself. That authorization did not exist anywhere in the repository
until the founder decision recorded at §3, J.1, below.

M12's report also surfaced two documentation-hygiene findings, now
resolved: `docs/sprints/sprint-02.md` carried a pre-existing,
uncommitted working-tree correction (its Status/Version header still
read "Proposed," stale relative to Milestones 1–10's real, merged PR
history) — committed separately, prior to and independent of this
document, per founder decision J.6. `PROJECT.md`'s own Milestone 11
Change Log entry asserted a "not committed" state for itself that was
already false by the time of that commit — noted, not corrected here
(out of this document's scope).

This document is the authoritative Sprint 03 Sprint Document. It does
not amend any Constitution or any accepted ADR; where it is silent, the
Governance Hierarchy (`docs/sprints/sprint-01.md`, §1) controls.

---

## 0. Sprint 03 Objective

Move Natkhat AI from "fully designed, zero lines of implementation" to
a working, **non-production, feature-flagged technical foundation**
that exercises the Sprint 02 designs end-to-end against synthetic data
only — without crossing any open legal-validation gate (consent-
mechanism sufficiency, AI-provider contract terms, India
data-localization, breach-notification/audit-retention finality) and
without ever collecting, storing, or exposing real parent or child
data. **Implementation authorization does not equal production
authorization** — this distinction, set by founder decision J.1, governs
every milestone below.

---

## 1. Governance Checkpoint (recap, not restated authority)

| Item                                       | Status                                                                          |
| ------------------------------------------ | ------------------------------------------------------------------------------- |
| Sprint 01                                  | Complete, permanently merged (`main`)                                           |
| Sprint 02 (M1–M11)                         | Complete, permanently merged (`main`, PRs #2–#12)                               |
| ADR-0004 (database), ADR-0005 (auth)       | Accepted — implementation deferred; legal-validation gates still open           |
| ADR-0006 (privacy/compliance requirements) | Accepted; six items marked [LEGAL VALIDATION REQUIRED], unresolved              |
| ADR-0007 (target-audience posture)         | Accepted; India, ages 4–10, founder-ratified; DPDP legal sufficiency still open |
| ADR-0008, 0009, 0010, 0012, 0014, 0015     | Accepted — Implementation Deferred                                              |
| ADR-0011 (Consent)                         | Proposed — mechanism direction recorded, DPDP legal validation open             |
| ADR-0013 (AI-Provider Boundary)            | Proposed — no provider selected, contract-terms legal review open               |
| M12 (this milestone)                       | Complete — founder-approved Decisions J.1–J.7 (§3)                              |
| M13–M20                                    | Not started; M13 requires separate, explicit founder authorization beyond J.1   |

This table is a pointer, not a new authority — if it disagrees with
`PROJECT.md` or an ADR, those win, per `docs/sprints/sprint-01.md`, §1.

---

## 2. Scope Boundary

### 2.1 Permitted now (foundation track, per Decision J.1)

Schema, module, and isolation-boundary implementation for the entities
and architecture already designed in Sprint 02 (ADR-0008–0010,
0012, 0015), built and tested exclusively against synthetic/fictional
data in a non-production environment; a `ConsentEvent` **scaffold**
(structure and atomicity invariant only, no real verification
mechanism); an AI-provider abstraction interface with a **mock adapter
only**; retention/deletion/export/backup-purge and audit-log
implementation, with the still-provisional Tier-5 retention period
implemented as a configuration value, not a constant; a single internal,
feature-flagged, dev-only end-to-end integration exercise (M20).

### 2.2 Explicitly excluded regardless of milestone

Any real parent, child, or family data, anywhere, ever. Any production
deployment. Any real consent-verification mechanism (signed form,
payment card, ID-linked, or otherwise) enabled or exercised against a
real user. Any real AI/LLM provider SDK, API key, credential, or model
call. Any real GCP/Supabase **production** project or India-residency
claim. Any `apps/admin` or `apps/website` scaffold (deferred to Sprint
04+, Decision J.2). Any AI-provider selection or contracting (deferred,
Decision J.4). Any modification to a Constitution, an already-accepted
ADR, or `docs/decisions/decision-log.md` beyond what this document
itself records.

### 2.3 The two-track split every implementation milestone must preserve

| Track                              | Meaning                                                                                                                                                                                                             | Governing decision                      |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| **A — Engineering scaffold**       | Schema, isolation, session logic, audit logging, Leo data model, AI-boundary interface + mock adapter — built and tested against synthetic data only, in a non-production environment, never exposed to a real user | Authorized now (J.1)                    |
| **B — Legally-gated real feature** | Real consent-mechanism activation (M17); real AI-provider integration (M19); real production infrastructure/India-residency (future, post-Sprint-03)                                                                | Each blocked on its own named gate — §6 |

Every milestone from M13 through M20 sits in Track A. M17 and M19 each
carry a Track B tail that must ship disabled by default, behind a
feature flag, and must not be activated by this sprint.

---

## 3. Approved Founder Decisions (2026-08-13)

Recorded here as the authoritative reference; each was presented with
options and a recommendation during M12 planning and decided by the
founder as follows.

**J.1 — Threshold implementation-authorization decision.** Approved:
**Option A.** Sprint 03 implementation is authorized now, strictly on
the synthetic-data/non-production track described in §2.3, Track A.
Guardrails, binding on every milestone: synthetic/test data only; no
real child or user data; no production deployment; no real consent
capture; no real AI-provider activation; mock AI adapter only; feature
flags must keep every activation track disabled by default; open
legal/compliance gates (§6) must never be silently treated as resolved;
**implementation authorization does not equal production authorization.**

**J.2 — Admin/Website sequencing.** Approved: **Option B.**
`apps/admin` and `apps/website` scaffolding (ADR-0014) is deferred to
Sprint 04 or later. Not added as a parallel track to Sprint 03.

**J.3 — Consent-verification mechanism direction.** Approved:
**Option A.** Signed/e-signed consent form remains the confirmed
primary candidate, to be submitted for India DPDP legal review as a
concrete design once M17's scaffold exists. Payment-card verification
remains the identified fallback. Real consent capture stays inactive
until legal validation clears it (§6).

**J.4 — AI-provider candidate selection.** Approved: **Option C.**
AI-provider selection is deferred entirely — no candidate is named at
this checkpoint. The provider-abstraction/mock-adapter architecture
(M19) is preserved and built to accept a future adapter without
redesign. Provider evaluation and contract-terms legal review occur at
a future decision point, separate from this one, before the
real-provider track can reach implementation authorization.

**J.5 — Dev infrastructure target.** Approved: **Option C (hybrid).**
M13 and M14 run on a local/self-hosted Postgres development
environment. A real, non-production dev Supabase project — explicitly
making no India-residency claim — is introduced specifically at M15,
when Supabase Auth integration is actually required. No production
infrastructure exists at any point in Sprint 03.

**J.6 — Sprint-02 correction and Sprint-03 authorship.** Approved:
**Option C.** The pending `docs/sprints/sprint-02.md` correction was
committed separately (commit `d979596`, prior to this document) as a
factual historical-record fix, independent of J.1–J.5. This document —
`docs/sprints/sprint-03.md` — is authored now that J.1–J.5 are resolved,
as the single authoritative Sprint 03 execution document.

**J.7 — Execution cadence.** Approved: **Option A.** Sprint 03 continues
Sprint 01/02's one-milestone-at-a-time, stop-and-report cadence through
at least Milestone 17. M13–M17 are not automatically batched. Whether
M18–M20 can move to dependency-chain batching is reassessed only after
M17 completes.

---

## 4. Milestone Breakdown

Each milestone follows the same discipline Sprint 01/02 used:
implemented one at a time, reported, and stopped for explicit review
before the next begins (Decision J.7), through at least M17.

### M12 — Implementation Plan & Contract

- **Objective:** Inspect the repository and determine exactly what
  Sprint 03 may and may not implement; obtain founder decisions on every
  open threshold question.
- **Source:** All of Sprint 01/02's governance chain (self-referential).
- **Implementation scope:** None — analysis and this document only.
- **Explicit exclusions:** No schema, code, infrastructure, or
  protected-file edit beyond `docs/sprints/sprint-02.md`'s factual
  correction and this document's own authorship.
- **Dependencies:** None.
- **Security/privacy implications:** None — no code or data touched.
- **Founder/legal gates:** This document is itself subject to founder
  review before M13 begins.
- **Expected files/directories:** `docs/sprints/sprint-02.md` (corrected),
  `docs/sprints/sprint-03.md` (this file).
- **Testing requirements:** Documentation validation only (Prettier
  format check).
- **Definition of Done:** Founder has reviewed and can separately
  authorize M13.
- **Implementation authorization status:** Complete.

### M13 — Backend & Environment Foundation

- **Objective:** Stand up the minimal, non-production engineering
  substrate (local DB connectivity, env/secrets validation, module
  skeleton, CI coverage) every later milestone builds on.
- **Source:** ADR-0004 (implementation-deferred), ADR-0006 §29 (secrets
  management).
- **Implementation scope:** Prisma installed and pointed at a local
  Postgres instance (Decision J.5); `scripts/check-env.ts` extended for
  new required env vars; empty NestJS module boundaries for the domains
  M14+ will fill in; Turborepo/CI updated to cover the new code.
- **Explicit exclusions:** No production or real Supabase/GCP project;
  no India-residency claim; no real schema fields yet (M14); no secrets
  beyond local dev placeholders.
- **Dependencies:** Explicit founder authorization to begin M13 (this
  document's own gate, distinct from J.1).
- **Security/privacy implications:** Low — no data model exists at this
  step.
- **Founder/legal gates:** None beyond the M13-start authorization
  itself.
- **Expected files/directories:** `apps/backend/prisma/`, updates to
  `scripts/check-env.ts` and `.env.example`, `apps/backend/src/<domain>/`
  stubs.
- **Testing requirements:** Unit (env validation), Integration (local DB
  connectivity health check).
- **Definition of Done:** `pnpm exec turbo run lint typecheck test build`
  green with the new structure; no real data path exists.
- **Implementation authorization status:** **Not yet authorized** —
  awaiting the founder's separate, explicit M13 go-ahead.

### M14 — Identity, Family & Tenant-Isolation Implementation

_(absorbs Sprint 02 M3's classification/isolation scope, per M12's
evaluation — RLS and Tier-3-adjacent encryption ship in the same change
as the schema, not after)_

- **Objective:** Implement ADR-0008's entity model (Parent, Family,
  Child, CoParentAssignment, Device, Session) together with ADR-0010's
  Row-Level Security so the tables are never live in an unisolated
  state.
- **Source:** ADR-0008, ADR-0010, `docs/modules/identity-family/README.md`.
- **Implementation scope:** Prisma schema for the six entities per the
  module doc's field tables; PostgreSQL RLS with `FORCE ROW LEVEL
SECURITY`, no `BYPASSRLS` request-serving role; repository-layer code
  only, no HTTP surface.
- **Explicit exclusions:** No API endpoints; no auth/session logic
  (M15); no real consent gating on Child creation yet beyond a
  placeholder (real atomicity ships with M17); synthetic fixtures only.
- **Dependencies:** M13.
- **Security/privacy implications:** First milestone touching
  classification-tiered data live — isolation must ship atomically with
  schema.
- **Founder/legal gates:** None beyond J.1's standing guardrails.
- **Expected files/directories:** `apps/backend/prisma/schema.prisma`
  (or migrations), `apps/backend/src/identity-family/`.
- **Testing requirements:** Unit (entity invariants), Security
  (cross-family authorization-bypass test, made executable from
  `identity-family/README.md` §6's informal walkthrough).
- **Definition of Done:** Schema migrates cleanly on a fresh dev DB; RLS
  proven to reject a cross-family query in a test.
- **Implementation authorization status:** Gated behind M13's completion
  and its own stop-and-report checkpoint (J.7).

### M15 — Authorization & Session Implementation

- **Objective:** Implement ADR-0009's two-gate authorization check
  (tenant-scope, then action-permission) and wire Supabase Auth
  (ADR-0005) against a real, non-production dev project (Decision J.5).
- **Source:** ADR-0009, ADR-0005, `docs/architecture/authorization-and-sessions.md`.
- **Implementation scope:** `authorize(...)` two-gate check; Supabase
  Auth SDK integration (dev project, test accounts only); the five
  owner-only-unconditional actions enforced as a hard invariant;
  family-switch operation; co-parent revocation cascade.
- **Explicit exclusions:** No child-session activation (ADR-0009 item 7
  is designed, not enabled); no production auth credentials.
- **Dependencies:** M14; introduction of the real dev Supabase project
  (J.5).
- **Security/privacy implications:** First real external SaaS
  dependency in the stack — secrets management (ADR-0006 §29) must be
  operational here.
- **Founder/legal gates:** None beyond J.1's standing guardrails.
- **Expected files/directories:** `apps/backend/src/auth/`,
  `apps/backend/src/authorization/`.
- **Testing requirements:** Security (the named ADR-0006 §6 cross-family
  rejection test, executable against real auth), Integration
  (revocation-cascade timing).
- **Definition of Done:** A revoked co-parent's next request is denied
  regardless of cascade-job timing, proven by test.
- **Implementation authorization status:** Gated behind M14's completion
  and its own stop-and-report checkpoint.

### M16 — Data Lifecycle & Auditability Implementation

_(absorbs Sprint 02 M7's audit-log scope, per M12's evaluation)_

- **Objective:** Implement ADR-0015's retention/deletion/export/
  backup-purge mechanics and the audit-log schema/pipeline from
  `docs/architecture/audit-logging.md`.
- **Source:** ADR-0015, `docs/architecture/audit-logging.md`, ADR-0006
  §22.
- **Implementation scope:** Soft-delete → 90-day hard-delete job;
  backup-purge paired with per-Family DEK crypto-shredding for Tier-3
  content; export-completeness job; append-only audit log covering every
  read/write/delete/export/share of Sensitive Child Content, with the
  Tier-5 retention period implemented as a **configuration value**
  (currently 3 years, provisional per ADR-0015 §13.3), never hardcoded.
- **Explicit exclusions:** No claim that the audit-retention period is
  DPDP-final; no production backup infrastructure.
- **Dependencies:** M14 (entities to retire), M15 (auth events to
  audit).
- **Security/privacy implications:** Audit logs must be structurally
  non-deletable by any application-layer parent action.
- **Founder/legal gates:** Audit-retention finality remains gated on
  breach-notification legal review (§6) — does not block implementing
  the job with a configurable value.
- **Expected files/directories:** `apps/backend/src/lifecycle/`,
  `apps/backend/src/audit/`.
- **Testing requirements:** Integration (deletion cascades, soft→hard
  timing), Security (audit-log immutability).
- **Definition of Done:** A deleted Family's Tier-3 content is unreadable
  immediately upon DEK destruction; audit log records every access with
  no parent-accessible delete path.
- **Implementation authorization status:** Gated behind M15's completion
  and its own stop-and-report checkpoint.

### M17 — Consent & Privacy Gate

- **Objective:** Implement the `ConsentEvent` schema and the atomic
  Child-creation-requires-consent invariant from ADR-0011, as a
  **scaffold only** — the real verification mechanism stays inactive.
- **Source:** ADR-0011, `docs/architecture/consent-architecture.md`.
- **Implementation scope — Track A (authorized now):** `ConsentEvent`
  entity (Tier-1 sensitivity, Tier-5 lifecycle behavior — append-only,
  never parent-deletable); atomic Child+ConsentEvent creation;
  `verification_reference` as an opaque pointer only, no artifact
  storage.
- **Implementation scope — Track B (blocked, do not build):** Any real
  signed-form capture, payment-card verification, or ID-linked
  verification flow; any UI exposed to a real parent.
- **Explicit exclusions:** No real consent ever captured; no claim of
  DPDP sufficiency.
- **Dependencies:** M14.
- **Security/privacy implications:** Highest-stakes milestone in the
  sequence for getting the scaffold/activation split right — a
  mis-scoped implementation is the most direct path to collecting real
  child data without valid consent.
- **Founder/legal gates:** Track A requires only the standing M13-start
  authorization. Track B (activation) requires the signed/e-signed
  mechanism (J.3) to clear India DPDP legal validation (§6) — not
  expected within Sprint 03.
- **Expected files/directories:** `apps/backend/src/consent/`.
- **Testing requirements:** Unit/Integration on the scaffold and
  atomicity invariant only; no test exercises a real mechanism.
- **Definition of Done:** No `Child` row can exist without a
  `ConsentEvent` row, proven by test; every real mechanism field is
  present but unimplemented/disabled.
- **Implementation authorization status:** Track A gated behind M14/M16
  completion and its own stop-and-report checkpoint; Track B blocked on
  §6, independent of sprint progress.

### M18 — Leo Foundation & Memory Isolation

- **Objective:** Implement ADR-0012's `Conversation`/`Message`/
  `LeoMemory` schema, the three-class memory architecture, and
  cross-child isolation — no AI.
- **Source:** ADR-0012, `docs/architecture/ai-memory-isolation.md`,
  `docs/modules/leo-companion/README.md`.
- **Implementation scope:** The three entities; Tier-3 per-Family DEK
  encryption (reusing M14's pattern); the three memory classes with
  their approved retention rules; owner-only Vault-add enforcement;
  cross-child application-layer isolation (residual risk explicitly
  inherited from ADR-0012 item 10, not resolved here).
- **Explicit exclusions:** No AI/LLM integration; no embedding pipeline
  or vector DB; no real conversation content — fixtures use M17's
  consent-scaffold Child rows.
- **Dependencies:** M14, M16, M17's scaffold track (Child creation
  requires a `ConsentEvent` even for fixtures).
- **Security/privacy implications:** First sibling-level (cross-child)
  isolation requirement in the sequence — any leak here is a security
  failure, per ADR-0012 item 10.
- **Founder/legal gates:** None beyond J.1's standing guardrails.
- **Expected files/directories:** `apps/backend/src/leo/`.
- **Testing requirements:** Unit (memory supersession-not-mutation
  invariant), Security (cross-family **and** cross-child isolation
  tests).
- **Definition of Done:** A Leo session scoped to one Child cannot read
  another Child's rows in the same Family, proven by test.
- **Implementation authorization status:** Gated behind M17's completion
  and its own stop-and-report checkpoint.

### M19 — AI Provider Boundary & Interface

- **Objective:** Implement ADR-0013's provider-neutral contract and
  adapter pattern, with a mock/no-op adapter only.
- **Source:** ADR-0013, `docs/architecture/ai-provider-boundary.md`.
- **Implementation scope — Track A (authorized now):** The neutral
  request/response contract; the adapter interface; one mock adapter
  returning canned responses; enforcement that no provider-specific type
  appears in a core-domain entity; the (empty) Personalization Data
  Allowlist structure (Option C, `first_name`-only-if-listed).
- **Implementation scope — Track B (blocked, do not build):** Any real
  provider SDK, API key, credential, or live model call; any provider
  selection or contracting (Decision J.4).
- **Explicit exclusions:** No provider selected or contracted; no real
  prompt ever sent anywhere.
- **Dependencies:** M18.
- **Security/privacy implications:** The adapter registry should
  structurally refuse to load a non-mock adapter absent an explicit,
  separately-flagged legal-clearance marker.
- **Founder/legal gates:** Track A requires only the standing
  authorization. Track B requires a future, separate founder provider
  decision (superseding J.4) plus contract-terms legal review (§6).
- **Expected files/directories:** `apps/backend/src/ai-provider/`.
- **Testing requirements:** Unit/Integration against the mock adapter;
  a contract test asserting no provider-specific leakage into
  core-domain entities.
- **Definition of Done:** Swapping the mock adapter for a second mock
  adapter requires no change to any M14–M18 entity or module.
- **Implementation authorization status:** Track A gated behind M18's
  completion and its own stop-and-report checkpoint; Track B blocked on
  §6, independent of sprint progress.

### M20 — First End-to-End Vertical Slice (Internal, Dev-Only, Feature-Flagged)

- **Objective:** Wire M13–M19 into one flow — parent signup → family →
  child (via consent scaffold) → Leo chat (via mock adapter) — proving
  the architecture, not launching anything.
- **Source:** All prior Sprint 03 milestones.
- **Implementation scope:** End-to-end integration test/demo path,
  entirely behind a feature flag defaulting off, disabled in any
  environment configured as production.
- **Explicit exclusions:** No real user ever reaches this flow; no
  production deploy; no real consent or real AI activation.
- **Dependencies:** M13–M19's Track A scaffolds — does not require
  either legal gate in §6 to close.
- **Security/privacy implications:** Confirms the full isolation chain
  (family → child → conversation → memory) holds under one realistic
  flow, not just per-milestone unit tests.
- **Founder/legal gates:** None beyond the standing authorization — this
  milestone is designed specifically to need nothing else.
- **Expected files/directories:** An integration-test suite exercising
  the full flow; no new production surface.
- **Testing requirements:** End-to-end, dev/flagged environment only.
- **Definition of Done:** The flow completes against synthetic fixtures
  with every isolation/audit/consent-scaffold check passing; the feature
  flag is confirmed off in any production-like environment.
- **Implementation authorization status:** Gated behind M19's completion.
  Per Decision J.7, whether M18–M20 batch together for review is
  reassessed only after M17.

---

## 5. Milestone Dependency Graph

- **M13** — depends on explicit founder authorization to start
  (independent of J.1, which authorizes the sprint's track, not this
  specific milestone's start).
- **M14** — depends on M13.
- **M15** — depends on M14; requires the dev Supabase project (J.5).
- **M16** — depends on M14, M15.
- **M17** (Track A) — depends on M14. (Track B) — depends additionally on
  §6 gates, not on sprint sequencing.
- **M18** — depends on M14, M16, M17 (Track A).
- **M19** (Track A) — depends on M18. (Track B) — depends additionally on
  a future provider decision plus §6 gates.
- **M20** — depends on M13–M19's Track A scaffolds only.

---

## 6. Legal/Privacy Validation Required (open, not resolved by J.1–J.7)

1. India DPDP Act legal sufficiency of the signed/e-signed consent-form
   design (J.3 selected the candidate; legal has not validated it) —
   blocks M17 Track B only.
2. Selection and legal review of an AI provider's contract terms
   (ADR-0006 §26) — deferred per J.4; blocks M19 Track B only, and has
   no timeline within Sprint 03.
3. India DPDP data-localization confirmation (ADR-0007 §D.3) — not
   triggered by J.5's hybrid dev approach; blocks any future
   _production_ infrastructure decision, in or beyond Sprint 03.
4. Regulatory breach-notification obligations and timelines (ADR-0006
   §30) — governs whether ADR-0015 §13.3's provisional 3-year Tier-5
   retention period holds; M16 implements that period as a
   configuration value specifically because of this open item.
5. Whether AI-driven Leo responses constitute "automated
   decision-making" under a GDPR Article 22 equivalent (ADR-0006 Legal
   Validation item 5) — not currently operative (India-only launch);
   relevant only if a future non-India market is ratified.

None of the above are resolved, assumed, or silently ratified by this
document or by any Sprint 03 milestone.

---

## 7. Risk Register (Sprint-03-specific, extends `sprint-01.md` §26 and `sprint-02.md` §6)

| Category          | Risk                                                                                                             | Mitigation                                                                                                                                                              |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Governance        | Implementation proceeds past what J.1 actually authorized, on the assumption that "Accepted" ADRs are sufficient | Every milestone's Definition of Done in §4 is explicit about Track A/B; M13 additionally requires its own separate go-ahead beyond J.1                                  |
| Privacy           | Synthetic/dev fixtures drift into real-looking or accidentally-real PII                                          | Fictional-data-only rule carried forward from Sprint 01/02; recommend a PR-checklist item forbidding real-looking PII in fixtures before M14 starts                     |
| Compliance        | M17's consent scaffold gets temporarily enabled for convenience during M18/M20 testing                           | Consent _activation_ is feature-flagged separately from consent _schema_; default-off, requires a second explicit flag flip outside any milestone's Definition of Done  |
| Compliance        | M19's mock adapter gets swapped for a real provider key "just to test it" before contract-terms review completes | No real provider credential is configured in any environment this sprint touches; adapter registry refuses non-mock adapters without an explicit legal-clearance marker |
| Scope             | M16's audit-log retention gets hardcoded, requiring a redeploy when DPDP review changes it                       | Implemented as a config value from the start (§4, M16)                                                                                                                  |
| Process           | First real code in the repository — CI has only ever validated scaffolds until now                               | Treat M13's first PR as a canary for CI behavior, not a formality                                                                                                       |
| Founder bandwidth | M17 Track B and M19 Track B both need future founder + legal input                                               | M18/M20 proceed on Track A regardless, per the dependency graph in §5                                                                                                   |

---

## 8. Testing Strategy

Per `docs/engineering/testing-strategy.md`'s existing taxonomy, Sprint 03
is the first sprint where Integration, API, and Security layers become
real (Sprint 01/02 only exercised Unit/Widget minimally). Per-milestone
minimum bars are specified in each milestone's own Testing Requirements
field in §4. Every PR must pass the existing `security-checklist.md`
and `pull-request-checklist.md` gates before merge — no new checklist
is introduced.

---

## 9. Sprint 03 Definition of Done

A new engineer or AI agent can clone the repo, read `PROJECT.md` →
Constitutions → ADR-0001 through ADR-0015 → this document → the
relevant module doc, and understand exactly which parts of Natkhat AI
are runnable in a dev-only, feature-flagged environment against
synthetic data, and which parts remain structurally present but
switched off pending the legal validation in §6. No real parent, child,
or family data exists anywhere. No production environment, real
AI-provider credential, or real consent-verification mechanism is
active. `PROJECT.md`'s Implementation Gate still reads BLOCKED for real
user data collection and production launch.

---

## 10. Explicit Exclusions (repository-wide, restated)

No `apps/admin`/`apps/website` scaffold (Decision J.2). No AI-provider
selection or contracting (Decision J.4). No real consent-verification
mechanism implementation or activation. No real AI/LLM SDK integration,
credential, or model call. No production GCP/Supabase project or
India-residency claim. No Constitution or accepted-ADR modification. No
claim, anywhere in this sprint's output, of COPPA, GDPR, DPDP, or other
regulatory compliance. No M13 implementation code until separately,
explicitly authorized beyond this document's own approval.

---

## Next Step

**M12 is complete.** `docs/sprints/sprint-02.md`'s factual correction is
committed (commit `d979596`); this document is authored and pending
review as the authoritative Sprint 03 plan. **M13 has not started and
may not start until the founder explicitly authorizes it**, per
instruction accompanying Decision J.1–J.7's approval. Execution then
continues one milestone at a time, stop-and-report, through at least
M17 (Decision J.7).
