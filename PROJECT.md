> Read this file first. This summarizes current state — it never
> overrides `docs/constitution/` or `docs/decisions/`. If they
> disagree, those win; file a correction here.

# Natkhat AI — Project Dashboard

**Version:** 1.18.0
**Status:** Living — updated in the same PR as any sprint/milestone/decision change
**Owner:** Repository maintainers
**Last Updated:** 2026-09-02 (Sprint 06, Milestone 26 — Sprint 05
Close-Out & Governance Sync: this file corrected to reflect Sprint 05
Milestone 25 (Admin Authentication for Audit-Log Endpoint) as merged
into `main` via PR #27 — `apps/backend/src/admin-auth/` and
`apps/admin`'s Firebase-session sign-in flow now gate `GET
/audit-events` and the `/audit` page, closing Known Risk #17. This
file's own prior M24 update (2026-08-31) had itself only reached the
state "M25 decided-in-principle, not yet authorized" — it was never
updated again after M25 was subsequently authorized (2026-09-01),
implemented, and merged (PR #27), so it inaccurately described M25 as
"not yet authorized" in the interim. Corrected in this pass, per
`docs/sprints/sprint-06.md`, §7, M26. Also records the Sprint 06
kickoff planning pass ("Leo's Real Experience"): `docs/sprints/sprint-06.md`
was drafted, and Founder Decisions H.1–H.8 were recorded — none of
Sprint 06's substantive milestones (M27–M30) are authorized yet; only
this governance-sync milestone (M26) is. See Current Status and Change
Log for full detail.)

## Governance Compliance

Every engineering milestone must comply with all of the following
(the strict read/authority order — Company above Product, Child
Privacy & Safety at the same tier as Product — is the Governance
Hierarchy in `docs/sprints/sprint-01.md`, §1):

- [Product Constitution](docs/constitution/product/natkhat-ai-constitution.md)
- [Engineering Constitution](docs/constitution/engineering/engineering-constitution.md)
- [Company (ASPOVO) Constitution](docs/constitution/company/aspovo-constitution.md) — currently a placeholder
- [Child Privacy & Safety Constitution](docs/constitution/product/child-privacy-and-safety-constitution.md) — Tier-1 Product Constitution Amendment, APPROVED, CRITICAL priority
- [ADRs](docs/decisions/)
- [Sprint Documents](docs/sprints/)

This section is a dashboard pointer only — it does not restate or
override any of the above (see banner and `docs/sprints/sprint-01.md`,
§1).

## Project Vision

Natkhat AI (an ASPOVO product) exists to help parents raise kind,
confident, curious, emotionally strong, future-ready children while
creating meaningful childhood memories — built on nine binding
principles including Human-first, Parent partnership, Safe &
Responsible AI, and No addictive engagement. Full detail:
`docs/constitution/product/natkhat-ai-constitution.md`. No standalone
vision paragraph beyond the mission has been ratified separately — see
that constitution's note on this gap.

## Mission

> Help parents raise kind, confident, curious, emotionally strong and
> future-ready children while creating meaningful childhood memories.

Source: [docs/constitution/product/natkhat-ai-constitution.md](docs/constitution/product/natkhat-ai-constitution.md).

## Current Development Phase

Sprint 01 — Repository Foundation — **complete** (all 12 Milestone
Breakdown entries in `docs/sprints/sprint-01.md`, §15 satisfied) and
permanently merged into `main`. Sprint 02 — Architecture & Compliance
Design Layer — **complete** (all 11 Milestone Breakdown entries in
`docs/sprints/sprint-02.md` satisfied) and permanently merged into
`main`. Sprint 03 — Implementation Plan & Contract (Foundation
Track) — **complete**: all nine Milestone Breakdown entries (M12–M20) in
`docs/sprints/sprint-03.md` satisfied, including the founder-directed
Google Cloud/Firebase migration
([ADR-0016](docs/decisions/ADR-0016-firebase-auth-and-google-cloud-migration.md))
and M20's first end-to-end vertical slice (PR #21) — permanently merged
into `main`. **Sprint 04 — Governance Sync, Admin/Website Scaffolding,
Leo-Chat Authorization — complete**: all three Milestone Breakdown
entries (M21–M23) in
[docs/sprints/sprint-04.md](docs/sprints/sprint-04.md) satisfied — M21
(Sprint 03 close-out/governance sync, PR #23), M22 (`apps/admin`/
`apps/website` scaffolding under the F.3 audit-logs-only / F.4
static-shell-only hard boundaries, PR #24), and M23 (the M15
authorization gate now guards Leo-chat start/continue via a new
`interact_with_leo` Action, PR #25) — all merged into `main` 2026-08-27.
**Sprint 05 — Planning Pass (Governance Sync + Founder-Gated
Recommendations) is complete**: see
[docs/sprints/sprint-05.md](docs/sprints/sprint-05.md), Founder
Decisions G.1–G.5. Milestone 24 (Sprint 04 Close-Out & Governance
Sync, PR #26) and Milestone 25 (Admin Authentication for Audit-Log
Endpoint, authorized 2026-09-01, PR #27) are both merged into `main`.
**Sprint 06 — "Leo's Real Experience" (Kickoff Planning Pass) is
underway**: see [docs/sprints/sprint-06.md](docs/sprints/sprint-06.md).
Founder Decisions H.1–H.8 are recorded. Milestone 26 (Sprint 05
Close-Out & Governance Sync) — this PROJECT.md correction pass — is in
progress; Milestones 27–30 (the substantive Leo-experience work:
backend Leo-chat API + mock-reply wiring, mobile parent authentication,
a child-facing screen, and Sprint 06 close-out) are each **not yet
authorized**, pending their own separate, explicit founder go-ahead in
sequence, per this project's standing one-milestone-at-a-time
discipline.

## Current Sprint

Sprint 06 — "Leo's Real Experience" (Kickoff Planning Pass). Sprint
Document: [docs/sprints/sprint-06.md](docs/sprints/sprint-06.md).
Sprint 05 — Planning Pass (Governance Sync + Founder-Gated
Recommendations), Sprint Document
[docs/sprints/sprint-05.md](docs/sprints/sprint-05.md), Sprint 04 —
Governance Sync, Admin/Website Scaffolding, Leo-Chat Authorization,
Sprint Document [docs/sprints/sprint-04.md](docs/sprints/sprint-04.md),
Sprint 03 — Implementation Plan & Contract (Foundation Track), Sprint
Document [docs/sprints/sprint-03.md](docs/sprints/sprint-03.md), Sprint
02 — Architecture & Compliance Design Layer, Sprint Document
[docs/sprints/sprint-02.md](docs/sprints/sprint-02.md), and Sprint 01 —
Repository Foundation, Sprint Document
[docs/sprints/sprint-01.md](docs/sprints/sprint-01.md), all remain
complete and permanently merged.

## Sprint Goal

Per `docs/sprints/sprint-06.md`, §7, M26: bring `PROJECT.md` back in
sync with Sprint 05's actual, fully merged state (M24 via PR #26, M25
via PR #27) before any Sprint 06 substantive scope (M27–M30) is added
on top of a stale baseline — documentation/governance-sync only,
mirroring the role Sprint 02 Milestone 11, Sprint 04 Milestone 21, and
Sprint 05 Milestone 24 each played for the sprint transition before
them. Sprint 05's own goal, now complete, is recorded for reference:
per `docs/sprints/sprint-05.md`, §4, M24, bring `PROJECT.md` and the
Product Constitution's stale cross-references back in sync with
Sprint 04's actual, merged state, plus G.3 (CI/CD ADR) and G.4 (Storage
amendment); M25 then closed the `GET /audit-events` no-auth-guard gap
Known Risk #17 tracked. Sprint 06's own eventual goal (once M27–M30 are
authorized): build a first, deliberately minimal slice of the actual
child-facing Leo experience — currently `apps/mobile` is unmodified
Flutter boilerplate and no HTTP API exists for the Leo module — against
the mock AI adapter only and the existing parent-authenticated
principal model, per `docs/sprints/sprint-06.md`'s Explicit Exclusions.

## Current Milestone

**Sprint 05 (Milestones 24–25) is complete and permanently merged into
`main`** — M24 (PR #26) and M25 (PR #27). Sprint 06 Milestone 26
(Sprint 05 Close-Out & Governance Sync) is the current, in-progress
milestone — this PROJECT.md update is that milestone's work, per
`docs/sprints/sprint-06.md`, §7, M26 ("bring `PROJECT.md` back in sync
with Sprint 05's actual, merged state"). See the new Sprint 05
Milestone Status table in Current Status for the per-milestone
breakdown, and Pending Tasks/Known Risks for the legal and founder
gates that remain genuinely open (M26 does not close them — it only
reports them accurately). Sprint 06 Milestones 27–30 (Leo-chat API
surface, mobile parent authentication, a child-facing screen, and
Sprint 06 close-out — `docs/sprints/sprint-06.md`, §7) are each
**not yet authorized** — every one requires its own separate, explicit
founder go-ahead once the milestone before it is merged and verified.
Sprint 01 (Milestones 0–12), Sprint 02 (Milestones 1–11), Sprint 03
(Milestones 12–20), and Sprint 04 (Milestones 21–23) remain separately
complete and permanently merged — see the historical completion
checklists further down in Current Status.

## Current Branch

`main` — Sprint 01 (Milestones 0–12) is **permanently merged**. First
commit `6ff7e44`, then PR
[#1](https://github.com/amiyamishra1990-rgb/natkhat-ai/pull/1)
(`chore/project-milestone-10-ci-verification` → `main`, carrying
Milestone 11/12 completion) merged via merge commit `87de72d` on
2026-08-03, all 5 required checks green
([run 30824853976](https://github.com/amiyamishra1990-rgb/natkhat-ai/actions/runs/30824853976)),
no force-push, no direct push to `main`, no CI bypass.

**Sprint 02 (Milestones 1–10) is also merged into `main`**, one PR per
milestone (M1–M4's architecture/module docs bundled in one PR; M4's ADR
followed separately once founder-approved), each via the same PR
workflow with no force-push and no direct push to `main`: PR #2
(governance close-out, ADR-0006/ADR-0007) → PR #3 (Sprint 02 planning,
`docs/sprints/sprint-02.md`) → PR #4 (M1–M4 architecture/module docs) →
PR #5 (M5, consent architecture) → PR #6 (M6, Leo memory/conversation
isolation) → PR #7 (M7, auditability/observability) → PR #8 (M8,
AI-provider boundary) → PR #9 (M9, India deployment) → PR #10 (M10,
Next.js admin/website ADR) → PR #11 (M4 governance-gap closure —
ADR-0015 promoted to Accepted). `origin/main` is currently at merge
commit `87f8cb5` (PR #11). Branch-protection status (required checks,
`enforce_admins`, the temporary `required_approving_review_count: 0`
condition) is unchanged from the state recorded in Known Risk #11 below —
this session did not re-verify it against GitHub and does not claim it
has changed.

Branch protection on `main` (post-Sprint-01-merge): 5 required status
checks (`lint`, `typecheck`, `test`, `build`, `mobile`, `strict: true`),
`enforce_admins: true`, force-push and branch deletion disabled, PR
workflow mandatory — **with one temporary exception**:
`required_approving_review_count` was changed from 1 to 0 on
2026-08-03, because the repository has exactly one collaborator (the
owner) and could not otherwise merge anything, ever (see Known Risks
and `docs/decisions/decision-log.md`, 2026-08-03 entry, for the full
rationale and the exact restore procedure for when a second trusted
reviewer is added).

## Current Release

Pre-release — no deployable environment yet.

## Build Status

**Green** — verified on real GitHub Actions, not just locally: all
five `ci.yml` jobs (`lint`, `typecheck`, `test`, `build`, `mobile`)
pass on
[run 30753691637](https://github.com/amiyamishra1990-rgb/natkhat-ai/actions/runs/30753691637)
against PR #1. Two real defects were caught by this real run (neither
had surfaced in local validation) and fixed on the same PR branch — see
Current Status.

## Current Status

**Sprint 03 Milestone Status (historical — complete as of 2026-08-26
(M21 entry), unchanged since; the current sprint's table is the Sprint
04 Milestone Status table immediately below the M12–M20 detail
paragraph):**

| M   | Milestone                                                             | Status                                                                                                                                                       | ADR / doc                                                                                                                                                                                                 |
| --- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 12  | Implementation Plan & Contract                                        | Complete, merged                                                                                                                                             | `docs/sprints/sprint-03.md` — founder-approved Decisions J.1–J.7                                                                                                                                          |
| 13  | Backend & Environment Foundation                                      | Complete, merged                                                                                                                                             | Prisma/local-then-Cloud-SQL connectivity, `scripts/check-env.ts`, module skeleton — no dedicated new ADR                                                                                                  |
| 14  | Identity, Family & Tenant-Isolation Implementation                    | Complete, merged                                                                                                                                             | `apps/backend/src/identity-family/` — implements [ADR-0008](docs/decisions/ADR-0008-core-data-model-parent-family-child.md)/[ADR-0010](docs/decisions/ADR-0010-encryption-and-tenant-isolation-design.md) |
| 15  | Authorization & Session Implementation                                | Complete, merged                                                                                                                                             | `apps/backend/src/authorization/`, `apps/backend/src/auth/` — implements [ADR-0009](docs/decisions/ADR-0009-authorization-and-session-architecture.md); rebuilt against Firebase Admin SDK by ADR-0016    |
| 16  | Data Lifecycle & Auditability Implementation                          | Complete, merged                                                                                                                                             | `apps/backend/src/lifecycle/`, `apps/backend/src/audit/` — implements [ADR-0015](docs/decisions/ADR-0015-child-data-lifecycle-architecture.md)                                                            |
| 17  | Consent & Privacy Gate (Track A scaffold only)                        | Complete, merged — **real mechanism (Track B) remains inactive**                                                                                             | `apps/backend/src/consent/` — implements [ADR-0011](docs/decisions/ADR-0011-consent-architecture.md)'s scaffold; ADR-0011 itself remains Proposed                                                         |
| 18  | Leo Foundation & Memory Isolation                                     | Complete, merged                                                                                                                                             | `apps/backend/src/leo/` — implements [ADR-0012](docs/decisions/ADR-0012-leo-memory-and-conversation-isolation-design.md)                                                                                  |
| 19  | AI Provider Boundary & Interface (Track A mock adapter only)          | Complete, merged — **real provider (Track B) remains unselected**                                                                                            | `apps/backend/src/ai-provider/` — implements [ADR-0013](docs/decisions/ADR-0013-ai-provider-abstraction-and-multi-provider-compatibility.md); ADR-0013 itself remains Proposed                            |
| 20  | First End-to-End Vertical Slice (internal, dev-only, feature-flagged) | Complete, merged (PR #21) — **Leo-chat interaction deliberately left ungated at the authorization layer, see decision-log 2026-08-22 and Known Risks below** | `apps/backend/test/vertical-slice.e2e-spec.ts`                                                                                                                                                            |

No production deployment, real parent/child/family data, real
consent-verification mechanism, or real AI/LLM provider credential
exists anywhere as a result of M12–M20 — every Track B item (real
consent activation, real AI-provider selection, real production
infrastructure) remains inactive, per `docs/sprints/sprint-03.md`, §2.3
and §10. The founder-directed Google Cloud/Firebase migration
([ADR-0016](docs/decisions/ADR-0016-firebase-auth-and-google-cloud-migration.md),
2026-08-23) superseded Sprint 03 Decision J.5's dev-Supabase target
after M15 had already implemented against it — M15's authorization/
session code was rebuilt against the Firebase Admin SDK, per ADR-0016's
own Change Log entry; no other M13–M20 milestone required rework. See
Known Risks below for the specific gates each Track B item remains
blocked on, and Known Risk #16 (new, this update) for the M20 Leo-chat
authorization gap now assigned to Sprint 04 M23
(`docs/sprints/sprint-04.md`, §4) — closed by M23, see below.

**Sprint 04 Milestone Status (historical — complete as of 2026-08-27,
unchanged since; the current sprint's table is the Sprint 05 Milestone
Status table immediately below):**

| M   | Milestone                               | Status                                                                                             | ADR / doc                                                                                                                                                                                                                                                                                               |
| --- | --------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 21  | Sprint 03 Close-Out & Governance Sync   | Complete, merged (PR #23)                                                                          | `docs/sprints/sprint-04.md`, §4, M21 — `PROJECT.md`/Constitution corrections, no new architecture or code                                                                                                                                                                                               |
| 22  | Admin & Website Application Scaffolding | Complete, merged (PR #24) — **no admin authentication at the time; closed by Sprint 05 M25 below** | `apps/admin/`, `apps/website/` — implements [ADR-0014](docs/decisions/ADR-0014-adopt-nextjs-for-admin-and-website-applications.md); `apps/backend/src/audit/audit.controller.ts` (new `GET /audit-events`); Founder Decisions F.3 (audit-log data only)/F.4 (static shell only) both respected as built |
| 23  | Leo-Chat Authorization Gap              | Complete, merged (PR #25)                                                                          | New `interact_with_leo` Action in `apps/backend/src/authorization/authorization.types.ts`; enforced in `apps/backend/src/leo/leo.service.ts`'s `startConversation`/`appendMessage` — implements Founder Decision F.6; does not touch ADR-0009 item 7 (child-login/child-session)                        |

Confirmed directly against the real filesystem and `git log` (not
assumed from a prior Change Log entry): `apps/admin/` and `apps/website/`
exist and build; `apps/backend/src/authorization/authorization.types.ts`
contains `interact_with_leo`; both M22's PR #24 and M23's PR #25 show as
merge commits in `main`'s history (2026-08-27).

**Sprint 05 Milestone Status (current — see Change Log for the
2026-09-02 M26 entry):**

| M   | Milestone                                   | Status                    | ADR / doc                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| --- | ------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 24  | Sprint 04 Close-Out & Governance Sync       | Complete, merged (PR #26) | `docs/sprints/sprint-05.md`, §4, M24 — `PROJECT.md`/Constitution corrections reflecting M21–M23 as merged; new [ADR-0017](docs/decisions/ADR-0017-github-actions-cicd.md) (CI/CD, G.3); dated [ADR-0016](docs/decisions/ADR-0016-firebase-auth-and-google-cloud-migration.md) amendment (Storage → Google Cloud Storage, G.4); no implementation code                                                                                      |
| 25  | Admin Authentication for Audit-Log Endpoint | Complete, merged (PR #27) | New `apps/backend/src/admin-auth/` module (`admin-auth.guard.ts`, `admin-auth.service.ts`, `admin-user.repository.ts`) gating `GET /audit-events`; `apps/admin` gains a Firebase-session sign-in flow (`app/sign-in/page.tsx`, `app/api/session/route.ts`, `lib/firebase-client.ts`, `lib/session.ts`, `proxy.ts`); new Prisma migration `20260901090000_m25_admin_authentication`; implements Founder Decision G.2; closes Known Risk #17 |

Confirmed directly against the real filesystem and `git log` (not
assumed from a prior Change Log entry): `apps/backend/src/admin-auth/`
exists with its guard, service, module, and repository files;
`apps/admin/proxy.ts` and `apps/admin/app/sign-in/page.tsx` exist; PR
#27 (`feat/sprint05-m25-admin-auth` → `main`) shows as a merge commit
in `main`'s history. No production deployment or real parent/child/
family data exists as a result of M21–M25 — `apps/admin`'s
`GET /audit-events` endpoint is now authenticated (Known Risk #17
resolved); ADR-0009 item 7 (child-login/child-session) remains
untouched, its own separate, not-yet-opened decision.

**Sprint 02 Milestone Status (historical — complete as of 2026-08-12,
unchanged since):**

| M   | Milestone                                    | Status                                                 | ADR / doc                                                                                                                                                                                                                                  |
| --- | -------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Identity & Family Architecture               | Complete, merged                                       | [ADR-0008](docs/decisions/ADR-0008-core-data-model-parent-family-child.md) — Accepted, Implementation Deferred; `docs/modules/identity-family/README.md`                                                                                   |
| 2   | Authorization & Session Architecture         | Complete, merged                                       | [ADR-0009](docs/decisions/ADR-0009-authorization-and-session-architecture.md) — Accepted, Implementation Deferred; `docs/architecture/authorization-and-sessions.md`                                                                       |
| 3   | Data Classification, Encryption & Isolation  | Complete, merged                                       | [ADR-0010](docs/decisions/ADR-0010-encryption-and-tenant-isolation-design.md) — Accepted, Implementation Deferred; `docs/architecture/data-classification-and-isolation.md`                                                                |
| 4   | Child-Data Lifecycle Architecture            | Complete, merged; **governance gap closed 2026-08-11** | [ADR-0015](docs/decisions/ADR-0015-child-data-lifecycle-architecture.md) — Accepted, Implementation Deferred; `docs/architecture/data-lifecycle.md`                                                                                        |
| 5   | Consent Architecture (Framework-Level)       | Complete, merged — **ADR remains Proposed**            | [ADR-0011](docs/decisions/ADR-0011-consent-architecture.md) — Proposed, blocked on final mechanism selection + India DPDP legal validation; `docs/architecture/consent-architecture.md`                                                    |
| 6   | Leo Memory & Conversation Isolation          | Complete, merged                                       | [ADR-0012](docs/decisions/ADR-0012-leo-memory-and-conversation-isolation-design.md) — Accepted, Implementation Deferred; `docs/architecture/ai-memory-isolation.md`, `docs/modules/leo-companion/README.md`                                |
| 7   | Auditability & Observability                 | Complete, merged                                       | `docs/architecture/audit-logging.md` (no dedicated new ADR — extends ADR-0006)                                                                                                                                                             |
| 8   | AI-Provider Data-Boundary / Multi-Provider   | Complete, merged — **ADR remains Proposed**            | [ADR-0013](docs/decisions/ADR-0013-ai-provider-abstraction-and-multi-provider-compatibility.md) — Proposed, cannot be Accepted until a candidate provider's contract terms clear legal review; `docs/architecture/ai-provider-boundary.md` |
| 9   | India-First Deployment & Data-Residency      | Complete, merged                                       | `docs/architecture/deployment-india.md` (no dedicated new ADR — data-residency decision remains gated on DPDP legal validation, see Known Risks)                                                                                           |
| 10  | Admin/Website Stack Formalization (ADR only) | Complete, merged                                       | [ADR-0014](docs/decisions/ADR-0014-adopt-nextjs-for-admin-and-website-applications.md) — Accepted                                                                                                                                          |
| 11  | Sprint 02 Design-Phase Close-Out & Gov. Sync | Complete, merged                                       | `PROJECT.md` only, per `docs/sprints/sprint-02.md`, §3, M11                                                                                                                                                                                |

No scaffold, schema, migration, authentication code, API, storage, or
business-feature implementation was created by any of M1–M10 — every
architecture/ADR above is explicitly "Implementation Deferred" (or, for
M5/M8, not yet Accepted at all). This is a documentation/design sprint
only, consistent with Sprint 02's Explicit Exclusions (§10) and its own
Definition of Done (§9). The Milestone 4 child-data lifecycle governance
gap — retention/deletion/export/backup-purge windows left open by
ADR-0006 §17/§18/§19/§21 — is now closed: the founder approved the
candidate values in `docs/architecture/data-lifecycle.md` §13 on
2026-08-05 (soft→hard-delete: 90 days; backup-purge: 90 days +
cryptographic erasure for Tier 3; Leo memory's three-class model D4-A/B/
C), and ADR-0015 was authored recording those values and promoted to
**Accepted — Implementation Deferred** (Last Updated 2026-08-11, merged
via PR #11). One value remains **provisional, not final**: the Tier 5
audit/security-log retention period (§13.3, currently 3 years) is
subject to change pending India DPDP Act legal review of
breach-notification/record-keeping obligations (ADR-0006 §30, still
open) — ADR-0015 does not resolve that legal gate, and neither does this
PROJECT.md update. See Known Risks below for the full list of items that
remain genuinely open after M1–M10 (consent-mechanism legal validation,
AI-provider contract-terms review, India data-localization confirmation,
breach-notification obligations, and the audit-log-retention
provisionality above) — M11 reports these, it does not close them.

---

**Historical — Sprint 01 (below, unchanged since 2026-08-04):**

**Milestone 12 (PROJECT.md final close-out) is now complete — Sprint 01
is 100% complete.** Per `docs/sprints/sprint-01.md`, §15, Milestone
12 is exactly: "PROJECT.md final close-out — Current Status, Completed
Tasks, Next Actions updated to reflect the finished foundation." Before
implementing, verified the resume request's own prerequisite claims
against the repository rather than assuming them: confirmed Milestones
0, 1, 1.5, 2, 5, 6, 7, 8, 9, 10, and 11 are each recorded as complete in
this file's own Completed Tasks/Change Log (all 11 present, none
missing), and confirmed no unresolved blocker prevents Milestone 12 —
the Blockers section already stated "None blocking Sprint 01 progress"
before this session began; the one open operational item (PR #1
merge-blocked pending a second reviewer) is explicitly recorded
elsewhere in this file as "not a Sprint 01 blocker," so it does not gate
this close-out.

Re-validated the Definition of Done (`docs/sprints/sprint-01.md`, §15)
directly, rather than relying solely on Milestone 10's prior CI run:
`pnpm install --frozen-lockfile` against the current `pnpm-lock.yaml`
succeeds cleanly; `pnpm exec turbo run lint typecheck test build`
passes 5/5 tasks (all cache-hit, confirming no drift since Milestone
10's real CI run); `flutter analyze` in `apps/mobile` reports "No
issues found"; `flutter test` reports "All tests passed." Combined with
Milestone 10's independently-verified real GitHub Actions run
([run 30753691637](https://github.com/amiyamishra1990-rgb/natkhat-ai/actions/runs/30753691637))
and branch protection, this satisfies §15's Definition of Done in full:
a new engineer or AI agent cloning the repo, reading `PROJECT.md` →
Constitution → ADRs → the current Sprint Document, running
`scripts/setup.sh`, gets `apps/backend` building/testing and
`apps/mobile` building/testing locally, with CI green on a real PR.

Reviewed `docs/sprints/sprint-01.md`, §27, Recommendation 6 ("Revisit
`docs/` domain boundaries, the Knowledge Vault's category list, and
`.ai/` structure at the end of Sprint 01 to confirm they held up in
practice before Sprint 02 adds real product modules") as a read-only
confirmation, not a redesign — Milestone 12 does not authorize
structural changes: the ten `docs/` domains (§5) were each populated
by exactly the milestone that owns them, with no domain needing a
scope it wasn't given (Milestone 6's how-to-docs discrepancy and
Milestone 11's `.ai/sessions/` discrepancy are the only two boundary
frictions found across all 12 milestones, and both were flagged and
deferred to a Change Request rather than silently resolved — neither
required a structural change); the Knowledge Vault's eight categories
(`docs/knowledge/`) were never populated with real entries in Sprint 01
(expected — Sprint 01 has no implementation to generate lessons from
yet) but the category list itself was never found to be wrong or
missing a needed category; `.ai/`'s four folders are each now used
for what §6 defines them for (`prompts/` populated at Milestone 11;
`context/` populated at Milestone 0/1.5; `sessions/` and `reviews/`
correctly still empty — no AI session has been logged there across all
12 milestones, which is itself the discrepancy flagged at Milestone 11
and carried forward below, not resolved here). Conclusion: the
structure held up in practice: no domain boundary or `.ai/` folder
needs to change before Sprint 02. This is a finding, not a decision —
no `docs/` or `.ai/` structural change was made.

**Sprint 01 Completion Checklist** (§15's twelve Milestone Breakdown
entries):

| #   | Milestone                                                        | Status                                |
| --- | ---------------------------------------------------------------- | ------------------------------------- |
| 0   | Governance Documentation Foundation                              | Complete                              |
| 1   | Root scaffolding                                                 | Complete                              |
| 1.5 | Governance Synchronization (Child Privacy & Safety Constitution) | Complete                              |
| 2   | Governance population (`change-request-process.md`)              | Complete                              |
| 3   | PROJECT.md close-out of Governance phase                         | Complete (satisfied by prior updates) |
| 4   | _(superseded by Milestone 0)_                                    | N/A                                   |
| 5   | Module Registry scaffolding                                      | Complete                              |
| 6   | Engineering standards docs                                       | Complete                              |
| 7   | Shared config packages                                           | Complete                              |
| 8   | App scaffolds                                                    | Complete                              |
| 9   | Developer tooling                                                | Complete                              |
| 10  | CI foundation                                                    | Complete                              |
| 11  | `.ai/` workspace population                                      | Complete                              |
| 12  | PROJECT.md final close-out                                       | Complete (this entry)                 |

No application code, business logic, database, auth, or product
functionality touched; no architecture, ADR, Constitution, or other
governance document modified — only `PROJECT.md` (this file). Sprint 02
has no approved Sprint Document yet (`docs/sprints/` contains only
`sprint-01.md`) — see Pending Tasks for the recommended first step.

Milestone 11 (`.ai/` workspace population) is complete, per
`docs/sprints/sprint-01.md`, §15's exact Milestone 11 definition:
"`.ai/` workspace population (remaining) — starter prompt template(s)
in `.ai/prompts/`." Before implementing, confirmed this exact scope
directly from the Sprint Document (§15) rather than from this session's
resume-request wording, per the AI Engineering Rule
(`.ai/context/agent-workflow.md`); the resume request's own wording
("starter prompt template(s) in `.ai/prompts/`") matched §15 verbatim,
so no scope mismatch needed surfacing this time.

Authored four starter prompt templates in `.ai/prompts/`:
`draft-adr.md`, `draft-module-doc.md`, `run-review-pass.md`, and
`resume-milestone.md`. The first three are not new process invention —
they are the exact three recurring tasks `.ai/prompts/README.md`
already named ("draft an ADR, draft a module doc, run a review pass")
before this milestone began. The fourth,
`resume-milestone.md`, generalizes the resume-and-implement-one-milestone
pattern this Sprint's own Change Log shows repeated identically across
all ten prior milestone sessions (each: read PROJECT.md → Constitution
→ ADRs → Sprint Document → confirm exact milestone scope → implement
only that milestone → report files/trees/validations/issues/acceptance
criteria → stop for approval) — captured as a template rather than
re-derived from scratch next time, per the same "keeps agent output
consistent across sessions and providers" rationale
`.ai/prompts/README.md` already states for this folder's purpose. Each
template is explicit that it is non-authoritative
(`docs/sprints/sprint-01.md`, §6) and defers to the governing
`docs/` document (`change-request-process.md`,
`docs/modules/TEMPLATE.md`, `review-checklist.md`/`ai-review-checklist.md`,
and the Sprint Document itself, respectively) wherever the two could
ever disagree.

Updated `.ai/prompts/README.md` from a structural placeholder (empty,
`Version 1.0.0`) to an active index (`Version 1.1.0`) listing all four
templates in a table, matching the update pattern every prior milestone
used for the `docs/` README each milestone populated (e.g.
`docs/modules/README.md` at Milestone 5, `docs/engineering/README.md`
at Milestone 6). Validated: `pnpm exec prettier --check .ai/prompts/*.md`
initially failed only on `README.md`'s table alignment; `pnpm exec
prettier --write` fixed it (table column widths only, no content
change), and a re-run of `--check` then passed for all five files in
the folder. No other file in the repository references
`.ai/prompts/` by path (checked via a repo-wide grep for `.ai/prompts`)
outside `PROJECT.md`, `docs/sprints/sprint-01.md`, and the folder's own
files, so no other document needed updating for this milestone.

No application code, business logic, database, auth, or product
functionality touched; no architecture, ADR, or Constitution changed;
`docs/modules/TEMPLATE.md`, `docs/engineering/change-request-process.md`,
`docs/engineering/review-checklist.md`, and
`docs/engineering/checklists/ai-review-checklist.md` were read for
grounding but not modified — the new prompt templates reference them,
they do not restate or alter them. `.ai/sessions/` and `.ai/reviews/`
remain empty structural placeholders: `docs/sprints/sprint-01.md`, §15's
Milestone 11 definition scopes this milestone to `.ai/prompts/` only.
One documentation forward-reference is worth flagging, not silently
resolved: `docs/engineering/checklists/ai-review-checklist.md` (line
31–33) says a session log in `.ai/sessions/` is expected "once that
workspace is populated with real session records — Sprint 01, Milestone
11," which reads as if Milestone 11 also covers `.ai/sessions/`. §15's
own Milestone 11 line is unambiguous and names only `.ai/prompts/`, so
§15 (the operative Milestone Breakdown) was followed here, consistent
with how this Sprint's own precedent (Milestone 6's similar
how-to-docs discrepancy) treats §15 as the deciding text over other
docs' forward-references. Recorded here, not resolved unilaterally —
`.ai/sessions/`/`.ai/reviews/` population remains unscheduled pending a
Change Request, same disposition as the Milestone 6 precedent.

Milestone 10 (CI foundation) is now underway: authored
`.github/workflows/ci.yml`, per `docs/sprints/sprint-01.md`, §15, §16.
Five jobs on `pull_request` → `main`: `lint`, `typecheck`, `test`,
`build` each run `pnpm install --frozen-lockfile` then `pnpm exec turbo
run <task> --filter="...[${{ github.event.pull_request.base.sha }}]"`
(Turborepo-filtered to packages changed since the PR base, per §16;
using the PR base commit SHA directly rather than `origin/<branch>`,
because `actions/checkout`'s `fetch-depth: 0` is not guaranteed to
create a resolvable `origin/main` remote-tracking ref — the SHA is
always present in a full-history checkout and is the pattern
Turborepo's own GitHub Actions guide recommends). A fifth job, `mobile`,
runs `flutter analyze`/`flutter test` (pinned to Flutter 3.44.8,
matching the version validated at Milestone 8) but only gated on
`apps/mobile/**` changes (§16) — since `apps/mobile` is not a
pnpm/Turborepo workspace member (ADR-0002), gating is done with a
`git diff --quiet <base-sha>...HEAD -- apps/mobile` step rather than
`turbo --filter`; the job always runs but its Flutter steps are
individually skipped (not the whole job) when irrelevant, so it stays
green and safely required without blocking non-mobile PRs. Validated:
YAML parses correctly (Prettier `--check` passes; a standalone
`pip install pyyaml` + `yaml.safe_load` parse confirms 5 jobs with the
expected step counts — no `actionlint`/`yamllint` binary was available
in this environment, so this is the deepest local static validation
possible), and every underlying command the workflow calls
(`turbo run lint typecheck test build`, `flutter analyze`, `flutter
test`) was re-run directly and still passes after the Milestone 9
tooling additions.

**Update — the workflow has now actually executed on GitHub, and real
CI found two real bugs local validation missed.** First commit
`6ff7e44` was pushed to `origin/main` (pre-existing, verified-empty
repo at `github.com/amiyamishra1990-rgb/natkhat-ai`), then PR
[#1](https://github.com/amiyamishra1990-rgb/natkhat-ai/pull/1)
(`chore/project-milestone-10-ci-verification`, content limited to
`PROJECT.md` tracking updates per the user's explicit scope
instruction) was opened specifically to exercise `ci.yml`'s
`pull_request` trigger. The first real run failed 4/5 jobs (`mobile`
correctly passed — no `apps/mobile/**` changes to gate on):
`lint`/`typecheck`/`test`/`build` all failed identically at `pnpm
install --frozen-lockfile` with `ERR_PNPM_OUTDATED_LOCKFILE` —
`package.json` declared `"@natkhat-ai/config-prettier": "workspace:*"`
but `pnpm-lock.yaml` still had `workspace:^`, because that field was
hand-edited for convention-consistency at Milestone 9 without
re-running `pnpm install` afterward. Reproduced locally (`pnpm install
--frozen-lockfile` failed identically), fixed with a plain `pnpm
install` (resyncs the lockfile; 1-line diff, nothing else changed),
verified, committed (`fix(repo): sync pnpm-lock.yaml specifier for
@natkhat-ai/config-prettier`), and pushed. The second run then failed
the same 4 jobs differently: `ERR_PNPM_UNSUPPORTED_ENGINE` —
`@commitlint/cli@21.2.1` requires Node `>=22.12.0`, but `.nvmrc`/
`engines.node` still targeted the Milestone 1 default of Node 20,
which `ci.yml` correctly installs via `setup-node`. This had never
surfaced locally because the local dev environment already runs Node
v24. Confirmed no ADR or constitution pins a specific Node version (a
`docs/` grep for "Node" version references returned nothing), so this
is a tooling-config fix, not an architecture change: bumped `.nvmrc`
(`20` → `22`) and root `package.json`'s `engines.node` (`>=20.0.0` →
`>=22.12.0`), re-verified `pnpm install --frozen-lockfile` and `turbo
run lint typecheck test build` locally, committed (`fix(repo): bump
Node engine requirement to >=22.12.0`) and pushed. The third run
passed all 5 jobs:
[run 30753691637](https://github.com/amiyamishra1990-rgb/natkhat-ai/actions/runs/30753691637)
— `lint`, `typecheck`, `test`, `build`, `mobile` all green. This is
exactly the class of defect Milestone 10 exists to catch (real,
clean-room CI vs. a long-lived local dev environment with stale state)
— see Build Status.

Job names (`lint`, `typecheck`, `test`, `build`) were deliberately made
four separate jobs, not one job running the combined `turbo run lint
typecheck test build` command from §16's first bullet as a single
status check — this is a judgment call, not an unambiguous reading of
§16: the second bullet ("Required status checks on main: lint,
typecheck, test, build") names four independently-selectable check
names, which only exist as four distinct GitHub status checks if they
are four distinct jobs. Recorded here as an interpretation, not a
silent architecture decision.

**Branch protection on `main` is now configured and independently
verified**, completing the other half of Milestone 10. After all five
checks were confirmed passing with their exact real GitHub Actions
context names (`lint`, `typecheck`, `test`, `build`, `mobile` — read
directly from `gh pr checks`, not assumed from the YAML), applied:

```
gh api repos/amiyamishra1990-rgb/natkhat-ai/branches/main/protection \
  --method PUT \
  -F required_status_checks[strict]=true \
  -F 'required_status_checks[contexts][]=lint' \
  -F 'required_status_checks[contexts][]=typecheck' \
  -F 'required_status_checks[contexts][]=test' \
  -F 'required_status_checks[contexts][]=build' \
  -F 'required_status_checks[contexts][]=mobile' \
  -F enforce_admins=true \
  -F 'required_pull_request_reviews[required_approving_review_count]=1' \
  -F restrictions=null
```

Combines §16's required status checks with §17's "main protected,
required review + status checks." Verified by an independent `GET`
(not just trusting the `PUT` response) — the returned config matches
exactly: 5 required contexts, `strict: true` (branches must be
up-to-date before merging), `required_approving_review_count: 1`,
`enforce_admins: true`, force-push and branch deletion both disabled.
Also verified functionally, not just by reading config back: PR #1's
own `gh pr view` now reports `mergeStateStatus: BLOCKED` /
`reviewDecision: REVIEW_REQUIRED` — branch protection is actually
being enforced by GitHub, not just recorded as configured.

**Practical consequence worth flagging directly**: `enforce_admins:
true` means this is not bypassable by repo admins either — **the repo
owner cannot self-merge PR #1** (or any future PR) without at least one
approving review from a different account. `.github/CODEOWNERS` is
still a placeholder with no real reviewers assigned (Milestone 1), and
this is currently a single-maintainer repository, so as configured,
_nothing can be merged to `main` right now without either adding a
second collaborator to review, or the user deliberately relaxing
`required_approving_review_count`/`enforce_admins` themselves._ This
was not silently softened (e.g. by dropping `enforce_admins` or the
review requirement) because §17 explicitly calls for "required review

- status checks" and doing so unilaterally would be weakening
  governance this session wasn't asked to touch — surfaced instead so
  the user can make that call. PR #1 is left open, unmerged, for the
  user's own review/merge decision.

**A correction to Milestone 9's own record**, found while following
this session's explicit instruction to revisit Milestone 9's
developer-tooling issues before building CI on top of them: the
Milestone 9 Change Log/Pending-Tasks entry stating that
`core.filemode=false` would prevent `.husky/pre-commit` and
`.husky/commit-msg` from running on Linux/Mac (because `chmod +x`
doesn't survive into the git index here) **was wrong, and the
recommended fix (`git update-index --chmod=+x ...`) was unnecessary.**
Reading `node_modules/husky/index.js` and `node_modules/husky/husky`
shows Husky v9 sets `core.hooksPath` to `.husky/_` (the gitignored,
auto-regenerated directory — **not** `.husky/` itself, correcting
another inaccuracy in the Milestone 9 write-up), and the shim git
actually executes there sources a dispatcher (`h`) that runs the
matching top-level file via `sh -e ".husky/<hook-name>" "$@"` — an
explicit interpreter invocation, not a direct `execve` of that file.
`sh` only needs the target file to be _readable_, not executable.
Verified empirically, not just by reading the source: with
`.husky/commit-msg` at mode `644` (confirmed via `ls -la`), directly
invoking `.husky/_/commit-msg` (what git actually calls) against a
non-conventional message correctly failed with commitlint's
`subject-empty`/`type-empty` errors and exit code 1, and against a
conventional message correctly exited 0 — proving the hook fires and
enforces correctly with no executable bit on the tracked file. The
`.husky/_/` shim layer itself (which _does_ need to be executable) is
never committed — Husky's own `.husky/_/.gitignore` (`*`) excludes it,
and `pnpm install`'s `"prepare": "husky"` script regenerates it fresh
with mode `0o755` on whichever machine runs the install, including
Linux CI runners. **No git-index or repository state needed changing
to fix this** — it was already correct; only the Milestone 9 record was
wrong. See Pending Tasks/Blockers for the correction to that entry, and
the original Change Log entry is left as-is (append-only, per this
project's own decision-log discipline) rather than rewritten.

Milestone 9 (Developer tooling) remains complete, modulo the correction
above: installed `husky`,
`lint-staged`, `@commitlint/cli`, and `@commitlint/config-conventional`
as root devDependencies (`pnpm add -D -w`), per
`docs/sprints/sprint-01.md`, §15, §17. `pnpm exec husky init` added the
`"prepare": "husky"` script, which sets `core.hooksPath` to `.husky/_`
(not `.husky/` itself — see the correction above) on every `pnpm
install`; `.husky/pre-commit` runs `pnpm exec lint-staged` and
`.husky/commit-msg` runs `pnpm exec commitlint --edit "$1"`.
`commitlint.config.js` extends `@commitlint/config-conventional`
(Conventional Commits, per §17) — validated directly against both a
non-conventional message (correctly rejected: `subject-empty`,
`type-empty`) and a conventional one (`chore(repo): ...`, correctly
accepted). Lint-staged is configured in `.lintstagedrc.cjs` rather than
inline in `package.json` because it needs a function-based entry: since
ESLint v9's flat config resolves `eslint.config.*` relative to
`process.cwd()` and not per linted file, backend files must be linted
via `pnpm --filter backend exec eslint --fix` (which sets `cwd` to
`apps/backend`) rather than a plain `eslint --fix` run from the repo
root — a plain root-level invocation was tried first and failed with
"ESLint couldn't find an eslint.config.(js|mjs|cjs) file", confirming
this is a real constraint, not a hypothetical one. A second glob,
`**/*.{ts,tsx,js,jsx,json,md,mdx,yml,yaml}`, runs `prettier --write`
repo-wide; the root `package.json` now has a `"prettier":
"@natkhat-ai/config-prettier"` field (plus `@natkhat-ai/config-prettier`
and `prettier` added as root devDependencies, matching the consumption
pattern documented in `packages/config-prettier/README.md`) so
root-level files (docs, scripts, config files) format against the
Milestone 7 shared config rather than Prettier's defaults. Added
`.prettierignore` excluding `apps/mobile/` (Flutter/Dart, not a
Prettier consumer per ADR-0002) and generated output. Validated
end-to-end with disposable fixtures created inside `apps/backend/src/`
(staged, run through `pnpm exec lint-staged`, then unstaged and
deleted — never committed, same disposable-fixture pattern as
Milestone 7): a badly-formatted-but-lint-clean file was correctly
reformatted by both tasks; a file with a real lint violation
(`@typescript-eslint/no-unused-vars`) was correctly caught and the
task run correctly failed (non-zero exit), proving the hook would
actually block a real commit rather than silently passing.

~~One item is flagged, not silently resolved: this environment has
`core.filemode=false`... whoever performs the first real commit must
explicitly force the bit...~~ — **superseded by the correction above**:
this was a false alarm (the executable bit on these two files is not
required at all), left struck through rather than deleted so the
correction is traceable, per this project's append-only discipline.

Milestones 1, 1.5, 2, 5, 6, 7, and 8 remain complete and approved (see
prior Change Log entries for detail: Root Repository Scaffold;
Repository Governance Synchronization, including ratification of the
Child Privacy & Safety Constitution; Governance population/
`change-request-process.md`; Module Registry scaffolding/
`docs/modules/TEMPLATE.md`; Engineering standards docs; Shared config
packages — `packages/config-typescript`, `packages/config-eslint`,
`packages/config-prettier`). Milestone 8 (App scaffolds): `apps/backend`
created via `nest new` (NestJS 11), wired to all three Milestone 7
shared config packages —
`tsconfig.json` extends `@natkhat-ai/config-typescript/base.json`
(overriding only the Nest-required decorator/CommonJS-interop fields),
`eslint.config.mjs` imports `@natkhat-ai/config-eslint/base`, and
`package.json`'s `"prettier"` field points at
`@natkhat-ai/config-prettier`. Added a `typecheck` script (`tsc
--noEmit`) and a `dev` script (`nest start --watch`) so the app
participates in all five `turbo.json` tasks. `turbo run typecheck lint
test build` all pass for `apps/backend`; `flutter analyze` and `flutter
test` both pass for `apps/mobile`. Fixed a real bug surfaced during
wiring: `@natkhat-ai/config-eslint` needed an explicit `"exports"` map
(`"./base": "./base.js"`) — Node's ESM resolver does not
extension-guess bare subpath imports, so the documented `import ...
from '@natkhat-ai/config-eslint/base'` usage was previously unusable by
a real consumer; this is now fixed and re-verified. `apps/mobile`
created via `flutter create --platforms=android,ios --org ai.natkhat
--project-name mobile` (org is a placeholder — no ASPOVO/Natkhat domain
convention is ratified anywhere yet; easy to change before any store
submission, not a Sprint 01 blocker). Per ADR-0002, `apps/mobile` is
intentionally **not** a pnpm workspace member (no `package.json`) and
does not consume the shared TS/ESLint/Prettier packages — confirmed via
`pnpm list -r` still showing exactly 4 workspace projects
(`backend` + 3 config packages) after `flutter create`. No `turbo.json`
root-task wiring was added for `flutter analyze`/`flutter test`; that is
left to Milestone 10 (CI foundation), which is better positioned to
decide root-task vs. plain CI-workflow-step given full `ci.yml`
context — see Change Log for detail. Application scaffolds only — no
business logic, authentication, RBAC, database, storage, APIs, or AI
integration was implemented in either app; both are exactly the default
generator output plus tooling wiring (and, for `apps/backend`, a
re-format to the shared Prettier style) and a one-line `pubspec.yaml`
description. No CI workflow yet (Milestone 10). No commits exist yet in
git; that remains the user's call.

A documentation discrepancy (not a scope conflict) was found and
recorded, not silently resolved: the Engineering Constitution's own
text (line "Detailed how-to documentation... is authored in a later
Sprint 01 milestone... Milestone 6") implies coding-standards.md,
branching-and-commits.md, release-strategy.md, dependency-management.md,
environment-management.md, code-review-workflow.md, and ci-cd.md are
also Milestone 6 deliverables, and `docs/sprints/sprint-01.md` §4's
folder-structure target lists them under the same `docs/engineering/`
annotation. However, §15's explicit Milestone 6 definition — the
operative Milestone Breakdown, and the one the user's own instructions
for this milestone matched verbatim — lists only the seven checklists
plus feature-flags/security-by-design/testing-strategy/versioning/
observability. Those seven other how-tos were treated as out of
Milestone 6's actual scope and are now tracked in
`docs/engineering/README.md` as unscheduled, pending a Change Request
to assign them to a future milestone.

## Repository Structure

Current state (governance documentation + root scaffold):

```
natkhat-ai/
├── PROJECT.md
├── README.md
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── turbo.json
├── .npmrc
├── .nvmrc
├── .editorconfig
├── .gitignore
├── .env.example
├── .prettierignore              # Milestone 9
├── commitlint.config.js         # Milestone 9
├── .lintstagedrc.cjs            # Milestone 9
├── .husky/                      # Milestone 9
│   ├── pre-commit                # runs `pnpm exec lint-staged`
│   └── commit-msg                # runs `pnpm exec commitlint --edit "$1"`
├── apps/
│   ├── backend/               # NestJS — pnpm workspace member, wired to packages/config-*
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tsconfig.build.json
│   │   ├── nest-cli.json
│   │   ├── eslint.config.mjs
│   │   ├── prisma/                    # Sprint 03 M13+ — schema.prisma, migrations/
│   │   ├── src/                       # Sprint 03 M13–M20 — real implementation, synthetic data only
│   │   │   ├── identity-family/       # M14 — ADR-0008/ADR-0010 (entities + RLS)
│   │   │   ├── authorization/         # M15 — ADR-0009 (two-gate authorize(), authorization.types.ts)
│   │   │   ├── auth/                  # M15 — Firebase Admin SDK (rebuilt per ADR-0016)
│   │   │   ├── lifecycle/             # M16 — ADR-0015 (retention/deletion/export/backup-purge)
│   │   │   ├── audit/                 # M16 — audit-logging.md (append-only audit trail); M22 adds audit.controller.ts (GET /audit-events); M25 gates it with AdminAuthGuard
│   │   │   ├── consent/               # M17 — ADR-0011 scaffold (Track A only, Track B inactive)
│   │   │   ├── leo/                   # M18 — ADR-0012 (Conversation/Message/LeoMemory); M23 — leo.service.ts's startConversation/appendMessage now call AuthorizationService.authorize() for the new interact_with_leo Action
│   │   │   ├── ai-provider/           # M19 — ADR-0013 (Track A mock adapter only, Track B inactive)
│   │   │   └── admin-auth/            # M25 — admin-auth.guard.ts, admin-auth.service.ts, admin-user.repository.ts; gates GET /audit-events via Firebase session verification
│   │   └── test/
│   │       └── vertical-slice.e2e-spec.ts   # M20 — first end-to-end vertical slice (PR #21); updated at M23 for the new authorization gate
│   ├── admin/                  # M22 — Next.js (ADR-0014); pnpm workspace member; audit-log view only (Founder Decision F.3); M25 adds Firebase-session sign-in
│   │   ├── package.json
│   │   ├── proxy.ts                # M25 — request-time session check (renamed from middleware.ts)
│   │   ├── app/sign-in/page.tsx    # M25 — parent/admin sign-in
│   │   ├── app/api/session/route.ts # M25 — session cookie exchange
│   │   ├── app/audit/page.tsx      # Server Component fetching GET /audit-events (now behind AdminAuthGuard)
│   │   ├── lib/firebase-client.ts  # M25
│   │   ├── lib/session.ts          # M25
│   │   └── README.md
│   ├── website/                 # M22 — Next.js (ADR-0014); pnpm workspace member; static/marketing shell only (Founder Decision F.4), zero forms/data collection
│   │   ├── package.json
│   │   └── app/
│   └── mobile/                 # Flutter — NOT a pnpm workspace member (ADR-0002)
│       ├── pubspec.yaml
│       ├── analysis_options.yaml
│       ├── lib/main.dart
│       ├── test/widget_test.dart
│       ├── android/
│       └── ios/
├── packages/
│   ├── config-typescript/
│   │   ├── package.json
│   │   ├── base.json
│   │   └── README.md
│   ├── config-eslint/
│   │   ├── package.json
│   │   ├── base.js
│   │   ├── eslint.config.js
│   │   └── README.md
│   └── config-prettier/
│       ├── package.json
│       ├── index.json
│       └── README.md
├── docs/
│   ├── README.md
│   ├── constitution/
│   │   ├── company/aspovo-constitution.md      # placeholder
│   │   ├── product/natkhat-ai-constitution.md
│   │   ├── product/child-privacy-and-safety-constitution.md
│   │   └── engineering/engineering-constitution.md
│   ├── decisions/
│   │   ├── ADR-0001-monorepo.md
│   │   ├── ADR-0002-flutter.md
│   │   ├── ADR-0003-backend.md
│   │   ├── ADR-0004-database.md
│   │   ├── ADR-0005-authentication.md
│   │   ├── ADR-0006-data-privacy-compliance.md
│   │   ├── ADR-0007-target-audience-interim-posture.md
│   │   ├── ADR-0008-core-data-model-parent-family-child.md      # Sprint 02 M1
│   │   ├── ADR-0009-authorization-and-session-architecture.md   # Sprint 02 M2
│   │   ├── ADR-0010-encryption-and-tenant-isolation-design.md   # Sprint 02 M3
│   │   ├── ADR-0011-consent-architecture.md                     # Sprint 02 M5 — Proposed
│   │   ├── ADR-0012-leo-memory-and-conversation-isolation-design.md # Sprint 02 M6
│   │   ├── ADR-0013-ai-provider-abstraction-and-multi-provider-compatibility.md # Sprint 02 M8 — Proposed
│   │   ├── ADR-0014-adopt-nextjs-for-admin-and-website-applications.md # Sprint 02 M10
│   │   ├── ADR-0015-child-data-lifecycle-architecture.md        # Sprint 02 M4
│   │   ├── ADR-0016-firebase-auth-and-google-cloud-migration.md # Sprint 03, founder-directed; 2026-08-31 amendment records Storage → Google Cloud Storage
│   │   ├── ADR-0017-github-actions-cicd.md                      # Sprint 05 M24 — records existing GitHub Actions CI/CD
│   │   └── decision-log.md
│   ├── architecture/
│   │   ├── overview.md
│   │   ├── observability.md
│   │   ├── authorization-and-sessions.md          # Sprint 02 M2
│   │   ├── data-classification-and-isolation.md   # Sprint 02 M3
│   │   ├── data-lifecycle.md                      # Sprint 02 M4
│   │   ├── consent-architecture.md                # Sprint 02 M5
│   │   ├── ai-memory-isolation.md                 # Sprint 02 M6
│   │   ├── audit-logging.md                       # Sprint 02 M7
│   │   ├── ai-provider-boundary.md                # Sprint 02 M8
│   │   └── deployment-india.md                    # Sprint 02 M9
│   ├── api/README.md
│   ├── engineering/
│   │   ├── README.md
│   │   ├── review-checklist.md
│   │   ├── change-request-process.md
│   │   ├── feature-flags.md
│   │   ├── security-by-design.md
│   │   ├── testing-strategy.md
│   │   ├── versioning.md
│   │   └── checklists/
│   │       ├── repository-checklist.md
│   │       ├── sprint-checklist.md
│   │       ├── pull-request-checklist.md
│   │       ├── release-checklist.md
│   │       ├── security-checklist.md
│   │       ├── production-checklist.md
│   │       └── ai-review-checklist.md
│   ├── product/README.md
│   ├── research/README.md
│   ├── modules/
│   │   ├── README.md
│   │   ├── TEMPLATE.md
│   │   ├── identity-family/README.md   # Sprint 02 M1 — Proposed
│   │   └── leo-companion/README.md     # Sprint 02 M6 — Proposed
│   ├── knowledge/
│   │   ├── README.md
│   │   ├── lessons-learned/
│   │   ├── performance-findings/
│   │   ├── security-discoveries/
│   │   ├── flutter-best-practices/
│   │   ├── nestjs-best-practices/
│   │   ├── supabase-findings/
│   │   ├── developer-onboarding/
│   │   └── ai-agent-learnings/
│   └── sprints/
│       ├── sprint-01.md   # Complete, permanently merged
│       ├── sprint-02.md   # Complete, permanently merged
│       ├── sprint-03.md   # Complete, permanently merged — M12–M20
│       ├── sprint-04.md   # Complete, permanently merged — M21–M23 (PRs #23, #24, #25)
│       ├── sprint-05.md   # Complete, permanently merged — M24–M25 (PRs #26, #27)
│       └── sprint-06.md   # "Leo's Real Experience" kickoff — H.1–H.8 decided; M26 in progress, M27–M30 not yet authorized
├── .ai/
│   ├── prompts/                  # Milestone 11 — populated
│   │   ├── README.md
│   │   ├── draft-adr.md
│   │   ├── draft-module-doc.md
│   │   ├── run-review-pass.md
│   │   └── resume-milestone.md
│   ├── context/README.md
│   ├── context/agent-workflow.md
│   ├── sessions/README.md          # still a placeholder — not in Milestone 11's scope
│   └── reviews/README.md           # still a placeholder — not in Milestone 11's scope
├── infrastructure/
│   ├── README.md
│   ├── gcp/README.md
│   ├── supabase/README.md
│   └── docker/README.md
├── scripts/
│   ├── setup.sh
│   └── check-env.ts
└── .github/
    ├── CODEOWNERS
    ├── PULL_REQUEST_TEMPLATE.md
    ├── ISSUE_TEMPLATE/
    │   ├── bug_report.md
    │   └── feature_request.md
    └── workflows/
        └── ci.yml         # Milestone 10 — lint, typecheck, test, build, mobile
```

`apps/mobile` remains a scaffold only (Milestone 8) — no business
logic, database, auth, storage, APIs, or AI integration. `apps/backend`
was a scaffold only through Sprint 02; Sprint 03 (M13–M20) implemented
real business logic, schema, authentication, and AI-boundary code
against it — see the Sprint 03 Milestone Status table above — but only
against synthetic/fictional data in a non-production environment, per
`docs/sprints/sprint-03.md`, §2.2/§10. `apps/admin` and `apps/website`
now exist (Sprint 04 M22, PR #24) as real, CI-integrated Next.js
applications — `apps/admin` is scoped strictly to Founder Decision F.3
(audit-log data only) and, as of Sprint 05 M25 (PR #27), sits behind a
Firebase-session sign-in flow and `AdminAuthGuard` (Known Risk #17
resolved); `apps/website` is a static/marketing shell only (Founder
Decision F.4, zero forms or data collection).
`node_modules/`, `dist/`, `.turbo/`, `.dart_tool/`, `build/`, `.idea/`,
and other generated/local files under `apps/` are gitignored (nested
`.gitignore` files for `apps/mobile`, root `.gitignore` for
`apps/backend`) and are not shown above. `.husky/_/` (Husky's internal
helper directory) is self-gitignored via its own generated
`.husky/_/.gitignore` (`*`) and is also not shown above.

## Approved Architecture

Single monorepo (`natkhat-ai/`), Turborepo over pnpm workspaces. Only
the apps, packages, governance scaffolding, and (as of Sprint 03)
synthetic-data-only backend implementation each milestone actually
authorized exist — nothing is built speculatively. Full description:
`docs/sprints/sprint-01.md`, §3 (`docs/architecture/overview.md` not
yet authored); Sprint 03's implementation scope is
`docs/sprints/sprint-03.md`, §2.

## Approved Tech Stack

| Layer                   | Technology                   | ADR                                                                                                                                                                              |
| ----------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Monorepo tooling        | Turborepo + pnpm workspaces  | ADR-0001                                                                                                                                                                         |
| Mobile                  | Flutter                      | ADR-0002                                                                                                                                                                         |
| Backend                 | NestJS                       | ADR-0003                                                                                                                                                                         |
| Admin (Sprint 04 M22)   | Next.js                      | ADR-0014 (implemented, Sprint 04 M22, audit-log data only — Founder Decision F.3; Firebase-session auth guard added Sprint 05 M25, PR #27)                                       |
| Website (Sprint 04 M22) | Next.js                      | ADR-0014 (implemented, Sprint 04 M22, static/marketing shell only — Founder Decision F.4)                                                                                        |
| Database                | PostgreSQL, via Google Cloud | ADR-0004 (implemented, Sprint 03 M13/M14, synthetic data only; hosting amended by ADR-0016)                                                                                      |
| ORM                     | Prisma                       | ADR-0004 (implemented, Sprint 03 M13/M14)                                                                                                                                        |
| Auth                    | Firebase Authentication      | ADR-0016 (implemented, Sprint 03 M15, dev project only; supersedes ADR-0005's auth clause)                                                                                       |
| Storage                 | Google Cloud Storage         | ADR-0016 amendment, "Amendment — Storage (2026-08-31)" — decision recorded only, no implementation code exists or is authorized; supersedes ADR-0005's Supabase Storage decision |
| Cloud                   | Google Cloud (GCP)           | ADR-0016                                                                                                                                                                         |
| CI/CD                   | GitHub Actions               | ADR-0017 (records the already-implemented choice, in effect since Sprint 01 Milestone 10)                                                                                        |

Full detail: `docs/constitution/product/natkhat-ai-constitution.md`.

## Product Constitution References

- [docs/constitution/product/natkhat-ai-constitution.md](docs/constitution/product/natkhat-ai-constitution.md)
- [docs/constitution/product/child-privacy-and-safety-constitution.md](docs/constitution/product/child-privacy-and-safety-constitution.md) — Tier-1 amendment, same authority level as the Product Constitution

## Engineering Constitution References

- [docs/constitution/engineering/engineering-constitution.md](docs/constitution/engineering/engineering-constitution.md)

## ADR Index

| ADR                                                                                             | Title                                                                                     | Status                                                                                                                                                                                                                                                                              |
| ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [ADR-0001](docs/decisions/ADR-0001-monorepo.md)                                                 | Adopt a Single Monorepo (Turborepo + pnpm Workspaces)                                     | Accepted                                                                                                                                                                                                                                                                            |
| [ADR-0002](docs/decisions/ADR-0002-flutter.md)                                                  | Adopt Flutter for the Mobile Application                                                  | Accepted                                                                                                                                                                                                                                                                            |
| [ADR-0003](docs/decisions/ADR-0003-backend.md)                                                  | Adopt NestJS for the Backend Application                                                  | Accepted                                                                                                                                                                                                                                                                            |
| [ADR-0004](docs/decisions/ADR-0004-database.md)                                                 | Adopt PostgreSQL (via Supabase) with Prisma — Decision Recorded, Implementation Deferred  | Accepted — Implementation Deferred (hosting clause amended 2026-08-23 by ADR-0016)                                                                                                                                                                                                  |
| [ADR-0005](docs/decisions/ADR-0005-authentication.md)                                           | Adopt Supabase Auth — Decision Recorded, Implementation Deferred                          | Accepted — Implementation Deferred (authentication clause superseded 2026-08-23 by ADR-0016; Storage clause superseded 2026-08-31 by ADR-0016's amendment)                                                                                                                          |
| [ADR-0006](docs/decisions/ADR-0006-data-privacy-compliance.md)                                  | Data Privacy & Compliance Engineering Requirements                                        | Accepted — Engineering Requirements Ratified; Legal Validation Required                                                                                                                                                                                                             |
| [ADR-0007](docs/decisions/ADR-0007-target-audience-interim-posture.md)                          | Interim Target-Audience Engineering Compliance Posture                                    | Accepted — Target Market/Age Range Founder-Ratified (India, ages 4–10); India DPDP Legal Validation Required                                                                                                                                                                        |
| [ADR-0008](docs/decisions/ADR-0008-core-data-model-parent-family-child.md)                      | Core Data Model — Parent/Family/Child Entities (Sprint 02 M1)                             | Accepted — Implementation Deferred                                                                                                                                                                                                                                                  |
| [ADR-0009](docs/decisions/ADR-0009-authorization-and-session-architecture.md)                   | Authorization & Session Architecture (Sprint 02 M2)                                       | Accepted — Implementation Deferred                                                                                                                                                                                                                                                  |
| [ADR-0010](docs/decisions/ADR-0010-encryption-and-tenant-isolation-design.md)                   | Encryption & Tenant-Isolation Implementation Design (Sprint 02 M3)                        | Accepted — Implementation Deferred                                                                                                                                                                                                                                                  |
| [ADR-0011](docs/decisions/ADR-0011-consent-architecture.md)                                     | Consent Architecture, Framework-Level (Sprint 02 M5)                                      | **Proposed** — founder direction on retention-survival/mechanism-shortlist recorded 2026-08-06; cannot reach Accepted until a final mechanism is selected and India DPDP legal validation confirms it                                                                               |
| [ADR-0012](docs/decisions/ADR-0012-leo-memory-and-conversation-isolation-design.md)             | Leo Memory & Conversation Isolation Design (Sprint 02 M6)                                 | Accepted — Implementation Deferred                                                                                                                                                                                                                                                  |
| [ADR-0013](docs/decisions/ADR-0013-ai-provider-abstraction-and-multi-provider-compatibility.md) | AI-Provider Abstraction & Multi-Provider Compatibility (Sprint 02 M8)                     | **Proposed** — cannot reach Accepted until at least one candidate provider's contract terms clear legal review (ADR-0006 §26)                                                                                                                                                       |
| [ADR-0014](docs/decisions/ADR-0014-adopt-nextjs-for-admin-and-website-applications.md)          | Adopt Next.js for Admin & Website Applications (Sprint 02 M10)                            | Accepted (records the already-locked choice; scaffolding implemented at Sprint 04 M22)                                                                                                                                                                                              |
| [ADR-0015](docs/decisions/ADR-0015-child-data-lifecycle-architecture.md)                        | Child-Data Lifecycle Architecture — Retention/Deletion/Export/Backup-Purge (Sprint 02 M4) | Accepted — Implementation Deferred (founder-approved 2026-08-05; closes the M4 governance gap; §13.3 audit/security-log retention remains APPROVED PROVISIONALLY, pending India DPDP legal review)                                                                                  |
| [ADR-0016](docs/decisions/ADR-0016-firebase-auth-and-google-cloud-migration.md)                 | Migrate Off Supabase — Firebase Authentication and Google Cloud (founder-directed)        | Accepted — Founder-Authorized, Effective Immediately (2026-08-23; supersedes ADR-0005's authentication clause; amends ADR-0004's hosting clause; 2026-08-31 amendment supersedes the original "Storage explicitly out of scope" with Storage → Google Cloud Storage, decision-only) |
| [ADR-0017](docs/decisions/ADR-0017-github-actions-cicd.md)                                      | Adopt GitHub Actions for CI/CD (Sprint 05 M24)                                            | Accepted (documentation-of-existing-fact — records the CI system in effect since Sprint 01 Milestone 10; no CI behavior change)                                                                                                                                                     |

All ADRs above are additionally governed by the
[Child Privacy & Safety Constitution](docs/constitution/product/child-privacy-and-safety-constitution.md)
(Tier-1 Product Constitution Amendment). No ADR may contradict it; on
any privacy/child-safety question the constitution controls, per the
Governance Hierarchy (`docs/sprints/sprint-01.md`, §1). ADR-0006 and
ADR-0007 (2026-08-03) are the first ADRs to cite the Child Privacy &
Safety Constitution explicitly by section within their own Constitution
Alignment text, closing a traceability gap the Sprint 01 audit found in
ADR-0001–0005 (which cite only the Product/Engineering Constitutions
generically).

## Last Decision

2026-08-11 — ADR-0015 (Child-Data Lifecycle Architecture) promoted to
**Accepted — Implementation Deferred**, closing the Sprint 02 Milestone
4 governance gap: the founder had already approved the underlying
candidate values on 2026-08-05
(`docs/architecture/data-lifecycle.md`, §13 — soft→hard-delete window
90 days; backup-purge window 90 days with Tier-3 cryptographic erasure;
Leo memory's three-class retention model), and ADR-0015 formally records
those ratified values per `docs/sprints/sprint-02.md`, §5's
decision-maker note. Explicitly a business/product decision plus an
engineering design record, not a legal certification — this ADR does not
authorize any deletion job, backup system, export pipeline, or schema,
and one value it records (Tier 5 audit/security-log retention, §13.3) is
**APPROVED PROVISIONALLY only**, subject to change pending India DPDP
Act legal review of breach-notification/record-keeping obligations
(see
[docs/decisions/ADR-0015-child-data-lifecycle-architecture.md](docs/decisions/ADR-0015-child-data-lifecycle-architecture.md)).
Prior decision, still standing: 2026-08-04 — Founder ratification of
ADR-0007 §D: initial target market is India (single market at launch,
future international expansion preserved as a later decision) and
target age range is 4–10, for a parent-managed childhood companion.
Explicitly a business/product decision, not a legal certification —
India DPDP Act legal validation of the eventual consent-capture design
remains open (see
[docs/decisions/ADR-0007-target-audience-interim-posture.md](docs/decisions/ADR-0007-target-audience-interim-posture.md)).

## Feature Roadmap

Not yet started. Neither Sprint 01 nor Sprint 02 authorizes business
features or their implementation (see Product Constitution) — Sprint 02
is a design/architecture and compliance documentation layer only (see
Sprint Goal).

## Pending Tasks / Next Tasks

- **Sprint 01 is permanently merged into `main`** (merge commit
  `87de72d`, 2026-08-03) — PR #1's second-reviewer deadlock is resolved
  (see Known Risk #11). No action needed here.
- **A data-privacy/compliance ADR and an interim target-audience ADR now
  exist** —
  [ADR-0006](docs/decisions/ADR-0006-data-privacy-compliance.md) and
  [ADR-0007](docs/decisions/ADR-0007-target-audience-interim-posture.md),
  accepted 2026-08-03; ADR-0007 updated 2026-08-04 with founder
  ratification of target market (India, single market at launch) and
  age range (4–10) — see ADR-0007 §D. Both clear their respective
  ADR-existence gates on ADR-0004 (database) and ADR-0005 (auth), but
  neither authorizes implementation by itself — see ADR-0004/ADR-0005
  gate status and Known Risk #10 for the specific legal-validation items
  (India DPDP Act consent-mechanism sufficiency, model-provider terms,
  breach-notification obligations, data-localization) that remain before
  schema, migration, or auth code may be written.
- **Correction:** this bullet previously stated "Sprint 02 has no
  approved Sprint Document yet." That was stale as of 2026-08-04 and is
  false as of this update — `docs/sprints/sprint-02.md` exists, was
  approved, and Milestones 1–10 of its 11 are complete and merged into
  `main` (see Current Status's Sprint 02 Milestone Status table). Left
  here, struck through in effect rather than deleted, per this
  repository's append-only correction discipline (see the Milestone 9
  executable-bit precedent in Completed Tasks).
- **Sprint 02 Milestone 11 (this update) is in progress.** Remaining
  after this PROJECT.md correction: none of Sprint 02's still-open
  founder/legal gates are resolved by M11 — M11's own Definition of Done
  is "PROJECT.md accurately reflects Sprint 02's actual end state," not
  closing those gates. Specifically still open (see Known Risks for
  full detail): (a) India DPDP legal validation of the consent-capture
  design and final selection of a specific verifiable-parental-consent
  mechanism from ADR-0011's shortlist — ADR-0011 stays Proposed until
  both occur; (b) AI/model-provider data-handling and training-use
  contract-terms legal review before any provider evaluated by ADR-0013
  is actually selected — ADR-0013 stays Proposed; (c) India DPDP
  data-localization confirmation before M9's candidate region
  (`docs/architecture/deployment-india.md`) becomes a real infrastructure
  decision; (d) regulatory breach-notification obligations/timelines
  under India's DPDP Act (ADR-0006 §30), which also gates whether
  ADR-0015 §13.3's 3-year audit/security-log retention period stays as
  approved-provisionally or must change. If a future sprint intends to
  implement any Sprint 02 design (database, auth, consent capture,
  AI-provider integration, or India infrastructure), all of the above
  are explicit prerequisites, not implementation-time cleanup.
- Unscheduled: `.ai/sessions/` and `.ai/reviews/` remain empty
  structural placeholders — Milestone 11 scoped only to
  `.ai/prompts/` per `docs/sprints/sprint-01.md`, §15's exact wording.
  `docs/engineering/checklists/ai-review-checklist.md` (line 31–33)
  reads as if session-log population was also part of Milestone 11;
  flagged, not resolved — needs a Change Request to assign, or a
  correction to that checklist's cross-reference.
- Turborepo root-task wiring for `flutter analyze`/`flutter test`
  (referenced by ADR-0002/`sprint-01.md` §11 as "a Turborepo task") was
  decided at Milestone 10: **not added** — `apps/mobile` stays outside
  the pnpm/turbo dependency graph per ADR-0002, and `ci.yml`'s `mobile`
  job invokes the Flutter CLI directly instead (see Current Status).
- Unscheduled: coding-standards.md, branching-and-commits.md,
  release-strategy.md, dependency-management.md,
  environment-management.md, code-review-workflow.md, ci-cd.md — named
  in the Engineering Constitution's text and `sprint-01.md` §4's folder
  target, but not in §15's explicit Milestone 6 definition. Needs a
  Change Request to assign to a milestone.
- No shared-infrastructure implementation (auth, RBAC, audit logging,
  event framework, database connection, security middleware,
  observability, or any packages beyond the three tooling-config
  packages created at Milestone 7) is scheduled in Sprint 01 — any such
  work requires a new Change Request
  (`docs/engineering/change-request-process.md`) resulting in a Sprint
  Document amendment/new ADR before implementation begins.

## Completed Tasks

- Milestone 0 (prior): governance documentation foundation — see
  Change Log below.
- Milestone 1: `git init` (default branch renamed `master` → `main` to
  match §17); root tooling config (`package.json`,
  `pnpm-workspace.yaml`, `turbo.json`, `.npmrc`, `.nvmrc`,
  `.editorconfig`, `.gitignore`, `.env.example`, root `README.md`);
  remaining `docs/` domains scaffolded with placeholder READMEs
  (`architecture/` incl. `overview.md`, `api/`, `engineering/`,
  `product/`, `research/`, `modules/`); `infrastructure/`
  (`gcp/`, `supabase/`, `docker/`) placeholders; `scripts/setup.sh` and
  `scripts/check-env.ts`; `.github/CODEOWNERS`,
  `PULL_REQUEST_TEMPLATE.md`, `ISSUE_TEMPLATE/`. No `apps/`,
  `packages/`, CI workflow, or shared config packages — those are
  Milestones 7–10.
- Milestone 1.5: created
  `docs/constitution/product/child-privacy-and-safety-constitution.md`
  (Tier-1 Product Constitution Amendment) verbatim from the directive
  the user supplied; updated `PROJECT.md` (this file), the Engineering
  Constitution (mandatory review gates + hierarchy reference), the
  Product Constitution (Trust-Above-All amendment), the ADR Index
  (governing-reference note, no new ADR), root `README.md` (Repository
  Governance reading order), `docs/engineering/README.md`, and
  `.ai/context/agent-workflow.md`; created
  `docs/engineering/review-checklist.md`. Documentation only. Approved
  by the user 2026-07-30.
- Milestone 2: authored `docs/engineering/change-request-process.md`
  in full (Proposal → Review → Decision → ADR/Decision Log →
  `PROJECT.md` update → Implementation, plus scope/roles/escalation
  rules), per `docs/sprints/sprint-01.md`, §10, §15; updated
  `docs/engineering/README.md` to reflect it. Documentation only.
- Milestone 5: authored `docs/modules/TEMPLATE.md` (fixed
  Vision/Requirements/Architecture/APIs/Database/Security/Testing/Deployment
  structure for future product modules), per
  `docs/sprints/sprint-01.md`, §13, §15; updated
  `docs/modules/README.md`. Documentation only — no module created.
- Milestone 6: authored the seven engineering checklists
  (`docs/engineering/checklists/`), `feature-flags.md`,
  `security-by-design.md`, `testing-strategy.md`, `versioning.md`, and
  `docs/architecture/observability.md`, per
  `docs/sprints/sprint-01.md`, §15, §19–§24; updated
  `docs/engineering/README.md`, `docs/architecture/overview.md`, and
  resolved forward-references in `docs/modules/TEMPLATE.md`.
  Documentation only.
- Milestone 7: created `packages/config-typescript`,
  `packages/config-eslint`, `packages/config-prettier` (each with its
  own `package.json`, config file, and README), per
  `docs/sprints/sprint-01.md`, §12, §15; ran `pnpm install` (now
  tracked via committed `pnpm-lock.yaml`) and validated all three
  against disposable out-of-repo fixtures and self-lint/self-format-check
  scripts — see Current Status above for detail. Updated
  `pnpm-workspace.yaml`'s comment. Tooling-config only — no apps, no
  business logic, no backend/AI/auth/RBAC/database/storage/API code.
- Milestone 8: scaffolded `apps/backend` (`nest new`, NestJS 11) and
  `apps/mobile` (`flutter create`), per `docs/sprints/sprint-01.md`,
  §15, ADR-0002, ADR-0003; wired `apps/backend` to all three Milestone
  7 shared config packages and validated `turbo run typecheck lint
test build`; validated `apps/mobile` via `flutter analyze`/`flutter
test` — see Current Status above for full detail. Fixed a missing
  `exports` map in `packages/config-eslint/package.json` discovered
  during wiring. Scaffolds only — no business logic, auth, APIs,
  database, AI integration, or Flutter features beyond the default
  generator output.
- Milestone 9: installed and wired `husky`, `lint-staged`, and
  commitlint (`@commitlint/cli` + `@commitlint/config-conventional`)
  as root devDependencies, per `docs/sprints/sprint-01.md`, §15, §17;
  `.husky/pre-commit` → `lint-staged`, `.husky/commit-msg` →
  `commitlint`, `.lintstagedrc.cjs` (ESLint on `apps/backend/**`,
  Prettier repo-wide), `commitlint.config.js`, `.prettierignore` — see
  Current Status above for full detail, including the discovered
  ESLint-v9-flat-config cwd constraint. Tooling only — no application
  code, business logic, or CI workflow changed. **Correction (Milestone
  10, 2026-08-02):** the executable-bit concern originally recorded
  here was a false alarm — see Current Status/Change Log for the
  empirical correction; no action was actually needed.
- Milestone 10: **fully complete**, per `docs/sprints/sprint-01.md`,
  §15, §16, §17 — `.github/workflows/ci.yml` authored (five jobs:
  `lint`, `typecheck`, `test`, `build`, `mobile`); first commit
  `6ff7e44` pushed to the pre-existing, verified-empty
  `github.com/amiyamishra1990-rgb/natkhat-ai`; the real workflow
  triggered via PR #1 and, after fixing two real bugs it caught (a
  `pnpm-lock.yaml` specifier drift and a Node engine requirement too
  low for `@commitlint/cli@21`), all five jobs verified passing on
  GitHub; branch protection on `main` configured with the confirmed
  real check names and independently verified both by reading the
  config back and by observing PR #1 actually become merge-blocked.
  Also corrected a factual error in Milestone 9's own record
  (executable-bit concern; see that entry above and Change Log). No
  application code, business logic, database, auth, or product
  functionality touched; no architecture, ADR, or Constitution changed.
  PR #1 left open, unmerged, for the user's own review — see Pending
  Tasks.
- Milestone 11: authored four starter prompt templates in
  `.ai/prompts/` (`draft-adr.md`, `draft-module-doc.md`,
  `run-review-pass.md`, `resume-milestone.md`), per
  `docs/sprints/sprint-01.md`, §15; updated `.ai/prompts/README.md`
  from a structural placeholder to an active index. Documentation
  only — see Current Status for full detail, including a flagged (not
  resolved) forward-reference discrepancy in
  `docs/engineering/checklists/ai-review-checklist.md` about
  `.ai/sessions/`.
- Milestone 12: **Sprint 01 close-out, fully complete** — verified all
  eleven prior milestones (0, 1, 1.5, 2, 5, 6, 7, 8, 9, 10, 11) and
  confirmed no unresolved Sprint 01 blocker; re-validated the
  Definition of Done (`docs/sprints/sprint-01.md`, §15) locally
  (`pnpm install --frozen-lockfile`, `turbo run lint typecheck test
build` 5/5, `flutter analyze`/`flutter test` both clean); reviewed §27
  Recommendation 6 (domain boundaries, Knowledge Vault categories,
  `.ai/` structure) as a read-only confirmation — no structural change
  needed; updated this file's Current Status, Completed Tasks,
  Pending Tasks, Blockers, Known Risks framing, Repository Health, and
  Change Log to reflect Sprint 01 as 100% complete. Documentation
  only — no application code, architecture, ADR, or governance
  document touched. See Current Status for the full Sprint 01
  Completion Checklist.
- **Sprint 02, Milestone 1 (Identity & Family Architecture):**
  `docs/modules/identity-family/README.md` and
  [ADR-0008](docs/decisions/ADR-0008-core-data-model-parent-family-child.md)
  (Accepted — Implementation Deferred). Design only — no schema,
  migration, or database.
- **Sprint 02, Milestone 2 (Authorization & Session Architecture):**
  `docs/architecture/authorization-and-sessions.md` and
  [ADR-0009](docs/decisions/ADR-0009-authorization-and-session-architecture.md)
  (Accepted — Implementation Deferred). Design only.
- **Sprint 02, Milestone 3 (Data Classification, Encryption &
  Tenant-Isolation Design):**
  `docs/architecture/data-classification-and-isolation.md` and
  [ADR-0010](docs/decisions/ADR-0010-encryption-and-tenant-isolation-design.md)
  (Accepted — Implementation Deferred). Design only — no encryption
  code, no key management implementation.
- **Sprint 02, Milestone 4 (Child-Data Lifecycle Architecture):**
  `docs/architecture/data-lifecycle.md`; founder approved candidate
  retention/deletion/export/backup-purge values 2026-08-05;
  [ADR-0015](docs/decisions/ADR-0015-child-data-lifecycle-architecture.md)
  authored and promoted to Accepted — Implementation Deferred,
  2026-08-11, closing the M4 governance gap (§13.3 audit/security-log
  retention remains APPROVED PROVISIONALLY, pending India DPDP legal
  review). Design only — no deletion job, backup system, or export
  pipeline implemented.
- **Sprint 02, Milestone 5 (Consent Architecture, Framework-Level):**
  `docs/architecture/consent-architecture.md` and
  [ADR-0011](docs/decisions/ADR-0011-consent-architecture.md) —
  **Proposed**, not Accepted: a non-binding consent-verification
  mechanism shortlist was produced for founder/legal review, but no
  mechanism was selected and India DPDP legal sufficiency was not
  validated, by design (out of M5's own scope). No consent-capture code,
  UI, or real consent record exists.
- **Sprint 02, Milestone 6 (Leo Memory & Conversation Isolation
  Architecture):** `docs/architecture/ai-memory-isolation.md`,
  `docs/modules/leo-companion/README.md`, and
  [ADR-0012](docs/decisions/ADR-0012-leo-memory-and-conversation-isolation-design.md)
  (Accepted — Implementation Deferred). Design only.
- **Sprint 02, Milestone 7 (Auditability & Observability
  Architecture):** `docs/architecture/audit-logging.md`, extending
  ADR-0006's auditability requirements — no dedicated new ADR was
  authored for this milestone. Design only.
- **Sprint 02, Milestone 8 (AI-Provider Data-Boundary & Multi-Provider
  Compatibility Architecture):**
  `docs/architecture/ai-provider-boundary.md` and
  [ADR-0013](docs/decisions/ADR-0013-ai-provider-abstraction-and-multi-provider-compatibility.md)
  — **Proposed**, not Accepted: cannot advance until at least one
  candidate provider's contract terms clear legal review (ADR-0006
  §26). No provider selected, evaluated comparatively, or contracted;
  no SDK integration, API call, or credential exists.
- **Sprint 02, Milestone 9 (India-First Deployment & Data-Residency
  Architecture):** `docs/architecture/deployment-india.md` — no
  dedicated new ADR; the region/data-residency decision itself remains
  gated on India DPDP data-localization confirmation (see Known Risks).
  Design only — no infrastructure provisioned.
- **Sprint 02, Milestone 10 (Admin/Website Stack Formalization, ADR
  only):**
  [ADR-0014](docs/decisions/ADR-0014-adopt-nextjs-for-admin-and-website-applications.md)
  (Accepted). Records the already-locked Next.js decision; does **not**
  authorize scaffolding `apps/admin` or `apps/website` — that requires
  separate founder approval in a future sprint.
- **Sprint 02, Milestone 11 (Design-Phase Close-Out & Governance
  Sync):** this `PROJECT.md` update — corrected Current
  Development Phase/Current Sprint/Sprint Goal/Current Milestone,
  added the Sprint 02 Milestone Status table to Current Status, added
  ADR-0008–ADR-0015 to the ADR Index, corrected the stale "Sprint 02
  has no approved Sprint Document" claim in Pending Tasks, added
  Sprint 02-specific Known Risks, updated Repository Structure/
  Repository Health/Major Decisions/Last Decision, and appended this
  Change Log entry. Per `docs/sprints/sprint-02.md`, §3, M11's own
  scope, only `PROJECT.md` was modified — no architecture, ADR,
  Constitution, `docs/sprints/sprint-02.md`, or implementation source
  touched. See Change Log for the full entry.

## Blockers

**None for Sprint 01 — it is permanently merged into `main`** (merge
commit `87de72d`, 2026-08-03; see Current Branch). The prior operational
item (PR #1 merge-blocked pending a second reviewer) is **resolved** —
see Known Risks and `docs/decisions/decision-log.md`.

**For Sprint 02 database/auth implementation specifically** (not a
Sprint 01 blocker, but a real one for that future work): ADR-0004 and
ADR-0005's textual prerequisite — "a dedicated data-privacy/compliance
ADR exists and is accepted" — is now satisfied by
[ADR-0006](docs/decisions/ADR-0006-data-privacy-compliance.md), and the
Product Constitution's Target Audience gate is addressed for engineering
purposes by
[ADR-0007](docs/decisions/ADR-0007-target-audience-interim-posture.md).
Both ADRs are explicit that this clears the ADR-existence blocker only —
implementation still requires the Legal Validation items in ADR-0006 and
the remaining open items in ADR-0007 §C (§C.1/§C.2/§C.7 are now
founder-ratified, ADR-0007 §D, 2026-08-04 — India, single market, ages
4–10) to be resolved. See ADR-0004/ADR-0005 gate status in Known Risks
below.

Known Risk #5 (missing Child Privacy & Safety Constitution) is resolved
as of Milestone 1.5 — see Known Risks below. Known Risks #6, #7, #8
(scope discrepancies) remain recorded as historical/resolved-by-precedent.
Known Risk #9 (branch protection blocked) is **resolved** — see Known
Risks below. Known Risks #1 and #2 (Privacy, Compliance) are now
**partially resolved** — engineering requirements defined via ADR-0006/
ADR-0007; legal validation and founder ratification of target audience
remain open (see Known Risks). Known Risk #3 (AI governance) remains
open by design. Known Risk #4 (ASPOVO Constitution placeholder) is
re-evaluated this session and classified as **not a Sprint 02 blocker**
(see Known Risks).

**Sprint 02 (correction, 2026-08-12):** the line above previously read
"Awaiting user approval before Sprint 02 begins" — stale. Sprint 02 was
approved and Milestones 1–10 are complete and merged into `main`; no
blocker exists for the design/documentation work itself. **For any
future implementation of a Sprint 02 design specifically** (not a
blocker to M11's documentation-only close-out): Known Risks #12–#15
below (India DPDP consent-mechanism legal validation, AI-provider
contract-terms review, India data-localization confirmation, and
breach-notification obligations affecting ADR-0015 §13.3's provisional
audit-log-retention period) are the live gates, mirroring the same
Legal-Validation-Required pattern Known Risk #10 already established
for ADR-0006/ADR-0007.

## Known Risks

Top risks (full register: [docs/sprints/sprint-01.md](docs/sprints/sprint-01.md), §26):

1. **Privacy — PARTIALLY RESOLVED (2026-08-03)** — a data-privacy/
   compliance ADR was required before ADR-0004/ADR-0005 implementation
   begins; [ADR-0006](docs/decisions/ADR-0006-data-privacy-compliance.md)
   now exists and is accepted, translating the Child Privacy & Safety
   Constitution into concrete engineering requirements (encryption,
   tenant isolation, retention/deletion/export, auditability,
   model-provider handling, training/advertising prohibitions, etc.).
   The ADR-existence blocker is cleared. **Not fully resolved**: ADR-0006
   itself lists specific items requiring formal legal validation (consent-
   mechanism sufficiency, model-provider contract terms, breach-
   notification obligations, data-localization requirements) — see Known
   Risk #10.
2. **Compliance — PARTIALLY RESOLVED (2026-08-04)** — COPPA/GDPR-K/India
   DPDP Act obligations and the product's target age range were not yet
   ratified.
   [ADR-0007](docs/decisions/ADR-0007-target-audience-interim-posture.md)
   defines an interim engineering posture (design to the strictest
   considered regime — India DPDP Act's under-18 "child" threshold —
   by default) that unblocks database/auth **design** work. **Update
   (2026-08-04, governance close-out):** the founder has now explicitly
   ratified the target market (India, single market at launch) and age
   range (4–10) — see ADR-0007 §D. This is a business decision, not a
   legal certification. **Not resolved**: India's DPDP Act legal
   sufficiency of the actual consent-capture design (once designed) and
   the specific verifiable-parental-consent mechanism remain open —
   ADR-0007 §C.3/§C.6 — see Known Risk #10.
3. **AI governance** — "Safe & Responsible AI" and "No addictive
   engagement" need engineering teeth, not just naming; enforced via
   the Governance Hierarchy and the AI Engineering Rule.
4. **Governance — RE-EVALUATED (2026-08-03)** — the ASPOVO Constitution
   remains a placeholder. Re-evaluated against Sprint 02 planning scope
   this session: Natkhat AI's own governance chain (Product + Child
   Privacy & Safety + Engineering Constitutions) is self-sufficient for
   every Natkhat-AI-level decision made to date, including ADR-0006/
   ADR-0007 — the ASPOVO Constitution's role is a company-level backstop
   for cross-product/company-wide matters, none of which Sprint 02
   planning is expected to require. **Classified as not a Sprint 02
   blocker.** Remains open, deferred, and must still be explicitly
   replaced via amendment before any future ASPOVO-level (multi-product)
   conflict arises — not resolved, just no longer blocking.
5. **Governance — RESOLVED (2026-07-29, Milestone 1.5)** — the Child
   Privacy & Safety Constitution (Trust-by-Design) flagged as missing
   after Milestone 1 was supplied by the user in full and ratified at
   `docs/constitution/product/child-privacy-and-safety-constitution.md`
   (Tier-1 Product Constitution Amendment, APPROVED, CRITICAL
   priority). Wired into the Engineering Constitution's mandatory
   review gates, the Product Constitution's Trust-Above-All amendment,
   the ADR Index, `docs/engineering/review-checklist.md`, root
   `README.md`, and `.ai/context/agent-workflow.md`.
6. **Process** — Milestone 1 was scaffolded strictly to
   `docs/sprints/sprint-01.md`, §15's definition, which excludes
   `apps/`, `packages/`, the CI workflow, Husky/commitlint, and the
   `config-typescript`/`config-eslint`/`config-prettier` packages
   (Milestones 7–10). A broader Milestone 1 scope was requested in the
   session that produced this update; flagged here rather than
   silently expanding an approved plan.
7. **Process — RESOLVED (2026-07-30, Milestone 2)** — a resume request
   this session asked to begin "Milestone 2 — Shared Infrastructure"
   (shared config, auth/RBAC/audit-logging/event-framework/database-
   connection foundations, security middleware, observability),
   none of which appears in `docs/sprints/sprint-01.md`. The actual
   Milestone 2 is documentation-only (§10, §15); Sprint 01 §14
   explicitly excludes auth/database/storage implementation; and Known
   Risk #1/#2's required data-privacy/compliance ADR does not yet
   exist to gate any of it. Surfaced to the user directly rather than
   silently resolved or silently expanded; the user chose the
   strict-repo-truth path — Milestone 1.5 approved, Milestone 2
   executed exactly as written (which produced
   `docs/engineering/change-request-process.md` itself), all requested
   shared-infrastructure work deferred to its real milestones/ADRs.
8. **Process — RESOLVED (2026-08-02, Milestone 9)** — this session's
   resume request labeled the target as "Milestone 9 → CI / GitHub
   Actions." Per `docs/sprints/sprint-01.md`, §15 and this file's own
   prior Current Milestone / Pending Tasks fields, the actual Milestone
   9 is **Developer tooling** (Husky, lint-staged, commitlint); CI /
   GitHub Actions is Milestone 10. Surfaced to the user directly rather
   than silently picking either interpretation; the user again chose
   the strict-repo-truth path (`docs/sprints/sprint-01.md` as Single
   Source of Truth) — Milestone 9 executed exactly as written in §15,
   CI / GitHub Actions deferred to its real milestone (10).
9. **Infrastructure — RESOLVED (2026-08-02, Milestone 10)** — branch
   protection on `main` was blocked (no remote, no commits) as of the
   prior session; the user explicitly approved unblocking it this
   session ("we will finish the blocked Git/GitHub portion"). First
   commit `6ff7e44` pushed to the pre-existing, verified-empty
   `github.com/amiyamishra1990-rgb/natkhat-ai`; real `ci.yml` triggered
   via PR #1 and verified green (after fixing two real bugs it caught —
   see Current Status/Change Log); branch protection configured with
   the confirmed real check names and independently verified (config
   read back via `GET`, and PR #1 observed to actually be
   merge-blocked). New operational item surfaced by this resolution,
   not itself a Sprint 01 risk: `enforce_admins: true` blocks even the
   repo owner from self-merging without a second reviewer — see
   Blockers/Pending Tasks.
10. **Compliance/Legal — UPDATED (2026-08-04)** — the specific successor
    to risks #1 and #2, now that ADR-0006/ADR-0007 exist. **Founder
    ratification obtained (2026-08-04, governance close-out):** target
    market (India, single market at launch) and age range (4–10) — see
    ADR-0007 §D. This is a business decision, not a legal certification.
    Before any database/auth implementation may proceed past design, the
    following remain open and require formal legal validation (none
    performed by this remediation phase, per its own scope): India DPDP
    Act legal sufficiency of the actual consent-capture design once it
    exists, and the specific verifiable-parental-consent mechanism
    (ADR-0007 §C.3/§C.6); third-party AI/model-provider data-handling and
    training-use contract terms; regulatory breach-notification
    obligations and timelines under India's DPDP Act specifically; India
    DPDP Act data-localization implications for Supabase region
    selection. COPPA/GDPR-K items (ADR-0007 §C.4/§C.5) are deferred, not
    open, unless/until a future non-India market is ratified. See
    ADR-0006 "Legal Validation Required" and ADR-0007 §C/§D for the
    complete, itemized lists.
11. **Governance — RESOLVED-WITH-CONDITION (2026-08-03)** — see
    Blockers/Current Branch: `main` branch protection's
    `required_approving_review_count` was temporarily changed from 1 to
    0 to resolve the unconditional one-person merge deadlock that
    blocked PR #1 (and would have blocked every future PR) — every
    other protection (required PR workflow, 5 required status checks,
    `strict` mode, `enforce_admins`, no force-push, no branch deletion)
    is unchanged. This is a deliberate, explicitly user-approved,
    reversible condition, not a permanent weakening — restore
    `required_approving_review_count` to 1 (or higher) the moment a
    second trusted collaborator/reviewer is added to the repository; the
    exact command is in `docs/decisions/decision-log.md`'s 2026-08-03
    entry. Sprint 01 (Milestones 0–12) is now permanently merged into
    `main` via this mechanism (merge commit `87de72d`), with all 5 CI
    checks green and no bypass of any kind.
12. **Compliance/Legal — OPEN (Sprint 02 M5)** — consent-architecture
    design (`docs/architecture/consent-architecture.md`,
    [ADR-0011](docs/decisions/ADR-0011-consent-architecture.md)) is
    complete at the framework level, and a non-binding
    consent-verification mechanism shortlist has been produced with
    founder direction recorded 2026-08-06. **Not resolved**: no specific
    mechanism has been finally selected, and India DPDP Act legal
    sufficiency of that mechanism has not been validated (ADR-0007
    §C.3/§C.6). ADR-0011 is deliberately kept at **Proposed**, not
    Accepted, until both occur — no consent-capture code, UI, or real
    consent record may be built against this design until then. **Update
    (2026-08-26, Sprint 03 M17):** the `ConsentEvent` schema and the
    atomic Child-creation-requires-consent invariant are now
    **implemented as a scaffold** (`apps/backend/src/consent/`) — Track A
    only, per `docs/sprints/sprint-03.md`, §4, M17. Track B (a real
    signed-form/payment-card/ID-linked verification flow) remains
    unbuilt and unactivated; this risk's underlying gate is unchanged.
13. **Compliance/Legal — OPEN (Sprint 02 M8)** — AI-provider boundary
    architecture (`docs/architecture/ai-provider-boundary.md`,
    [ADR-0013](docs/decisions/ADR-0013-ai-provider-abstraction-and-multi-provider-compatibility.md))
    establishes a provider-agnostic abstraction, but **no AI/LLM provider
    has been selected, contracted, or had its data-handling/training-use
    terms legally reviewed** (ADR-0006 §26). ADR-0013 is kept at
    **Proposed**, not Accepted, until a candidate provider's contract
    terms clear legal review. No SDK integration, API call, model-routing
    code, or provider credential is authorized by this ADR. **Update
    (2026-08-26, Sprint 03 M19):** the provider-neutral contract, adapter
    interface, and a **mock adapter only** are now implemented
    (`apps/backend/src/ai-provider/`) — Track A only, per
    `docs/sprints/sprint-03.md`, §4, M19. No real provider SDK,
    credential, or model call exists; this risk's underlying gate is
    unchanged.
14. **Compliance/Legal — OPEN (Sprint 02 M9)** — India-first deployment/
    data-residency design (`docs/architecture/deployment-india.md`) names
    a candidate region, but India DPDP Act data-localization confirmation
    for that region has **not** been performed. This design does not
    authorize any real infrastructure/region decision (ADR-0007 §D.3).
15. **Compliance/Legal — PARTIALLY OPEN (Sprint 02 M4/M7)** — the Sprint
    02 M4 governance gap (retention/deletion/export/backup-purge windows)
    is now closed via
    [ADR-0015](docs/decisions/ADR-0015-child-data-lifecycle-architecture.md)
    (Accepted — Implementation Deferred, founder-approved 2026-08-05,
    ADR authored 2026-08-11). **One value within it is not final**:
    ADR-0015 §13.3's Tier-5 audit/security-log retention period (3 years,
    APPROVED PROVISIONALLY) remains subject to change pending India DPDP
    Act legal review of regulatory breach-notification/record-keeping
    obligations (ADR-0006 §30) — referenced by M7's auditability design,
    not resolved by it. Do not treat this period as final until that
    legal review completes. **Update (2026-08-26, Sprint 03 M16):** the
    retention/deletion/export/backup-purge mechanics and the audit-log
    pipeline are now **implemented**
    (`apps/backend/src/lifecycle/`, `apps/backend/src/audit/`), with the
    Tier-5 retention period implemented as a **configuration value**
    (currently 3 years), not hardcoded, specifically because this legal
    review is still open — per `docs/sprints/sprint-03.md`, §4, M16.
    This risk's underlying legal gate is unchanged.
16. **Governance — RESOLVED (Sprint 04 M23, 2026-08-27)** — M20's
    first end-to-end vertical slice
    (`apps/backend/test/vertical-slice.e2e-spec.ts`) had deliberately
    left Leo-chat interaction ungated at the authorization layer: no
    `Action` existed in
    `apps/backend/src/authorization/authorization.types.ts`'s bounded set
    (M15) for "interact with Leo for a given child," and
    `apps/backend/src/leo/leo.service.ts` (M18) never called
    `AuthorizationService.authorize(...)`. Recorded as a known, open gap
    at the time — see `docs/decisions/decision-log.md`'s 2026-08-22 entry
    for the full original rationale. **Closed at Sprint 04 Milestone 23**
    (`docs/sprints/sprint-04.md`, §4, Founder Decision F.6; PR #25,
    merged 2026-08-27; `docs/decisions/decision-log.md`'s 2026-08-27
    entry): a new `interact_with_leo` Action was added to the bounded
    set (co-parent-eligible, not owner-only-unconditional — requires an
    explicit `permission_scope` grant), and
    `leo.service.ts`'s `startConversation`/`appendMessage` now call
    `AuthorizationService.authorize(...)` for it before doing anything
    else. Explicitly narrower than, and not conflated with, ADR-0009
    Decision item 7's child-login/child-session question, which remains
    untouched and out of scope — that still requires its own separate,
    founder-approved Change Request per ADR-0009 itself.
17. **Security — RESOLVED (Sprint 05 M25, 2026-09-01/PR #27)** — the new
    `GET /audit-events` endpoint
    (`apps/backend/src/audit/audit.controller.ts`) and `apps/admin`'s
    `/audit` page (PR #24, merged 2026-08-27) had shipped with **no
    authentication guard at all** — a known, deliberate, temporary gap
    for a non-production, synthetic-data-only environment, documented at
    the time in both the controller's own comment and
    `apps/admin/README.md`. **Closed at Sprint 05 Milestone 25**
    (`docs/sprints/sprint-05.md`, §3, Founder Decision G.2; PR #27,
    merged): a new `apps/backend/src/admin-auth/` module
    (`admin-auth.guard.ts`, backed by `admin-auth.service.ts` and
    `admin-user.repository.ts`) now gates `GET /audit-events`, and
    `apps/admin` gained a Firebase-session sign-in flow (`app/sign-in/page.tsx`,
    `app/api/session/route.ts`, `lib/firebase-client.ts`,
    `lib/session.ts`, `proxy.ts`) enforcing the same session
    server-side. Does not affect the F.3 audit-log-data-only hard
    boundary (what the endpoint may return is unchanged — only who may
    call it is now gated).

## Repository Health

Foundation stage, now permanently live on `main`. Three tooling-config
packages (Milestone 7) and two application scaffolds — `apps/backend`
(NestJS) and `apps/mobile` (Flutter) — exist and are validated
(Milestone 8), with no business logic in either. Developer tooling —
Husky, lint-staged, commitlint — installed and validated (Milestone 9).
`.github/workflows/ci.yml` verified green on real GitHub Actions
repeatedly (Milestones 10 and the 2026-08-03 remediation merge). Branch
protection on `main` configured and independently verified, with one
temporary, tracked exception (`required_approving_review_count: 0` —
see Known Risk #11). **Sprint 01 (Repository Foundation) is 100%
complete and permanently merged into `main`** (merge commit `87de72d`,
2026-08-03). Known Risks #5, #9 resolved; #6–#8 historical; #1 and #2
partially resolved (ADR-0006/ADR-0007 accepted 2026-08-03; legal
validation and founder ratification of target audience remain open —
see Known Risk #10); #3 open by design; #4 re-evaluated and classified
as not a Sprint 02 blocker; #11 resolved-with-condition (temporary,
reversible). No operational blocker remains for Sprint 01.

**Sprint 02 (Architecture & Compliance Design Layer) — all 11 Milestones
complete and merged into `main`.** No new application code, schema, or
infrastructure was added by Sprint 02 — it is a documentation/design
layer only, adding 8 new ADRs (ADR-0008–ADR-0015), 8 new architecture
documents, and 2 new module documents (see Repository Structure). Of
those, 6 ADRs are **Accepted — Implementation Deferred** (0008, 0009,
0010, 0012, 0014, 0015) and 2 remain **Proposed** (0011, consent
mechanism; 0013, AI-provider selection) pending the legal/founder gates
in Known Risks #12–#15. The Sprint 02 M4 governance gap (retention/
deletion/export/backup-purge windows) is closed via ADR-0015; its one
provisional value (§13.3 audit-log retention) is not yet final.

**Sprint 03 (Implementation Plan & Contract, Foundation Track) — all
nine Milestones (M12–M20) complete and merged into `main`.** This is
the first sprint with real application code: schema, RLS-enforced
tenant isolation, authorization/session logic, data-lifecycle/audit
pipelines, a consent scaffold, Leo memory isolation, and an AI-provider
mock-adapter boundary now exist in `apps/backend/src/` — see the
Sprint 03 Milestone Status table in Current Status and the Repository
Structure tree above. Every Track B item (real consent activation, real
AI-provider selection/credential, real production infrastructure)
remains inactive, per `docs/sprints/sprint-03.md`, §2.2/§10 — this
distinction (**implementation authorization does not equal production
authorization**, Decision J.1) is unchanged by Sprint 03's completion.
Known Risks #12, #13, #15 updated to record each milestone's Track A
scaffold as implemented while their underlying legal/founder gates
remain open; Known Risk #16 (new) records the M20 Leo-chat authorization
gap, now assigned to Sprint 04 M23.

**Sprint 04 (Governance Sync, Admin/Website Scaffolding, Leo-Chat
Authorization) — all three Milestones (M21–M23) complete and merged into
`main`.** M21 was documentation/governance-sync only (PR #23). M22 (PR
#24) added the first real application code since Sprint 03: `apps/admin`
and `apps/website` as CI-integrated Next.js applications, plus
`apps/backend`'s first HTTP controller (`GET /audit-events`) — strictly
bounded by Founder Decisions F.3 (audit-log data only) and F.4
(static/marketing shell only), with no admin authentication yet (Known
Risk #17). M23 (PR #25) closed the Known-Risk-#16 Leo-chat authorization
gap: a new `interact_with_leo` Action now gates `leo.service.ts`'s
`startConversation`/`appendMessage`. All three PRs merged 2026-08-27.

**Sprint 05 (Planning Pass — Governance Sync + Founder-Gated
Recommendations) — both Milestones (M24–M25) complete and merged into
`main`.** M24 was documentation/governance-sync only (PR #26), folding
in a new ADR-0017 (CI/CD, G.3) and a dated ADR-0016 amendment
(Storage → Google Cloud Storage, G.4, documentation only, no
implementation code). M25 (PR #27) added the first real application
code since Sprint 04: an `apps/backend/src/admin-auth/` module and an
`apps/admin` Firebase-session sign-in flow, closing the Known-Risk-#17
audit-log no-auth-guard gap.

**Sprint 06 ("Leo's Real Experience" — Kickoff Planning Pass) —
`docs/sprints/sprint-06.md` drafted; Founder Decisions H.1–H.8
recorded; Milestone 26 (this update) in progress.** No new application
code, schema, or infrastructure has been added by Sprint 06 to date —
M26 is documentation/governance-sync only, per
`docs/sprints/sprint-06.md`, §7, bringing `PROJECT.md` back in sync
with Sprint 05's actual merged state. Milestones 27–30 (backend
Leo-chat API + mock-reply wiring, mobile parent authentication, a
child-facing screen, and Sprint 06 close-out) remain **not yet
authorized** — each requires its own separate, explicit founder
go-ahead once the milestone before it is merged and verified.

## Major Decisions

- [ADR-0017](docs/decisions/ADR-0017-github-actions-cicd.md) — Adopt GitHub Actions for CI/CD (Sprint 05 M24) — Accepted; documentation-of-existing-fact, no CI behavior change
- [ADR-0016](docs/decisions/ADR-0016-firebase-auth-and-google-cloud-migration.md) — Migrate Off Supabase — Firebase Authentication and Google Cloud (founder-directed) — Accepted, Founder-Authorized, Effective Immediately (2026-08-23); supersedes ADR-0005's authentication clause, amends ADR-0004's hosting clause; 2026-08-31 amendment: Storage → Google Cloud Storage (decision only, no implementation)
- [ADR-0015](docs/decisions/ADR-0015-child-data-lifecycle-architecture.md) — Child-Data Lifecycle Architecture (Sprint 02 M4) — Accepted, Implementation Deferred; founder-approved 2026-08-05, closes the M4 governance gap; §13.3 audit-log retention Approved Provisionally, pending India DPDP legal review
- [ADR-0014](docs/decisions/ADR-0014-adopt-nextjs-for-admin-and-website-applications.md) — Adopt Next.js for Admin & Website Applications (Sprint 02 M10) — Accepted; scaffolding implemented at Sprint 04 M22
- [ADR-0013](docs/decisions/ADR-0013-ai-provider-abstraction-and-multi-provider-compatibility.md) — AI-Provider Abstraction & Multi-Provider Compatibility (Sprint 02 M8) — Proposed, blocked on provider contract-terms legal review; Track A (mock adapter) implemented at Sprint 03 M19
- [ADR-0012](docs/decisions/ADR-0012-leo-memory-and-conversation-isolation-design.md) — Leo Memory & Conversation Isolation Design (Sprint 02 M6) — Accepted, Implementation Deferred
- [ADR-0011](docs/decisions/ADR-0011-consent-architecture.md) — Consent Architecture, Framework-Level (Sprint 02 M5) — Proposed, blocked on mechanism selection + India DPDP legal validation; Track A (`ConsentEvent` scaffold) implemented at Sprint 03 M17
- [ADR-0010](docs/decisions/ADR-0010-encryption-and-tenant-isolation-design.md) — Encryption & Tenant-Isolation Implementation Design (Sprint 02 M3) — Accepted, Implementation Deferred
- [ADR-0009](docs/decisions/ADR-0009-authorization-and-session-architecture.md) — Authorization & Session Architecture (Sprint 02 M2) — Accepted, Implementation Deferred
- [ADR-0008](docs/decisions/ADR-0008-core-data-model-parent-family-child.md) — Core Data Model — Parent/Family/Child Entities (Sprint 02 M1) — Accepted, Implementation Deferred
- [ADR-0007](docs/decisions/ADR-0007-target-audience-interim-posture.md) — Interim Target-Audience Engineering Compliance Posture — Accepted, Target Market/Age Range Founder-Ratified (India, ages 4–10), India DPDP Legal Validation Required
- [ADR-0006](docs/decisions/ADR-0006-data-privacy-compliance.md) — Data Privacy & Compliance Engineering Requirements — Accepted, Legal Validation Required
- [ADR-0005](docs/decisions/ADR-0005-authentication.md) — Adopt Supabase Auth — Decision Recorded, Implementation Deferred (authentication clause superseded 2026-08-23 by ADR-0016; Storage clause unaffected)
- [ADR-0004](docs/decisions/ADR-0004-database.md) — Adopt PostgreSQL (via Supabase) with Prisma — Decision Recorded, Implementation Deferred (hosting clause amended 2026-08-23 by ADR-0016)
- [ADR-0003](docs/decisions/ADR-0003-backend.md) — Adopt NestJS for the Backend Application
- [ADR-0002](docs/decisions/ADR-0002-flutter.md) — Adopt Flutter for the Mobile Application
- [ADR-0001](docs/decisions/ADR-0001-monorepo.md) — Adopt a Single Monorepo (Turborepo + pnpm Workspaces)

## Change Log

- **2026-09-02** — Sprint 06, Milestone 26 (Sprint 05 Close-Out &
  Governance Sync): per `docs/sprints/sprint-06.md`, §7, M26's explicit
  scope (`PROJECT.md` corrections reflecting M24–M25 as merged;
  documentation/governance-sync only, no new architecture or
  implementation code). Read `PROJECT.md`, `docs/sprints/sprint-05.md`
  and `docs/sprints/sprint-06.md` in full, and the real filesystem/
  `git log` before making any change, per the AI Engineering Rule.
  Verified directly (not assumed from a prior Change Log entry) that PR
  #27 (`feat/sprint05-m25-admin-auth` → `main`, M25) shows as a merge
  commit in `main`'s history, and that `apps/backend/src/admin-auth/`
  and `apps/admin`'s Firebase-session sign-in files
  (`app/sign-in/page.tsx`, `app/api/session/route.ts`,
  `lib/firebase-client.ts`, `lib/session.ts`, `proxy.ts`) exist on
  disk. This file's own prior M24 update (2026-08-31) had only reached
  "M25 decided-in-principle, not yet authorized" and was never revisited
  after M25 was subsequently authorized (2026-09-01), implemented, and
  merged — it had described M25 as "not yet authorized" for two days
  (2026-09-01 through 2026-09-02) after it was in fact merged into
  `main`. Updated: header block Version/Last Updated, Current
  Development Phase, Current Sprint, Sprint Goal, Current Milestone (all
  corrected from Sprint 05-M24-in-progress framing to
  Sprint 05-complete/Sprint 06-M26-in-progress framing), Current Status
  (Sprint 04 Milestone Status table marked historical; new Sprint 05
  Milestone Status table added, mirroring the existing tables' format),
  Repository Structure (tree now shows `apps/backend/src/admin-auth/`,
  `apps/admin`'s new sign-in/session/proxy files, and `sprint-06.md`;
  the stale "no auth guard yet" narrative corrected throughout),
  Approved Tech Stack (Admin row corrected to record the M25 auth
  guard), Known Risks (#17 marked RESOLVED, recording M25's actual
  closure), Repository Health (Sprint 05 paragraph rewritten from
  "M24 in progress" to "M24–M25 both complete and merged"; new Sprint 06
  paragraph added), and Major Decisions (unchanged — M26 introduces no
  new or amended ADR). Also drafted
  [docs/sprints/sprint-06.md](docs/sprints/sprint-06.md) in a prior pass
  of this same planning effort (Sprint 06 kickoff: read every existing
  Leo-experience-relevant document, found none of the seven
  research documents the kickoff brief named actually exist in this
  repository, surveyed `apps/mobile` — unmodified Flutter boilerplate —
  and the backend Leo/AI-provider modules, and proposed a founder-gated
  milestone breakdown M26–M30); recorded Founder Decisions H.1–H.8 in it
  per the founder's own decision message (H.2: M27, the backend
  Leo-chat API + mock-reply wiring, confirmed as the first slice; H.6/H.7
  authorize M27/M28's existence; H.1/H.3/H.4/H.5 leave personality,
  visual style, voice/sound, and age-band handling explicitly deferred
  or placeholder-only; H.8 authorizes this M26). Did not touch
  `apps/backend/src/leo/`, `apps/mobile/`, or any Leo-chat/mobile-auth
  code (M27/M28's scope, not yet authorized); did not modify
  `docs/sprints/sprint-01.md` through `docs/sprints/sprint-05.md`, or
  any already-accepted ADR. Validated: `pnpm exec prettier --check`
  against the touched files; `pnpm exec turbo run lint typecheck test
build` re-run to confirm no regression from documentation-only
  changes. — AI agent (Claude Code), executing founder-authorized M26
  per the founder's Sprint 06 H.1–H.8 decisions message; M27–M30
  correctly not started.
- **2026-08-31** — Sprint 05, Milestone 24 (Sprint 04 Close-Out &
  Governance Sync): per `docs/sprints/sprint-05.md`, §4, M24's explicit
  scope (`PROJECT.md` corrections reflecting M21–M23 as merged; a new
  ADR-0017 recording the existing GitHub Actions CI/CD choice (Founder
  Decision G.3); a dated amendment to ADR-0016 recording Storage →
  Google Cloud Storage, decision-only (Founder Decision G.4);
  documentation/governance-sync only, no new architecture beyond the
  CI/CD ADR itself, no implementation code). Read `PROJECT.md`,
  `docs/sprints/sprint-04.md` in full, `docs/decisions/decision-log.md`'s
  2026-08-27 entry, ADR-0009, ADR-0016, and the Product Constitution's
  Locked Technology Stack table before making any change, per the AI
  Engineering Rule. Verified directly against `git log` and the real
  filesystem (not assumed from a prior Change Log entry) that PR #24
  (M22) and PR #25 (M23) both show as merge commits in `main`'s history,
  both dated 2026-08-27 — the same date `docs/sprints/sprint-04.md`
  itself was last updated to record both as "implemented... not yet
  merged; awaiting founder review." This file's own prior M21 update
  (2026-08-26) had only reached "M21 in progress, M22/M23 not yet
  authorized" and was never revisited after M22/M23 were subsequently
  authorized and merged — it had described both as "not yet authorized"
  for five days (2026-08-27 through 2026-08-31) after they were in fact
  merged into `main`. Updated exactly the fields
  `docs/sprints/sprint-05.md`, §4, M24 names: header block Version/Last
  Updated, Current Development Phase, Current Sprint, Sprint Goal,
  Current Milestone (all corrected from Sprint 04-in-progress framing to
  Sprint 04-complete/Sprint 05-M24-in-progress framing), Current Status
  (Sprint 03 Milestone Status table marked historical; new Sprint 04
  Milestone Status table added, mirroring the existing tables' format),
  Repository Structure (tree now shows `apps/admin/`, `apps/website/`,
  the M22 `audit.controller.ts` addition, the M23 `leo.service.ts`
  authorization-gate comment, `ADR-0017`, and `sprint-05.md`; the stale
  "`apps/admin` and `apps/website` do not exist" narrative corrected),
  Approved Tech Stack (Admin/Website rows corrected from "scaffolding
  not authorized" to "implemented, Sprint 04 M22"; Storage row corrected
  to Google Cloud Storage; CI/CD row corrected from "Not yet recorded"
  to ADR-0017), ADR Index (ADR-0005/ADR-0016/ADR-0014 status text
  updated; new ADR-0017 row added), Known Risks (#16 marked RESOLVED,
  recording M23's actual closure; new #17 added recording the M22
  no-auth-guard gap and its Sprint 05 M25 recommendation status),
  Repository Health (Sprint 04 paragraph rewritten from "Milestone 21 in
  progress... M22/M23 not yet authorized" to "all three Milestones
  complete and merged"; new Sprint 05 paragraph added), and Major
  Decisions (ADR-0014/ADR-0016 rows updated; new ADR-0017 row added).
  Also created [ADR-0017](docs/decisions/ADR-0017-github-actions-cicd.md)
  (new, documentation-of-existing-fact only) and amended
  [ADR-0016](docs/decisions/ADR-0016-firebase-auth-and-google-cloud-migration.md)
  with a new, dated "Amendment — Storage (2026-08-31)" section — the
  original Decision item 4/Consequences text is retained unedited above
  it, per this repository's append-only ADR-amendment discipline, not
  rewritten. Corrected
  `docs/constitution/product/natkhat-ai-constitution.md` (v1.3.0 →
  1.4.0): added a new "Constitutional Amendment — Storage and CI/CD
  (2026-08-31)" subsection and updated the Locked Technology Stack
  table's Storage and CI/CD rows to cite ADR-0016's amendment and
  ADR-0017 respectively — the original Google Cloud Migration amendment
  text (2026-08-23) is retained unedited above it, per the same
  append-only discipline. Finalized `docs/sprints/sprint-05.md` itself in
  the same pass: Founder Decisions G.1–G.5 recorded with their actual
  outcomes (§3), M24 marked authorized/in-progress, M25 left explicitly
  **not yet authorized**. Did not touch `apps/admin`, `apps/website`,
  `apps/backend/src/audit/audit.controller.ts`, or any admin-authentication
  code (M25's scope, not authorized); did not modify
  `docs/sprints/sprint-01.md` through `docs/sprints/sprint-04.md`, or any
  already-accepted ADR's original decision text. Validated: `pnpm exec
prettier --check` flagged formatting (table-column alignment/whitespace
  only) in the touched files; `pnpm exec prettier --write` fixed them (no
  content change), and a re-run of `--check` passed clean. Full
  `turbo run lint typecheck test build` re-run to confirm no regression
  from documentation-only changes. — AI agent (Claude Code), executing
  founder-authorized M24 per the founder's Sprint 05 G.1–G.5 decisions
  message; M25 correctly not started.
- **2026-08-26** — Sprint 04, Milestone 21 (Sprint 03 Close-Out &
  Governance Sync): per `docs/sprints/sprint-04.md`, §4, M21's explicit
  scope ("`PROJECT.md` Current Development Phase/Current Sprint/Current
  Milestone/Repository Structure/ADR Index/Known Risks updates; the
  Constitution's Locked Technology Stack table's Admin/Website rows
  corrected to cite ADR-0014; the Target Audience section's apparent
  contradiction with ADR-0007 resolved or explicitly reconciled" —
  documentation/governance-sync only, no new architecture, ADR, or
  implementation code). Read `PROJECT.md`, `docs/sprints/sprint-03.md`
  in full (all nine Milestone Breakdown entries, M12–M20), the
  2026-08-22 `docs/decisions/decision-log.md` entry (M20's Leo-chat
  authorization gap), ADR-0007 (§D and its Constitution Alignment
  section), ADR-0014, and the Product Constitution before making any
  change, per the AI Engineering Rule. Verified directly against the
  real filesystem (not assumed from prior Change Log entries) that
  `apps/backend/src/` now contains eight real implementation domains
  (`identity-family/`, `authorization/`, `auth/`, `lifecycle/`,
  `audit/`, `consent/`, `leo/`, `ai-provider/`) and that
  `apps/admin`/`apps/website` do not exist — confirming M22 has not
  started. This file was found frozen at its 2026-08-12 Sprint-02-M11
  state for every section except the ADR-0016 migration's own narrow,
  ADR-scoped edits (2026-08-23) — its Current Development
  Phase/Current Sprint/Sprint Goal/Current Milestone sections still
  described Sprint 02 M11 with no mention of Sprint 03 at all, and the
  Repository Structure tree was still frozen at the Milestone-8-scaffold
  state, missing every Sprint 03 file. Updated exactly the fields
  `docs/sprints/sprint-04.md`, §4, M21 names: Current Development Phase,
  Current Sprint, Sprint Goal, Current Milestone, Current Status (added
  a Sprint 03 Milestone Status table mirroring the existing Sprint 02
  table's format; marked the Sprint 02 table historical), Repository
  Structure (tree now reflects Sprint 03's `apps/backend/src/`
  domains, `apps/backend/prisma/`, `apps/backend/test/`
  `vertical-slice.e2e-spec.ts`, `ADR-0016`, `sprint-03.md`,
  `sprint-04.md`), Approved Architecture/Approved Tech Stack (Database/
  ORM/Auth rows corrected from "implementation deferred" to
  "implemented, Sprint 03... synthetic data only" — implementation
  genuinely occurred at M13–M15, this is not a re-interpretation),
  Known Risks (#12/#13/#15 annotated with each milestone's Track A
  scaffold now implemented while their underlying legal/founder gates
  remain explicitly unchanged and open; new #16 recording the M20
  Leo-chat authorization gap and its assignment to Sprint 04 M23),
  Repository Health (added Sprint 03 and Sprint 04 paragraphs; corrected
  the stale "Milestone 11 (this update) in progress" to "complete" now
  that Sprint 02 itself is historical), Major Decisions (ADR-0011/
  ADR-0013 rows annotated with their Track A scaffold status), and this
  Change Log entry. Also corrected
  `docs/constitution/product/natkhat-ai-constitution.md` (v1.2.0 →
  1.3.0): Locked Technology Stack table's Admin application/Marketing
  website rows corrected from "Not yet recorded" to ADR-0014 (the
  citation fix ADR-0014's own Consequences clause named as due at
  Sprint 02 M11, missed until now); added a new "Constitutional
  Amendment — Target Audience Reconciliation (2026-08-26)" subsection
  reconciling the Target Audience section's original "Not yet ratified"
  text with ADR-0007 §D's founder ratification (India, ages 4–10,
  2026-08-04) — the original text is retained below the amendment as
  historical context, not deleted, per this repository's append-only
  discipline; ADR-0007's own Constitution Alignment section already
  supplied the reconciling logic (the Constitution's wording "is no
  longer in tension with this ADR now that §D exists"), so this was a
  citing/formalizing edit, not an invented reconciliation. Did not touch
  `apps/admin`, `apps/website`,
  `apps/backend/src/authorization/authorization.types.ts`, or any
  Leo-chat code (M23's scope, not authorized); did not create any new
  ADR; did not modify `docs/sprints/sprint-01.md`,
  `docs/sprints/sprint-02.md`, `docs/sprints/sprint-03.md`, or any
  already-accepted ADR's own text. `docs/sprints/sprint-04.md` itself
  was finalized in the same pass — Founder Decisions F.1–F.6 recorded
  with their actual outcomes (§3), M21 marked authorized, M22
  finalized with the F.3 (audit-logs-only) and F.4 (static-shell-only)
  boundaries locked in, and a new M23 entry (Leo-Chat Authorization Gap)
  added — M22 and M23 both explicitly marked **not yet authorized**.
  Validated: `pnpm exec prettier --check` initially flagged formatting
  issues (table-column alignment/whitespace only) in all three touched
  files (`PROJECT.md`, `docs/sprints/sprint-04.md`,
  `docs/constitution/product/natkhat-ai-constitution.md`); `pnpm exec
prettier --write` fixed them (no content change), and a re-run of
  `--check` passed clean for all three. — AI agent (Claude Code),
  executing founder-authorized M21 per the founder's Sprint 04 F.1–F.6
  decisions message; M22/M23 correctly not started.
- **2026-08-23** — Founder-directed migration off Supabase onto Google
  Cloud, recorded as
  [ADR-0016](docs/decisions/ADR-0016-firebase-auth-and-google-cloud-migration.md):
  Firebase Authentication supersedes Supabase Auth (ADR-0005's
  authentication clause); PostgreSQL hosting moves from Supabase to
  Google Cloud, Cloud SQL for PostgreSQL as the dev-instance candidate
  (amends ADR-0004's hosting clause; engine/ORM unchanged); Google
  Cloud (GCP) formally recorded as Cloud provider. Storage explicitly
  out of scope, remains Supabase Storage pending a separate founder
  decision. Rebuilt M15 authentication code
  (`apps/backend/src/auth/`) against the Firebase Admin SDK, using
  Application Default Credentials (never a downloaded service-account
  key file — the founder's org enforces
  `iam.managed.disableServiceAccountApiKeyCreation`), preserving the
  same lazy-provider, fail-closed, `describeIfConfigured`-skip test
  pattern the Supabase implementation established.
  `ParentRepository.findByAuthIdentityRef` required no change.
  Constitutional Amendment recorded in
  `docs/constitution/product/natkhat-ai-constitution.md` (v1.2.0),
  amending the Locked Technology Stack table per its own Amendment
  clause. Decision Log entry added. Sprint 03 remains synthetic-data-
  only, non-production; PR #21 (M20 vertical slice) was not touched by
  this session — see PR #21's own status. — AI agent (Claude Code),
  pending user review before merge.
- **2026-08-12** — Sprint 02, Milestone 11 (Design-Phase Close-Out &
  Governance Sync): per `docs/sprints/sprint-02.md`, §3, M11's explicit
  scope ("`PROJECT.md` Current Status/Milestone/Pending Tasks/Known
  Risks/ADR Index/Change Log updates only"), read `PROJECT.md`, all
  eight new Sprint 02 ADRs (ADR-0008–ADR-0015) and their exact status
  lines, `docs/sprints/sprint-02.md`'s committed (HEAD) content and its
  Milestone Breakdown (§3)/Founder Decisions Required (§7)/Legal-
  Privacy Validation Required (§8), `docs/architecture/data-lifecycle.md`
  §13's founder-decision record, `docs/modules/README.md`'s module
  table, and `docs/decisions/decision-log.md`, before making any change,
  per the AI Engineering Rule — rather than assuming the resume request's
  own claims about repository state. Verified directly via `git log`/
  `git diff` that Sprint 02 Milestones 1–10 are each merged into `main`
  through their own PR (PR #2 governance close-out, PR #3 planning, PR #4
  M1–M4 docs, PR #5–#10 M5–M10, PR #11 the M4 governance-gap closure),
  that `origin/main` is at merge commit `87f8cb5`, and that this session's
  own branch (`docs/sprint02-m4-child-data-lifecycle-adr`) is what PR #11
  merged — i.e. already fully contained in `main`. Confirmed
  [ADR-0015](docs/decisions/ADR-0015-child-data-lifecycle-architecture.md)
  is Accepted — Implementation Deferred (Last Updated 2026-08-11),
  closing the Milestone 4 child-data lifecycle governance gap, with its
  §13.3 audit/security-log retention value correctly APPROVED
  PROVISIONALLY, not final. Confirmed ADR-0011 (M5, consent) and ADR-0013
  (M8, AI-provider) remain Proposed, not Accepted, and did not represent
  either as resolved. Found this file frozen at its 2026-08-04
  Sprint-01-close-out state — unedited since, per `git diff HEAD
origin/main -- PROJECT.md` returning empty — causing several stale/
  false statements: "Sprint 02 has no approved Sprint Document yet"
  (false — it exists, approved, 10 of 11 milestones executed), an ADR
  Index stopping at ADR-0007 (missing ADR-0008–ADR-0015 entirely), a
  Repository Structure tree missing every Sprint 02 file, and a Current
  Sprint/Milestone/Development Phase still describing Sprint 01. Updated
  exactly those fields plus Last Decision, Pending Tasks, Blockers,
  Known Risks (added items #12–#15 for the still-open Sprint 02 legal/
  founder gates: ADR-0011's consent-mechanism selection + DPDP legal
  validation, ADR-0013's provider contract-terms review, M9's India
  data-localization confirmation, and ADR-0015 §13.3's provisional
  audit-log retention), Repository Health, Major Decisions, and this
  Change Log entry — per M11's scope, no other file was touched.
  Explicitly did not mark any of Known Risks #10, #12–#15 as resolved,
  did not invent a legal-validation outcome, did not expand ADR-0015's
  actual Decision/Consequences text or scope, and did not edit
  `docs/sprints/sprint-02.md`, any ADR, any Constitution,
  `docs/decisions/decision-log.md`, `docs/modules/README.md`, `apps/`,
  `packages/`, or `infrastructure/` — confirmed via `git status`/`git
diff` after editing that the working tree's only changes are in this
  file, and that `docs/sprints/sprint-02.md`'s pre-existing uncommitted
  working-tree modification (present before this session, unrelated to
  M11) is byte-for-byte unchanged. Not staged, not committed, not
  pushed — pending founder review before commit, per explicit
  instruction. — AI agent (Claude Code), pending founder review.
- **2026-08-04** — Post-Sprint-01 Remediation, Governance Close-Out:
  reviewed [ADR-0006](docs/decisions/ADR-0006-data-privacy-compliance.md)
  one final time against the Child Privacy & Safety Constitution, the
  Product Constitution, the Engineering Constitution, ADR-0004, and
  ADR-0005 — every requirement's Constitution citation verified accurate
  (e.g. §24 Safe Sharing reproduces the Constitution §4's six items
  exactly); no contradiction or weakening found; ADR-0006 left unedited.
  Presented the founder decision still required by
  [ADR-0007](docs/decisions/ADR-0007-target-audience-interim-posture.md)
  §C (target market, in simple language with age-range, jurisdiction,
  engineering, and legal-validation implications for each option) rather
  than inventing or silently ratifying one; recommended a single-market
  launch as the safest practical option preserving future international
  expansion; stopped and asked the founder directly (two clarifying
  questions: launch strategy, then specific country) rather than
  assuming. Founder ratified: single-market launch, India, ages 4–10 (a
  parent-managed childhood companion) — explicitly not interpreted as
  legal approval, per the founder's own instruction. Updated ADR-0007
  (added §D, Founder Ratification; marked §C items 1/2/7 resolved by
  reference to §D; left §C items 3/4/5/6 open — India DPDP Act
  legal-sufficiency review and the specific consent-verification
  mechanism remain the live blockers; COPPA/GDPR-K explicitly deferred,
  not closed, for any future non-India expansion; version 1.0.0 →
  1.1.0). Updated `PROJECT.md` (this file — Current Branch/header, ADR
  Index, Known Risks #2/#10, Blockers, Pending Tasks, Major Decisions,
  Last Decision, this Change Log entry, Last Updated) to match. Did not
  create `docs/sprints/sprint-02.md` (explicitly out of scope for this
  phase) and did not touch database, authentication, API, storage,
  AI-memory, or business-feature code. Implementation gate recorded
  explicitly: Sprint 02 planning/documentation allowed; database,
  authentication, child personal-data collection, and production child
  users all remain blocked pending the India DPDP Act legal-validation
  items above. — AI agent (Claude Code), founder decision obtained
  in-session via direct questions; committing per explicit instruction
  now that no further founder decision blocks ADR-0007.
- **2026-08-03** — Post-Sprint-01 Remediation, Phase 2 (Privacy/Child-
  Safety/Compliance Governance Gates): read PROJECT.md, the Product,
  Engineering, and Child Privacy & Safety Constitutions, ADR-0004/0005,
  the ADR Index, Decision Log, Known Risks, and
  `docs/sprints/sprint-01.md` before making any change, per the AI
  Engineering Rule. Created
  [ADR-0006](docs/decisions/ADR-0006-data-privacy-compliance.md) (Data
  Privacy & Compliance Engineering Requirements), translating the
  already-ratified Child Privacy & Safety Constitution into 30
  engineering-actionable requirements (privacy by default, data
  minimization/purpose limitation, parent ownership/consent/
  authorization boundaries, a five-tier data classification, per-category
  requirements for conversations/Leo memories/voice/images/drawings/
  growth data, encryption at rest/in transit, mandatory tenant/family
  isolation, retention/deletion/export/correction, backup-deletion
  propagation, auditability/access logging, safe sharing, search-engine
  non-indexing, model-provider handling, training/advertising
  prohibitions, secrets management, and incident-response
  considerations) without weakening, restating, or reinterpreting the
  Constitution — the Constitution controls wherever this ADR is silent.
  Six items are explicitly marked **[LEGAL VALIDATION REQUIRED]** rather
  than asserted as certified compliance, per this phase's explicit
  instruction not to invent legal conclusions. Created
  [ADR-0007](docs/decisions/ADR-0007-target-audience-interim-posture.md)
  (Interim Target-Audience Engineering Compliance Posture): found
  repository evidence insufficient to ratify a specific age range or
  target-market list (per the Product Constitution's own "Not yet
  ratified" text), so this ADR does **not** invent one — it separates
  (A) already-ratified product facts (children-facing, parent-managed
  accounts) from (B) a conservative engineering posture (design to the
  strictest of India's DPDP Act/GDPR-K/COPPA thresholds by default,
  unconditional verifiable-parental-consent architecture) that unblocks
  design work, from (C) seven specific items — exact age range, exact
  target markets, DPDP/COPPA/GDPR-K applicability determinations, the
  consent-verification method, and international-availability scope —
  that explicitly require a founder decision and/or legal validation,
  none of which this phase performed. Re-evaluated ADR-0004/ADR-0005:
  their stated "dedicated compliance ADR must exist" prerequisite is now
  satisfied, so gate status is **PARTIALLY SATISFIED** — design work may
  proceed under ADR-0006/ADR-0007's posture, but real implementation
  remains gated on the Legal Validation Required items and the founder
  decisions in ADR-0007 §C. Did not edit ADR-0004 or ADR-0005 themselves
  (ADRs are superseded, never rewritten, per this repository's own
  discipline) — their prerequisite is now met by ADR-0006/0007's
  existence, not by editing their text. Re-evaluated the ASPOVO
  Constitution placeholder against Sprint 02 planning scope and
  classified it as **not a Sprint 02 blocker** — Natkhat AI's own
  Product/Child-Privacy/Engineering constitutions are self-sufficient
  for every decision made so far, including this session's; the
  placeholder remains an open, deferred structural risk, not fabricated
  or filled in, per this phase's explicit instruction not to invent an
  ASPOVO Constitution. Updated `PROJECT.md` (this file — Current Branch,
  Blockers, Known Risks #1/#2/#4 plus new #10/#11, Pending Tasks,
  Repository Health, ADR Index, Major Decisions, Last Decision) and
  `docs/decisions/decision-log.md` (one new entry, recording the
  temporary `required_approving_review_count: 0` branch-protection
  condition from the prior remediation phase, which had been flagged
  but not yet logged) — governance traceability only, per this phase's
  Task 5 scope. No Constitution rewritten (no formal amendment was
  required — this phase's ADRs sit below the Constitutions in the
  Governance Hierarchy and do not need to alter them to take effect); no
  architecture redesigned; no database, auth, API, storage, AI-memory,
  or business-feature code touched; no Sprint 02 Sprint Document
  created. These changes are in the working tree only as of this entry
  — not yet committed, pending explicit approval to commit/push through
  the protected-branch/PR workflow (same pattern as the two prior
  remediation phases). — AI agent (Claude Code), pending user review.
- **2026-08-03** — Post-Sprint-01 Remediation, Phase 1 (Git/Single-
  Source-of-Truth completion gap and branch-protection deadlock):
  verified all uncommitted working-tree changes belonged exclusively to
  approved Sprint 01 Milestones 11/12 (no architecture, ADR,
  Constitution, business-feature, or Sprint 02 content present) before
  committing. Created two commits on
  `chore/project-milestone-10-ci-verification` — `0a79d62`
  ("docs(ai): populate .ai/prompts workspace with starter templates
  (Milestone 11)") and `be2c95c` ("docs(project): record Sprint 01
  completion (Milestone 12 close-out)") — both passing
  `.husky/pre-commit`/`.husky/commit-msg` hooks with no bypass. Pushed
  to the existing branch backing open PR #1 (no new branch, no
  force-push, no direct push to `main`); all 5 CI checks passed on the
  resulting run
  ([30824853976](https://github.com/amiyamishra1990-rgb/natkhat-ai/actions/runs/30824853976)).
  Independently confirmed the branch-protection deadlock was genuine
  (exactly one collaborator — the repo owner — with
  `required_approving_review_count: 1` and `enforce_admins: true`,
  meaning no possible approver existed for any PR, ever) before
  proposing a fix, and stopped for explicit user approval before
  changing branch protection, per this phase's explicit instruction.
  On approval, changed only `required_approving_review_count` (1 → 0)
  via the `required_pull_request_reviews` sub-resource PATCH endpoint —
  deliberately narrower than a full protection-object PUT, to minimize
  risk of touching any other setting; independently re-verified via a
  fresh `GET` that only that one field changed. Merged PR #1 via
  `gh pr merge --merge` (merge commit `87de72d`) with all CI checks
  green and `mergeStateStatus: CLEAN` — no CI bypass, no force-push, no
  direct push to `main`. Verified post-merge: `origin/main` and local
  `main` fast-forwarded and synchronized at `87de72d`; working tree
  clean; all 14 Sprint 01 Milestone rows (0–12) present and `Complete`
  in `PROJECT.md` on `main`; branch protection unchanged except the one
  approved field. Left the merged feature branch undeleted (repository's
  own `deleteBranchOnMerge: false` setting and no documented branch-
  cleanup policy found — a new judgment call was not made unilaterally).
  Flagged, not yet executed pending this phase's own explicit scope: per
  `PROJECT.md`'s own update discipline and the Decision Log's discipline
  for small implementation decisions, this branch-protection change
  itself should be recorded — done in the following Phase 2 entry
  above, together with the rest of that phase's traceability work. No
  Constitution, ADR, or architecture touched; no Sprint 02 work begun.
  — AI agent (Claude Code), pending user review.
- **2026-08-03** — Milestone 12 (PROJECT.md final close-out) complete —
  **Sprint 01 is now 100% complete**: before implementing, verified
  (rather than assumed) that Milestones 0, 1, 1.5, 2, 5, 6, 7, 8, 9,
  10, and 11 are each recorded complete in this file's own Completed
  Tasks/Change Log, and confirmed no unresolved blocker prevents this
  close-out (the one open item, PR #1's merge-review block, is
  explicitly recorded elsewhere as "not a Sprint 01 blocker"). Per
  `docs/sprints/sprint-01.md`, §15's exact Milestone 12 definition
  ("PROJECT.md final close-out — Current Status, Completed Tasks, Next
  Actions updated to reflect the finished foundation"), updated exactly
  those fields plus Blockers, Repository Health, and Known Risks
  framing — no other file touched. Re-validated §15's Definition of
  Done directly rather than relying solely on Milestone 10's prior run:
  `pnpm install --frozen-lockfile` clean, `pnpm exec turbo run lint
typecheck test build` 5/5 (all cache-hit — no drift since Milestone
  10), `flutter analyze`/`flutter test` in `apps/mobile` both clean.
  Reviewed `docs/sprints/sprint-01.md`, §27, Recommendation 6 (revisit
  `docs/` domain boundaries, Knowledge Vault categories, `.ai/`
  structure before Sprint 02) as a read-only confirmation, not a
  redesign — Milestone 12 does not authorize structural change; found
  the structure held up in practice across all 12 milestones, with the
  Milestone 6 and Milestone 11 documentation-discrepancy precedents as
  the only two boundary frictions found, both already flagged and
  deferred to a Change Request rather than requiring a structural fix.
  Recorded a full twelve-row Sprint 01 Completion Checklist in Current
  Status. Confirmed no approved Sprint 02 Sprint Document exists yet
  (`docs/sprints/` contains only `sprint-01.md`); recommended, per §27
  Recommendation 1, that the literal next step is authoring
  `docs/sprints/sprint-02.md` through the Change Request Process, not
  any specific implementation milestone (none is recorded as Sprint
  02's Milestone Breakdown anywhere) — and flagged that Known Risks #1
  (privacy/compliance ADR) and #2 (COPPA/GDPR-K ratification) are
  explicit prerequisites, per the Risk Register (§26), if Sprint 02
  turns out to implement ADR-0004/ADR-0005. No application code,
  business logic, database, auth, or product functionality touched; no
  architecture, ADR, Constitution, or other governance document
  modified; no Sprint 02 planning performed — only this file. — AI
  agent (Claude Code), pending user review before Sprint 02.
- **2026-08-03** — Milestone 11 (`.ai/` workspace population) complete:
  confirmed the exact scope directly from `docs/sprints/sprint-01.md`,
  §15 ("`.ai/` workspace population (remaining) — starter prompt
  template(s) in `.ai/prompts/`") before implementing, per the AI
  Engineering Rule read-first sequence — the resume request's own
  wording matched §15 verbatim, so no mismatch needed surfacing this
  time (contrast Known Risks #6–#8, where prior resume requests did not
  match). Authored four starter prompt templates in `.ai/prompts/`:
  `draft-adr.md`, `draft-module-doc.md`, and `run-review-pass.md`
  formalize the three recurring tasks `.ai/prompts/README.md` already
  named before this milestone ("draft an ADR, draft a module doc, run a
  review pass"); `resume-milestone.md` generalizes the
  resume-and-implement-one-milestone pattern this Sprint's own Change
  Log shows repeated identically across all ten prior milestone
  sessions. Each template states it is non-authoritative
  (`docs/sprints/sprint-01.md`, §6) and points to the governing `docs/`
  document it summarizes rather than restating it. Updated
  `.ai/prompts/README.md` from a structural placeholder
  (`Version 1.0.0`) to an active index (`Version 1.1.0`) listing all
  four templates, matching the update pattern every prior milestone
  used for the `docs/` README it populated. Validated:
  `pnpm exec prettier --check .ai/prompts/*.md` (failed once on
  `README.md`'s table alignment, fixed with `--write` — table
  formatting only, no content change — then passed for all five files);
  a repo-wide grep for `.ai/prompts` confirmed no other document
  references the folder by path and needed updating. Flagged, not
  resolved: `docs/engineering/checklists/ai-review-checklist.md` (line
  31–33) reads as if `.ai/sessions/` population were also part of
  Milestone 11, but `docs/sprints/sprint-01.md`, §15's own Milestone 11
  definition names only `.ai/prompts/` — §15 was followed as the
  operative Milestone Breakdown, consistent with the Milestone 6
  precedent for resolving this class of documentation discrepancy;
  `.ai/sessions/` and `.ai/reviews/` remain empty placeholders, tracked
  in Pending Tasks. No application code, business logic, database,
  auth, or product functionality touched; no architecture, ADR, or
  Constitution changed; no governance document modified — only
  `.ai/prompts/` and this file. — AI agent (Claude Code), pending user
  review before Milestone 12.
- **2026-08-02** — Milestone 10 (CI foundation) **fully complete**:
  this session's request explicitly approved finishing the
  Git/GitHub-remote prerequisite that the prior session's Milestone 10
  work had left blocked. Before touching anything: verified the
  repository was safe to push — `git add -A --dry-run` listed exactly
  164 files (no `node_modules/`, `dist/`, `build/`, `.turbo/`,
  `coverage/`, `.dart_tool/`, Android/iOS build artifacts, or `.idea/`
  — all correctly gitignored, confirmed by both the file listing and
  direct `git check-ignore -v` tests, including one live test that
  created and removed a real `apps/backend/coverage/` directory to
  confirm the pattern actually works, not just reads correctly);
  filename- and content-scanned all 164 candidate files for secrets
  (`.env`, `.pem`/`.key`/`.keystore`/`.jks`, `local.properties`,
  `key.properties`, AWS/GitHub/Google/OpenAI/Slack token patterns) —
  none found, only the intentional placeholder `.env.example`; and
  confirmed via `gh repo list`/`gh api repos/.../branches` that
  `github.com/amiyamishra1990-rgb/natkhat-ai` already existed
  (created 2026-07-26 by the user, public) and was genuinely empty (0
  branches, 0 size, `pushed_at` == `created_at`) before pushing
  anything to it.

  Created the first commit, `6ff7e44` ("chore(repo): establish Sprint
  01 repository foundation (Milestones 0-10)"), through the real
  `pre-commit`/`commit-msg` hooks (no `--no-verify`) — lint-staged
  auto-fixed formatting on 91 matching files and ran ESLint on 6
  backend files with no errors, commitlint accepted the message
  cleanly. Added `origin` and pushed `main` directly (the standard
  bootstrap exception to GitHub Flow — there is no prior `main` to
  branch from for an empty repo). Since `ci.yml` only triggers on
  `pull_request`, opened
  [PR #1](https://github.com/amiyamishra1990-rgb/natkhat-ai/pull/1)
  from branch `chore/project-milestone-10-ci-verification` (scope
  `project`, per §17's convention for `PROJECT.md`-only changes) to
  exercise the real workflow — its content is limited to `PROJECT.md`
  tracking updates, per this session's explicit scope instruction.

  The first real run failed 4/5 jobs with `ERR_PNPM_OUTDATED_LOCKFILE`
  (`pnpm-lock.yaml` still had `workspace:^` for
  `@natkhat-ai/config-prettier` after that field was hand-edited to
  `workspace:*` at Milestone 9 without re-running `pnpm install`) —
  reproduced locally, fixed with `pnpm install`, committed and pushed.
  The second run failed the same 4 jobs with
  `ERR_PNPM_UNSUPPORTED_ENGINE` (`@commitlint/cli@21.2.1` requires Node
  `>=22.12.0`; `.nvmrc`/`engines.node` still targeted Milestone 1's
  Node 20 default, never caught locally because the local environment
  already runs Node v24) — confirmed no ADR/constitution pins a Node
  version, bumped `.nvmrc` and `engines.node` to `>=22.12.0`, verified,
  committed, and pushed. The third run passed all five jobs
  (`lint`, `typecheck`, `test`, `build`, `mobile`) — see
  [run 30753691637](https://github.com/amiyamishra1990-rgb/natkhat-ai/actions/runs/30753691637).
  Both fixes are real, narrowly-scoped tooling-config corrections, not
  architecture changes.

  Configured branch protection on `main` using the confirmed real
  check-context names (exact `gh api` command in Current Status),
  combining §16's required status checks with §17's required review.
  Verified two ways: an independent `GET` of the protection config
  (not just trusting the `PUT` response) matched exactly, and PR #1
  itself was observed to flip to `mergeStateStatus: BLOCKED` /
  `reviewDecision: REVIEW_REQUIRED` — proof GitHub is actually
  enforcing it, not just recording it. Flagged directly, not silently
  absorbed: `enforce_admins: true` means the repo owner cannot
  self-merge PR #1 (or anything else) without a second reviewer, given
  this is currently a single-maintainer repo with `CODEOWNERS` still a
  placeholder — this was not softened unilaterally, since §17
  explicitly calls for required review and loosening it wasn't asked
  for; left for the user to decide. PR #1 itself left open and
  unmerged — merging wasn't part of this session's explicit instruction
  set, and self-merging under freshly-set review rules would be an
  odd thing for the agent that just configured those rules to do
  unilaterally.

  No application code, business logic, database, auth, or product
  functionality touched; no architecture, ADR, Constitution, or
  approved governance document changed; no force-push, no deletion, no
  destructive git operation; only the two real bugs above and
  `PROJECT.md` tracking fields were modified. — AI agent (Claude Code),
  pending user review before Milestone 11 and before merging PR #1.

- **2026-08-02** — Milestone 10 (CI foundation) — `ci.yml` half
  complete, branch-protection half blocked: per this session's explicit
  instruction to "pay particular attention to the developer-tooling
  issues recorded during Milestone 9," re-examined Husky's actual
  mechanism before building CI on top of it (`node_modules/husky/*.js`)
  and found the Milestone 9 record was wrong on two points — (1)
  `core.hooksPath` is `.husky/_`, not `.husky/`; (2) that means git
  never directly executes `.husky/pre-commit`/`.husky/commit-msg` — a
  shim in the gitignored, auto-regenerated `.husky/_/` sources a
  dispatcher that runs the top-level hook file via `sh -e "<path>"`, an
  explicit interpreter invocation that only needs the file to be
  _readable_. Verified empirically (not just by reading source):
  directly invoked `.husky/_/commit-msg` (what git actually calls) with
  `.husky/commit-msg` still at mode `644`, against both a
  non-conventional message (correctly rejected, exit 1) and a
  conventional one (correctly accepted, exit 0). The Milestone 9
  Pending-Tasks item recommending `git update-index --chmod=+x
.husky/pre-commit .husky/commit-msg` before the first commit was
  therefore unnecessary and has been struck through (not deleted) in
  that entry, with this entry as the append-only correction record —
  see Current Status for full detail. No git-index or repository state
  needed changing; only the written record was wrong.

  Authored `.github/workflows/ci.yml` per `docs/sprints/sprint-01.md`,
  §15, §16: five jobs — `lint`, `typecheck`, `test`, `build` (each
  `pnpm install --frozen-lockfile` then `pnpm exec turbo run <task>
--filter="...[${{ github.event.pull_request.base.sha }}]"`, using the
  PR base commit SHA rather than `origin/<branch>` because
  `actions/checkout`'s `fetch-depth: 0` does not guarantee a
  resolvable `origin/main` ref — this is the pattern Turborepo's own
  GitHub Actions guide recommends) and `mobile` (Flutter 3.44.8,
  matching the version validated at Milestone 8; gated on
  `apps/mobile/**` changes via a `git diff --quiet <base-sha>...HEAD --
apps/mobile` step rather than `turbo --filter`, since `apps/mobile`
  is not a pnpm/Turborepo workspace member per ADR-0002 — steps are
  skipped when irrelevant, not the whole job, so the check stays green
  and safely required without blocking non-mobile PRs). Chose four
  separate `lint`/`typecheck`/`test`/`build` jobs rather than one job
  running the combined `turbo run lint typecheck test build` command
  literally shown in §16's first bullet, because §16's second bullet
  ("Required status checks on main: lint, typecheck, test, build")
  names four independently-selectable check names, which only exist as
  four distinct GitHub status checks if they are four distinct jobs —
  recorded as an interpretation, not a silent architecture call. This
  also settles the Turborepo-root-task-wiring question left open by
  Milestone 8: `turbo.json` was **not** changed — `apps/mobile` stays
  outside the pnpm/turbo graph (ADR-0002) and the `mobile` job invokes
  the Flutter CLI directly instead.

  Validated: `pnpm exec prettier --check .github/workflows/ci.yml`
  passes; installed `pyyaml` (`pip install --user pyyaml`, a local,
  non-repo dev-time check, not a project dependency) and
  `yaml.safe_load`-parsed the file, confirming 5 well-formed jobs with
  the expected step counts (no `actionlint`/`yamllint` binary was
  available in this environment for deeper schema validation); re-ran
  `pnpm exec turbo run lint typecheck test build` (5/5 tasks pass,
  matching Milestone 8's baseline — one pre-existing, unrelated
  warning: `no output files found for task backend#test`, present
  since Milestone 1's `turbo.json` and not touched here) and
  `flutter analyze`/`flutter test` in `apps/mobile` (both still pass)
  directly, confirming every command the workflow calls is itself
  sound. **The workflow itself has never executed on GitHub** — no
  remote or commits exist to trigger it.

  Branch protection on `main` (§15, §16, §17's "required review +
  status checks") is **not implemented — blocked, not deferred by
  choice**: `git log`/`git remote -v` confirm zero commits and no
  configured remote, so there is no GitHub repository for `gh api
repos/<owner>/<repo>/branches/main/protection` to target, even though
  `gh auth status` shows an authenticated account with `repo`/`workflow`
  scopes. Creating a remote and making the first-ever commit are
  materially different, shared-state actions from authoring `ci.yml`
  and were not authorized by this session's "Implement ONLY Milestone
  10" instruction; the exact command to run once unblocked is in
  Current Status. Recorded as Known Risk #9 (open, not
  resolved-by-precedent). No application code, business logic,
  database, auth, or product functionality touched; no architecture
  redesigned; no Constitution/ADR changed; no commit made. — AI agent
  (Claude Code), pending user review before Milestone 11.

- **2026-08-02** — Milestone 9 (Developer tooling) complete: this
  session's resume request labeled the target "Milestone 9 → CI /
  GitHub Actions," which does not match `docs/sprints/sprint-01.md`,
  §15 (Milestone 9 = Developer tooling; CI is Milestone 10). Surfaced
  to the user rather than silently picking an interpretation; the user
  chose the strict-repo-truth path (resolves/records Known Risk #8).
  Installed `husky@^9`, `lint-staged@^17`, `@commitlint/cli@^21`,
  `@commitlint/config-conventional@^21` as root devDependencies via
  `pnpm add -D -w`. Ran `pnpm exec husky init`, which set
  `core.hooksPath=.husky` and added `"prepare": "husky"` to
  `package.json`; replaced the generated default `.husky/pre-commit`
  (`pnpm test`) with `pnpm exec lint-staged`, and added
  `.husky/commit-msg` running `pnpm exec commitlint --edit "$1"`.
  Added `commitlint.config.js` (`module.exports = { extends:
['@commitlint/config-conventional'] }`) — validated directly (not
  just by inspection) against a non-conventional message (correctly
  rejected, `subject-empty`/`type-empty`) and a conventional one
  (correctly accepted). Added `.lintstagedrc.cjs` rather than an inline
  `"lint-staged"` key in `package.json`, because a plain
  `"apps/backend/**/*.{ts,js}": "eslint --fix"` entry was tried first
  and failed: ESLint v9's flat config resolves `eslint.config.*`
  relative to `process.cwd()`, not per linted file, so running from the
  repo root (lint-staged's invocation context) could not find
  `apps/backend/eslint.config.mjs`. The working fix uses a
  function-based entry that computes each file's path relative to
  `apps/backend` and runs `pnpm --filter backend exec eslint --fix`
  (which sets `cwd` to `apps/backend`, matching how `turbo run lint`
  already succeeds for that package). A second glob,
  `**/*.{ts,tsx,js,jsx,json,md,mdx,yml,yaml}`, runs `prettier --write`
  repo-wide; added `"@natkhat-ai/config-prettier": "workspace:*"` and
  `"prettier": "^3.4.0"` as new root devDependencies and a root
  `"prettier": "@natkhat-ai/config-prettier"` field (matching the
  consumption pattern documented in
  `packages/config-prettier/README.md`) so root-level files (docs,
  scripts, root configs) format against the Milestone 7 shared config
  instead of Prettier's defaults — verified via `pnpm exec prettier
--check package.json commitlint.config.js`. Added `.prettierignore`
  excluding `apps/mobile/` (Flutter/Dart, not a Prettier consumer per
  ADR-0002) and generated output (`node_modules/`, `.turbo/`, `dist/`,
  `build/`, `coverage/`, `pnpm-lock.yaml`). Validated the full
  pre-commit path end-to-end twice with disposable fixtures created
  inside `apps/backend/src/` (staged via `git add`, run through `pnpm
exec lint-staged`, then unstaged and deleted — never committed, same
  disposable-fixture discipline as Milestone 7): a badly-formatted but
  lint-clean file was correctly fixed by both tasks (exit 0); a file
  with a real `@typescript-eslint/no-unused-vars` violation was
  correctly caught and the task run correctly failed (non-zero exit),
  confirming the hook would actually block a bad commit rather than
  silently passing. Flagged, not silently fixed: this environment has
  `core.filemode=false` (confirmed via `git config core.filemode`), so
  `chmod +x` on the two hook files does not survive into the git index
  — a test `git add` + `git ls-files -s` showed both staged as `100644`
  despite being `-rwxr-xr-x` on disk; since `.husky/*` hooks require the
  executable bit on Linux/Mac, whoever makes the first real commit must
  run `git update-index --chmod=+x .husky/pre-commit
.husky/commit-msg` (or equivalent) at that time — recorded in
  Pending Tasks rather than force-staged unilaterally, to preserve this
  repo's zero-commits/zero-staged-state pattern to date. No application
  code, business logic, or CI workflow changed; no commit made — that
  remains the user's call. — AI agent (Claude Code), pending user
  review before Milestone 10.
- **2026-07-31** — Milestone 8 (App scaffolds) complete: created
  `apps/backend` via `nest new backend --package-manager pnpm
--skip-git --skip-install --strict` (NestJS 11), per
  `docs/sprints/sprint-01.md`, §15, ADR-0003. Wired it to all three
  Milestone 7 shared config packages: `tsconfig.json` now `extends
"@natkhat-ai/config-typescript/base.json"` with only the
  Nest-required overrides added (`emitDecoratorMetadata`,
  `experimentalDecorators`, `target: ES2023`, `baseUrl`, `incremental`,
  `outDir`, `removeComments`, `resolvePackageJsonExports`,
  `allowSyntheticDefaultImports`); `eslint.config.mjs` now imports
  `@natkhat-ai/config-eslint/base` instead of Nest's generated
  type-aware config, with a `files`-scoped override adding Jest
  globals for `**/*.spec.ts`; removed the generated `.prettierrc` and
  added `"prettier": "@natkhat-ai/config-prettier"` to `package.json`;
  removed now-unused direct devDependencies (`eslint-plugin-prettier`,
  `eslint-config-prettier`, `typescript-eslint`) that were superseded
  by the shared config's own internal dependencies; added
  `@natkhat-ai/config-typescript`, `@natkhat-ai/config-eslint`,
  `@natkhat-ai/config-prettier` as `workspace:*` devDependencies; added
  a `typecheck` script (`tsc --noEmit -p tsconfig.json`, not part of
  Nest's default template) and a `dev` script (`nest start --watch`)
  so the app participates in every `turbo.json` task name. Reformatted
  the generated `src/`/`test/` files to the shared Prettier style (`pnpm
run format`). While wiring, found and fixed a real defect in
  `packages/config-eslint/package.json`: it had no `"exports"` map, so
  the documented `import ... from '@natkhat-ai/config-eslint/base'`
  usage failed under Node's ESM resolver (`ERR_MODULE_NOT_FOUND` — ESM
  does not extension-guess bare subpath imports the way CommonJS
  `require` does); added `"exports": {".": "./base.js", "./base":
"./base.js"}` and re-verified both the fix and `apps/backend`'s lint
  task pass. Ran `pnpm install` at the root (backend now present in
  the committed `pnpm-lock.yaml`) and confirmed via `turbo run
typecheck lint test build` that all four tasks pass for
  `apps/backend`. Created `apps/mobile` via `flutter create
--platforms=android,ios --org ai.natkhat --project-name mobile
apps/mobile` (Flutter 3.44.8), per ADR-0002. `--org ai.natkhat` is a
  placeholder reverse-domain identifier — no ASPOVO/Natkhat domain or
  bundle-ID convention is ratified in any governance document; recorded
  here rather than decided silently, and trivially changeable before
  any real store submission, so not treated as a blocker. Per
  ADR-0002, `apps/mobile` intentionally has no `package.json` (not a
  pnpm workspace member, does not consume the shared TS/ESLint/Prettier
  packages) — confirmed `pnpm list -r` still shows exactly 4 workspace
  projects after scaffolding. Validated with `flutter analyze` (no
  issues) and `flutter test` (1 passed, the generator's own smoke
  test); did not attempt a native platform build (APK/IPA) in this
  environment — Xcode isn't available on Windows, and `analyze`/`test`
  are the two checks `docs/sprints/sprint-01.md` §16 actually specifies
  for CI. Updated the default `pubspec.yaml` `description` field only
  (no code changes) and confirmed `.dart_tool/`, `build/`, `.idea/`,
  `*.iml`, and `android/local.properties` are all gitignored via
  Flutter's own generated nested `.gitignore` files. Updated root
  `.gitignore`'s stale forward-reference comment. Deliberately did
  **not** add `turbo.json` root-task wiring (`//#...`) for `flutter
analyze`/`flutter test`, even though ADR-0002/`sprint-01.md` §11
  describe Flutter as "a Turborepo task" — that CI-integration decision
  is Milestone 10's (CI foundation) to make with full `ci.yml` context,
  not implied by anything Milestone 8's own definition of done
  requires (§15: "wired to shared config **where applicable**" — N/A
  for Flutter per ADR-0002 — and "both run/build," which is validated
  above via direct Flutter CLI). Updated `PROJECT.md` (this file) per
  the Sprint Document's same-PR update discipline (§2), which Milestone
  8's own instructions treat as an explicit requirement. No `apps/`
  content beyond the two scaffolds, no business logic, authentication,
  RBAC, database, storage, APIs, or AI integration implemented; no
  commit made — that remains the user's call. — AI agent (Claude
  Code), pending user review before Milestone 9.
- **2026-07-31** — Milestone 7 (Shared config packages) complete:
  created `packages/config-typescript` (`base.json`), `packages/config-eslint`
  (`base.js`), `packages/config-prettier` (`index.json`) — each with
  its own scoped `package.json` (`@natkhat-ai/*`, private,
  workspace-internal) and README, per `docs/sprints/sprint-01.md`, §12,
  §15. Ran `pnpm install` (`pnpm-lock.yaml` now committed to the tree)
  and validated: `config-eslint`/`config-prettier` self-lint and
  self-format-check against their own shared config via
  `pnpm --filter <pkg> run lint|format:check`; `turbo run lint`
  correctly scopes to the 3 packages via the pnpm workspace graph;
  `config-typescript`'s `base.json` and `config-eslint`'s `base.js`
  were each validated as real `extends`/import targets against
  disposable fixture files created outside the repo (session
  scratchpad only, never committed) — both correctly passed valid code
  and caught an intentionally broken example. No `apps/` or dummy
  in-repo consumer packages were created, per this milestone's explicit
  "no apps" instruction. Updated `pnpm-workspace.yaml`'s comment
  (`packages/` now exists). Tooling-config only — no application code,
  business logic, backend services, Flutter code, AI integration,
  authentication, RBAC, database, storage, or APIs implemented; no
  commit made (repo has no commits yet, per prior milestones' pattern —
  committing remains the user's call). — AI agent (Claude Code),
  pending user review before Milestone 8.
- **2026-07-30** — Milestone 6 (Engineering standards docs) complete:
  authored the seven engineering checklists
  (`docs/engineering/checklists/`: repository, sprint, pull-request,
  release, security, production, ai-review), `feature-flags.md`,
  `security-by-design.md`, `testing-strategy.md`, `versioning.md`, and
  `docs/architecture/observability.md`, per
  `docs/sprints/sprint-01.md`, §15, §19–§24; updated
  `docs/engineering/README.md`, `docs/architecture/overview.md`, and
  `docs/modules/TEMPLATE.md`'s forward-references. Recorded (not
  resolved unilaterally) a documentation gap: seven further how-tos
  (coding-standards, branching-and-commits, release-strategy,
  dependency-management, environment-management, code-review-workflow,
  ci-cd) are named by the Engineering Constitution's text and
  `sprint-01.md` §4 as belonging under `docs/engineering/`, but are not
  part of §15's explicit Milestone 6 definition; left unscheduled
  pending a Change Request. Documentation only — no application code,
  auth, RBAC, database, storage, APIs, AI models, business features,
  UI, or infrastructure implemented; no commit made. — AI agent
  (Claude Code), pending user review before Milestone 7.
- **2026-07-30** — Milestone 5 (Module Registry scaffolding) complete:
  authored `docs/modules/TEMPLATE.md` in full (Vision, Requirements,
  Architecture, APIs, Database, Security, Testing, Deployment — per
  `docs/sprints/sprint-01.md`, §13) and updated `docs/modules/README.md`.
  No scope discrepancy this session — the resume request matched
  `sprint-01.md`, §15's Milestone 5 definition exactly. Documentation
  only — no module created, no structure/architecture/code changed, no
  commit made. — AI agent (Claude Code), pending user review before
  Milestone 6.
- **2026-07-30** — Milestone 1.5 approved by the user. Milestone 2
  (Governance population — remaining) complete: authored
  `docs/engineering/change-request-process.md` in full
  (`docs/sprints/sprint-01.md`, §10) and updated
  `docs/engineering/README.md`. This session's resume request asked to
  begin "Milestone 2 — Shared Infrastructure," which does not match the
  approved Sprint 01 document (actual Milestone 2 is documentation-only;
  auth/database/RBAC/audit-logging/event-framework/security-middleware/
  observability implementation is not in Sprint 01's scope at all, and
  is further gated by Known Risk #1/#2's still-unwritten data-privacy
  ADR). Flagged to the user rather than silently resolved; user chose
  to follow the Sprint Document strictly and defer all
  shared-infrastructure code. Documentation only — no structure,
  architecture, or code changed; no commit made. Resolves/records Known
  Risk #7. — AI agent (Claude Code), pending user review before
  Milestone 5.
- **2026-07-29** — Milestone 1.5 (Repository Governance
  Synchronization) complete: ratified
  `docs/constitution/product/child-privacy-and-safety-constitution.md`
  (Tier-1 Product Constitution Amendment) from the user-supplied
  directive; synchronized `PROJECT.md`, Engineering Constitution
  (mandatory review gates), Product Constitution (Trust-Above-All
  amendment), ADR Index (governing reference, no new ADR), root
  `README.md`, `.ai/context/agent-workflow.md`; created
  `docs/engineering/review-checklist.md`. Documentation only — no
  structure, architecture, or code changed. Resolves Known Risk #5. —
  AI agent (Claude Code), pending user review.
- **2026-07-29** — Milestone 1 (Root Repository Scaffold) complete:
  `git init` (default branch set to `main`), root tooling config,
  remaining `docs/` domains with placeholder READMEs,
  `infrastructure/` and `scripts/` placeholders, `.github/` templates.
  Flagged two discrepancies against the resuming brief (missing Child
  Privacy & Safety Constitution file; requested scope beyond §15's
  Milestone 1) rather than resolving them unilaterally. — AI agent
  (Claude Code), pending user review.
- **2026-07-28** — Initial creation: `PROJECT.md`, documentation
  structure, Company/Product/Engineering Constitutions, ADR-0001
  through ADR-0005, Decision Log, Knowledge Vault, `.ai/` workspace,
  Sprint 01 document. — AI agent (Claude Code), pending user review.

## Last Updated

2026-08-04 — Post-Sprint-01 Remediation, Governance Close-Out.
**Sprint 01 is permanently merged into `main`** (Phase 1, merge commit
`87de72d`; branch protection intact except a temporary, tracked,
reversible `required_approving_review_count: 0`). Phase 2 (2026-08-03)
created [ADR-0006](docs/decisions/ADR-0006-data-privacy-compliance.md)
and [ADR-0007](docs/decisions/ADR-0007-target-audience-interim-posture.md),
clearing ADR-0004/ADR-0005's "dedicated compliance ADR must exist"
prerequisite. This close-out session (a) verified ADR-0006 against every
governing Constitution/ADR with no defect found, and (b) obtained
explicit founder ratification of ADR-0007's target market (India, single
market at launch) and age range (4–10) — recorded as ADR-0007 §D, a
business decision explicitly not treated as legal approval. Gate status
is now **PARTIALLY SATISFIED**: design work may proceed under the ADRs'
engineering posture; real implementation remains gated on India DPDP Act
legal validation of the eventual consent-capture design and the specific
consent-verification mechanism (ADR-0007 §C.3/§C.6, ADR-0006 "Legal
Validation Required"), neither performed by this phase. The ASPOVO
Constitution placeholder remains re-evaluated as not a Sprint 02 blocker
(unchanged this session). Updated `PROJECT.md` (this file) and
`docs/decisions/ADR-0007-target-audience-interim-posture.md` for
governance traceability — no Constitution rewritten, no architecture
redesigned, no database/auth/API/storage/AI-memory/business-feature code
touched, no Sprint 02 Sprint Document created. Implementation gate:
Sprint 02 planning/documentation allowed; database, authentication,
child personal-data collection, and production child users remain
blocked. Committing and pushing through the protected-branch/PR
workflow per explicit instruction, now that no further founder decision
blocks ADR-0007.
