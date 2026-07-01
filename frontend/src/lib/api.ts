const BASE = process.env.EXPO_PUBLIC_BACKEND_URL || '';

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE}/api${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json();
}

export const api = {
  sendOtp: (mobile: string) =>
    req<{ ok: boolean; dev_otp: string }>('/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ mobile }),
    }),
  verifyOtp: (mobile: string, otp: string, name?: string, email?: string) =>
    req<{ ok: boolean; parent: any; child: any; has_child: boolean }>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ mobile, otp, name, email }),
    }),
  createChild: (parent_id: string, child_name: string, age: number, bhasha: string) =>
    req<{ ok: boolean; child: any }>('/child/profile', {
      method: 'POST',
      body: JSON.stringify({ parent_id, child_name, age, bhasha }),
    }),
  getChild: (child_id: string) =>
    req<{ ok: boolean; child: any }>(`/child/${child_id}`),
  seenIntro: (child_id: string) =>
    req<{ ok: boolean }>('/child/seen-intro', {
      method: 'POST',
      body: JSON.stringify({ child_id }),
    }),
  getPortalsMeta: () =>
    req<{ portals: any[]; levels: any[]; bhashas: any[] }>('/portals'),
  askLeo: (payload: {
    child_id?: string;
    child_name: string;
    bhasha: string;
    portal_name: string;
    messages: { role: 'user' | 'assistant'; content: string }[];
  }) =>
    req<{ content: { type: string; text: string }[]; safety_triggered?: boolean }>('/leo', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  logSession: (payload: any) =>
    req<{ ok: boolean }>('/session/log', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
