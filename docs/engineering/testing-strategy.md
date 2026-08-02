# Testing Strategy

**Version:** 1.0.0
**Status:** Documented — full taxonomy defined ahead of code; Sprint
01 applies only Unit/Widget minimally, to prove scaffolds work
**Owner:** Engineering
**Last Updated:** 2026-07-30

Full authorship of the taxonomy at `docs/sprints/sprint-01.md`, §23.

## Taxonomy

| Layer         | Scope                                                        | Owned by                                    |
| ------------- | ------------------------------------------------------------ | ------------------------------------------- |
| Unit          | Single function/class, no I/O                                | Every package/app                           |
| Widget        | Single Flutter widget in isolation                           | `apps/mobile`                               |
| Integration   | Multiple internal units together (e.g. service + repository) | `apps/backend`                              |
| API           | HTTP contract behavior, request → response                   | `apps/backend`                              |
| End-to-end    | Full user flow across app + backend                          | Once both apps exist and are wired together |
| Performance   | Latency/throughput under load                                | Once a deployable target exists             |
| Accessibility | Screen-reader/contrast/tap-target compliance                 | `apps/mobile` (and any future web app)      |
| Security      | Auth/authorization/injection/exposure checks                 | Any surface handling child/parent data      |
| Regression    | Previously-fixed bugs stay fixed                             | Any package/app, added at fix time          |

## Sprint 01 bar

Only Unit and Widget testing apply, minimally — enough to prove the
`apps/backend` (NestJS) and `apps/mobile` (Flutter) scaffolds run and
build (Milestone 8), not to validate business logic that doesn't exist
yet. Integration, API, End-to-end, Performance, Accessibility, and
Regression testing begin once there is a corresponding surface to
test.

## Coverage philosophy

No arbitrary coverage percentage is mandated. Coverage requirements
are judged against how much of a module's actual business logic is
exercised — see each module's own Testing section, per
`docs/modules/TEMPLATE.md`, §7 — not against a global number that
incentivizes testing trivial code and skipping hard paths.

## Where tests live

Co-located with the code they test (e.g. `*.spec.ts` beside its
source, per NestJS convention; `*_test.dart` beside its Flutter
source), never in a separate parallel tree.

## Security testing

Any surface handling child or parent data must include tests proving
the Mandatory Engineering Review Gates hold under test (e.g. one
family's data is never returned to another's session) — this is
enforced by
[`security-checklist.md`](./checklists/security-checklist.md), not a
separate testing document.

## Enforcement

[`pull-request-checklist.md`](./checklists/pull-request-checklist.md)
requires tests for the layer(s) a change touches;
[`release-checklist.md`](./checklists/release-checklist.md) requires
CI green before any release.
