// M25 (docs/sprints/sprint-05.md, §4). Shared between
// app/api/session/route.ts (sets/clears it), middleware.ts (checks
// presence for the redirect-to-sign-in UX gate), and app/audit/page.tsx
// (reads it to authenticate the backend fetch) — one constant, not
// three copies of the literal cookie name.
export const SESSION_COOKIE_NAME = 'admin_session';
