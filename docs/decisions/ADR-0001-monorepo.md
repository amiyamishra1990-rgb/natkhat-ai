# ADR-0001: Adopt a Single Monorepo (Turborepo + pnpm Workspaces)

**Version:** 1.0.0
**Status:** Accepted
**Owner:** Engineering
**Last Updated:** 2026-07-28

## Context

Natkhat AI consists of multiple applications (mobile, backend, and
later admin/website) and shared tooling configuration. A single
source of truth for dependency graphs, tooling, and CI is required
from the start to avoid drift between apps, per the Product
Constitution's locked technology stack.

## Decision

Adopt a single monorepo, `natkhat-ai/`, using pnpm workspaces
(`apps/*`, `packages/*`) to define the dependency graph and Turborepo
(`turbo.json`) to orchestrate `lint`, `typecheck`, `test`, `build`,
and `dev` across it. Only the apps and packages needed for the active
sprint exist at any time — nothing is built speculatively.

## Consequences

- One root config source; no per-app tooling drift.
- Flutter (`apps/mobile`) does not fit pnpm's dependency graph
  natively — it is orchestrated as a Turborepo _task_, never a
  dependency-graph member (see ADR-0002).
- CI must be Turborepo-filtered from the start to avoid unbounded CI
  time growth as more apps are added.
- Remote caching is deferred until the dependency graph grows
  significantly (tracked as a future Decision Log entry, not an ADR).

## Constitution Alignment

Engineering Constitution — Repository standards, Folder conventions,
Package conventions.
