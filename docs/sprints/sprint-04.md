# Sprint 04 — Implementation Plan & Contract (Foundation Track: Governance Sync, Admin/Website, Leo-Chat Authorization)

**Version:** 1.0.0
**Status:** Founder Decisions F.1–F.6 (§3) are **decided** — recorded
below with their actual outcomes, not just the open questions. This
document plays the same role `docs/sprints/sprint-03.md`'s Milestone 12
played before Decisions J.1–J.7: it inspected the governing documents,
surfaced every open question, and is now updated to record what the
founder actually decided for each. **Only M21 (Sprint 03 Close-Out &
Governance Sync) is authorized to begin.** M22 (Admin & Website
Application Scaffolding) and M23 (Leo-Chat Authorization Gap) remain
**not yet authorized** — each requires its own separate, explicit
founder go-ahead before implementation begins, per this project's
standing one-milestone-at-a-time discipline (mirrored from
`docs/sprints/sprint-03.md`, Decision J.7).
**Owner:** Product Owner
**Last Updated:** 2026-08-26
**Phase:** Post-Sprint-03 planning and M21 execution. Sprint 01, Sprint
02, and Sprint 03 are all complete and merged into `main` — see
`docs/sprints/sprint-01.md`, `docs/sprints/sprint-02.md`, and
`docs/sprints/sprint-03.md`.

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

### M22 — Admin & Website Application Scaffolding _(confirmed candidate — §2.1; boundaries locked in — F.3/F.4)_

- **Objective:** Create `apps/admin` and `apps/website` as real Next.js
  applications, wired into the pnpm/Turborepo workspace and CI, per
  ADR-0014's already-locked decision.
- **Source:** ADR-0014, Decision J.2.
- **Implementation scope:** `apps/admin` and `apps/website` scaffolds
  (default framework output plus shared `config-typescript`/
  `config-eslint`/`config-prettier` wiring — the same integration
  pattern ADR-0003 established for `apps/backend`); Turborepo/CI
  coverage (`lint`, `typecheck`, `test`, `build`) for both.
- **Explicit exclusions:** No admin authentication, no CMS, no
  marketing content beyond placeholder scaffolding, no production
  deployment. No data access of any kind beyond the F.3 ceiling below —
  this milestone itself is scaffold-only and reads nothing; F.3 bounds
  what any _later_ admin data-access milestone may ever build toward.
  **Hard boundary (F.3):** any future `apps/admin` data-access milestone
  may read audit-log data only — never parent, child, or family content,
  never aggregate/anonymized stats, never any other data category.
  **Hard boundary (F.4):** `apps/website` in Sprint 04 is a
  static/marketing shell only — no signup form, no contact form, no
  data collection of any kind.
- **Dependencies:** None beyond the scope decision itself (F.1); does
  not depend on M21.
- **Founder/legal gates:** F.3 and F.4 are now resolved (§3) — this
  milestone's Definition of Done can be written precisely against the
  two hard boundaries above. No further founder/legal gate blocks the
  scaffold itself.
- **Implementation authorization status:** **Not yet authorized** —
  awaiting separate, explicit founder go-ahead, per this project's
  standing one-milestone-at-a-time discipline. M21's authorization does
  not extend to M22.

### M23 — Leo-Chat Authorization Gap _(confirmed — F.6)_

- **Objective:** Close the authorization gap M20 deliberately left
  open (per the 2026-08-22 `docs/decisions/decision-log.md` entry): add
  the missing `Action` to the bounded authorization set established at
  M15 for "interact with Leo for a given child," and wire the
  corresponding enforcement check into the Leo-chat entry point.
- **Source:** `docs/decisions/decision-log.md`, 2026-08-22 entry;
  Founder Decision F.6 (§3).
- **Implementation scope:** Add one new `Action` to
  `apps/backend/src/authorization/authorization.types.ts`'s existing
  bounded set; wire an `AuthorizationService.authorize(...)` check for
  that `Action` into the Leo-chat entry point in
  `apps/backend/src/leo/leo.service.ts` (the call M20's own vertical-
  slice test — `apps/backend/test/vertical-slice.e2e-spec.ts` —
  currently exercises without any authorization check, per the
  decision-log entry).
- **Explicit exclusions:** Does **not** touch child-login/child-session
  (ADR-0009 Decision item 7) — that remains explicitly out of scope,
  requiring its own separate, founder-approved Change Request per
  ADR-0009 itself. No other change to `authorization.types.ts`'s bounded
  set beyond the one new `Action`; no change to the five owner-only-
  unconditional actions or to `permission_scope`'s existing semantics.
- **Dependencies:** None beyond M15's existing bounded authorization
  set (already merged). Independent of M22 — may run before, after, or
  in parallel with M22 once both are separately authorized.
- **Founder/legal gates:** None.
- **Implementation authorization status:** **Not yet authorized** —
  awaiting separate, explicit founder go-ahead, same one-milestone-at-
  a-time discipline as every other milestone in this document.

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
Decision J.7), only **M21** is authorized to begin now. **M22 and M23
remain not yet authorized** — each requires its own separate, explicit
founder go-ahead, the same way Sprint 03's M13 required its own gate
beyond J.1's threshold authorization. M21 execution proceeds
one-milestone-at-a-time, stop-and-report, exactly as every prior
milestone in this project has.
