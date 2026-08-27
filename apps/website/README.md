# Natkhat AI — Website

Public marketing website. Next.js (TypeScript, App Router), scaffolded
at Sprint 04, Milestone 22
([ADR-0014](../../docs/decisions/ADR-0014-adopt-nextjs-for-admin-and-website-applications.md)).

**Content scope — hard boundary (Founder Decision F.4,
[docs/sprints/sprint-04.md](../../docs/sprints/sprint-04.md), §3/§4):**
static/marketing shell only. No signup form, no contact form, no data
collection of any kind.

## Development

```bash
pnpm --filter website dev   # http://localhost:3002
```

## Scripts

`dev`, `build`, `start`, `lint`, `typecheck` — see `package.json`. No
`test` script yet; Turborepo skips packages without one.
