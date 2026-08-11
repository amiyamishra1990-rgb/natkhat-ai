# ADR-0014: Adopt Next.js for Admin & Website Applications

**Version:** 1.0.0
**Status:** Accepted
**Owner:** Engineering
**Last Updated:** 2026-08-10

## Context

Natkhat AI's Product Constitution locks Next.js as the technology for
two future applications: an internal admin application (`apps/admin`)
and the public marketing website (`apps/website`), both scheduled for
Sprint 02 or later
([`docs/constitution/product/natkhat-ai-constitution.md`](../constitution/product/natkhat-ai-constitution.md),
Locked Technology Stack). Unlike the other locked layers — Turborepo/
pnpm (ADR-0001), Flutter (ADR-0002), NestJS (ADR-0003) — this choice has
never had its own ADR; the Constitution's table has carried "Not yet
recorded" against both rows since Sprint 01. `docs/sprints/sprint-02.md`,
§3, Milestone 10 names closing exactly this gap as its objective:
formalize the already-locked decision in ADR form, mirroring
ADR-0001–0003's format, with no scaffold creation.

This ADR does not choose Next.js — that choice was made and locked
before Sprint 02 began. It records the decision and its consequences,
per the same "design/record now, implement later" discipline every
Sprint 02 milestone uses.

## Decision

Build `apps/admin` and `apps/website` in Next.js (TypeScript) when each
is eventually scaffolded, as full members of the pnpm/Turborepo
dependency graph, consuming the shared `config-typescript`,
`config-eslint`, and `config-prettier` packages — the same integration
pattern ADR-0003 established for `apps/backend`.

Scaffolding itself is **not** authorized by this ADR. Per
`docs/sprints/sprint-02.md`, §2.2 and §3 (Milestone 10), creating the
`apps/admin` or `apps/website` directory, any admin authentication, any
CMS, or any marketing content is explicitly out of scope for Sprint 02
and requires separate founder approval in a future sprint.

## Consequences

- Once scaffolded, `apps/admin` and `apps/website` will participate
  fully in Turborepo-filtered CI (`lint`, `typecheck`, `test`, `build`),
  the same as `apps/backend` (ADR-0003).
- The Product Constitution's Locked Technology Stack table and
  `docs/architecture/overview.md`'s tech-stack table both still read
  "Not yet recorded" against Admin/Website as of this ADR's acceptance
  — updating those citations to point at ADR-0014 is deferred to Sprint
  02, Milestone 11 (Close-Out & Governance Sync), not performed here.
- No admin tool built on `apps/admin` may access child, parent, or
  family data without separately clearing the same gates every other
  system in this repository must clear — ADR-0006's Legal Validation
  Required items, the Child Privacy & Safety Constitution, and any
  applicable ADR from Sprint 02's child-data-focused milestones (M1–M9).
  This ADR grants no such access and asserts no compliance of any kind.
- No implementation, business logic, authentication, CMS, or content is
  authorized by this ADR. `apps/admin` and `apps/website` do not exist
  in the repository as of this ADR's acceptance.

## Constitution Alignment

Product Constitution — Locked Technology Stack (Admin application,
Marketing website rows). Engineering Constitution — Repository
standards, CI/CD workflow. Consistent with, and does not amend,
ADR-0001 (monorepo/workspace membership pattern) or ADR-0003 (the
directly analogous backend-application ADR this one mirrors).
