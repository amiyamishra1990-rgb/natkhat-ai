# ADR-0003: Adopt NestJS for the Backend Application

**Version:** 1.0.0
**Status:** Accepted
**Owner:** Engineering
**Last Updated:** 2026-07-28

## Context

Natkhat AI requires a backend application (`apps/backend`) serving
both mobile and (in a later sprint) admin/website clients. NestJS is
locked as the backend framework in the Product Constitution's
technology stack.

## Decision

Build `apps/backend` in NestJS (TypeScript), as a full member of the
pnpm/Turborepo dependency graph, consuming the shared
`config-typescript`, `config-eslint`, and `config-prettier` packages.

## Consequences

- NestJS's structured, dependency-injection-based architecture gives
  a consistent module/service/controller shape for future backend
  growth.
- As a graph member, `apps/backend` participates fully in
  Turborepo-filtered CI (`lint`, `typecheck`, `test`, `build`).
- No business logic, database integration, or authentication is
  implemented in Sprint 01 (see ADR-0004, ADR-0005) — Sprint 01
  validates only that the scaffold runs and builds.

## Constitution Alignment

Product Constitution — locked technology stack. Engineering
Constitution — Repository standards, CI/CD workflow.
