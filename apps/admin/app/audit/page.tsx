// M22 (docs/sprints/sprint-04.md, §4) — audit-log view. A Server
// Component doing a plain server-to-server fetch against the backend's
// audit-events endpoint (apps/backend/src/audit/audit.controller.ts).
// Server-side fetch deliberately avoids CORS entirely — no CORS
// middleware was added to the backend for this.
//
// Founder Decision F.3 boundary: this page renders exactly what the
// backend returns from AuditModule — audit-log data only. It must
// never call, join against, or render parent/child/family content or
// aggregate/derived statistics. Do not add any other backend endpoint
// call to this page or app without re-checking F.3 first.

interface AuditEvent {
  id: string;
  occurredAt: string;
  eventType: string;
  actorPrincipalId: string | null;
  actorPrincipalType: string | null;
  actorRoleAtTime: string | null;
  familyId: string | null;
  childId: string | null;
  targetType: string;
  targetId: string | null;
}

const BACKEND_API_URL = process.env.BACKEND_API_URL ?? 'http://localhost:3000';

async function getAuditEvents(): Promise<{ events: AuditEvent[] } | { error: string }> {
  try {
    const res = await fetch(`${BACKEND_API_URL}/audit-events`, { cache: 'no-store' });
    if (!res.ok) {
      return { error: `Backend responded with ${res.status} ${res.statusText}` };
    }
    return { events: (await res.json()) as AuditEvent[] };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: `Could not reach backend at ${BACKEND_API_URL}: ${message}` };
  }
}

export default async function AuditLogPage() {
  const result = await getAuditEvents();

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Audit Log</h1>
      <p>Security/audit-log data only (Founder Decision F.3). Synthetic data only.</p>

      {'error' in result && (
        <p style={{ color: '#b00020' }}>
          {result.error} — is <code>apps/backend</code> running? (
          <code>pnpm --filter backend dev</code>)
        </p>
      )}

      {'events' in result && result.events.length === 0 && <p>No audit events recorded yet.</p>}

      {'events' in result && result.events.length > 0 && (
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              {['Occurred At', 'Event Type', 'Actor', 'Family ID', 'Child ID', 'Target'].map(
                (heading) => (
                  <th
                    key={heading}
                    style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '0.5rem' }}
                  >
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {result.events.map((event) => (
              <tr key={event.id}>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                  {new Date(event.occurredAt).toISOString()}
                </td>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                  {event.eventType}
                </td>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                  {event.actorPrincipalType ?? '—'}
                  {event.actorRoleAtTime ? ` (${event.actorRoleAtTime})` : ''}
                  {event.actorPrincipalId ? ` · ${event.actorPrincipalId}` : ''}
                </td>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                  {event.familyId ?? '—'}
                </td>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                  {event.childId ?? '—'}
                </td>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                  {event.targetType}
                  {event.targetId ? ` · ${event.targetId}` : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
