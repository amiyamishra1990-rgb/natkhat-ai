import { App, initializeApp, getApps, cert, applicationDefault } from 'firebase-admin/app';
import { Auth, getAuth } from 'firebase-admin/auth';

// M15 (docs/sprints/sprint-03.md, §4; ADR-0016 — supersedes ADR-0005's
// authentication clause). Points at a real, non-production DEV Firebase
// project (`natkhat-ai-dev`, Blaze plan) — test accounts only, no
// India-residency claim, no production credentials. Never a hardcoded
// value; FIREBASE_PROJECT_ID is required at first use.
//
// Credential strategy (ADR-0016, Decision item 2): Application Default
// Credentials (ADC) — `gcloud auth application-default login` — never a
// downloaded service-account JSON key file. The founder's Google Cloud
// organization enforces `iam.managed.disableServiceAccountApiKeyCreation`
// as Active; this is not something this codebase asks to override.
// Production credential strategy (e.g. Workload Identity Federation on
// Cloud Run/GKE) is separate future work, not implemented here.
//
// A plain lazy function, deliberately NOT registered as a NestJS DI
// provider — same precedent as the Supabase client this replaces
// (identity-family/rls-context.ts's getAppPrismaClient()): the missing-
// env-var error surfaces the first time the client is actually used
// (inside FirebaseAuthService's methods), not at module load. No dev
// Firebase project exists yet for most contributors' environments, and
// unrelated backend commands (build, typecheck, lint, other modules'
// tests) must keep working without one.
let cachedApp: App | undefined;
let cachedAuth: Auth | undefined;

export function getFirebaseAuth(): Auth {
  if (!cachedAuth) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    if (!projectId) {
      throw new Error(
        'FIREBASE_PROJECT_ID must be set — required to verify Firebase-issued ID tokens against ' +
          'the M15 non-production dev project (ADR-0016). See apps/backend/.env.example. Never a ' +
          'production project.',
      );
    }

    const existing = getApps().find((app) => app.name === '[DEFAULT]');
    cachedApp =
      existing ??
      initializeApp({
        // GOOGLE_APPLICATION_CREDENTIALS, if set, points ADC at a
        // service-account key file; leaving it unset (the expected
        // local-dev case) makes `applicationDefault()` use the
        // `gcloud auth application-default login` user credential
        // instead — never a downloaded key committed to this repo.
        credential: process.env.GOOGLE_APPLICATION_CREDENTIALS
          ? cert(process.env.GOOGLE_APPLICATION_CREDENTIALS)
          : applicationDefault(),
        projectId,
      });

    // ID-token verification only, server-side — never exposed to a
    // client. No client-side Firebase usage exists in this milestone;
    // M14's Postgres RLS remains the isolation layer for Natkhat's own
    // tables; Firebase's own user store is not subject to it.
    cachedAuth = getAuth(cachedApp);
  }
  return cachedAuth;
}

export function resetFirebaseAdminForTests(): void {
  cachedApp = undefined;
  cachedAuth = undefined;
}
