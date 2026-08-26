import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About — Natkhat AI',
};

export default function About() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '40rem' }}>
      <h1>About</h1>
      <p>
        Natkhat AI is an ASPOVO product. Full product principles are documented in
        `docs/constitution/product/natkhat-ai-constitution.md`.
      </p>
      <p style={{ color: '#666', fontSize: '0.9rem' }}>
        Placeholder content — Sprint 04, Milestone 22 static marketing shell.
      </p>
    </main>
  );
}
