# Supabase Infrastructure (Superseded)

No Supabase project config, migrations, or client setup were ever
created here. As of
[ADR-0016](../../docs/decisions/ADR-0016-firebase-auth-and-google-cloud-migration.md)
(2026-08-23, founder-directed), Natkhat AI is migrating off Supabase
entirely: Authentication moves to Firebase Authentication and Database
hosting moves to Google Cloud (Cloud SQL for PostgreSQL as the
dev-instance candidate) — see [`../gcp/`](../gcp/). Storage is
explicitly out of scope for that ADR and remains recorded as Supabase
Storage in [ADR-0005](../../docs/decisions/ADR-0005-authentication.md)
pending a separate founder decision — this folder is kept as a
placeholder for that reason only, not because any other Supabase
component is still planned.
