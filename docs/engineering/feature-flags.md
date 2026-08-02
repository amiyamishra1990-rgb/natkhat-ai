# Feature Flag Philosophy

**Version:** 1.0.0
**Status:** Documented — no feature-flag system is implemented in
Sprint 01 (no features exist yet)
**Owner:** Engineering
**Last Updated:** 2026-07-30

Full authorship of the interim standard at
`docs/sprints/sprint-01.md`, §20.

## Core rule

All unfinished or unstable functionality ships behind a feature flag —
never exposed to real users by default. A feature is "finished" only
once it has cleared
[`review-checklist.md`](./review-checklist.md) and
[`release-checklist.md`](./checklists/release-checklist.md) in full.

## Flag categories

- **Release flags** — gate a feature during rollout; temporary by
  definition, removed once the feature is fully and stably shipped.
- **Ops flags** — kill-switches for operational control (e.g.
  disabling a degraded dependency); may be long-lived.
- **Permission flags** — gate a capability by plan/role/family
  settings; long-lived by design, not cleanup debt.

Only release and ops flags are subject to the cleanup rule below;
permission flags are not.

## Rules

- Default state for any new release flag is **off**.
- Every release flag has a named owner and a removal target — a flag
  with no plan to remove it is not a release flag, it should be
  reclassified.
- No flag may be used to bypass the Mandatory Engineering Review Gates
  (Privacy, Security, Parent Trust, Child Safety) — a flagged-off
  feature still must not leak child/parent data through logging,
  error paths, or partial exposure.
- Flag state changes affecting child- or parent-facing behavior are
  audit-logged, per the Child Privacy & Safety Constitution's Secure
  Development Standards (item 12).
- [`pull-request-checklist.md`](./checklists/pull-request-checklist.md)
  and
  [`release-checklist.md`](./checklists/release-checklist.md) both
  check flag hygiene — a release flag left in place after its feature
  is fully rolled out blocks the release checklist.

## What's deferred

No flag _system_ (SDK, remote config, targeting rules) is chosen or
implemented in Sprint 01 — there are no features to flag yet. Tool
selection is a future Decision Log entry or ADR, not a Milestone 6
concern.
