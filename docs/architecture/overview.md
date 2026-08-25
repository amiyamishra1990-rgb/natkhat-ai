# Architecture Overview

**Version:** 1.1.0
**Status:** Living — summarizes decisions already recorded elsewhere; originates none
**Owner:** Engineering
**Last Updated:** 2026-07-30

This page summarizes the architecture already decided in
`docs/decisions/` and `docs/sprints/sprint-01.md`. It does not make new
decisions — any change to what's described here requires an amendment
at the correct layer (an ADR or the Sprint Document), never an edit
here first. See `docs/sprints/sprint-01.md`, §1, for the full
Governance Hierarchy.

## Repository shape

Single monorepo (`natkhat-ai/`), pnpm workspaces (`apps/*`,
`packages/*`) defining the dependency graph, Turborepo orchestrating
`lint`, `typecheck`, `test`, `build`, and `dev` across it. Only the
apps and packages needed for the active sprint exist at any time — see
ADR-0001.

## Applications (locked stack)

| App     | Technology | Status                             | ADR              |
| ------- | ---------- | ---------------------------------- | ---------------- |
| Mobile  | Flutter    | Scheduled — Sprint 01, Milestone 8 | ADR-0002         |
| Backend | NestJS     | Scheduled — Sprint 01, Milestone 8 | ADR-0003         |
| Admin   | Next.js    | Sprint 02+                         | Not yet recorded |
| Website | Next.js    | Sprint 02+                         | Not yet recorded |

Flutter is orchestrated as a Turborepo _task_, never a pnpm
dependency-graph member (ADR-0001, ADR-0002).

## Data, auth, and storage

PostgreSQL with Prisma (ADR-0004) and Firebase Authentication
([ADR-0016](../decisions/ADR-0016-firebase-auth-and-google-cloud-migration.md),
2026-08-23, superseding ADR-0005's authentication clause) are the
locked choices; database hosting and authentication both target Google
Cloud (Cloud SQL for PostgreSQL; Firebase project `natkhat-ai-dev`).
Storage remains recorded as Supabase Storage (ADR-0005), unaffected by
ADR-0016, pending a separate founder decision. As of Sprint 03,
Milestones 13-19 have implemented schema, migrations, and client code
against these — this page predates that work and is not the current
implementation-status source; see `PROJECT.md`'s Current Status and the
ADR Index for that.

## Shared packages

Only tooling-config packages are in scope for Sprint 01:
`config-typescript`, `config-eslint`, `config-prettier` (Milestone 7).
No `types`, `ui`, `utils`, `api-client`, or `content-safety` package
exists yet — none has a second consumer or a real need yet
(`docs/sprints/sprint-01.md`, §12).

## What this document is not

Not a home for new architectural decisions (those are ADRs), not an
implementation guide (see `docs/engineering/`), and not the
observability philosophy (see
[`docs/architecture/observability.md`](./observability.md)).
