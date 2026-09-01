'use client';

import { useRouter } from 'next/navigation';

// M25 (docs/sprints/sprint-05.md, §4). Clears the session cookie
// (app/api/session/route.ts's DELETE handler) — does not touch
// Firebase's own client-side auth state, since every page in this app
// is server-rendered against the cookie, not client-side Firebase
// auth state.
export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await fetch('/api/session', { method: 'DELETE' });
    router.push('/sign-in');
    router.refresh();
  }

  return (
    <button onClick={handleSignOut} style={{ padding: '0.25rem 0.5rem' }}>
      Sign out
    </button>
  );
}
