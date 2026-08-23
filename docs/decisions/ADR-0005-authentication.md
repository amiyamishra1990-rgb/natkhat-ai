# ADR-0005: Adopt Supabase Auth — Decision Recorded, Implementation Deferred

**Version:** 1.0.0
**Status:** Accepted — Implementation Deferred. **Authentication clause
superseded 2026-08-23 by [ADR-0016](./ADR-0016-firebase-auth-and-google-cloud-migration.md)
(Supabase Auth → Firebase Authentication, founder-directed).** The
Storage clause below is unaffected and remains as originally recorded
— see ADR-0016, Decision item 4. This ADR is left otherwise unedited
as the historical record.
**Owner:** Engineering
**Last Updated:** 2026-07-28

## Context

Supabase Auth (and Supabase Storage) is locked as Natkhat AI's
authentication and storage layer in the Product Constitution's
technology stack. As with ADR-0004, authentication for a
children/family-facing product carries privacy and compliance
obligations not yet resolved.

## Decision

Record Supabase Auth as the authentication provider and Supabase
Storage as the storage provider for Natkhat AI. **No implementation**
begins in Sprint 01 or any subsequent sprint until the same
data-privacy/compliance ADR required by ADR-0004 exists and is
accepted.

## Consequences

- This ADR alone does not authorize any authentication or storage
  code.
- Gated by the same compliance prerequisite as ADR-0004; the two are
  implemented together once that prerequisite is met.
- Tracked as an open risk in `docs/sprints/sprint-01.md`, Risk
  Register (Privacy and Child Safety categories).

## Constitution Alignment

Product Constitution — locked technology stack, Core Principle
"Safe & Responsible AI", Target Audience (not yet ratified).
Engineering Constitution — Security by design.
