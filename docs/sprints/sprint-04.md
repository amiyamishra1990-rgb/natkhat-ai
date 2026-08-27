# Sprint 04 — Implementation Plan & Contract (Foundation Track: Governance Sync, Admin/Website, Leo-Chat Authorization)

**Version:** 1.1.0
**Status:** Founder Decisions F.1–F.6 (§3) are **decided** — recorded
below with their actual outcomes, not just the open questions. This
document plays the same role `docs/sprints/sprint-03.md`'s Milestone 12
played before Decisions J.1–J.7: it inspected the governing documents,
surfaced every open question, and is now updated to record what the
founder actually decided for each. **M21 (Sprint 03 Close-Out &
Governance Sync) is complete and merged (PR #23).** **M22 (Admin &
Website Application Scaffolding) was separately authorized by the
founder on 2026-08-26 and is implemented** — see §4, M22 for the full
scope (including a founder-clarified boundary question resolved before
implementation) and the PR opened off
`feat/sprint04-m22-admin-website-scaffolding`; not yet merged, awaiting
founder review. **M23 (Leo-Chat Authorization Gap) was separately
authorized by the founder on 2026-08-27 and is implemented** — see §4,
M23 for the full scope and the PR opened off
`feat/sprint04-m23-leo-chat-authorization`; not yet merged, awaiting
founder review. Per this project's standing one-milestone-at-a-time
discipline (mirrored from `docs/sprints/sprint-03.md`, Decision J.7),
M23's authorization is its own separate, explicit founder go-ahead,
distinct from Founder Decision F.6 below (F.6 only decided that M23
would exist as its own milestone, sequenced after M22 — it did not
itself authorize implementation to begin, the same distinction M21's
own go-ahead already draws against M22/M23).
**Owner:** Product Owner
**Last Updated:** 2026-08-27
**Phase:** Sprint 04 execution. M21 complete and merged; M22
implemented, pending founder review/merge; M23 authorized 2026-08-27
and implemented, pending founder review/merge. Sprint 01, Sprint 02,
and Sprint 03 are all complete and merged into `main` — see
`docs/sprints/sprint-01.md`, `docs/sprints/sprint-02.md`, and
`docs/sprints/sprint-03.md`. This is the last drafted Sprint 04
milestone (§4) — once M23 is reviewed and merged, Sprint 04 as
currently scoped (M21-M23) is complete; further Sprint 04/05 scope is a
new planning conversation, not an automatic continuation.

## Context

The founder confirmed Sprint 03 (Milestones 12–20) is complete and
merged into `main`, including the Supabase → Google Cloud/Firebase
migration ([ADR-0016](../decisions/ADR-0016-firebase-auth-and-google-cloud-migration.md))
and the M20 first end-to-end vertical slice, and said: "start next
Sprint 04."

Per this project's own governance discipline — every prior sprint
(`sprint-01.md`, `sprint-02.md`, `sprint-03.md`) opened with a
planning-only milestone before any implementation began, and
`.ai/context/agent-workflow.md`'s read-first sequence is binding on
every AI agent — Sprint 04 does not begin with code. This document is
that planning pass. **No implementation code, schema, migration,
scaffold, or business logic has been written as part of producing
this document.**

### A governance-sync gap found while preparing this document

Sprint 02 closed with its own Milestone 11 ("Design-Phase Close-Out &
Governance Sync") specifically to bring `PROJECT.md` back in sync with
what had actually shipped. **Sprint 03 has no equivalent milestone**,
and `PROJECT.md`'s Current Development Phase / Current Sprint / Current
Milestone / Repository Structure sections still describe the Sprint 02
M11 state — they were never updated to reflect Sprint 03 (M12–M20) at
all. The only Sprint-03-era edits `PROJECT.md` received were the
ADR-0016 migration's own Change Log entry, ADR Index row updates, and
Approved Tech Stack row updates (2026-08-23) — narrow, ADR-scoped edits,
not a real close-out pass.

Two smaller, related staleness findings from the same review, surfaced
here rather than silently fixed (this document does not modify any
Constitution, ADR, or `PROJECT.md`):

- The Product Constitution's own Locked Technology Stack table
  (`docs/constitution/product/natkhat-ai-constitution.md`) still lists
  Admin application / Marketing website as "Not yet recorded," even
  though [ADR-0014](../decisions/ADR-0014-adopt-nextjs-for-admin-and-website-applications.md)
  recorded that decision back in Sprint 02, and even though the same
  table's Authentication/Database/Cloud-provider rows were correctly
  updated for ADR-0016. This looks like the same Sprint 02 M11
  close-out step (ADR-0014's own Consequences clause names "updating
  those citations" as M11's job) was missed for this one table, not
  performed for it, or never revisited since.
- The Product Constitution's Target Audience section says "Not yet
  ratified... must be resolved via a dedicated ADR," while
  [ADR-0007](../decisions/ADR-0007-target-audience-interim-posture.md)
  records the target audience as founder-ratified (India, ages 4–10)
  for engineering-compliance purposes. The two read as contradictory on
  a surface pass; ADR-0007's own title ("Interim ... Posture") suggests
  this may be deliberate (an engineering-scope ratification short of a
  full product-level one), but this document does not resolve that
  question — it is flagged for founder/governance clarification.

**Recommendation, not a confirmed decision:** Sprint 04 open with a
close-out/governance-sync milestone for Sprint 03 (mirroring Sprint
02's M11) before or alongside its first substantive milestone, so
`PROJECT.md` and the Constitution's cross-references catch up before
new scope is added on top of a stale baseline. See §4, proposed
Milestone 21.

---

## 0. Proposed Sprint 04 Objective (draft — not yet founder-approved)

Bring Natkhat AI's admin and marketing-website applications
(`apps/admin`, `apps/website`) into existence as real, CI-integrated
Next.js applications — the one piece of scope every governing document
already points at by name for "Sprint 04 or later" — while keeping the
same non-production, synthetic-data-only discipline Sprint 03
established, and while explicitly not attempting to close any of the
legal/business gates that still block Track B (real consent
verification, real AI-provider integration, real production
infrastructure) unless the founder decides otherwise below.

---

## 1. Governance Checkpoint (recap, not restated authority)

| Item                                                | Status                                                                                                  |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Sprint 01                                           | Complete, permanently merged (`main`)                                                                   |
| Sprint 02 (M1–M11)                                  | Complete, permanently merged (`main`)                                                                   |
| Sprint 03 (M12–M20)                                 | Complete, permanently merged (`main`) — confirmed directly by the founder; verified at `main`@`7b471a2` |
| ADR-0016 (Google Cloud/Firebase migration)          | Accepted, implemented, merged (PR #22)                                                                  |
| M20 (first end-to-end vertical slice)               | Merged (PR #21), rebased onto ADR-0016's foundation, CI green                                           |
| ADR-0014 (Next.js for admin/website)                | Accepted — decision recorded; scaffolding explicitly **not** authorized by ADR-0014 itself              |
| ADR-0011 (Consent), ADR-0013 (AI-Provider Boundary) | Still **Proposed**, not Accepted — same open legal/business gates as Sprint 03 §6                       |
| This document                                       | Proposed only — no milestone below is authorized                                                        |

This table is a pointer, not a new authority — if it disagrees with
`PROJECT.md` or an ADR, those win, per `docs/sprints/sprint-01.md`, §1.

---

## 2. Scope Boundary (draft)

### 2.1 Confirmed candidate — backed by an existing founder decision

**`apps/admin` and `apps/website` scaffolding.** Sprint 03's Decision
J.2 explicitly named this: _"`apps/admin` and `apps/website` scaffolding
(ADR-0014) is deferred to Sprint 04 or later. Not added as a parallel
track to Sprint 03."_ This is the only item in this document backed by
an **explicit, already-recorded founder decision** naming Sprint 04 by
number. Everything else below is either a recommendation or an open
question.

### 2.2 Recommendations for founder consideration (not yet backed by a decision)

- **Sprint 03 close-out / governance-sync milestone** (§Context above,
  §4 proposed M21). Precedent-based (Sprint 01 M12, Sprint 02 M11), not
  required by any explicit governing statement for Sprint 03
  specifically.
- **Leo-chat authorization gap.** `docs/decisions/decision-log.md`'s
  2026-08-22 entry explicitly records that M20 "deliberately leaves
  Leo-chat interaction ungated at the authorization layer" — no
  `Action` exists in `authorization.types.ts`'s bounded set (M15) for
  "interact with Leo for a given child," and flags this "for a future
  milestone to design and close, not left to be rediscovered." This is
  the closest thing in the repository to an explicit "next sprint"
  engineering item outside admin/website. **Decided (F.6, §3): assigned
  to M23**, its own milestone, not folded into admin/website scope. Note:
  this is
  narrower than, and should not be conflated with, ADR-0009 Decision
  item 7's child-login/child-session question, which ADR-0009 itself
  says explicitly requires its **own separate founder-approved Change
  Request** and is not implied to be in scope here.
- **CI/CD formalization.** `GitHub Actions` has been the de facto CI
  since Sprint 01 M10 but has no dedicated ADR (`PROJECT.md`'s Approved
  Tech Stack table still lists it "Not yet recorded"). Minor
  documentation housekeeping, not urgent, not blocking anything.

### 2.3 Candidates gated on legal/business items — not simply "next sprint" ready

These are the Track B items Sprint 03 built scaffolding for but left
inactive. None of them can be authorized by a sprint-numbering decision
alone — each needs its own named gate cleared first, per
`sprint-03.md` §6 (carried forward, still open, unchanged by anything in
this document):

| Item                                              | Gate that must clear first                                                       |
| ------------------------------------------------- | -------------------------------------------------------------------------------- |
| Real consent-verification mechanism (M17 Track B) | India DPDP Act legal sufficiency review of the signed/e-signed form design (J.3) |
| Real AI-provider integration (M19 Track B)        | Provider selection (deferred, J.4) + that provider's contract-terms legal review |
| Real production infrastructure / India residency  | India DPDP data-localization confirmation (ADR-0007 §D.3)                        |
| Audit-log retention finality (ADR-0015 §13.3)     | Regulatory breach-notification obligations/timelines legal review (ADR-0006 §30) |

If the founder wants Sprint 04 to make progress on any of these, the
concrete next step in each case is a legal/business action (e.g.,
retaining India DPDP counsel, initiating an AI-provider evaluation), not
an engineering milestone — this document does not propose engineering
milestones for any of them.

### 2.4 Explicitly excluded regardless of milestone (carried forward from Sprint 03 §10, unchanged)

Any real parent, child, or family data, anywhere, ever. Any production
deployment. Any real consent-verification mechanism enabled or
exercised against a real user. Any real AI/LLM provider SDK, API key,
credential, or model call. Any real GCP production project or
India-residency claim (the existing dev Firebase/Postgres targets are
non-production only). Any modification to a Constitution or an
already-accepted ADR beyond what a future, explicitly-approved document
records. Any claim of COPPA/GDPR/DPDP compliance.

---

## 3. Founder Decisions (2026-08-26)

Mirrors Sprint 03's §3 format — six open questions were presented with a
recommendation each (Sprint 03's own J.1–J.7 were resolved the same way
before `sprint-03.md` was finalized). Recorded here as the authoritative
reference: each decision below as the founder actually made it, not
merely the question as originally posed.

**F.1 — Sprint 04 primary scope.** **DECIDED: `apps/admin` +
`apps/website` scaffolding only (§2.1) — no parallel workstream.** The
founder explicitly deferred this specific call ("I don't know, you
decide"); it was resolved by following this document's own
recommendation and this project's standing one-workstream-at-a-time
discipline (the same discipline that gated Sprint 03 against the
ADR-0016 migration) — **not** invented independently, and not to be read
as an unprompted founder preference. Per J.2's own framing ("not added
as a parallel track"), F.6 below (Leo-chat authorization) is
nonetheless included in Sprint 04 as its **own**, separately-sequenced
milestone (M23) rather than folded into this scope — F.1 governs
admin/website's own scope boundary, not the sprint's total milestone
count.

**F.2 — Sprint 03 close-out.** **DECIDED: yes.** Sprint 04 opens with
M21 (Sprint 03 Close-Out & Governance Sync) before/alongside admin/
website work, per this document's own recommendation — the same pattern
Sprint 02 M11 established, directly fixing the stale-`PROJECT.md`
problem found while preparing this document (see Context above).

**F.3 — Admin application data access.** **DECIDED: security/audit-log
data only.** `apps/admin` may read audit-log data (the M16 audit
trail — who did what, when) and nothing else: it must **not** read any
parent, child, or family content, aggregate/anonymized stats, or any
other data category. This is the founder's explicit choice among the
three options offered (audit logs only / aggregate stats only / admin
logins only, nothing else) — audit logs only was selected. This is a
**hard boundary** on M22's (and any future admin milestone's)
Definition of Done, consistent with the Child Privacy & Safety
Constitution's Data-Minimization principle. See §4, M22.

**F.4 — Website content scope.** **DECIDED: static/marketing shell
only.** No signup form, no contact form, no data collection of any kind
on `apps/website` in Sprint 04, per this document's own recommendation.
Any data-collecting feature reopens the same consent/privacy gates
Sprint 03 was built to avoid crossing prematurely — revisit in a later,
separate decision if/when the founder wants a data-collecting feature
on the website.

**F.5 — Milestone numbering.** **DECIDED (via this document's own
recommendation, not separately re-litigated with the founder as its own
explicit question — flagged here, not assumed silently, in case it
needs explicit reconfirmation): continue the running count.** Sprint 04
milestones start at M21.

**F.6 — Leo-chat authorization gap (§2.2).** **DECIDED: include it in
Sprint 04, as its own milestone (M23), not bundled into the
admin/website scaffolding work (M22).** This closes the gap the
2026-08-22 `docs/decisions/decision-log.md` entry flagged: M20
deliberately left Leo-chat interaction ungated at the authorization
layer — no `Action` exists in `authorization.types.ts`'s bounded set
(M15) for "interact with Leo for a given child." Sequenced after M22, as
**M23** (confirmed against the actual M21/M22 numbering landed on
above). This is explicitly **not** the same question as ADR-0009
Decision item 7's child-login/child-session question — that remains
out of scope for M23 and requires its own separate, founder-approved
Change Request per ADR-0009 itself. See §4, M23.

---

## 4. Proposed Milestone Breakdown (draft — none authorized)

### M21 — Sprint 03 Close-Out & Governance Sync _(confirmed — F.2)_

- **Objective:** Bring `PROJECT.md` and the Constitution's stale
  cross-references (§Context above) back in sync with Sprint 03's
  actual, merged state before Sprint 04 scope is added on top.
- **Source:** Precedent — Sprint 02 M11; the specific staleness findings
  in this document's Context section.
- **Implementation scope:** `PROJECT.md` Current Development Phase /
  Current Sprint / Current Milestone / Repository Structure / ADR Index
  / Known Risks updates reflecting M12–M20 and ADR-0016 as merged; the
  Constitution's Locked Technology Stack table's Admin/Website rows
  corrected to cite ADR-0014; the Target Audience section's apparent
  contradiction with ADR-0007 resolved or explicitly reconciled in text.
- **Explicit exclusions:** No new architecture, ADR, or implementation
  code. Documentation/governance-sync only, exactly like Sprint 02 M11.
- **Dependencies:** None — runs before/alongside M22.
- **Founder/legal gates:** None.
- **Implementation authorization status:** **Authorized — begin now.**
  F.2 confirmed this milestone; per this project's standing
  one-milestone-at-a-time discipline, M22 and M23 remain separately
  gated (see below) and are not authorized by this M21 go-ahead.

### M22 — Admin & Website Application Scaffolding _(authorized by the founder 2026-08-26; implemented — see below)_

- **Objective:** Create `apps/admin` and `apps/website` as real Next.js
  applications, wired into the pnpm/Turborepo workspace and CI, per
  ADR-0014's already-locked decision.
- **Source:** ADR-0014, Decision J.2; founder authorization message,
  2026-08-26 ("M22 — Admin & Website Application Scaffolding").
- **Scope note — resolved discrepancy:** this section originally read
  "this milestone itself is scaffold-only and reads nothing; F.3 bounds
  what any _later_ admin data-access milestone may ever build toward."
  The founder's own authorization message described F.3 as an in-scope
  capability for M22 itself ("`apps/admin` data access — HARD BOUNDARY
  (F.3): may read security/audit-log data only... If building a working
  audit-log view requires any data access beyond this, stop and report
  rather than expanding scope"), which only makes sense if a working
  audit-log view is expected M22 work, not a future milestone's. Flagged
  to the founder directly (an F.3-boundary-adjacent ambiguity, per the
  "stop and report" instruction) rather than guessed at; the founder
  confirmed: **build the working audit-log view now, within M22.** This
  is recorded as a founder-clarified scope expansion within F.3's
  existing boundary — audit-log data only — not a silent contradiction
  of the resolved F.3 decision (§3) or a widening of what `apps/admin`
  may ever read.
- **Implementation scope (as built):** `apps/admin` and `apps/website`
  scaffolded via Next.js (TypeScript, App Router), rewired to this
  repository's ADR-0003 integration pattern (`tsconfig.json` extends
  `@natkhat-ai/config-typescript/base.json`; `eslint.config.mjs`
  composes `@natkhat-ai/config-eslint/base` with Next's own flat-config
  rule sets; `"prettier": "@natkhat-ai/config-prettier"`); Turborepo/CI
  coverage (`lint`, `typecheck`, `build` for both — `test` intentionally
  has no script, Turborepo skips packages without one, verified
  empirically). One new backend endpoint,
  `GET /audit-events` (`apps/backend/src/audit/audit.controller.ts`),
  the module's first HTTP surface, delegating to a new
  `AuditService.findAll()` (thin wrapper over the existing
  `AuditEventRepository.findMany()`, now sorted newest-first) — scoped
  strictly to `AuditModule`'s own Prisma-backed data, no cross-module
  joins. `apps/admin`'s `/audit` page is a Server Component doing a
  plain server-to-server `fetch` against that endpoint (no CORS
  middleware needed). `apps/website` ships two static pages (home,
  about) with zero forms, data collection, or tracking of any kind.
- **Explicit exclusions (unchanged, honored as built):** No admin
  authentication (the new endpoint has no auth guard — a known,
  deliberate, temporary gap, commented in `audit.controller.ts` and
  flagged here — must be closed before any real deployment). No CMS, no
  production deployment. **Hard boundary (F.3), respected:** the new
  endpoint and page expose audit-log data only — `familyId`/`childId`
  fields are opaque UUID references (audit-log data), never resolved to
  actual family/child records; `metadata` is content-free by design
  (`docs/architecture/audit-logging.md` §3, §10); no parent, child, or
  family content and no aggregate/derived statistics are read anywhere.
  **Hard boundary (F.4), respected:** `apps/website` remains a
  static/marketing shell only.
- **Dependencies:** None beyond the scope decision itself (F.1); does
  not depend on M21.
- **Founder/legal gates:** None remaining — F.3/F.4 resolved (§3), and
  the scaffold-vs-audit-view scope question above was resolved directly
  with the founder before implementation.
- **Implementation authorization status:** **Authorized 2026-08-26 and
  implemented** — see the PR opened off
  `feat/sprint04-m22-admin-website-scaffolding` for the full diff. Not
  yet merged; awaiting founder review, same as every prior milestone.

### M23 — Leo-Chat Authorization Gap _(authorized by the founder 2026-08-27; implemented — see below)_

- **Objective:** Close the authorization gap M20 deliberately left
  open (per the 2026-08-22 `docs/decisions/decision-log.md` entry): add
  the missing `Action` to the bounded authorization set established at
  M15 for "interact with Leo for a given child," and wire the
  corresponding enforcement check into the Leo-chat entry point.
- **Source:** `docs/decisions/decision-log.md`, 2026-08-22 and
  2026-08-27 entries; Founder Decision F.6 (§3); founder authorization
  message, 2026-08-27 ("NATKHAT AI — M23 Authorization: Leo-Chat
  Authorization Gap").
- **Implementation scope (as built):** Added `interact_with_leo` to
  `apps/backend/src/authorization/authorization.types.ts`'s bounded
  `ACTIONS` set — not one of the five owner-only-unconditional actions,
  so it is co-parent-eligible by construction (requires an explicit
  `permission_scope` grant, no default-allow). Wired an
  `AuthorizationService.authorize(...)` check for that `Action` into
  `apps/backend/src/leo/leo.service.ts`'s `startConversation` and
  `appendMessage` — the chat-start/message-send entry points the
  2026-08-22 decision-log entry named directly — via a new private
  `assertLeoChatAuthorized` helper that runs first, before any
  Conversation/Message row is read or written; denial throws a new
  `LeoChatNotAuthorizedError`. `LeoModule` now imports
  `AuthorizationModule` to obtain `AuthorizationService` (no circular
  dependency — `AuthorizationModule` only imports `IdentityFamilyModule`
  and `AuditModule`). `docs/architecture/authorization-and-sessions.md`
  §5's table gained a footnoted row for this Action. Test coverage: a
  unit-level permission-matrix addition to
  `authorization/authorization.service.spec.ts` (owner-allow,
  granted-co-parent-allow, ungranted-co-parent-deny, reserved-Child-
  deny); a new real-Postgres integration spec,
  `leo/leo-chat-authorization.integration.spec.ts` (owner-allow,
  granted-co-parent-allow, ungranted-co-parent-deny with no Conversation
  row created, no-role-at-all-deny, `appendMessage` independently gated
  with no Message row written, and live revocation taking effect
  immediately); the three existing Leo test files that call
  `startConversation`/`appendMessage` directly
  (`leo/leo.service.integration.spec.ts`,
  `leo/leo-cross-child-isolation.integration.spec.ts`, and M20's
  `apps/backend/test/vertical-slice.e2e-spec.ts`) updated to supply the
  now-required `principalId`/`principalType` and to construct
  `LeoService` with an `AuthorizationService` — verified passing, not
  assumed, including the vertical-slice e2e run with
  `VERTICAL_SLICE_ENABLED=true`.
- **Explicit exclusions (unchanged, honored as built):** Does **not**
  touch child-login/child-session (ADR-0009 Decision item 7) — that
  remains explicitly out of scope, requiring its own separate,
  founder-approved Change Request per ADR-0009 itself; this milestone
  gates which _parent-authenticated_ principal (owner or a co-parent
  explicitly granted the action) may act, never a Child principal. No
  other change to `authorization.types.ts`'s bounded set beyond the one
  new `Action`; no change to the five owner-only-unconditional actions
  or to `permission_scope`'s existing parsing/serialization semantics.
  No change to Leo AI/mock-adapter behavior, memory/encryption (M18),
  or the AI provider boundary (M19).
- **Dependencies:** None beyond M15's existing bounded authorization
  set (already merged). Independent of M22.
- **Founder/legal gates:** None remaining.
- **Implementation authorization status:** **Authorized 2026-08-27 and
  implemented** — see the PR opened off
  `feat/sprint04-m23-leo-chat-authorization` for the full diff. Not yet
  merged; awaiting founder review, same as every prior milestone.

---

## 5. Legal/Privacy Validation Required (unchanged, carried forward from `sprint-03.md` §6)

None of Sprint 03's five open legal/privacy items are resolved,
narrowed, or affected by anything in this document:

1. India DPDP Act legal sufficiency of the signed/e-signed consent-form
   design.
2. Selection and legal review of an AI provider's contract terms.
3. India DPDP data-localization confirmation.
4. Regulatory breach-notification obligations and timelines (governs
   ADR-0015 §13.3's provisional 3-year Tier-5 retention period).
5. Whether AI-driven Leo responses constitute "automated
   decision-making" under a GDPR Article 22 equivalent (not currently
   operative — India-only launch).

---

## 6. Sprint 04 Definition of Done (draft)

Not final until F.1–F.6 are answered. Provisionally, mirroring Sprint
03's §9: a new engineer or AI agent can clone the repo, read
`PROJECT.md` → Constitutions → ADRs (through ADR-0016) → this document
(once finalized) → the relevant module doc, and understand exactly
which of `apps/admin`/`apps/website` exists, what it can and cannot do,
and which parts remain structurally absent pending a later, separate
founder decision. No real parent, child, or family data exists
anywhere. No production environment is active.

---

## Next Step

**Founder Decisions F.1–F.6 (§3) are recorded.** This document's job of
surfacing every open question for the founder is done. Per this
project's standing governance discipline (mirrored from Sprint 03's
Decision J.7): **M21 is complete and merged (PR #23). M22 was
separately authorized (2026-08-26) and is implemented, pending founder
review/merge. M23 was separately authorized (2026-08-27) and is
implemented, pending founder review/merge** — its own explicit
founder go-ahead, distinct from F.6 itself, the same way Sprint 03's
M13 required its own gate beyond J.1's threshold authorization. Each
milestone proceeded one-milestone-at-a-time, stop-and-report, exactly
as every prior milestone in this project has — including stopping to
flag and resolve a genuine F.3-boundary-adjacent scope ambiguity with
the founder directly before M22's implementation began (see §4, M22).
**M23 is the last drafted Sprint 04 milestone.** Once M22 and M23 are
both reviewed and merged, Sprint 04 (as currently scoped: M21-M23) is
complete; any further Sprint 04/05 scope is a new planning
conversation with the founder, not an automatic continuation of this
document.
