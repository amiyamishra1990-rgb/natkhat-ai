# ADR-0002: Adopt Flutter for the Mobile Application

**Version:** 1.0.0
**Status:** Accepted
**Owner:** Engineering
**Last Updated:** 2026-07-28

## Context

Natkhat AI requires a single cross-platform mobile application
(`apps/mobile`) for parents and children. Flutter is locked as the
mobile technology in the Product Constitution's technology stack.

## Decision

Build `apps/mobile` in Flutter. Because Flutter's tooling and package
manager (pub) are independent of the pnpm/Node dependency graph,
Flutter is orchestrated as a Turborepo _task_ (via `turbo.json` task
definitions invoking Flutter CLI commands), never as a workspace
package or dependency-graph member (see ADR-0001).

## Consequences

- Mobile CI (`flutter analyze`, `flutter test`) runs as its own
  Turborepo task, gated on changes under `apps/mobile/**`.
- Mobile releases follow a tagged-release strategy
  (`release/mobile-vX.Y.Z`), distinct from the continuous-deploy
  strategy used for web/backend.
- Risk: Flutter's exclusion from the pnpm graph means shared
  TypeScript config packages (`config-typescript`, etc.) do not apply
  to it; any future Dart-specific shared config is a separate, later
  decision.

## Constitution Alignment

Product Constitution — locked technology stack. Engineering
Constitution — Release strategy, CI/CD workflow.
