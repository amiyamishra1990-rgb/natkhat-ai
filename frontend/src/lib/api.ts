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
  tts: (text: string, bhasha: string) =>
    req<{ ok: boolean; audio_base64: string; lang_code?: string; mime?: string; error?: string }>(
      '/tts',
      {
        method: 'POST',
        body: JSON.stringify({ text, bhasha }),
      },
    ),
  logSession: (payload: any) =>
    req<{ ok: boolean }>('/session/log', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

// STT is a multipart upload (audio file), so it doesn't use the JSON `req` helper.
export async function sttUpload(
  audioUri: string,
  bhasha: string,
): Promise<{ ok: boolean; transcript: string; error?: string }> {
  const url = `${BASE}/api/stt`;
  const form = new FormData();
  // In React Native, FormData supports { uri, name, type }
  // Cast to any because RN's FormData typing is not aware of the RN file blob shape.
  form.append('file', {
    uri: audioUri,
    name: 'voice.m4a',
    type: 'audio/m4a',
  } as any);
  form.append('bhasha', bhasha);
  const res = await fetch(url, { method: 'POST', body: form as any });
  if (!res.ok) {
    return { ok: false, transcript: '', error: `STT ${res.status}` };
  }
  return res.json();
}
