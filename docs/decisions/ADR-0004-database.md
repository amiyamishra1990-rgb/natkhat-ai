# ADR-0004: Adopt PostgreSQL (via Supabase) with Prisma — Decision Recorded, Implementation Deferred

**Version:** 1.0.0
**Status:** Accepted — Implementation Deferred. **Hosting clause
amended 2026-08-23 by [ADR-0016](./ADR-0016-firebase-auth-and-google-cloud-migration.md)
("via Supabase" → Google Cloud, Cloud SQL for PostgreSQL as the
dev-instance candidate, founder-directed).** The database engine
(PostgreSQL) and ORM (Prisma) choices below are unchanged and not
reopened by ADR-0016. This ADR is left otherwise unedited as the
historical record.
**Owner:** Engineering
**Last Updated:** 2026-07-28

## Context

PostgreSQL, hosted via Supabase, with Prisma as the ORM, is locked as
Natkhat AI's database layer in the Product Constitution's technology
stack. Natkhat AI is a children/family-facing product; its data model
will include child and family data, which raises privacy and
compliance obligations (COPPA or equivalent) that have not yet been
resolved (see the Product Constitution's Target Audience section).

## Decision

Record PostgreSQL (via Supabase) with Prisma as the system of record
for Natkhat AI. **No implementation** — no schema, no migration, no
Prisma client integration — begins in Sprint 01 or any subsequent
sprint until a dedicated data-privacy/compliance ADR exists and is
accepted.

## Consequences

- This ADR alone does not authorize any code touching a database.
- A future data-privacy/compliance ADR is a hard prerequisite for
  implementation, gating this decision, not a parallel workstream.
- Tracked as an open risk in `docs/sprints/sprint-01.md`, Risk
  Register (Privacy category).

## Constitution Alignment

Product Constitution — locked technology stack, Target Audience (not
yet ratified). Engineering Constitution — Security by design.
