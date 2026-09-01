'use client';

import { Suspense, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getAdminFirebaseAuth } from '@/lib/firebase-client';

// M25 (docs/sprints/sprint-05.md, §4; Founder Decision G.2) — sign-in
// for the admin-principal type only (AdminUser, apps/backend's
// schema.prisma). Deliberately not built on or shared with any
// parent/child sign-in flow — none exists in this app, and this page
// must never be reused by one, per this milestone's explicit
// exclusion.
//
// Email/password against the real, non-production dev Firebase project
// (ADR-0016) — test/synthetic admin accounts only, provisioned
// out-of-band (see apps/admin/README.md). A successful Firebase
// sign-in only proves *a* Firebase identity; it is not by itself proof
// of adminship — that is decided server-side, by whether
// AdminUserRepository has a row for this uid
// (admin-auth/admin-auth.service.ts), the first time the resulting
// token is sent to the backend. A non-admin Firebase account can sign
// in here successfully and still see every subsequent /audit-events
// call rejected.
// useSearchParams() (for the ?next= redirect target) requires a
// Suspense boundary during Next.js's build-time prerendering — this
// wrapper is that boundary, not a loading-state affordance (the form
// itself renders instantly client-side).
export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const auth = getAdminFirebaseAuth();
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await credential.user.getIdToken();

      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      if (!response.ok) {
        throw new Error('Could not establish a session with the admin app.');
      }

      const next = searchParams.get('next') ?? '/audit';
      router.push(next);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '24rem' }}>
      <h1>Natkhat AI — Admin sign-in</h1>
      <p>Test/synthetic admin accounts only. Synthetic data only.</p>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
      >
        <label>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            style={{ display: 'block', width: '100%', padding: '0.5rem' }}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            style={{ display: 'block', width: '100%', padding: '0.5rem' }}
          />
        </label>
        <button type="submit" disabled={submitting} style={{ padding: '0.5rem' }}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      {error && <p style={{ color: '#b00020' }}>{error}</p>}
    </main>
  );
}
