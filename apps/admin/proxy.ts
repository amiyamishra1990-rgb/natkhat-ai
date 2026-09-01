import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/session';

// M25 (docs/sprints/sprint-05.md, §4; Founder Decision G.2). A UX gate
// only — redirects to /sign-in when the session cookie is simply
// absent, so a browser never even attempts an unauthenticated request.
// This is NOT the security boundary: Proxy cannot cryptographically
// verify the Firebase ID token (that needs the Admin SDK, server-side,
// which is deliberately not wired into apps/admin — see
// app/api/session/route.ts's own comment), so a present-but-expired-
// or-forged cookie still passes this check. The real enforcement is,
// and remains, apps/backend's AdminAuthGuard — app/audit/page.tsx
// redirects to /sign-in itself if the backend responds 401 for a
// cookie that made it past this gate.
//
// Named/filed per Next.js's current "Proxy" convention (this file was
// `middleware.ts` until the "middleware" convention was deprecated in
// favor of `proxy.ts`/`export function proxy` — same runtime
// semantics, just the current name).
export function proxy(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (!hasSession) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Only the routes Founder Decision F.3 actually gates. /sign-in
  // itself, /api/session, and the bare landing page (/) stay
  // unmatched — a session-less visitor must be able to reach the
  // sign-in page and the route that establishes the cookie.
  matcher: ['/audit/:path*'],
};
