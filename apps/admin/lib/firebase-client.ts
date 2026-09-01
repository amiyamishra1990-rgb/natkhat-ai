'use client';

import { initializeApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// M25 (docs/sprints/sprint-05.md, §4; Founder Decision G.2; ADR-0016).
// Client-side Firebase Auth for apps/admin's sign-in page only — no
// other client-side Firebase usage exists in this app. Points at the
// same real, non-production dev Firebase project
// (`natkhat-ai-dev`) apps/backend's Admin SDK (auth/firebase-admin.provider.ts)
// verifies tokens against; test/synthetic admin accounts only, per
// this milestone's scope.
//
// NEXT_PUBLIC_* values are Firebase's own public client config (Web
// API key, project id, etc.) — not secrets by Firebase's own design
// (see apps/backend/.env.example's FIREBASE_WEB_API_KEY comment for
// the same point made about the backend's integration test). Left
// unset here rather than hardcoded so this app is never coupled to
// one specific Firebase project; the sign-in page fails clearly (not
// silently) if they are missing.
function readFirebaseConfig(): FirebaseOptions {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? `${projectId}.firebaseapp.com`;

  if (!apiKey || !projectId) {
    throw new Error(
      'NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID must be set — see apps/admin/.env.example. Never a production Firebase project.',
    );
  }

  return { apiKey, authDomain, projectId };
}

let cachedAuth: ReturnType<typeof getAuth> | undefined;

export function getAdminFirebaseAuth() {
  if (!cachedAuth) {
    const existing = getApps()[0];
    const app = existing ?? initializeApp(readFirebaseConfig());
    cachedAuth = getAuth(app);
  }
  return cachedAuth;
}
