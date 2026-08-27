# Natkhat AI — Admin

Internal admin console. Next.js (TypeScript, App Router), scaffolded at
Sprint 04, Milestone 22 ([ADR-0014](../../docs/decisions/ADR-0014-adopt-nextjs-for-admin-and-website-applications.md)).

**Data access — hard boundary (Founder Decision F.3,
[docs/sprints/sprint-04.md](../../docs/sprints/sprint-04.md), §3/§4):**
audit-log data only. Never parent, child, or family content; never
aggregate/derived statistics; never any other data category.

No authentication is wired yet (explicit M22 exclusion) — the backend
endpoint this app calls (`GET /audit-events`) has no auth guard. This
is a known, deliberate, temporary gap for a non-production,
synthetic-data-only environment; it must be closed before any real
deployment.

## Development

```bash
pnpm --filter admin dev   # http://localhost:3001
```

Requires `apps/backend` running separately (`pnpm --filter backend dev`,
default `http://localhost:3000`) for the `/audit` page to render real
data. Override the backend URL with `BACKEND_API_URL`.

## Scripts

`dev`, `build`, `start`, `lint`, `typecheck` — see `package.json`. No
`test` script yet; Turborepo skips packages without one.
