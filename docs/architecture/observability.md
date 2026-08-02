# Observability Philosophy

**Version:** 1.0.0
**Status:** Documented — philosophy only; no logging/metrics/tracing
tooling is implemented in Sprint 01 (no application code exists yet)
**Owner:** Engineering
**Last Updated:** 2026-07-30

Full authorship of the philosophy at `docs/sprints/sprint-01.md`, §21.
This document does not select tooling — tool choice (e.g. GCP-native
Cloud Logging/Monitoring, given the locked GCP cloud target) is a
future Decision Log entry or ADR, made when a deployable target
actually exists.

## Logging

Structured (JSON) logs, one event per line, carrying a correlation/
request ID that threads through a single request across services. No
child- or parent-identifying content in log bodies — logs reference
opaque IDs, never names, conversation text, or media.

## Metrics

The four golden signals as the baseline for every service once one
exists: latency, traffic, error rate, saturation. Business metrics
(e.g. feature adoption) are added per-module, defined in that module's
own docs (`docs/modules/TEMPLATE.md`, §8), not globally mandated here.

## Tracing

Distributed tracing becomes relevant once more than one service is
in the request path (backend + a future service). Deferred until that
topology exists — Sprint 01 has a single backend app.

## Audit events

Distinct from application logs: an audit event records who did what,
to which record, and when — immutable, retained per the Child Privacy
& Safety Constitution's Parent Data Ownership and Leo Memory Protection
requirements. This is the "Audit Logging" Mandatory Engineering Review
Gate, verified by
[`security-checklist.md`](../engineering/checklists/security-checklist.md).

## Error reporting

Centralized error capture once a deployable service exists; error
payloads follow the same no-PII/no-child-data rule as logs. An error
that occurs while handling child/parent data must be scrubbed of that
data before it reaches an error-tracking tool.

## Monitoring and health checks

Every service exposes liveness (is it running) and readiness (can it
serve traffic) checks. Monitoring dashboards and alerting are wired
per-service at the point it becomes deployable, verified by
[`production-checklist.md`](../engineering/checklists/production-checklist.md).

## What this document is not

Not an implementation guide (no logging library, APM, or dashboard is
chosen yet) and not a replacement for `docs/architecture/overview.md`,
which covers application/data architecture, not observability.
