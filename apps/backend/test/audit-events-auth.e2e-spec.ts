import { randomUUID } from 'node:crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { App } from 'supertest/types';
import { initializeApp as initializeClientApp, deleteApp as deleteClientApp } from 'firebase/app';
import { getAuth as getClientAuth, signInWithCustomToken } from 'firebase/auth';
import { AuditModule } from '../src/audit/audit.module';
import { getFirebaseAuth, resetFirebaseAdminForTests } from '../src/auth/firebase-admin.provider';

// M25 (docs/sprints/sprint-05.md, §4; Founder Decision G.2) — the
// Definition-of-Done proof this milestone exists to produce: the real
// HTTP behavior of GET /audit-events with AdminAuthGuard wired in,
// against the real, non-production dev Firebase project
// (`natkhat-ai-dev`, ADR-0016) and a real Postgres instance (this
// suite runs under jest-e2e.json, same live-DB expectation every other
// *.e2e-spec.ts/*.integration.spec.ts in this backend already has).
// Skipped, not failed, when FIREBASE_PROJECT_ID/FIREBASE_WEB_API_KEY
// are not present — same convention admin-auth.integration.spec.ts and
// auth/firebase-auth.integration.spec.ts already use.
const hasFirebaseCredentials = Boolean(
  process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_WEB_API_KEY,
);

const describeIfConfigured = hasFirebaseCredentials ? describe : describe.skip;

describeIfConfigured('GET /audit-events — AdminAuthGuard (M25)', () => {
  let app: INestApplication<App>;
  const admin = new PrismaClient();

  const adminEmail = `m25-e2e-admin-${randomUUID()}@example.invalid`;
  const parentEmail = `m25-e2e-parent-${randomUUID()}@example.invalid`;
  let adminFirebaseUid: string;
  let parentFirebaseUid: string;
  let adminUserId: string;
  let parentId: string;
  let clientApp: ReturnType<typeof initializeClientApp>;
  let adminIdToken: string;
  let parentIdToken: string;

  beforeAll(async () => {
    resetFirebaseAdminForTests();
    const firebaseAdminAuth = getFirebaseAuth();

    const adminFirebaseUser = await firebaseAdminAuth.createUser({ email: adminEmail });
    adminFirebaseUid = adminFirebaseUser.uid;
    const adminUser = await admin.adminUser.create({
      data: {
        authIdentityRef: adminFirebaseUid,
        displayName: 'Fictional M25 E2E Admin',
        contactEmail: adminEmail,
      },
    });
    adminUserId = adminUser.id;

    // A real Parent — not an AdminUser — used to prove the endpoint
    // rejects "any logged-in Firebase user," not just a missing token.
    const parentFirebaseUser = await firebaseAdminAuth.createUser({ email: parentEmail });
    parentFirebaseUid = parentFirebaseUser.uid;
    const parent = await admin.parent.create({
      data: {
        authIdentityRef: parentFirebaseUid,
        displayName: 'Fictional M25 E2E Parent',
        contactEmail: parentEmail,
      },
    });
    parentId = parent.id;

    clientApp = initializeClientApp(
      {
        apiKey: process.env.FIREBASE_WEB_API_KEY,
        projectId: process.env.FIREBASE_PROJECT_ID,
      },
      `m25-e2e-${randomUUID()}`,
    );
    const clientAuth = getClientAuth(clientApp);

    const adminCustomToken = await firebaseAdminAuth.createCustomToken(adminFirebaseUid);
    const adminCredential = await signInWithCustomToken(clientAuth, adminCustomToken);
    adminIdToken = await adminCredential.user.getIdToken();

    const parentCustomToken = await firebaseAdminAuth.createCustomToken(parentFirebaseUid);
    const parentCredential = await signInWithCustomToken(clientAuth, parentCustomToken);
    parentIdToken = await parentCredential.user.getIdToken();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuditModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    if (clientApp) {
      await deleteClientApp(clientApp);
    }
    const firebaseAdminAuth = getFirebaseAuth();
    if (adminFirebaseUid) {
      await firebaseAdminAuth.deleteUser(adminFirebaseUid);
    }
    if (parentFirebaseUid) {
      await firebaseAdminAuth.deleteUser(parentFirebaseUid);
    }
    if (adminUserId) {
      await admin.adminUser.delete({ where: { id: adminUserId } });
    }
    if (parentId) {
      await admin.parent.delete({ where: { id: parentId } });
    }
    await admin.$disconnect();
  });

  it('rejects a request with no Authorization header', () => {
    return request(app.getHttpServer()).get('/audit-events').expect(401);
  });

  it('rejects a request bearing a real Parent credential — a valid Firebase token that is not an admin principal', () => {
    return request(app.getHttpServer())
      .get('/audit-events')
      .set('Authorization', `Bearer ${parentIdToken}`)
      .expect(401);
  });

  it('accepts a request bearing a real AdminUser credential', () => {
    return request(app.getHttpServer())
      .get('/audit-events')
      .set('Authorization', `Bearer ${adminIdToken}`)
      .expect(200);
  });
});
