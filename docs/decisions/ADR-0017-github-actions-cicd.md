# ADR-0017: Adopt GitHub Actions for CI/CD

**Version:** 1.0.0
**Status:** Accepted
**Owner:** Engineering
**Last Updated:** 2026-08-31

## Context

`PROJECT.md`'s and the Product Constitution's Approved Tech Stack tables
have listed the `CI/CD` row as "Not yet recorded" since Sprint 01, even
though GitHub Actions has been Natkhat AI's de facto, and only, CI system
since Sprint 01 Milestone 10 (`docs/sprints/sprint-01.md`, §15, §16):
`.github/workflows/ci.yml` was authored, exercised on a real PR, and
verified green on GitHub Actions at Milestone 10, and required-status-check
branch protection was configured against its five job names (`lint`,
`typecheck`, `test`, `build`, `mobile`) the same session. Every sprint
since (02, 03, 04) has continued to rely on it without any alternative
ever being evaluated or adopted.

`docs/sprints/sprint-04.md`, §2.2 flagged this citation gap directly
("`GitHub Actions` has been the de facto CI since Sprint 01 M10 but has
no dedicated ADR... Minor documentation housekeeping, not urgent, not
blocking anything") and deferred writing it. Sprint 05, Milestone 24
(`docs/sprints/sprint-05.md`, Founder Decision G.3) closes that gap.

This ADR is a documentation-of-existing-fact record, not a new
architecture decision — `ci.yml` is not modified by this ADR, and no CI
behavior changes as a result of it.

## Decision

Adopt GitHub Actions as Natkhat AI's CI/CD system, formally recording the
choice already in effect since Sprint 01 Milestone 10. `.github/workflows/ci.yml`
defines five jobs, each independently required by `main`'s branch
protection: `lint`, `typecheck`, `test`, `build` (Turborepo-filtered to
packages changed since the PR base) and `mobile` (Flutter, gated on
`apps/mobile/**` changes via `git diff` rather than a Turborepo filter,
per ADR-0002's exclusion of `apps/mobile` from the pnpm/Turborepo
dependency graph). `test` additionally runs a real, ephemeral Postgres
service container (added Sprint 03 Milestone 13) — never Supabase, GCP,
or a production database.

No deployment (CD) workflow exists yet; "CI/CD" in the Approved Tech
Stack tables refers to the continuous-integration half only, consistent
with the repository having no deployable environment (`PROJECT.md`'s
Current Release: "Pre-release — no deployable environment yet"). Adding
a real deploy workflow is separate future work, gated on the same
production-readiness prerequisites as any other production milestone —
not authorized by this ADR.

## Consequences

- Closes the "Not yet recorded" citation gap in `PROJECT.md`'s and the
  Product Constitution's Approved Tech Stack tables — both updated to
  cite this ADR.
- No change to `.github/workflows/ci.yml`, branch protection, or any CI
  behavior. This ADR ratifies the status quo; it does not alter it.
- Future CD (deployment) workflow decisions are out of scope here and
  will need their own ADR when a real deployment target exists.

## Constitution Alignment

Engineering Constitution — CI/CD as a required engineering practice
(`docs/engineering/checklists/repository-checklist.md`,
`docs/engineering/checklists/pull-request-checklist.md`). No Product or
Child Privacy & Safety Constitution clause is implicated — this ADR
concerns build/test tooling only, not any data-handling or child-facing
behavior.
