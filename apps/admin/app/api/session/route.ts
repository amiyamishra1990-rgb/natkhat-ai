import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/session';

// M25 (docs/sprints/sprint-05.md, §4; Founder Decision G.2) — the
// bridge between the client-side Firebase sign-in
// (app/sign-in/page.tsx, which never has access to Node's httpOnly
// cookie APIs) and the server-rendered app/audit/page.tsx (which needs
// the token on every server-to-server fetch, not just once at
// sign-in). This route does not talk to Firebase at all — it only
// stores/clears a token the browser already obtained and verified
// nothing itself; every real verification happens where it always
// did, in apps/backend's AdminAuthGuard (admin-auth/admin-auth.guard.ts).
//
// Deliberately simple: the raw Firebase ID token is stored directly,
// not exchanged for a longer-lived Firebase session cookie (Admin
// SDK's createSessionCookie) — that would need firebase-admin wired
// into apps/admin as well, which is more than this milestone's
// authentication-only scope needs. The practical effect is a session
// that expires with the ID token itself (~1 hour, Firebase's own
// default) — session-lifetime/refresh-token handling beyond that is
// not part of this milestone; re-signing-in is the expected recovery
// path (app/audit/page.tsx redirects to /sign-in on a 401 from the
// backend).
const SESSION_MAX_AGE_SECONDS = 55 * 60;

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { idToken?: unknown } | null;
  const idToken = body?.idToken;

  if (typeof idToken !== 'string' || idToken.length === 0) {
    return NextResponse.json({ error: 'idToken is required' }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, idToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
