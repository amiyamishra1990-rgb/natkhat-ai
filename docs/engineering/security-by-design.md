# Security by Design

**Version:** 1.0.0
**Status:** Documented — this is a documentation-only milestone; no
scanning tooling, SBOM generation, or secrets infrastructure is
implemented in Sprint 01
**Owner:** Engineering
**Last Updated:** 2026-07-30

Full authorship of the standard at `docs/sprints/sprint-01.md`, §22.
This document sets the general engineering security standard; where
child or parent data is involved, the
[Child Privacy & Safety Constitution](../constitution/product/child-privacy-and-safety-constitution.md)
is the stricter, controlling authority (`docs/sprints/sprint-01.md`,
§1) — this document does not restate its 14 Mandatory Engineering
Requirements, only cross-references them.

## Least privilege

Every service account, database role, and API scope is granted the
minimum access required for its function. No shared "admin" credential
is used for routine operations.

## Secrets management

Secrets are never committed to the repository. GCP Secret Manager is
the single source of truth for production/staging secrets
(`docs/sprints/sprint-01.md`, §22, §26); local development uses
`.env`, excluded via `.gitignore` and documented in `.env.example`.

## Data encryption

Encryption at rest and in transit is required for all data once a
database/storage layer exists (ADR-0004, ADR-0005 — both decision
recorded, implementation deferred). Child voice/image data carries
enhanced requirements per the Child Privacy & Safety Constitution,
item 7.

## PII and child-data handling

General PII follows this document's baseline (minimize collection,
justify every field, encrypt, log access). Child data is a dedicated,
**stricter** tier above general PII — governed entirely by the Child
Privacy & Safety Constitution (Privacy by Default, Parent Owns the
Child's Data, Child Data Minimization, items 1/2/11) — this document
never weakens that tier, only points to it.

## Audit logging

Every sensitive action (auth events, data export, deletion, sharing,
permission changes) is audit-logged, immutably, with who/what/when.
This is one of the four Mandatory Engineering Review Gates
(`docs/constitution/engineering/engineering-constitution.md`) and is
verified by
[`security-checklist.md`](./checklists/security-checklist.md).

## Dependency scanning and SBOM

No automated dependency-scanning or SBOM-generation tooling is
implemented in Sprint 01. Until it exists, new dependencies are
manually checked for known vulnerabilities before merge
(`security-checklist.md`). Tool selection (e.g. GitHub Dependabot,
Renovate security alerts) is a future Decision Log entry, made when
CI foundation (Milestone 10) is built.

## Vulnerability management

Any vulnerability discovered is logged in
`docs/knowledge/security-discoveries/`, triaged by severity, and — if
it has architectural consequences — escalated to a full ADR rather
than patched silently (`docs/sprints/sprint-01.md`, §9 escalation
rule).

## Enforcement

[`security-checklist.md`](./checklists/security-checklist.md) is the
operational gate for everything above; this document is the
philosophy it implements.
