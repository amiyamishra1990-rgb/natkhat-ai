# ADR-0016: Migrate Off Supabase — Firebase Authentication and Google Cloud (Founder-Directed)

**Version:** 1.0.0
**Status:** Accepted — Founder-Authorized, Effective Immediately (founder
direct instruction recorded 2026-08-23, this session's resume
authorization on branch `chore/sprint03-supabase-to-gcp-migration-decision`;
explicitly framed there as "a founder-authorized technology-decision
change, not an engineering-initiated one" — the stated exception to
this repository's normal "don't change locked architecture" rule, per
that same instruction's closing reminder. This ADR alone authorizes
only the scope in Decision items 1-3 below; it does not reopen any
other locked decision.)
**Owner:** Engineering
**Last Updated:** 2026-08-23

## Context

[ADR-0004](./ADR-0004-database.md) locked PostgreSQL "via Supabase"
with Prisma, and [ADR-0005](./ADR-0005-authentication.md) locked
Supabase Auth and Supabase Storage, both gated on a data-privacy/
compliance ADR that [ADR-0006](./ADR-0006-data-privacy-compliance.md)
and [ADR-0007](./ADR-0007-target-audience-interim-posture.md) later
satisfied. Sprint 03's M13-M15 (`docs/sprints/sprint-03.md`, §4,
Decision J.5) then implemented against a real, non-production dev
Supabase project: local Postgres for M13/M14, and Supabase Auth SDK
integration for M15 (`apps/backend/src/auth/`).

The founder has since decided, independently of any engineering
recommendation, to move Natkhat AI off Supabase entirely and onto
Google Cloud, because the founder already holds a Google Cloud billing
subscription and wants to consolidate spend there. This is a
founder-level technology-decision change to the locked stack, not an
engineering-initiated redesign — the same authority level ADR-0004 and
ADR-0005's own "locked in the Product Constitution's technology stack"
required to establish them in the first place.

The following are now confirmed, verified directly by the founder in
the relevant consoles before this ADR was authored:

- A real, non-production Firebase project exists: name `Natkhat AI-Dev`,
  project ID `natkhat-ai-dev`, Blaze (pay-as-you-go) plan linked to the
  founder's existing GCP billing account. Email/Password sign-in is
  confirmed **Enabled** (Firebase Console → Authentication → Sign-in
  method).
- The founder's Google Cloud organization enforces the security
  baseline `iam.managed.disableServiceAccountApiKeyCreation` as
  **Active** (IAM & Admin → Organization Policies), which blocks
  creating or downloading service-account JSON key files org-wide.
  This ADR does not ask the founder to override that policy for one
  dev credential, and does not treat a downloaded key as an option.

## Decision

1. **Authentication: Firebase Authentication supersedes Supabase Auth.**
   This supersedes ADR-0005's authentication decision only — see item
   4 below for what this ADR does *not* decide. Firebase project
   `natkhat-ai-dev` (Blaze plan) is the real, non-production dev target
   for Sprint 03's M15 code going forward, replacing Decision J.5's
   "real, non-production dev Supabase project" for authentication.
   Email/Password is the confirmed sign-in provider; no other provider
   is enabled or in scope.

2. **Credential strategy: Application Default Credentials (ADC), never
   a downloaded service-account key file.** Local/dev backend
   authentication to the Firebase Admin SDK uses ADC:
   - The founder (or an operator with terminal access to the founder's
     machine) runs `gcloud auth application-default login` — a browser
     Google sign-in that stores a credential locally at the standard
     ADC path. No JSON key file is created or committed anywhere.
   - Backend code initializes `firebase-admin` with
     `admin.credential.applicationDefault()`, never
     `admin.credential.cert(serviceAccountJson)`.
   - This is a dev-machine-only credential strategy. Production
     credential strategy (e.g., Workload Identity Federation on Cloud
     Run/GKE) is separate future work, explicitly out of scope here.
   - The org policy `iam.managed.disableServiceAccountApiKeyCreation`
     remains enforced, untouched, and is not something this ADR (or any
     future one) proposes overriding for developer convenience.

3. **Database hosting: PostgreSQL moves off Supabase onto Google
   Cloud.** This amends ADR-0004's hosting choice only — the database
   engine (PostgreSQL) and ORM (Prisma) are unchanged, and ADR-0004's
   own schema/migration decisions are unchanged. Cloud SQL for
   PostgreSQL is the natural candidate, consistent with this ADR's
   Cloud-provider decision (item 5). The founder stated this directly,
   in two separate sessions and in different words — most recently "
   anything that can be done by Google Cloud should be applied & to be
   done the needful" — confirming this is a settled founder decision,
   not an inference. Per standing Sprint 03 scope rules, this is a
   non-production, dev-only Cloud SQL instance; no production database
   is provisioned by this ADR.

4. **Storage is explicitly out of scope — not decided here.**
   ADR-0005 bundled Supabase Auth and Supabase Storage into one
   decision. The founder's instruction that produced this ADR addressed
   authentication and database only; Storage was not mentioned. No
   Storage code exists yet in this repository (ADR-0005's Storage
   clause remained implementation-deferred throughout Sprint 03), so
   nothing requires migrating today. Rather than infer a Storage
   provider from the general "move off Supabase" direction, this ADR
   leaves ADR-0005's Storage decision (Supabase Storage) formally
   recorded and unchanged, pending a separate, explicit founder
   decision — flagged here as an open item, not silently resolved.

5. **Cloud provider formally recorded: Google Cloud (GCP).** Prior to
   this ADR, PROJECT.md's and the Product Constitution's locked-stack
   tables listed the Cloud provider row as "Not yet recorded" despite
   Google Cloud being the de facto assumption throughout. This ADR
   formally records Google Cloud (GCP) as Natkhat AI's cloud provider,
   consistent with — and the direct cause of — items 1-3 above.

6. **`docs/architecture/deployment-india.md` is untouched.** It remains
   provisional and unratified, per its own status; this migration does
   not ratify it, amend it, or depend on it. Any rework there is
   separate future work.

## Consequences

- Supersedes ADR-0005's authentication decision (Supabase Auth →
  Firebase Authentication). ADR-0005's Storage decision is unaffected
  and remains as recorded there — see Decision item 4.
- Amends ADR-0004's hosting choice ("via Supabase" → Google Cloud,
  Cloud SQL for PostgreSQL as the dev-instance candidate). ADR-0004's
  engine (PostgreSQL) and ORM (Prisma) choices are unchanged and not
  reopened by this ADR.
- Supersedes Sprint 03 Decision J.5 (`docs/sprints/sprint-03.md`, §4)
  for its authentication half: the M15 dev target is now the real,
  non-production dev Firebase project (`natkhat-ai-dev`), not a
  Supabase project. `docs/sprints/sprint-03.md` itself is left
  unedited as the historical record of what was originally planned;
  this ADR is the record of the deviation.
- M15's authentication code (`apps/backend/src/auth/`) is rebuilt
  against Firebase Authentication, preserving the same lazy-provider,
  fail-closed pattern, the same error classes
  (`InvalidAccessTokenError`, `UnknownParentIdentityError`), and the
  same `describeIfConfigured`-skip-without-live-credentials integration
  test pattern the Supabase implementation established.
  `ParentRepository.findByAuthIdentityRef` requires no change — it was
  already provider-agnostic (keyed on `Parent.authIdentityRef`, an
  opaque external-identity string, not a Supabase-specific type).
- No Supabase secrets, Firebase service-account key files, or any other
  credential material is committed by this ADR or its implementation.
  ADC is the only backend credential path for this dev environment.
- Sprint 03 remains synthetic-data-only and non-production; nothing in
  this ADR changes that. No real child or parent data exists in any
  environment this ADR touches.
- Storage provider selection remains an explicit open item — flagged
  for a future, separate founder decision, not to be inferred from this
  ADR's Auth/Database scope.
- This ADR does not reopen ADR-0006, ADR-0007, ADR-0008, ADR-0009,
  ADR-0010, ADR-0012, or ADR-0015 — none of their data-model,
  authorization, encryption, consent, or lifecycle decisions depend on
  which company hosts Postgres or issues auth tokens, and none is
  amended here.

## Constitution Alignment

Amends the Product Constitution's Locked Technology Stack table
(Database, Authentication, and Cloud provider rows) via the
constitutional amendment this ADR is accompanied by, per the
Constitution's own Amendment clause ("no stack decision here may be
changed by a lower layer... only by an explicit amendment at this
layer") — the founder, as Product Owner, is the same authority that
originally locked the stack and is the one directing this change.
Engineering Constitution — Security by design (ADC over a downloaded
service-account key; the org's `iam.managed.disableServiceAccountApiKeyCreation`
policy is preserved, not weakened, by this decision).
