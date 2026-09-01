import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { initializeApp as initializeClientApp, deleteApp as deleteClientApp } from 'firebase/app';
import { getAuth as getClientAuth, signInWithCustomToken } from 'firebase/auth';
import { AdminUserRepository } from './repositories/admin-user.repository';
import { AdminAuthService, UnknownAdminIdentityError } from './admin-auth.service';
import { getFirebaseAuth, resetFirebaseAdminForTests } from '../auth/firebase-admin.provider';

// M25 (docs/sprints/sprint-05.md, §4; Founder Decision G.2) — same
// "Integration ... executable against real auth" bar as
// auth/firebase-auth.integration.spec.ts, run against the same real,
// non-production dev Firebase project (`natkhat-ai-dev`, ADR-0016).
// Skipped, not failed, when FIREBASE_PROJECT_ID/FIREBASE_WEB_API_KEY
// are not present — same convention, same reason (see that file's own
// comment).
//
// Beyond mirroring that file's "resolves a real verified token" /
// "rejects a garbage token" pair, this suite adds the one case that is
// specific to this milestone's scope: a real Parent's own, genuinely
// valid Firebase ID token must still be rejected by AdminAuthService,
// because AdminUser and Parent are looked up from entirely separate
// tables — proving the admin-principal type is distinct, not merely
// "any logged-in user" (M25's explicit requirement).
const hasFirebaseCredentials = Boolean(
  process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_WEB_API_KEY,
);

const describeIfConfigured = hasFirebaseCredentials ? describe : describe.skip;

describeIfConfigured('AdminAuthService — real dev Firebase project (M25)', () => {
  const admin = new PrismaClient();
  const adminUserRepository = new AdminUserRepository(admin);
  const service = new AdminAuthService(adminUserRepository);

  const adminEmail = `m25-admin-integration-${randomUUID()}@example.invalid`;
  const parentEmail = `m25-parent-integration-${randomUUID()}@example.invalid`;
  let adminFirebaseUid: string;
  let parentFirebaseUid: string;
  let adminUserId: string;
  let parentId: string;
  let clientApp: ReturnType<typeof initializeClientApp>;

  beforeAll(async () => {
    resetFirebaseAdminForTests();
    const adminAuth = getFirebaseAuth();

    const adminFirebaseUser = await adminAuth.createUser({ email: adminEmail });
    adminFirebaseUid = adminFirebaseUser.uid;
    const adminUser = await admin.adminUser.create({
      data: {
        authIdentityRef: adminFirebaseUid,
        displayName: 'Fictional M25 Integration Admin',
        contactEmail: adminEmail,
      },
    });
    adminUserId = adminUser.id;

    // A real Parent, sharing nothing with the AdminUser above except
    // both existing in the same Firebase project — exactly the
    // scenario the "distinct principal type" requirement is about.
    const parentFirebaseUser = await adminAuth.createUser({ email: parentEmail });
    parentFirebaseUid = parentFirebaseUser.uid;
    const parent = await admin.parent.create({
      data: {
        authIdentityRef: parentFirebaseUid,
        displayName: 'Fictional M25 Integration Parent',
        contactEmail: parentEmail,
      },
    });
    parentId = parent.id;

    clientApp = initializeClientApp(
      {
        apiKey: process.env.FIREBASE_WEB_API_KEY,
        projectId: process.env.FIREBASE_PROJECT_ID,
      },
      `m25-integration-${randomUUID()}`,
    );
  });

  afterAll(async () => {
    if (clientApp) {
      await deleteClientApp(clientApp);
    }
    const adminAuth = getFirebaseAuth();
    if (adminFirebaseUid) {
      await adminAuth.deleteUser(adminFirebaseUid);
    }
    if (parentFirebaseUid) {
      await adminAuth.deleteUser(parentFirebaseUid);
    }
    if (adminUserId) {
      await admin.adminUser.delete({ where: { id: adminUserId } });
    }
    if (parentId) {
      await admin.parent.delete({ where: { id: parentId } });
    }
    await admin.$disconnect();
  });

  async function getIdTokenFor(firebaseUid: string): Promise<string> {
    const adminAuth = getFirebaseAuth();
    const customToken = await adminAuth.createCustomToken(firebaseUid);
    const clientAuth = getClientAuth(clientApp);
    const credential = await signInWithCustomToken(clientAuth, customToken);
    return credential.user.getIdToken();
  }

  it('resolves the AdminUser for a real, verified Firebase ID token', async () => {
    const idToken = await getIdTokenFor(adminFirebaseUid);

    const resolved = await service.resolveAdminFromIdToken(idToken);
    expect(resolved.id).toBe(adminUserId);
    expect(resolved.authIdentityRef).toBe(adminFirebaseUid);
  });

  it('rejects a real, valid Firebase ID token belonging to a Parent, not an AdminUser', async () => {
    const idToken = await getIdTokenFor(parentFirebaseUid);

    await expect(service.resolveAdminFromIdToken(idToken)).rejects.toThrow(
      UnknownAdminIdentityError,
    );
  });
});
