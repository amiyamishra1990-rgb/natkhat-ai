# Versioning Strategy

**Version:** 1.0.0
**Status:** Documented — no API, database, or mobile release exists
yet to version
**Owner:** Engineering
**Last Updated:** 2026-07-30

Full authorship of the strategy at `docs/sprints/sprint-01.md`, §24.

## Repository version

Root `package.json` (`natkhat-ai`, currently `0.0.0`, pre-release).
Semantic Versioning (`MAJOR.MINOR.PATCH`), bumped only at a real
release per
[`release-checklist.md`](./checklists/release-checklist.md). No
release exists yet in Sprint 01.

## API version

Once `apps/backend` has endpoints (Milestone 8+), the API is versioned
in its URI path (`/v1`, `/v2`), never as a silent breaking change to an
existing version. A new major API version is an ADR-worthy decision if
it forces client migration.

## Database version

Prisma migration history (ADR-0004) is the database's version record.
No migration exists yet — ADR-0004's implementation is deferred until
the required data-privacy/compliance ADR is written
(`docs/sprints/sprint-01.md`, §26, Known Risk #1). Every migration,
once they begin, must be reversible or explicitly documented as
irreversible with a stated reason.

## Mobile version

Flutter's `pubspec.yaml` `version: X.Y.Z+build` (semantic version plus
monotonic build number for app-store submissions). Mobile releases use
dedicated `release/mobile-vX.Y.Z` branches
(`docs/sprints/sprint-01.md`, §17), independent of the repository
version — app-store release cadence does not have to match backend
deploys.

## Release version

Conventional Commits (enforced by commitlint,
`docs/sprints/sprint-01.md`, §17) drive the semantic version bump:
`fix:` → patch, `feat:` → minor, a commit with a `BREAKING CHANGE:`
footer → major. Tags follow `vX.Y.Z`.

## Migration strategy

No user data exists yet, so no data-migration strategy is active in
Sprint 01. Once ADR-0004 is implemented, every schema migration must:
run in a transaction where the database supports it, be tested against
a representative dataset before applying to production, and have a
documented rollback — enforced by
[`production-checklist.md`](./checklists/production-checklist.md).

## Enforcement

[`release-checklist.md`](./checklists/release-checklist.md) requires
the correct version bump before any release proceeds.
