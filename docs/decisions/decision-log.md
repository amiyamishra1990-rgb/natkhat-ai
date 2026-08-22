# Decision Log

**Version:** 1.0.0
**Status:** Living — append-only, updated as new minor decisions are recorded
**Owner:** Engineering
**Last Updated:** 2026-08-22

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
