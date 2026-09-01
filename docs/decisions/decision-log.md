# Decision Log

**Version:** 1.0.0
**Status:** Living — append-only, updated as new minor decisions are recorded
**Owner:** Engineering
**Last Updated:** 2026-09-01

Append-only. Each entry: date, one-line decision, one-line rationale,
author. Small implementation decisions that don't warrant a full ADR
go here (see `docs/sprints/sprint-01.md`, §8/§9, for the ADR vs.
Decision Log split). If an entry later turns out to have architectural
consequences, it is promoted to a full ADR that references the
original entry; the entry itself is never deleted or rewritten.

---

- **2026-07-28** — Decision: Author governance documentation
  (Constitutions, ADRs, Decision Log, Sprint 01 document, Knowledge
  Vault, `.ai/` workspace) before any repository scaffolding or source
  code is created. Rationale: establishes a Single Source of Truth
  before code exists, per the approved Sprint 01 architecture plan.
  Author: Amiya (product owner), recorded by AI agent.
- **2026-08-03** — Decision: temporarily set `main` branch protection's
  `required_approving_review_count` from 1 to 0 (all other protections —
  required PR workflow, 5 required status checks, `strict` mode,
  `enforce_admins`, no force-push, no branch deletion — unchanged).
  Rationale: the repository has exactly one collaborator (the owner),
  who cannot approve their own pull request; with `enforce_admins: true`
  and no second reviewer, this created an unconditional merge deadlock
  to `main` for every future PR, not just PR #1. This is a temporary,
  fully reversible condition, not a permanent weakening of review
  discipline — restore `required_approving_review_count` to 1 (or
  higher) via the same `gh api ... branches/main/protection/required_pull_request_reviews`
  PATCH call the moment a second trusted collaborator/reviewer is added
  to the repository. Tracked in `PROJECT.md`'s Known Risks as a
  temporary one-person-repository governance condition. Author: Amiya
  (product owner, approved explicitly), recorded by AI agent.
- **2026-08-18** — Decision: `invite_revoke_co_parent` is a
  co-parent-eligible action grantable via `permission_scope`, not one
  of the five hard-invariant owner-only actions. Rationale: ADR-0009's
  Decision item 3 names exactly five owner-only-unconditional actions
  (billing, family/account deletion, data export, share-link
  management, consent-of-record changes) — co-parent invite/revoke is
  not among them. The M15 implementation (`authorization.types.ts`)
  and the architecture doc's §5 table had conservatively treated it as
  a sixth owner-only action, which this session's review confirmed
  contradicts the ADR's literal text; corrected code, tests, and doc
  to match ADR-0009 as written, with dated footnotes in
  `docs/architecture/authorization-and-sessions.md` preserving the
  original wording rather than silently rewriting it. This is an
  alignment fix to the existing ADR, not a new architectural decision —
  ADR-0009 itself is unchanged. Author: Amiya (product owner),
  reviewed and approved applying this change in session; recorded by
  AI agent.
- **2026-08-22** — Decision: Sprint 03 Milestone 20 (first end-to-end
  vertical slice) deliberately leaves Leo-chat interaction ungated at
  the authorization layer, and this is recorded as a known, open gap
  rather than silently accepted. No `Action` exists in
  `authorization.types.ts`'s bounded set (M15) for "interact with Leo
  for a given child," and `leo/leo.service.ts` (M18) never calls
  `AuthorizationService.authorize(...)` anywhere — the only isolation
  Leo's module currently enforces is the family/child scoping proven
  by M14's RLS and M18's own application-layer cross-child checks, not
  a permission check on _which_ parent (owner vs. co-parent, or a
  future child-session principal) may open or send messages in a given
  child's Leo conversation. M20's vertical-slice integration test
  (`apps/backend/test/vertical-slice.e2e-spec.ts`) exercises this
  exactly as M18 shipped it, rather than introducing a new `Action`
  into the already-closed M15 authorization file to paper over the
  gap. Rationale: adding real authorization to Leo interactions is a
  substantive M15/M18-scope change (new bounded Action, a decision on
  whether/how a co-parent's `permission_scope` should gate it, and
  possibly the reserved child-principal question ADR-0009 Decision
  item 7 already deferred) — not something to bolt on incidentally
  inside an integration-test milestone. Flagged here explicitly for a
  future milestone to design and close, not left to be rediscovered.
  Author: Amiya (product owner), directed this exact scoping and
  disclosure in session; recorded by AI agent.
- **2026-08-23** — Decision: migrate off Supabase entirely onto Google
  Cloud — Firebase Authentication replaces Supabase Auth, and
  PostgreSQL hosting moves from Supabase to Google Cloud (Cloud SQL for
  PostgreSQL as the dev-instance candidate); recorded formally as
  [ADR-0016](./ADR-0016-firebase-auth-and-google-cloud-migration.md),
  which supersedes ADR-0005's authentication clause and amends
  ADR-0004's hosting clause. Rationale: founder already holds a Google
  Cloud billing subscription and wants to consolidate spend there — a
  founder-level technology-decision change, not an engineering
  recommendation. Storage (ADR-0005's other clause) is explicitly not
  part of this decision and remains open. Sprint 03 Decision J.5's dev
  Supabase project is superseded by a real, non-production dev Firebase
  project (`natkhat-ai-dev`) for authentication; M13/M14's dev Postgres
  target moves toward a dev-only Cloud SQL instance per the same ADR.
  Author: Amiya (product owner/founder, decided directly), recorded by
  AI agent.
- **2026-08-27** — Decision: close the Leo-chat authorization gap
  recorded in this log's 2026-08-22 entry, as Sprint 04 Milestone 23
  ("Leo-Chat Authorization Gap"). A new `Action`, `interact_with_leo`,
  was added to `authorization.types.ts`'s bounded set (M15), and
  `leo/leo.service.ts`'s `startConversation`/`appendMessage` — the
  chat-start/message-send entry points the 2026-08-22 entry named
  directly — now each call `AuthorizationService.authorize(...)` for
  that Action before doing anything else, denying (via a new
  `LeoChatNotAuthorizedError`) any principal who fails either the M15
  tenant/family-scope gate or the action-permission gate. Not one of
  ADR-0006 §6's five owner-only-unconditional actions, so a co-parent
  is granted it only when explicitly present in their own
  `permission_scope`, same as every other non-owner-only action — no
  new default-allow introduced. Proven with both a unit-level
  (`authorization/authorization.service.spec.ts`) and a real-Postgres
  integration test (`leo/leo-chat-authorization.integration.spec.ts`,
  covering owner-allow, granted-co-parent-allow, ungranted-co-parent-
  deny, no-role-at-all-deny, and live revocation), plus an update to
  `apps/backend/test/vertical-slice.e2e-spec.ts` (M20) proving the
  existing end-to-end flow still passes with the gate in place.
  Rationale: the 2026-08-22 entry explicitly flagged this "for a future
  milestone to design and close, not left to be rediscovered" — Sprint
  04's own Founder Decision F.6 (`docs/sprints/sprint-04.md`, §3)
  scheduled that milestone as M23, sequenced after M22. Explicitly does
  **not** touch ADR-0009 Decision item 7 (child-login/child-session):
  this gates which _parent-authenticated_ principal may act, not
  whether a Child principal may. Author: Amiya (product owner/founder —
  gave the explicit go-ahead to implement M23 directly, satisfying this
  project's standing one-milestone-at-a-time authorization discipline
  the same way the 2026-08-26 M22 go-ahead did, per
  `docs/sprints/sprint-04.md` §4's M23 section), recorded by AI agent.
- **2026-09-01** — Decision: close the audit-log endpoint no-auth-guard
  gap self-flagged at Sprint 04 Milestone 22, as Sprint 05 Milestone 25
  ("Admin Authentication for Audit-Log Endpoint"). `GET /audit-events`
  (`apps/backend/src/audit/audit.controller.ts`) now requires
  `AdminAuthGuard` (`apps/backend/src/admin-auth/admin-auth.guard.ts`):
  a valid `Authorization: Bearer <Firebase ID token>` that resolves,
  via a new `AdminUser` Prisma model
  (`prisma/migrations/20260901090000_m25_admin_authentication`), to a
  distinct admin-principal type — never a Parent or Child. A real
  Parent's own valid Firebase token is rejected (401), same as a
  missing token, because `AdminUser` and `Parent` are looked up from
  entirely separate tables (`admin-auth/admin-auth.service.ts`,
  mirroring `auth/firebase-auth.service.ts`'s own Parent lookup).
  `apps/admin` gained a corresponding `/sign-in` page
  (Firebase email/password, against the same real, non-production dev
  Firebase project, `natkhat-ai-dev`, ADR-0016) and an httpOnly
  session-cookie bridge (`app/api/session/route.ts`) so
  `app/audit/page.tsx`'s server-to-server fetch can carry the token;
  `proxy.ts` (Next.js's current file-convention name for what was
  `proxy.ts`) redirects a session-less request to `/sign-in`
  before it is attempted, though the real enforcement is, and remains,
  the backend guard. Proven with unit tests
  (`admin-auth/admin-auth.service.spec.ts`,
  `admin-auth/admin-auth.guard.spec.ts`), a real-Firebase integration
  test (`admin-auth/admin-auth.integration.spec.ts`, including the
  Parent-token-rejected case), and a real-HTTP e2e test
  (`apps/backend/test/audit-events-auth.e2e-spec.ts`) proving
  `GET /audit-events` itself rejects an unauthenticated request,
  rejects a real Parent credential, and accepts a real AdminUser
  credential. What the endpoint returns is unchanged — Founder
  Decision F.3's audit-log-data-only hard boundary is unaffected; only
  who may call it changed. No admin RBAC/role system, no admin-invite/
  management flow, and no change to child-login/child-session
  (ADR-0009 item 7) — none of those were touched, per M25's explicit
  exclusions. Rationale: the Sprint 04 M22 entry (and
  `apps/backend/src/audit/audit.controller.ts`'s and
  `apps/admin/README.md`'s own comments at the time) flagged this
  explicitly as "must be closed before any real deployment," not
  urgent given no production deployment target existed — Founder
  Decision G.2 (`docs/sprints/sprint-05.md`, §3) authorized closing it
  as its own separately-authorized Milestone 25, sequenced after M24.
  Author: Amiya (product owner/founder — gave the explicit go-ahead to
  implement M25 directly, following M24's merge, per this project's
  standing one-milestone-at-a-time authorization discipline), recorded
  by AI agent.
