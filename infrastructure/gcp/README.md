# GCP Infrastructure

Placeholder. No GCP resources, IaC, or configuration are checked into
this repository yet. Cloud provider is locked to Google Cloud per the
Product Constitution, formally recorded by
[ADR-0016](../../docs/decisions/ADR-0016-firebase-auth-and-google-cloud-migration.md)
(2026-08-23, founder-directed), which also moves Authentication
(Firebase Authentication, project `natkhat-ai-dev`, Blaze plan) and
Database hosting (Cloud SQL for PostgreSQL, dev-instance candidate) to
Google Cloud, superseding Supabase for both. Neither the Firebase
project nor a Cloud SQL instance is provisioned or configured by this
repository — the Firebase project already exists in the console per
ADR-0016; no Cloud SQL instance exists yet.

Candidate region rationale (provisional, pending legal confirmation —
not a decision to provision anything) is documented at
[`docs/architecture/deployment-india.md`](../../docs/architecture/deployment-india.md)
(Sprint 02, Milestone 9), left untouched by ADR-0016. No project,
resource, or configuration is created by that document either.
