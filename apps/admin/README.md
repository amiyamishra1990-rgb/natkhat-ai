# Natkhat AI — Admin

Internal admin console. Next.js (TypeScript, App Router), scaffolded at
Sprint 04, Milestone 22 ([ADR-0014](../../docs/decisions/ADR-0014-adopt-nextjs-for-admin-and-website-applications.md)).

**Data access — hard boundary (Founder Decision F.3,
[docs/sprints/sprint-04.md](../../docs/sprints/sprint-04.md), §3/§4):**
audit-log data only. Never parent, child, or family content; never
aggregate/derived statistics; never any other data category. Unchanged
by the authentication work below — that closes _who_ may call the
endpoint, not _what_ it returns.

## Authentication (Sprint 05, Milestone 25)

`/audit` and the backend's `GET /audit-events` are gated. Signing in
uses Firebase Authentication (`app/sign-in/page.tsx`) against the same
real, non-production dev Firebase project (`natkhat-ai-dev`, ADR-0016)
the mobile app's parent sign-in also targets — but as a **distinct
admin-principal type** (`AdminUser`, `apps/backend/prisma/schema.prisma`),
never a Parent or Child. A Parent's own valid Firebase credential is
rejected by the backend's `AdminAuthGuard`
(`apps/backend/src/admin-auth/`), same as an unauthenticated request —
signing in to Firebase is necessary but not sufficient, an `AdminUser`
row must also exist for that identity.

Flow: `/sign-in` obtains a Firebase ID token client-side, POSTs it to
`/api/session` which stores it in an httpOnly cookie, then
`app/audit/page.tsx` (a Server Component) sends it as
`Authorization: Bearer <token>` on its server-to-server fetch to the
backend. `proxy.ts` redirects a session-less request to `/sign-in`
before it is even attempted, but the real enforcement is the backend
guard — the middleware cannot cryptographically verify the token (see
its own comment) and `app/audit/page.tsx` redirects to `/sign-in` on a
401 from the backend regardless.

AdminUser rows and their Firebase accounts are provisioned out-of-band,
test/synthetic accounts only — this milestone is authentication only,
not an admin-invite/management flow (deliberate exclusion, per
`docs/sprints/sprint-05.md`, §4, M25).

Requires `NEXT_PUBLIC_FIREBASE_API_KEY`/`NEXT_PUBLIC_FIREBASE_PROJECT_ID`
(see `.env.example`) to be set for `/sign-in` to work; unset locally,
it fails clearly with an error rather than silently.

## Development

```bash
pnpm --filter admin dev   # http://localhost:3001
```

Requires `apps/backend` running separately (`pnpm --filter backend dev`,
default `http://localhost:3000`) for the `/audit` page to render real
data. Override the backend URL with `BACKEND_API_URL`. Copy
`.env.example` to `.env.local` and fill in the dev Firebase project's
config to exercise `/sign-in` locally.

## Scripts

`dev`, `build`, `start`, `lint`, `typecheck` — see `package.json`. No
`test` script yet; Turborepo skips packages without one.
