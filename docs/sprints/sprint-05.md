# Sprint 05 — Planning Pass (Governance Sync + Founder-Gated Recommendations)

**Version:** 1.2.0
**Status:** Founder Decisions G.1–G.5 (§3) are **decided** — recorded
below with their actual outcomes, not just the open questions. **M24
(Sprint 04 Close-Out & Governance Sync) is merged into `main`** (PR
#26) — see §4, M24 for the full scope, including the G.3 CI/CD ADR and
G.4 Storage decision folded in. **M25 (Admin Authentication for
Audit-Log Endpoint) is authorized (2026-09-01) and implemented** — see
§4, M25 for the full implementation scope; PR opened off
`feat/sprint05-m25-admin-auth`, not yet merged, awaiting founder
review. **Once M25 merges, Sprint 05 (M24+M25) is complete** — see
Next Step.
**Owner:** Product Owner
**Last Updated:** 2026-09-01

## 0. Context

The founder confirmed Sprint 04 (Milestones 21–23) is complete and merged
into `main`, and said: proceed to Sprint 05 planning.

Per this project's own governance discipline — every prior sprint
(`sprint-01.md`, `sprint-02.md`, `sprint-03.md`, `sprint-04.md`) opened
with a planning-only milestone before any implementation began — Sprint 05
does not begin with code. This document is that planning pass.

Separately, and **not part of this document's proposed scope**: the
founder is pursuing AI-provider outreach (contacting Anthropic and OpenAI
about India data-residency timing, minors-safety review process, and
contract terms) as its own track, currently on hold and not engineering
work. This document does not assume which provider, if either, will be
selected, and does not propose any real-provider integration. The M19 AI
provider boundary (mock adapter only) remains the only
implementation-authorized state.

### A governance-sync gap found while preparing this document

`docs/sprints/sprint-04.md` (Last Updated 2026-08-27) records M22 and M23
as "implemented... not yet merged; awaiting founder review." Both have
since actually merged into `main`: PR #24 (M22, `apps/admin` +
`apps/website` scaffolding) on 2026-08-27, and PR #25 (M23, Leo-chat
authorization gap) also on 2026-08-27. `PROJECT.md`'s last edit
(commit `c90eb16`, the M21 close-out itself) predates both merges — it
still describes M22 and M23 as **"drafted but not yet authorized"** in at
least four places (Current Development Phase, Current Milestone, the
Sprint 03/04 pointer table, and the Repository Structure comment on
`sprint-04.md`), and its Repository Structure section does not list
`apps/admin`, `apps/website`, or the M23 authorization-service change at
all. This is the same class of gap Sprint 04's own Milestone 21 was
created to close for Sprint 03 (`docs/sprints/sprint-04.md`, Context) —
Sprint 04 has no equivalent close-out step for itself yet.

**Recommendation, not a confirmed decision:** Sprint 05 open with a
close-out/governance-sync milestone for Sprint 04 (mirroring Sprint 02
M11 and Sprint 04 M21), before any other Sprint 05 work, so `PROJECT.md`
catches up with M22/M23's actual merged state before new scope is added
on top of a stale baseline. See §4, proposed Milestone 24.

Two smaller staleness findings from the same review, surfaced here rather
than silently fixed:

- The Product Constitution's Locked Technology Stack table still lists
  `CI/CD` as "Not yet recorded," even though GitHub Actions has been the
  de facto CI since Sprint 01 Milestone 10. `docs/sprints/sprint-04.md`
  §2.2 already flagged this as "minor documentation housekeeping, not
  urgent, not blocking anything" and it remains undone.
- The same table's `Storage` row still reads "Supabase Storage," and
  [ADR-0016](../decisions/ADR-0016-firebase-auth-and-google-cloud-migration.md)
  (Decision item 4) explicitly left that as an **open item pending a
  separate, explicit founder decision** when Auth and Database moved off
  Supabase. This is not a staleness bug — it is an accurate record of a
  gap the founder has not yet closed — but it is worth surfacing again
  now that the rest of the Supabase footprint is gone.

---

## 1. Governance Checkpoint (recap, not restated authority)

| Item                                                | Status                                                                                                                                                                                                                                                     |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sprint 01                                           | Complete, permanently merged (`main`)                                                                                                                                                                                                                      |
| Sprint 02 (M1–M11)                                  | Complete, permanently merged (`main`)                                                                                                                                                                                                                      |
| Sprint 03 (M12–M20)                                 | Complete, permanently merged (`main`)                                                                                                                                                                                                                      |
| Sprint 04 (M21–M23)                                 | Complete, permanently merged (`main`) — M21 PR #23, M22 PR #24, M23 PR #25, all 2026-08-27                                                                                                                                                                 |
| Sprint 05 M24 (Governance Sync)                     | Complete, permanently merged (`main`) — PR #26, 2026-08-31                                                                                                                                                                                                 |
| ADR-0016 (Google Cloud/Firebase migration)          | Accepted, implemented, merged                                                                                                                                                                                                                              |
| ADR-0014 (Next.js for admin/website)                | Accepted, implemented (M22)                                                                                                                                                                                                                                |
| M23 (`interact_with_leo` authorization Action)      | Merged — Leo-chat start/continue now gated; child-login/child-session (ADR-0009 item 7) still untouched, its own separate, not-yet-opened decision                                                                                                         |
| M25 (Admin Authentication for Audit-Log Endpoint)   | Complete, merged (PR #27) — see §4, M25                                                                                                                                                                                                                    |
| ADR-0011 (Consent), ADR-0013 (AI-Provider Boundary) | Still **Proposed**, not Accepted — same open legal/business gates as Sprint 03 §6                                                                                                                                                                          |
| `PROJECT.md`                                        | Corrected by M24 to reflect M21–M23 as merged; see §0 for the gap as originally found. Not further updated by M25 — PROJECT.md sync happens at the next close-out milestone, per this project's own precedent (M22/M23 were likewise not synced until M24) |
| This document                                       | Founder Decisions G.1–G.5 recorded (§3); M24 merged; M25 authorized and implemented, PR open — Sprint 05 (M24+M25) complete once M25 merges                                                                                                                |

This table is a pointer, not a new authority — if it disagrees with
`PROJECT.md` or an ADR, those win, per `docs/sprints/sprint-01.md`, §1.

---

## 2. Scope Boundary (draft)

### 2.1 Confirmed candidate — backed by precedent, not yet a founder decision

Unlike Sprint 04 (which had an explicit, already-recorded founder
decision naming it by number — Sprint 03's Decision J.2), **no governing
document names Sprint 05 scope explicitly by number.**
`docs/sprints/sprint-04.md`'s own closing line says as much: "any further
Sprint 04/05 scope is a new planning conversation... not an automatic
continuation." The closest thing to confirmed scope is the governance-sync
gap identified in §0 — precedent-backed (Sprint 02 M11, Sprint 04 M21),
the same way M21 itself was proposed before being decided.

### 2.2 Recommendations for founder consideration (not yet backed by a decision)

- **Sprint 04 close-out / governance-sync milestone** (§0, §4 proposed
  M24). Precedent-based, not required by any explicit governing statement
  naming Sprint 05.
- **Admin authentication for the audit-log endpoint.** M22 shipped
  `GET /audit-events` and `apps/admin`'s `/audit` page with **no auth
  guard at all** — an explicit, deliberate M22 exclusion, documented in
  both `apps/backend/src/audit/audit.controller.ts`'s own comment and
  `apps/admin/README.md`: "a known, deliberate, temporary gap for a
  non-production, synthetic-data-only environment; it must be closed
  before any real deployment." This is the closest thing in the
  repository to an explicit "must happen eventually" engineering item
  outside the governance-sync gap. It is not urgent — `apps/admin` has no
  production deployment target yet — but it is the one piece of shipped
  code with a documented, self-flagged security gap.
- **CI/CD ADR.** `PROJECT.md`'s and the Product Constitution's Approved
  Tech Stack tables both still list CI/CD as "Not yet recorded" despite
  GitHub Actions being the de facto CI since Sprint 01 M10 (§0). Minor
  documentation housekeeping — writing a short ADR recording the existing,
  already-implemented choice, not an architecture change.

### 2.3 Open founder decision, not an engineering recommendation

- **Storage provider.** ADR-0016 deliberately left `Storage` on Supabase
  Storage as an explicit open item (Decision item 4) when Auth and
  Database moved to Firebase/GCP. No Storage code exists yet in this
  repository (ADR-0005's Storage clause has remained
  implementation-deferred throughout Sprints 01–04), so nothing is
  functionally broken by leaving it open — but the founder may want to
  resolve whether Storage moves to Google Cloud Storage (for consistency
  with the rest of the ADR-0016 migration) or stays on Supabase, before
  any milestone that would first introduce real file storage. **No
  recommendation offered** — this is a founder infrastructure-consolidation
  preference, not an engineering call, and no milestone in this document
  depends on it being resolved.

### 2.4 Candidates gated on legal/business items — not simply "next sprint" ready

Unchanged from Sprint 03 §6 / Sprint 04 §2.3 — carried forward, still
open:

| Item                                              | Gate that must clear first                                                                                                  |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Real consent-verification mechanism (M17 Track B) | India DPDP Act legal sufficiency review of the signed/e-signed form design                                                  |
| Real AI-provider integration (M19 Track B)        | Provider selection (currently a separate, on-hold founder outreach track, §0) + that provider's contract-terms legal review |
| Real production infrastructure / India residency  | India DPDP data-localization confirmation (ADR-0007 §D.3)                                                                   |
| Audit-log retention finality (ADR-0015 §13.3)     | Regulatory breach-notification obligations/timelines legal review (ADR-0006 §30)                                            |
| Child-login/child-session (ADR-0009 item 7)       | Its own separate, founder-approved Change Request per ADR-0009 itself                                                       |

If the founder wants Sprint 05 to make progress on any of these, the
concrete next step in each case is a legal/business action, not an
engineering milestone — this document does not propose engineering
milestones for any of them.

### 2.5 Explicitly excluded regardless of milestone (carried forward, unchanged)

Any real parent, child, or family data, anywhere, ever. Any production
deployment. Any real consent-verification mechanism enabled or exercised
against a real user. Any real AI/LLM provider SDK, API key, credential, or
model call — AI-provider selection is a separate, on-hold founder track
and is explicitly **not** part of Sprint 05 scope regardless of that
track's status. Any real GCP production project or India-residency claim.
Any modification to a Constitution or an already-accepted ADR beyond what
a future, explicitly-approved document records. Any claim of
COPPA/GDPR/DPDP compliance. Any child-login/child-session implementation
(ADR-0009 item 7).

---

## 3. Founder Decisions (2026-08-31)

Mirrors Sprint 03/04's format: each decision below as the founder
actually made it, not merely the question as originally posed.

**G.1 — Sprint 05 primary scope.** **DECIDED: yes.** Sprint 05 opens
with a governance-sync milestone (M24, mirroring Sprint 02 M11/Sprint 04
M21) before any other work, matching this document's own recommendation
and the precedent set by those two milestones.

**G.2 — Admin authentication.** **DECIDED: yes, as its own
separately-authorized milestone (M25).** This closes the audit-log
endpoint's self-documented no-auth-guard gap. The founder's decision
message authorized M24 only — M25 requires its own separate
authorization message once M24 is merged and verified, per this
project's one-milestone-at-a-time discipline; it is not started by this
document.

**Update (2026-09-01):** M24 merged into `main` (PR #26). The founder
subsequently gave M25 its own separate, explicit go-ahead, satisfying
the condition above — see §4, M25 for the implementation this
authorized.

**G.3 — CI/CD ADR.** **DECIDED: yes, folded into M24** as recommended —
[ADR-0017](../decisions/ADR-0017-github-actions-cicd.md), a
documentation-only ADR recording GitHub Actions as the already-implemented
CI/CD choice, not a new architecture decision.

**G.4 — Storage provider.** **DECIDED: move Storage to Google Cloud
Storage**, for consistency with the rest of the ADR-0016 migration (Auth
and Database already moved off Supabase to Google Cloud/Firebase). No
Storage code exists in the repository yet, so this is a documentation
decision only — no implementation work is authorized by this decision.
Recorded as a dated, append-only amendment to
[ADR-0016](../decisions/ADR-0016-firebase-auth-and-google-cloud-migration.md)
("Amendment — Storage (2026-08-31)") rather than rewriting the ADR's
original Decision item 4 text. The Product Constitution's and
`PROJECT.md`'s Approved Tech Stack tables' `Storage` rows are updated to
"Google Cloud Storage," citing the amendment. **No Storage
implementation code was written** — that remains a future, separately
authorized milestone whenever a real feature first needs file storage.

**G.5 — Milestone numbering.** **DECIDED: yes.** Sprint 05 continues the
running count, starting at M24, consistent with every prior sprint's
numbering discipline (F.5 in Sprint 04 set this same precedent).

---

## 4. Milestone Breakdown

### M24 — Sprint 04 Close-Out & Governance Sync _(authorized 2026-08-31 and implemented; see below)_

- **Objective:** Bring `PROJECT.md` back in sync with Sprint 04's actual,
  merged state (M21–M23) before Sprint 05 scope is added on top; fold in
  the CI/CD ADR (G.3) and the Storage decision (G.4).
- **Source:** Precedent — Sprint 02 M11, Sprint 04 M21; the specific
  staleness findings in this document's §0; founder authorization
  message, 2026-08-31 ("NATKHAT AI — Sprint 05 Founder Decisions
  (G.1–G.5) + M24 Authorization").
- **Implementation scope (as built):** `PROJECT.md` Current Development
  Phase / Current Sprint / Sprint Goal / Current Milestone / Current
  Status (new Sprint 04 Milestone Status table; Sprint 03's table marked
  historical) / Repository Structure (now shows `apps/admin/`,
  `apps/website/`, the M22 `audit.controller.ts` addition, and the M23
  `leo.service.ts` authorization-gate comment) / Approved Tech Stack /
  ADR Index / Known Risks (#16 marked resolved; new #17 for the M22
  no-auth-guard gap) / Repository Health / Major Decisions / Change Log
  updated to reflect M21–M23 as merged (PRs #23, #24, #25, all
  2026-08-27). New
  [ADR-0017](../decisions/ADR-0017-github-actions-cicd.md) recording
  GitHub Actions as CI/CD (G.3); the Product Constitution's/`PROJECT.md`'s
  Approved Tech Stack tables' `CI/CD` row updated to cite it. A new dated
  amendment to
  [ADR-0016](../decisions/ADR-0016-firebase-auth-and-google-cloud-migration.md)
  recording Storage → Google Cloud Storage (G.4); the same tables'
  `Storage` row updated to cite it. Both Constitution and `PROJECT.md`
  edits follow this project's append-only discipline — original text
  retained, not rewritten.
- **Explicit exclusions (honored as built):** No new architecture beyond
  the CI/CD ADR itself (a documentation-of-existing-fact ADR) and the
  Storage decision (a documentation-only ADR-0016 amendment — no bucket,
  SDK, or credential). No implementation code of any kind. Did not touch
  `apps/admin`, `apps/website`, or `apps/backend/src/audit/audit.controller.ts`
  (M25's scope, not yet authorized).
- **Dependencies:** None.
- **Founder/legal gates:** None.
- **Implementation authorization status:** **Authorized 2026-08-31,
  implemented, and merged** — PR #26, merged into `main` 2026-08-31.

### M25 — Admin Authentication for Audit-Log Endpoint _(authorized 2026-09-01 and implemented)_

- **Objective:** Close the M22-documented gap: add an auth guard to
  `GET /audit-events` and wire corresponding sign-in to `apps/admin`, so
  the audit-log view is no longer reachable without authentication.
- **Source:** `apps/backend/src/audit/audit.controller.ts` and
  `apps/admin/README.md`, both flagging this as a known, deliberate,
  temporary gap that "must be closed before any real deployment."
- **Implementation scope (as built):** A new, distinct admin-principal
  type — `AdminUser`
  (`apps/backend/prisma/schema.prisma`; migration
  `20260901090000_m25_admin_authentication`) — kept separate from
  Parent/Child, never an extension of either. A new `admin-auth` backend
  module (`apps/backend/src/admin-auth/`): `AdminAuthService` mirrors
  `auth/firebase-auth.service.ts`'s Parent-resolution shape but resolves
  against `AdminUser`; `AdminAuthGuard` (a NestJS `CanActivate`)
  requires `Authorization: Bearer <Firebase ID token>` and is applied
  directly to `AuditController` (`@UseGuards(AdminAuthGuard)`) — the
  only `apps/admin`-facing route that had no guard. `apps/admin` gained
  `/sign-in` (Firebase email/password client SDK,
  `lib/firebase-client.ts`), an httpOnly session-cookie bridge
  (`app/api/session/route.ts`, deliberately storing the raw ID token
  rather than exchanging it for a Firebase session cookie — see that
  file's own comment on why), a UX-only redirect gate (`proxy.ts`,
  Next.js's current file-convention name), and `app/audit/page.tsx`
  updated to send the cookie's token as a Bearer header and redirect to
  `/sign-in` on a 401. `apps/admin/README.md` and
  `audit.controller.ts`'s own comment updated to remove the "known gap"
  language.
- **Explicit exclusions (honored as built):** No change to what data
  the endpoint returns (F.3's audit-log-only hard boundary is
  unaffected). No admin authorization/RBAC system, no multiple admin
  roles, no admin-invite/admin-management flow — `AdminUser` rows are
  provisioned out-of-band, test/synthetic accounts only. No production
  deployment. No change to consent, AI-provider, or child-login/
  child-session (ADR-0009 item 7) — none touched.
- **Dependencies:** None beyond M22 (already merged). Independent of
  M24.
- **Founder/legal gates:** None identified; none encountered.
- **Tests:** Unit (`admin-auth/admin-auth.service.spec.ts`,
  `admin-auth/admin-auth.guard.spec.ts`); real-Firebase integration
  (`admin-auth/admin-auth.integration.spec.ts`, proving both a real
  AdminUser token resolves and a real Parent token is rejected — same
  skip-if-not-configured convention as
  `auth/firebase-auth.integration.spec.ts`); real-HTTP e2e
  (`apps/backend/test/audit-events-auth.e2e-spec.ts`) proving
  `GET /audit-events` itself rejects an unauthenticated request,
  rejects a real Parent credential, and accepts a real AdminUser
  credential.
- **Implementation authorization status:** **Decided-in-principle at
  G.2 (2026-08-31); given its own separate, explicit founder go-ahead
  on 2026-09-01, following M24's merge (PR #26)** — implemented per the
  scope above. **Merged into `main` via PR #27.**

---

## 5. Legal/Privacy Validation Required (unchanged, carried forward)

None of Sprint 03's five open legal/privacy items are resolved, narrowed,
or affected by anything in this document:

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

## 6. Sprint 05 Definition of Done (draft)

Not final until G.1–G.5 are answered. Provisionally, mirroring Sprint
04's §6: a new engineer or AI agent can clone the repo, read
`PROJECT.md` → Constitutions → ADRs (through ADR-0016) → this document
(once finalized) → the relevant module doc, and `PROJECT.md` accurately
reflects Sprint 04 (M21–M23) as merged. No real parent, child, or family
data exists anywhere. No production environment is active. No AI-provider
selection has been made or assumed.

---

## Next Step

**Founder Decisions G.1–G.5 (§3) are recorded.** This document's job of
surfacing every open question for the founder is done, the same role
`sprint-04.md` played before its own F.1–F.6. Per this project's
standing governance discipline: **M24 is merged into `main`** (PR #26,
2026-08-31). **M25 was subsequently given its own separate, explicit
founder go-ahead (2026-09-01, following M24's merge), implemented, and
merged** (PR #27) — see §4, M25. **Sprint 05 (M24–M25) is complete.**
Sprint 06 ("Leo's Real Experience") is the next planning pass — see
`docs/sprints/sprint-06.md`.

**Once M25 merges, Sprint 05 (M24+M25) is complete**, per Founder
Decision G.5's milestone-numbering discipline and this project's own
"any further scope is a new planning conversation, not an automatic
continuation" precedent (carried forward from Sprint 04's own closing
line, §2.1 above). No further Sprint 05/06 scope is proposed or implied
by this document.
