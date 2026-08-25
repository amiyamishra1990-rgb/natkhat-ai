import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { initializeApp as initializeClientApp, deleteApp as deleteClientApp } from 'firebase/app';
import { getAuth as getClientAuth, signInWithCustomToken } from 'firebase/auth';
import { ParentRepository } from '../identity-family/repositories/parent.repository';
import { FirebaseAuthService, InvalidAccessTokenError } from './firebase-auth.service';
import { getFirebaseAuth, resetFirebaseAdminForTests } from './firebase-admin.provider';

// M15 — the "Integration ... executable against real auth" bar
// sprint-03.md §4's M15 entry sets, run against the real, non-
// production dev Firebase project `natkhat-ai-dev` (ADR-0016). Skipped,
// not failed, when FIREBASE_PROJECT_ID/FIREBASE_WEB_API_KEY are not
// present, or when the local machine has no Application Default
// Credentials configured (`gcloud auth application-default login`) —
// this project's dev Firebase project is not provisioned in every
// contributor's environment. Once both env vars are supplied (as a
// local .env) and ADC is configured, this suite runs for real and is
// the actual proof this milestone's Definition of Done requires — the
// mocked firebase-auth.service.spec.ts unit test is not a substitute
// for it, per the M14 lesson that mock-only tests do not prove
// security-sensitive behavior.
//
// FIREBASE_WEB_API_KEY is the project's public Web API key (Firebase
// project settings), used only by the client SDK's signInWithCustomToken
// to obtain a real, verifiable ID token for this test — it is not a
// secret by Firebase's own design (safe to ship in client bundles), but
// is still read from configuration rather than hardcoded, so this test
// is never coupled to one specific Firebase project. The Admin SDK
// (getFirebaseAuth, used by FirebaseAuthService itself) never uses this
// key — it authenticates via ADC only, per ADR-0016.
const hasFirebaseCredentials = Boolean(
  process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_WEB_API_KEY,
);

const describeIfConfigured = hasFirebaseCredentials ? describe : describe.skip;

describeIfConfigured('FirebaseAuthService — real dev Firebase project (M15)', () => {
  const admin = new PrismaClient();
  const parentRepository = new ParentRepository(admin);
  const service = new FirebaseAuthService(parentRepository);

  // A synthetic test account created for this run only — never a real
  // parent. Uses the Admin SDK (ADC) so this suite does not depend on
  // email delivery/confirmation flows.
  const testEmail = `m15-integration-${randomUUID()}@example.invalid`;
  let firebaseUid: string;
  let parentId: string;
  let clientApp: ReturnType<typeof initializeClientApp>;

  beforeAll(async () => {
    resetFirebaseAdminForTests();
    const adminAuth = getFirebaseAuth();
    const user = await adminAuth.createUser({ email: testEmail });
    firebaseUid = user.uid;

    const parent = await admin.parent.create({
      data: {
        authIdentityRef: firebaseUid,
        displayName: 'Fictional M15 Integration Parent',
        contactEmail: testEmail,
      },
    });
    parentId = parent.id;

    clientApp = initializeClientApp(
      {
        apiKey: process.env.FIREBASE_WEB_API_KEY,
        projectId: process.env.FIREBASE_PROJECT_ID,
      },
      `m15-integration-${randomUUID()}`,
    );
  });

  afterAll(async () => {
    if (clientApp) {
      await deleteClientApp(clientApp);
    }
    const adminAuth = getFirebaseAuth();
    if (firebaseUid) {
      await adminAuth.deleteUser(firebaseUid);
    }
    if (parentId) {
      await admin.parent.delete({ where: { id: parentId } });
    }
    await admin.$disconnect();
  });

  it('resolves the Parent for a real, verified Firebase ID token', async () => {
    const adminAuth = getFirebaseAuth();
    const customToken = await adminAuth.createCustomToken(firebaseUid);

    const clientAuth = getClientAuth(clientApp);
    const credential = await signInWithCustomToken(clientAuth, customToken);
    const idToken = await credential.user.getIdToken();

    const parent = await service.resolveParentFromIdToken(idToken);
    expect(parent.id).toBe(parentId);
    expect(parent.authIdentityRef).toBe(firebaseUid);
  });

  it('rejects a garbage/forged ID token', async () => {
    await expect(service.resolveParentFromIdToken('not-a-real-token')).rejects.toThrow(
      InvalidAccessTokenError,
    );
  });
});
