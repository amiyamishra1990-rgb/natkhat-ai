# Infrastructure

**Version:** 1.0.0
**Status:** Placeholder — no real infrastructure-as-code yet
**Owner:** Engineering
**Last Updated:** 2026-07-29

Placeholders only, per `docs/sprints/sprint-01.md`, §3. No real IaC is
authored until a deployable target exists — Sprint 01, Milestone 1
creates the folder structure only.

- [`gcp/`](./gcp/) — Google Cloud (per the locked tech stack; database
  and authentication hosting target per ADR-0016; no resources
  provisioned yet)
- [`supabase/`](./supabase/) — superseded per ADR-0016 for database and
  auth; Storage remains recorded as Supabase Storage (ADR-0005),
  pending a separate founder decision
- [`docker/`](./docker/) — local development containers (none defined
  yet)
