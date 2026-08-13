# Sprint 02 — Architecture & Compliance Design Layer

**Version:** 1.1.0
**Status:** Approved for execution. Sprint 02 proceeded through
Milestones 1–4 (Identity & Family, Authorization & Sessions, Data
Classification/Encryption/Isolation, Data Lifecycle), each reviewed and
founder-approved at its own stop-and-report checkpoint — see
[ADR-0008](../decisions/ADR-0008-core-data-model-parent-family-child.md),
[ADR-0009](../decisions/ADR-0009-authorization-and-session-architecture.md),
and
[ADR-0010](../decisions/ADR-0010-encryption-and-tenant-isolation-design.md)'s
own "Accepted — Implementation Deferred" status lines, and
`docs/architecture/data-lifecycle.md` §13's founder-decision record
(2026-08-05), for the actual approval evidence. **This document's own
Status line was not updated at each milestone as it happened — a
documentation gap, corrected here 2026-08-06, not a claim that approval
happened on this date.** Milestone 5 (Consent Architecture) is now
underway — see `docs/architecture/consent-architecture.md` and
[ADR-0011](../decisions/ADR-0011-consent-architecture.md). Of the
Founder Decisions in §7: item 2 (retention windows, M4) is resolved
(`docs/architecture/data-lifecycle.md` §13); item 3 (consent-mechanism
direction) remains open — M5 exists to produce the shortlist that item
requires, per §3's own M5 text, so it is not a start-blocker for M5;
item 4 (M10 sequencing) remains open and unrelated to M5. Execution
continues one milestone at a time, stop-and-report, per §3's preamble.
**Owner:** Product Owner
**Last Updated:** 2026-08-06
**Phase:** Post-governance-close-out, Sprint 02 execution in progress —
Milestones 1–4 complete and merged, Milestone 5 in progress.

## Context

Sprint 01 (Repository Foundation) is complete and permanently merged
into `main`. The Post-Sprint-01 Privacy/Child-Safety/Compliance
Governance Remediation is also complete:
[ADR-0006](../decisions/ADR-0006-data-privacy-compliance.md) (Data
Privacy & Compliance Engineering Requirements) and
[ADR-0007](../decisions/ADR-0007-target-audience-interim-posture.md)
(Interim Target-Audience Engineering Compliance Posture) are both
accepted and merged. ADR-0007 §D additionally records the founder's
ratified initial-launch decision: a parent-managed childhood companion,
ages **4–10**, launching first in a **single market — India** — a
business decision, explicitly not a legal certification of DPDP Act
compliance.

This clears the **existence** of a compliance ADR that ADR-0004
(database) and ADR-0005 (authentication) named as their prerequisite. It
does **not** clear the remaining gates: India DPDP Act legal validation
of an actual consent-capture design (ADR-0007 §C.3, §D.3), selection of
the specific verifiable-parental-consent mechanism (ADR-0007 §C.6),
third-party AI/model-provider contract-terms review (ADR-0006 §26), and
the other items in ADR-0006's "Legal Validation Required" section and
`PROJECT.md` Known Risk #10. None of those gates move in Sprint 02.

**What Sprint 02 is for:** translating ADR-0006's 30 engineering
requirements and ADR-0007's posture into concrete, reviewable
**architecture and design documents** for the systems that will
eventually implement child/family data handling — data model,
authorization, encryption/isolation, data lifecycle, consent
architecture, Leo memory/conversation isolation, auditability,
AI-provider boundaries, and India-first deployment — **without writing
any code that touches a database, an authentication system, a consent
mechanism, storage, a production API, or an AI integration.** This is
the same "design now, implement later" discipline Sprint 01 already
used for ADR-0004/0005 themselves.

Per the Governance Hierarchy (`docs/sprints/sprint-01.md`, §1; restated
in the Engineering Constitution), this Sprint Document must not
schedule anything that contradicts ADR-0001 through ADR-0007, and
nothing here amends any Constitution or any accepted ADR. Every
milestone below produces documentation only — `docs/architecture/`,
`docs/modules/<slug>/README.md` (per
[`docs/modules/TEMPLATE.md`](../modules/TEMPLATE.md)), and where a
design decision is architectural/hard-to-reverse, a new ADR authored at
execution time (not by this planning document).

---

## 0. Sprint 02 Objective

Move Natkhat AI from "repository foundation with governance gates" to
"a fully designed next engineering layer, ready to implement the moment
the remaining legal/privacy gates clear" — by producing reviewable
architecture for parent-managed identity, child isolation, consent,
data classification/encryption, data lifecycle, Leo memory/conversation
boundaries, auditability, AI-provider boundaries, and India-first
deployment, plus formalizing the Next.js admin/website decision that is
already locked in the Product Constitution but has no ADR of its own —
**without implementing any of it.**

---

## 1. Governance Checkpoint (recap, not restated authority)

| Item                                                   | Status                                                                                                          |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Sprint 01                                              | Complete, permanently merged (`main`, merge commit `87de72d`)                                                   |
| ADR-0001–0003 (monorepo, Flutter, NestJS)              | Accepted, implemented (scaffolds only)                                                                          |
| ADR-0004 (database)                                    | Accepted — implementation deferred; ADR-existence gate cleared by ADR-0006, legal/design gates below still open |
| ADR-0005 (authentication)                              | Accepted — implementation deferred; same gate status as ADR-0004                                                |
| ADR-0006 (privacy/compliance engineering requirements) | Accepted; verified 2026-08-04, no defect found                                                                  |
| ADR-0007 (target-audience posture)                     | Accepted; §D founder-ratified 2026-08-04 — India, single market, ages 4–10                                      |
| CI                                                     | Green (5/5 required checks)                                                                                     |
| Branch protection                                      | Active, unchanged, not weakened                                                                                 |
| Working tree                                           | Clean                                                                                                           |

This table is a pointer, not a new authority — if it ever disagrees
with `PROJECT.md` or an ADR, those win (`docs/sprints/sprint-01.md`,
§1).

---

## 2. Scope Boundary

### 2.1 Explicitly included — architecture/design documentation only

Data-model design; authorization/session architecture; data
classification, encryption, and tenant-isolation design; child-data
lifecycle (retention/deletion/export/backup-purge) design;
consent-architecture design (framework only — see 2.3); Leo
memory/conversation-isolation design; auditability/audit-log-schema
design; AI-provider data-boundary and multi-provider/self-hosted
compatibility design; India-first deployment and data-residency
architecture; formal ADR recording the already-locked Next.js
admin/website stack decision.

### 2.2 Explicitly excluded — no implementation, regardless of milestone

No Prisma schema, no migration, no database connection code (ADR-0004
still gates this). No Supabase Auth integration, no session/token code
(ADR-0005 still gates this). No consent-capture UI, API, or storage of
any real consent record. No storage bucket wiring, no upload/download
code. No production API endpoints beyond the existing scaffold's
default generator output. No AI/LLM provider integration code, no
prompt pipeline, no Leo implementation. No collection of any real
child, parent, or family personal data — test/example data in design
docs must be clearly fictional, never sourced from a real user. No
`apps/admin` or `apps/website` scaffold creation (that is a candidate
for a future sprint, contingent on separate founder approval — this
Sprint records the ADR decision only, per §2.1). No `docs/sprints/
sprint-03.md`.

### 2.3 The four-way split required by this planning phase

| Category                                      | Meaning                                                                                                                                       | What's in it                                                                                                                                                                                                                                                                                                                                              |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Permitted immediately**                  | Pure documentation/architecture work; touches no real data, no new business/legal decision required beyond what ADR-0006/0007 already settled | M1–M9, M11 (see §3) — producing design docs, ER-level data models (fictional examples only), authorization models, classification/encryption designs, lifecycle designs, memory/conversation isolation designs, audit-schema designs, AI-provider boundary designs, India-deployment architecture                                                         |
| **2. Requiring founder approval**             | Business/product-weight decisions embedded in a design, even though the design itself is just documentation                                   | Exact retention windows per data category (M4); backup-purge window (M4); consent-mechanism shortlist to carry into legal review (M5); whether to proceed with drafting the Next.js admin/website ADR now vs. defer (M10)                                                                                                                                 |
| **3. Requiring legal/privacy validation**     | Cannot be finalized as compliant or production-ready without qualified legal counsel — Sprint 02 can design around these, not resolve them    | India DPDP Act legal sufficiency of the consent-capture design once drafted (M5); final consent-verification mechanism selection (M5); AI/model-provider contract-terms review (M8); India DPDP data-localization confirmation for actual Supabase/GCP region selection (M9); breach-notification obligations/timelines (referenced, not resolved, in M7) |
| **4. Explicitly blocked from implementation** | No code, regardless of how complete the design is                                                                                             | Database schema/migrations, authentication code, consent-mechanism implementation, storage wiring, production APIs, AI-provider integration, any real child-data collection, production child users — see `PROJECT.md` Implementation Gate                                                                                                                |

---

## 3. Milestone Breakdown

Each milestone follows the same execution discipline Sprint 01 used:
implemented one at a time, reported, and stopped for review before the
next begins, unless the founder explicitly requests a different cadence
when approving this plan.

### M1 — Identity & Family Architecture (Parent-managed identity, child isolation, family/account boundaries)

- **Objective:** Design the core Parent/Family/Child entity model and
  the isolation boundary between families, per ADR-0006 §4 (Parent
  Ownership), §6 (Parent/Child Authorization Boundaries), and the Child
  Privacy & Safety Constitution §2, §9.
- **Scope:** ER-level (not implementation-level) design of Parent,
  Family, Child, and Co-Parent principal types; ownership references
  (non-transferable parent→child); device/session inventory model
  (Constitution §9 — view/remove devices, end sessions, login history)
  at the design level only.
- **Files/modules expected:** `docs/modules/identity-family/README.md`
  (copied from `docs/modules/TEMPLATE.md`, Status: Proposed).
- **Dependencies:** None — may start immediately on approval.
- **Privacy/security requirements:** Must satisfy ADR-0006 §1, §4, §6,
  §16 by design (private-by-default, parent ownership, tenant-scoped
  authorization). Every entity/field needs a documented purpose
  (ADR-0006 §2, Constitution §11) — no speculative fields.
- **Acceptance criteria:** Module doc complete per every
  `TEMPLATE.md` section; Security section (§6 of the template)
  explicitly answers all ten Mandatory Engineering Review Checklist
  items for the _design_ (not a claim that undesigned code satisfies
  them); no field lacks a stated purpose.
- **Definition of Done:** Reviewed against ADR-0006/0007 and the Child
  Privacy & Safety Constitution with no contradiction; Status remains
  "Proposed" (not "Approved") until the founder/product owner reviews
  it, per the Module Registry's own status lifecycle.
- **Explicit exclusions:** No Prisma schema file, no migration, no
  database of any kind. No real user/family data anywhere in the
  document — examples must be fictional.
- **New ADR required before implementation:** **Yes** — an architectural,
  hard-to-reverse data-model decision. Candidate title: "Core Data
  Model — Parent/Family/Child Entities." Number assigned sequentially
  at authoring time (next available after ADR-0007). Status at
  authoring: Accepted — Implementation Deferred (same pattern as
  ADR-0004), since it records a design decision, not code.

### M2 — Authorization & Session Architecture

- **Objective:** Design the RBAC/tenant-scoped authorization model
  (ADR-0006 §6, §16) — parent-only actions, any-child-session
  restrictions, and device/session management (Constitution §9).
- **Scope:** Authorization-check model design (role × family-scope,
  not role alone); session/token lifecycle design at the architecture
  level (no real token issuance); explicit statement of which actions
  are parent-only vs. shared.
- **Files/modules expected:** `docs/architecture/authorization-and-sessions.md`.
- **Dependencies:** M1 (needs the Parent/Family/Child entity model).
- **Privacy/security requirements:** Must design for "a valid
  child-role token must still be rejected outside its own family"
  (ADR-0006 §6) as a first-class test case, not an afterthought.
- **Acceptance criteria:** Document explicitly walks through at least
  one cross-family authorization-bypass scenario and shows the design
  rejects it; ties every authorization rule back to ADR-0006 §6/§16 or
  Constitution §8/§9.
- **Definition of Done:** No implementation; reviewed against ADR-0005
  (still implementation-deferred) for consistency, not contradiction.
- **Explicit exclusions:** No Supabase Auth integration, no real
  session/token code, no login flow implementation.
- **New ADR required before implementation:** **Yes** — candidate
  "Authorization & Session Architecture," extends ADR-0005. Status at
  authoring: Accepted — Implementation Deferred.

### M3 — Data Classification, Encryption & Tenant-Isolation Design

- **Objective:** Resolve the open engineering-design questions ADR-0006
  explicitly deferred to Sprint 02 (§14: field-level vs. managed
  encryption for highest-sensitivity fields; §16: concrete Row-Level
  Security design for tenant isolation).
- **Scope:** Per-tier (ADR-0006 §7) technical design: which fields need
  application/field-level encryption beyond Supabase/PostgreSQL's
  managed at-rest encryption; PostgreSQL RLS policy design ensuring
  isolation is enforced at the database layer, not only in application
  code.
- **Files/modules expected:** `docs/architecture/data-classification-and-isolation.md`.
- **Dependencies:** M1 (entities to classify and isolate).
- **Privacy/security requirements:** Directly implements ADR-0006 §14,
  §15, §16; must not weaken any Tier-3 (Sensitive Child Content)
  baseline control from ADR-0006's classification table.
- **Acceptance criteria:** Every data category from ADR-0006 §7's table
  is mapped to a specific encryption/isolation design decision, not
  left open; RLS design is concrete enough to review, not aspirational.
- **Definition of Done:** No schema or policy is actually applied to any
  database — this is a design document informing the future ADR-0004
  implementation.
- **Explicit exclusions:** No real Supabase project configuration, no
  RLS policy execution, no field-level encryption key generation or
  storage.
- **New ADR required before implementation:** **Yes** — candidate
  "Encryption & Tenant-Isolation Implementation Design," extends
  ADR-0004/ADR-0006. Status at authoring: Accepted — Implementation
  Deferred.

### M4 — Child-Data Lifecycle Architecture (Retention, Deletion, Export, Backup-Purge)

- **Objective:** Resolve ADR-0006's other explicitly deferred opens:
  §17 (retention windows per category), §18 (deletion — soft/hard
  delete window), §19 (export completeness), §21 (backup-retention/
  purge window).
- **Scope:** Per-category retention **candidate options, not a
  decision** (mirroring M5's consent-mechanism shortlist pattern) —
  proposed windows for founder review, not a settled policy;
  deletion-window proposal (soft-delete → bounded hard-delete);
  export-completeness checklist tied to the Privacy Dashboard
  (Constitution §10); backup purge-window candidate options.
- **Files/modules expected:** `docs/architecture/data-lifecycle.md`.
- **Dependencies:** M1 (entities), M3 (classification tiers — retention
  scales with sensitivity).
- **Privacy/security requirements:** No data category may be left with
  indefinite retention without a stated reason (ADR-0006 §17); deletion
  requests must be audit-logged (§18, ties to M7).
- **Acceptance criteria:** Every category in ADR-0006 §7's table has an
  explicit retention/deletion/export/backup-purge candidate proposal,
  presented as options for founder decision, not asserted as final.
- **Definition of Done:** Proposal only — no retention job, deletion
  job, export job, or backup policy is implemented or scheduled
  anywhere.
- **Explicit exclusions:** No cron job, no Supabase backup
  configuration change, no real deletion of anything (there is no real
  data yet).
- **New ADR required before implementation:** **Founder approval
  required first** (specific windows are a business/product decision,
  not purely engineering — see §2.3, category 2), **then Yes**, a new
  ADR recording the ratified windows. Cannot be finalized in Sprint 02
  without that founder input.

### M5 — Consent Architecture (Framework-Level Only)

- **Objective:** Design the consent-event/audit-trail architecture
  (ADR-0006 §5) — explicitly **not** the specific verifiable-parental-
  consent mechanism, which ADR-0007 §C.6/§D.3 gates on legal validation.
- **Scope:** Design of a versioned, auditable consent-event record (who
  consented, when, what was consented to, which privacy-terms version)
  and how it gates child-record creation. A short, non-binding shortlist
  of candidate consent-verification mechanisms (e.g., payment-card
  verification, signed form, government-ID-linked verification) is
  produced for founder/legal review — **not selected or implemented
  here.**
- **Files/modules expected:** `docs/architecture/consent-architecture.md`.
- **Dependencies:** M1 (parent/child identity model).
- **Privacy/security requirements:** Must make consent an auditable
  event per ADR-0006 §5 and §22; must not assert that any candidate
  mechanism is legally sufficient under India's DPDP Act — that
  determination is explicitly out of scope here.
- **Acceptance criteria:** Consent-event schema design is complete and
  auditable; mechanism shortlist is presented as options with
  trade-offs, not a decision; document explicitly states the DPDP
  legal-sufficiency gate is unresolved.
- **Definition of Done:** No consent-capture code, UI, or storage of
  any real consent record. Framework design only.
- **Explicit exclusions:** No specific mechanism selected; no legal
  conclusion about DPDP sufficiency; no real consent ever captured.
- **New ADR required before implementation:** **Yes, but cannot be
  Accepted in Sprint 02.** Candidate "Consent Architecture" ADR is
  drafted as **Proposed**, blocked from "Accepted" status until (a) the
  founder picks a mechanism from the shortlist and (b) India DPDP legal
  validation confirms its sufficiency (ADR-0007 §C.3/§C.6).

### M6 — Leo Memory & Conversation Isolation Architecture

- **Objective:** Design the memory-versioning/deletion-cascade model
  and conversation tenant-isolation approach (ADR-0006 §8–§9, §16).
- **Scope:** Leo-memory data-model design (version history, parent-
  deletion cascade to derived/cached copies — embeddings, summaries,
  indexes); conversation isolation design (family/tenant identifier on
  every record, enforced at the data layer per M3's RLS design).
- **Files/modules expected:** `docs/modules/leo-companion/README.md`
  (Status: Proposed) plus a supporting
  `docs/architecture/ai-memory-isolation.md`.
- **Dependencies:** M1 (family model), M3 (classification/encryption/
  isolation design), M4 (lifecycle — memory deletion/export rules).
- **Privacy/security requirements:** Memory content is Tier-3 Sensitive
  Child Content (ADR-0006 §7); no design may allow one family's Leo
  memory or conversation to be visible to another (Constitution §8,
  "mandatory").
- **Acceptance criteria:** Deletion-cascade design explicitly names
  every derived-data location a memory could exist in (embeddings,
  summaries, caches) and confirms each is covered.
- **Definition of Done:** Design only — no memory storage, no
  embedding pipeline, no conversation persistence implemented.
- **Explicit exclusions:** No AI/LLM integration, no vector database
  selection or wiring, no actual conversation data.
- **New ADR required before implementation:** **Yes** — candidate "Leo
  Memory & Conversation Isolation Design," extends ADR-0004/ADR-0006.
  Status at authoring: Accepted — Implementation Deferred.

### M7 — Auditability & Observability Architecture

- **Objective:** Design the concrete audit-event schema (who/what/
  when/which record) required by ADR-0006 §22–§23, extending the
  existing `docs/architecture/observability.md` philosophy into an
  actionable design.
- **Scope:** Audit-log event schema (append-only, non-deletable by
  parent, distinct from user-content deletion per §18); access-logging
  design specifically for Privacy Dashboard shared-link views
  (Constitution §10, ADR-0006 §23).
- **Files/modules expected:** `docs/architecture/audit-logging.md`
  (new); update `docs/architecture/observability.md` to reference it.
- **Dependencies:** M2 (authorization events to audit), M4 (deletion/
  export **event types** to audit — M7 needs only which event types
  M4 defines, not M4's founder-gated exact retention/backup-purge
  window values, so M7 is not blocked on that founder decision).
- **Privacy/security requirements:** Every access (read, write, delete,
  export, share) to Sensitive Child Content must be covered by the
  schema (ADR-0006 §22).
- **Acceptance criteria:** Schema covers every event type ADR-0006 §22
  names; explicitly distinct from and non-interfering with user-content
  deletion (§18).
- **Definition of Done:** Design only — no logging pipeline, no
  database table, no storage of any real audit event.
- **Explicit exclusions:** No log-shipping/observability tooling
  selection or integration (that remains a future Decision Log item per
  `docs/engineering/security-by-design.md`).
- **New ADR required before implementation:** **No** — extends an
  already-documented standard (`security-by-design.md`,
  `observability.md`); a Decision Log entry is sufficient once actual
  tooling is chosen, per the ADR-vs-Decision-Log split
  (`docs/sprints/sprint-01.md`, §8/§9).

### M8 — AI-Provider Data-Boundary & Multi-Provider/Self-Hosted Compatibility Architecture

- **Objective:** Design the abstraction boundary required by
  Constitution §13–§14 (no single-provider dependency; must support
  multiple providers, self-hosted models, local inference, and provider
  replacement without a product rewrite) and the technical enforcement
  of ADR-0006 §26–§28 (no training-use, no advertising/profiling use).
- **Scope:** Provider-abstraction interface design (what data crosses
  the boundary, what never does — e.g., raw child PII never included in
  a prompt sent to a third-party provider without justification);
  provider-evaluation criteria (data-handling, retention, training-use
  terms) for future legal review — **not an actual provider selection.**
- **Files/modules expected:** `docs/architecture/ai-provider-boundary.md`.
- **Dependencies:** M6 (Leo memory boundaries — what data the AI layer
  can touch).
- **Privacy/security requirements:** Must design so that switching
  providers is additive, not a rewrite (Constitution §14); must design
  the technical enforcement of "never used to train any shared,
  cross-customer, or third-party model" (ADR-0006 §27) as a boundary
  the architecture makes structurally hard to violate, not just a
  policy statement.
- **Acceptance criteria:** Document names specific data categories that
  may/may not cross the provider boundary, referencing ADR-0006's
  classification tiers (M3).
- **Definition of Done:** Design only — no provider account, API key,
  or integration code of any kind.
- **Explicit exclusions:** No provider selected or contracted; no
  contract-terms legal review performed (ADR-0006 §26 remains
  **[LEGAL VALIDATION REQUIRED]**); no prompt/response code.
- **New ADR required before implementation:** **Yes** — candidate "AI
  Provider Abstraction & Multi-Provider Compatibility." Cannot be fully
  Accepted until at least one candidate provider's contract terms clear
  legal review (ADR-0006 §26); drafted as Proposed in Sprint 02.

### M9 — India-First Deployment & Data-Residency Architecture

- **Objective:** Design the GCP/Supabase deployment architecture
  consistent with a single-market (India) launch, informed by — but not
  asserting legal compliance with — India's DPDP Act data-localization
  considerations (ADR-0007 §D.3).
- **Scope:** Candidate Supabase/GCP region selection rationale;
  environment topology (dev/staging/production) design; how the design
  would change if a future market is added (per ADR-0007's "additive,
  not a rebuild" posture).
- **Files/modules expected:** `docs/architecture/deployment-india.md`;
  update `infrastructure/gcp/README.md` and
  `infrastructure/supabase/README.md` placeholders with the design
  rationale (still no real provisioning).
- **Dependencies:** M3 (classification — what data actually needs
  localization), M8 (AI-provider region constraints, if any).
- **Privacy/security requirements:** Must not claim DPDP data-
  localization compliance — flags the specific region choice as
  **[LEGAL VALIDATION REQUIRED]** pending confirmation (ADR-0007 §C.3).
- **Acceptance criteria:** A specific candidate region is named with
  rationale, explicitly marked provisional pending legal confirmation.
- **Definition of Done:** Design only — no GCP project, no Supabase
  project, no infrastructure actually provisioned.
- **Explicit exclusions:** No Terraform/IaC, no real cloud resource
  creation, no production environment.
- **New ADR required before implementation:** **Not in Sprint 02** —
  the region decision itself only becomes ADR-worthy once India DPDP
  legal validation confirms it; Sprint 02 produces the design rationale
  a future ADR would cite.

### M10 — Admin/Website Stack Formalization (ADR only)

- **Objective:** Close the one non-child-data documentation gap in the
  Locked Technology Stack table: Next.js for `apps/admin` and
  `apps/website` is already locked in the Product Constitution but has
  no ADR of its own (unlike ADR-0001–0003 for the other locked layers).
- **Scope:** Author the ADR recording that decision, mirroring
  ADR-0001–0003's format. **No scaffold creation** — that is explicitly
  out of scope for Sprint 02 (§2.2).
- **Files/modules expected:** A new ADR file (candidate title: "Adopt
  Next.js for Admin & Website Applications").
- **Dependencies:** None — independent of the child-data-focused
  milestones; can run in parallel with M1–M9.
- **Privacy/security requirements:** Minimal at this stage — no child
  data is involved in an internal admin tool or marketing site decision
  record itself. Any future admin-tool access to child data would
  itself require the same ADR-0006 gates as everything else.
- **Acceptance criteria:** ADR follows the existing format (Context,
  Decision, Consequences, Constitution Alignment); explicitly states no
  implementation is authorized.
- **Definition of Done:** ADR accepted (recording the already-locked
  decision); no code, no scaffold.
- **Explicit exclusions:** No `apps/admin` or `apps/website` directory
  created. No admin authentication, no CMS, no marketing content.
- **New ADR required before implementation:** This milestone **is** the
  new ADR. Whether to execute it now vs. defer to a later sprint is a
  **founder-approval item** (§2.3, category 2) — it's low-risk but
  expands the repository's documented app surface, and the founder may
  prefer to sequence it after the child-data-focused milestones.

### M11 — Sprint 02 Design-Phase Close-Out & Governance Sync

- **Objective:** Mirror Sprint 01's Milestone 12 pattern — once M1–M10
  are complete (or as many as the founder approved), update
  `PROJECT.md`, the ADR Index, Known Risks, and this Sprint Document's
  own status to reflect what was actually designed vs. what remains
  gated.
- **Scope:** `PROJECT.md` Current Status/Milestone/Pending
  Tasks/Known Risks/ADR Index/Change Log updates only.
- **Files/modules expected:** `PROJECT.md`.
- **Dependencies:** M1–M10 (as many as were approved and executed).
- **Privacy/security requirements:** None beyond accurate, honest
  status reporting — no claim of legal compliance or implementation
  readiness beyond what was actually validated.
- **Acceptance criteria:** Every new design doc/module doc/ADR produced
  by this sprint is indexed and linked from `PROJECT.md`; every
  remaining gate (legal validation, founder decisions not yet made) is
  restated, not silently dropped.
- **Definition of Done:** `PROJECT.md` accurately reflects Sprint 02's
  actual end state.
- **Explicit exclusions:** No new Sprint 03 document.
- **New ADR required before implementation:** No.

---

## 4. Milestone Dependency Graph

Plain adjacency list (each line: milestone → what it directly depends
on), replacing the earlier ASCII diagram, which omitted the M4→M6 edge
and used decorative connectors that didn't map to real dependencies —
this list is the authoritative dependency statement and matches each
milestone's own "Dependencies" field in §3 exactly:

- **M1** (Identity & Family) — depends on nothing; startable immediately.
- **M2** (Authorization & Sessions) — depends on M1.
- **M3** (Classification/Encryption/Isolation) — depends on M1.
- **M4** (Data Lifecycle) — depends on M1, M3.
- **M5** (Consent Architecture) — depends on M1.
- **M6** (Leo Memory/Conversation) — depends on M1, M3, **M4**.
- **M7** (Auditability) — depends on M2, M4 (event types only — see
  §3, M7).
- **M8** (AI-Provider Boundary) — depends on M6.
- **M9** (India Deployment) — depends on M3, M8.
- **M10** (Admin/Website ADR) — depends on nothing; independent.
- **M11** (Close-Out) — depends on M1–M10, as many as were approved and
  executed.

---

## 5. New ADRs Anticipated (candidates, not yet authored)

| Candidate ADR                                           | Triggered by | Can be "Accepted" in Sprint 02?                                                                      |
| ------------------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------- |
| Core Data Model — Parent/Family/Child Entities          | M1           | Yes — Accepted, Implementation Deferred                                                              |
| Authorization & Session Architecture                    | M2           | Yes — Accepted, Implementation Deferred                                                              |
| Encryption & Tenant-Isolation Implementation Design     | M3           | Yes — Accepted, Implementation Deferred                                                              |
| Child-Data Lifecycle (Retention/Deletion/Export/Backup) | M4           | Only after founder ratifies specific windows                                                         |
| Consent Architecture (Framework-Level)                  | M5           | **No** — Proposed only, blocked on mechanism selection + India DPDP legal validation                 |
| Leo Memory & Conversation Isolation Design              | M6           | Yes — Accepted, Implementation Deferred                                                              |
| AI-Provider Abstraction & Multi-Provider Compatibility  | M8           | Proposed only — full acceptance likely needs at least provisional provider-terms review              |
| India Data-Residency / Region Selection                 | M9           | **No** — not authored in Sprint 02; deferred until DPDP legal validation                             |
| Adopt Next.js for Admin & Website Applications          | M10          | Yes — Accepted (mirrors ADR-0001–0003), contingent on founder choosing to sequence this milestone in |

Exact ADR numbers are assigned sequentially at authoring time (next
available after ADR-0007), not reserved by this document.

**Decision-maker note:** per `docs/engineering/change-request-process.md`
("Decision-maker — the product owner for anything touching the Product
Constitution, Child Privacy & Safety Constitution, or Sprint scope"),
the founder (Product Owner) is the decision-maker for every ADR in this
table before it is marked "Accepted" — the per-milestone stop-and-report
cadence (§3 preamble) is how that review happens in practice; "Accepted"
in this table is never a standalone Engineering/AI-agent
self-certification.

---

## 6. Risk Register (Sprint-02-specific — extends `sprint-01.md` §26)

| Category           | Risk                                                                                                                                                  | Impact                                                                                                                    | Mitigation                                                                                                                                                         |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Compliance/Legal   | Design work proceeds far enough that implementation feels "ready," creating pressure to skip India DPDP legal validation                              | Real child data collected on an unvalidated consent design                                                                | M5's ADR explicitly cannot reach "Accepted" without legal validation; `PROJECT.md` gate stays BLOCKED regardless of design completeness                            |
| Governance/process | Eleven milestones' worth of design docs drift from ADR-0006/0007 if not cross-checked                                                                 | Design contradicts the ratified engineering requirements                                                                  | Every milestone's Acceptance Criteria requires an explicit ADR-0006/0007 citation, not just a general privacy gesture                                              |
| Scope              | Design work for M8 (AI-provider boundary) implicitly favors a specific provider before evaluation criteria are founder-reviewed                       | Premature lock-in, or a provider chosen without the multi-provider requirement (Constitution §14) actually being testable | M8's acceptance criteria requires the abstraction boundary to be provider-agnostic, reviewed before any provider-specific detail is added                          |
| Process            | Sprint 02's documentation surface (potentially 10+ new files) repeats Sprint 01's "documentation-heavy sprint" risk                                   | Timeline risk if treated as lightweight                                                                                   | Same mitigation as Sprint 01 Risk Register: timebox/resource explicitly as design-heavy, not implementation-heavy                                                  |
| Founder bandwidth  | M4 (lifecycle windows) and M10 (admin/website sequencing) both need founder decisions; if deferred, later milestones (M6, M7) that depend on M4 stall | Sprint 02 progress blocks on founder availability, not on engineering capacity                                            | Milestones are independently executable where dependencies allow (see §4); M1–M3, M5 (framework only), M8, M9, M10 do not require the M4 founder decision to start |

---

## 7. Founder Decisions Required (before or during Sprint 02 execution)

1. Approval of this Sprint 02 plan itself (or a modified version of it).
2. Exact retention windows per data category, and the backup-purge
   window (M4) — ADR-0006 §17/§21 explicitly left these open.
3. Which consent-verification mechanism to carry forward into India
   DPDP legal review, from M5's shortlist (not a final decision — a
   direction for legal counsel to validate).
4. Whether to execute M10 (Next.js admin/website ADR) within Sprint 02
   or defer it to a later sprint.
5. Per-milestone go-ahead, following the same stop-and-report cadence
   Sprint 01 used — unless the founder authorizes a faster cadence when
   approving this plan.

## 8. Legal/Privacy Validation Required (unchanged from governance close-out, restated for Sprint 02 relevance)

1. India DPDP Act legal sufficiency of the consent-capture design once
   M5 produces it (ADR-0007 §C.3/§D.3).
2. Legal sufficiency of the specific consent-verification mechanism,
   once founder-directed from M5's shortlist (ADR-0007 §C.6).
3. Third-party AI/model-provider data-handling and training-use
   contract terms, before any provider named in M8's evaluation is
   actually selected (ADR-0006 §26).
4. India DPDP Act data-localization confirmation before M9's candidate
   region becomes a real infrastructure decision (ADR-0007 §D.3).
5. Regulatory breach-notification obligations and timelines under
   India's DPDP Act specifically (ADR-0006 §30) — referenced by M7, not
   resolved by it.

None of the above are resolved, assumed, or silently ratified by this
Sprint Document or by any milestone in it.

---

## 9. Sprint 02 Definition of Done

A new engineer, AI agent, or legal reviewer can read `PROJECT.md` →
Constitution → ADR-0001 through ADR-0007 (plus any new ADRs this sprint
produces) → this Sprint Document → the relevant module/architecture doc,
and understand exactly how Natkhat AI's identity, authorization, data
classification, lifecycle, consent, Leo memory, auditability,
AI-provider, and India-deployment layers are intended to work — with
every remaining legal/privacy/founder gate explicitly named, not
implied. No database, authentication, consent, storage, AI-integration,
or production code exists as a result of this sprint. `PROJECT.md`'s
Implementation Gate section still reads BLOCKED for database,
authentication, child personal-data collection, and production child
users.

---

## 10. Explicit Exclusions (repository-wide, restated)

No implementation of: child/personal-data database, authentication,
consent mechanism, storage, production API, AI integration, or any
business feature. No `apps/admin`/`apps/website` scaffold. No
`docs/sprints/sprint-03.md`. No Constitution or accepted-ADR
modification. No claim, anywhere in this sprint's output, of COPPA,
GDPR, DPDP, or other regulatory compliance.

---

## Next Step

**Approved for execution (see Status header).** M1–M4 are complete and
merged. M5 (Consent Architecture) has been executed — see
`docs/architecture/consent-architecture.md` and
[ADR-0011](../decisions/ADR-0011-consent-architecture.md) — and awaits
founder/product-owner review at this milestone's stop-and-report
checkpoint before M6 begins. M4 and M10 remain blocked on their
respective founder decisions (§7, items 2 and 4) — item 2 is now
resolved (see Status header); item 4 (M10 sequencing) is still open.
Execution continues one milestone at a time, stop-and-report, per §3's
preamble, unless the founder directs otherwise.
