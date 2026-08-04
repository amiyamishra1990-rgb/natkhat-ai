# Decision Log

**Version:** 1.0.0
**Status:** Living — append-only, updated as new minor decisions are recorded
**Owner:** Engineering
**Last Updated:** 2026-07-28

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
