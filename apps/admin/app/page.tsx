import Link from 'next/link';

// M22 (docs/sprints/sprint-04.md, §4) — scaffold home page. No
// authentication exists yet (explicit M22 exclusion), so this is a
// bare landing page, not a real dashboard.
export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Natkhat AI — Admin</h1>
      <p>Internal admin console scaffold (Sprint 04, Milestone 22). Synthetic data only.</p>
      <p>
        <Link href="/audit">View audit log</Link>
      </p>
    </main>
  );
}
