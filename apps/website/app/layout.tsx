import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Natkhat AI',
  description:
    'Help parents raise kind, confident, curious, emotionally strong and future-ready children while creating meaningful childhood memories.',
};

// M22 (docs/sprints/sprint-04.md, §4) — static/marketing shell only
// (Founder Decision F.4). No form, no data-collection mechanism, no
// analytics/tracking script anywhere in this app.
//
// Not typed via Next's generated `LayoutProps<'/'>` global — see
// apps/admin/app/layout.tsx's identical comment for why.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav style={{ padding: '1rem 2rem', borderBottom: '1px solid #eee' }}>
          <Link href="/" style={{ marginRight: '1rem' }}>
            Natkhat AI
          </Link>
          <Link href="/about">About</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
