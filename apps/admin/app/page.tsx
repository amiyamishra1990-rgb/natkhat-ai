import Link from 'next/link';

// M22 (docs/sprints/sprint-04.md, §4) — scaffold home page. M25
// (docs/sprints/sprint-05.md, §4) closed the "no authentication yet"
// gap this comment used to flag: /audit is now guarded (proxy.ts,
// AdminAuthGuard) — this page itself stays a bare landing page, not a
// real dashboard, and links to /sign-in explicitly rather than
// assuming a visitor is already authenticated.
export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Natkhat AI — Admin</h1>
      <p>
        Internal admin console (Sprint 04 Milestone 22 scaffold; Sprint 05 Milestone 25 auth).
        Synthetic data only.
      </p>
      <p>
        <Link href="/sign-in">Sign in</Link>
      </p>
      <p>
        <Link href="/audit">View audit log</Link> (requires sign-in)
      </p>
    </main>
  );
}
