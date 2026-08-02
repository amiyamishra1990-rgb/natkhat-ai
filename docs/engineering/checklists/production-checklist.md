# Production Checklist

**Version:** 1.0.0
**Status:** Active
**Owner:** Engineering
**Last Updated:** 2026-07-30

Applied before any surface is deployed to production. Implements the
observability standard
(`docs/architecture/observability.md`) and closes the loop after
[`release-checklist.md`](./release-checklist.md).

- [ ] [`release-checklist.md`](./release-checklist.md) is complete.
- [ ] Liveness and readiness health checks are defined for every new
      service.
- [ ] Monitoring and alerting are wired for the new surface, per
      `docs/architecture/observability.md`.
- [ ] A rollback path and/or feature-flag kill-switch is available and
      has been exercised at least once (staging or equivalent).
- [ ] Expected load/performance has been sanity-checked against the
      new surface's actual capacity.
- [ ] On-call ownership for the new surface is documented (who gets
      paged).
- [ ] No secret, credential, or child/parent data appears in logs,
      error reports, or monitoring dashboards.

**Any unchecked item blocks production deployment.** No production
deploy target exists yet in Sprint 01 — this checklist is documented
now so it is not invented under deadline pressure later
(`docs/sprints/sprint-01.md`, §21).
