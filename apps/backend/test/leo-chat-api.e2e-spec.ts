import { randomUUID } from 'node:crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { App } from 'supertest/types';
import { initializeApp as initializeClientApp, deleteApp as deleteClientApp } from 'firebase/app';
import { getAuth as getClientAuth, signInWithCustomToken } from 'firebase/auth';
import { LeoChatModule } from '../src/leo-chat/leo-chat.module';
import { getFirebaseAuth, resetFirebaseAdminForTests } from '../src/auth/firebase-admin.provider';
import { serializePermissionScope } from '../src/authorization/permission-scope';

/**
 * M27 (docs/sprints/sprint-06.md, §7; founder decisions H.2/H.6) — the
 * Definition-of-Done proof this milestone exists to produce: the real
 * HTTP behavior of the new Leo-chat API surface
 * (`POST /leo/conversations`, `POST /leo/conversations/:id/messages`,
 * `GET /leo/conversations/:id/messages`) with `ParentAuthGuard` and the
 * M23 `interact_with_leo` gate both wired in, against a real Postgres
 * instance and (when configured) the real, non-production dev Firebase
 * project `natkhat-ai-dev` (ADR-0016) — same
 * "real-infrastructure-for-security-sensitive-behavior" discipline
 * `test/audit-events-auth.e2e-spec.ts` (M25) already established for
 * `AdminAuthGuard`, applied here to `ParentAuthGuard`/`interact_with_leo`
 * instead. Skipped, not failed, when
 * FIREBASE_PROJECT_ID/FIREBASE_WEB_API_KEY are not present — identical
 * convention.
 *
 * Proves, end to end, both halves of this milestone's own explicit
 * scope: (a) an authorized parent can start a conversation, send a
 * message, and receive a persisted mock Leo reply; (b) an unauthorized
 * principal (wrong family, or missing interact_with_leo permission) is
 * correctly denied — same pattern
 * `leo/leo-chat-authorization.integration.spec.ts` (M23) already
 * proves at the service layer, now proved again at the real HTTP layer
 * this milestone adds.
 */
const hasFirebaseCredentials = Boolean(
  process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_WEB_API_KEY,
);

const describeIfConfigured = hasFirebaseCredentials ? describe : describe.skip;

describeIfConfigured('Leo-chat API — ParentAuthGuard + interact_with_leo gate (M27)', () => {
  let app: INestApplication<App>;
  const admin = new PrismaClient();

  const ownerEmail = `m27-e2e-owner-${randomUUID()}@example.invalid`;
  const ungrantedCoParentEmail = `m27-e2e-co-parent-${randomUUID()}@example.invalid`;
  const strangerEmail = `m27-e2e-stranger-${randomUUID()}@example.invalid`;

  let ownerFirebaseUid: string;
  let ungrantedCoParentFirebaseUid: string;
  let strangerFirebaseUid: string;
  let ownerId: string;
  let ungrantedCoParentId: string;
  let strangerId: string;
  let familyId: string;
  let childId: string;
  let clientApp: ReturnType<typeof initializeClientApp>;
  let ownerIdToken: string;
  let ungrantedCoParentIdToken: string;
  let strangerIdToken: string;

  beforeAll(async () => {
    resetFirebaseAdminForTests();
    const firebaseAdminAuth = getFirebaseAuth();

    const ownerUser = await firebaseAdminAuth.createUser({ email: ownerEmail });
    ownerFirebaseUid = ownerUser.uid;
    const owner = await admin.parent.create({
      data: {
        authIdentityRef: ownerFirebaseUid,
        displayName: 'Fictional M27 E2E Owner',
        contactEmail: ownerEmail,
      },
    });
    ownerId = owner.id;

    const ungrantedCoParentUser = await firebaseAdminAuth.createUser({
      email: ungrantedCoParentEmail,
    });
    ungrantedCoParentFirebaseUid = ungrantedCoParentUser.uid;
    const ungrantedCoParent = await admin.parent.create({
      data: {
        authIdentityRef: ungrantedCoParentFirebaseUid,
        displayName: 'Fictional M27 E2E Ungranted Co-Parent',
        contactEmail: ungrantedCoParentEmail,
      },
    });
    ungrantedCoParentId = ungrantedCoParent.id;

    // A parent authenticated for a real Parent record but holding no
    // role at all in the Family under test — proves the
    // family_not_authorized gate, not just "wrong permission_scope."
    const strangerUser = await firebaseAdminAuth.createUser({ email: strangerEmail });
    strangerFirebaseUid = strangerUser.uid;
    const stranger = await admin.parent.create({
      data: {
        authIdentityRef: strangerFirebaseUid,
        displayName: 'Fictional M27 E2E Stranger',
        contactEmail: strangerEmail,
      },
    });
    strangerId = stranger.id;

    const family = await admin.family.create({
      data: { owningParentId: ownerId, displayName: 'Fictional M27 E2E Family' },
    });
    familyId = family.id;

    const child = await admin.child.create({
      data: {
        familyId,
        firstName: 'Fictional M27 E2E Child',
        dateOfBirth: new Date('2019-06-01'),
        createdByParentId: ownerId,
      },
    });
    childId = child.id;

    // Co-parent explicitly granted a permission that is NOT
    // interact_with_leo — proves the action_not_permitted gate
    // specifically, not merely "has no role at all."
    await admin.coParentAssignment.create({
      data: {
        familyId,
        parentId: ungrantedCoParentId,
        invitedByParentId: ownerId,
        permissionScope: serializePermissionScope(['view_child_profile']),
      },
    });

    clientApp = initializeClientApp(
      {
        apiKey: process.env.FIREBASE_WEB_API_KEY,
        projectId: process.env.FIREBASE_PROJECT_ID,
      },
      `m27-e2e-${randomUUID()}`,
    );
    const clientAuth = getClientAuth(clientApp);

    const ownerCustomToken = await firebaseAdminAuth.createCustomToken(ownerFirebaseUid);
    ownerIdToken = await (
      await signInWithCustomToken(clientAuth, ownerCustomToken)
    ).user.getIdToken();

    const ungrantedCoParentCustomToken = await firebaseAdminAuth.createCustomToken(
      ungrantedCoParentFirebaseUid,
    );
    ungrantedCoParentIdToken = await (
      await signInWithCustomToken(clientAuth, ungrantedCoParentCustomToken)
    ).user.getIdToken();

    const strangerCustomToken = await firebaseAdminAuth.createCustomToken(strangerFirebaseUid);
    strangerIdToken = await (
      await signInWithCustomToken(clientAuth, strangerCustomToken)
    ).user.getIdToken();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [LeoChatModule],
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
    for (const uid of [ownerFirebaseUid, ungrantedCoParentFirebaseUid, strangerFirebaseUid]) {
      if (uid) {
        await firebaseAdminAuth.deleteUser(uid);
      }
    }
    if (familyId) {
      await admin.leoMemory.deleteMany({ where: { familyId } });
      await admin.message.deleteMany({ where: { familyId } });
      await admin.conversation.deleteMany({ where: { familyId } });
      await admin.familyEncryptionKey.deleteMany({ where: { familyId } });
      await admin.coParentAssignment.deleteMany({ where: { familyId } });
      await admin.child.deleteMany({ where: { familyId } });
      await admin.family.deleteMany({ where: { id: familyId } });
    }
    await admin.parent.deleteMany({
      where: { id: { in: [ownerId, ungrantedCoParentId, strangerId] } },
    });
    await admin.$disconnect();
  });

  it('rejects POST /leo/conversations with no Authorization header', () => {
    return request(app.getHttpServer())
      .post('/leo/conversations')
      .send({ familyId, childId })
      .expect(401);
  });

  it('rejects a stranger parent (no role in the family) with family_not_authorized', () => {
    return request(app.getHttpServer())
      .post('/leo/conversations')
      .set('Authorization', `Bearer ${strangerIdToken}`)
      .send({ familyId, childId })
      .expect(500);
  });

  it('rejects an ungranted co-parent (role present, interact_with_leo not granted) with action_not_permitted', () => {
    return request(app.getHttpServer())
      .post('/leo/conversations')
      .set('Authorization', `Bearer ${ungrantedCoParentIdToken}`)
      .send({ familyId, childId })
      .expect(500);
  });

  it('rejects a request missing familyId/childId with 400', () => {
    return request(app.getHttpServer())
      .post('/leo/conversations')
      .set('Authorization', `Bearer ${ownerIdToken}`)
      .send({})
      .expect(400);
  });

  it('end to end: the owning parent starts a conversation, sends a message, and receives a persisted mock Leo reply', async () => {
    const startResponse = await request(app.getHttpServer())
      .post('/leo/conversations')
      .set('Authorization', `Bearer ${ownerIdToken}`)
      .send({ familyId, childId })
      .expect(201);

    const conversationId = startResponse.body.id as string;
    expect(conversationId).toEqual(expect.any(String));

    const sendResponse = await request(app.getHttpServer())
      .post(`/leo/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${ownerIdToken}`)
      .send({ familyId, childId, content: 'Fictional: hi Leo, want to play a game?' })
      .expect(201);

    expect(sendResponse.body.childMessage.sender).toBe('child');
    expect(sendResponse.body.childMessage.content).toBe('Fictional: hi Leo, want to play a game?');
    expect(sendResponse.body.leoMessage.sender).toBe('leo');
    // Proves the loop actually ran through the mock adapter, not a
    // pass-through echo — mock.adapter.ts's own fixed canned-response
    // shape, untouched by this milestone.
    expect(sendResponse.body.leoMessage.content).toContain(
      'Fictional canned response for task_type',
    );
    expect(sendResponse.body.leoMessage.content).toContain('no real model was called');

    const listResponse = await request(app.getHttpServer())
      .get(`/leo/conversations/${conversationId}/messages`)
      .query({ familyId, childId })
      .set('Authorization', `Bearer ${ownerIdToken}`)
      .expect(200);

    expect(listResponse.body).toHaveLength(2);
    expect(listResponse.body.map((m: { sender: string }) => m.sender)).toEqual(['child', 'leo']);
  });

  it('GET messages is also gated: a stranger parent cannot list a conversation they have no role for', async () => {
    const startResponse = await request(app.getHttpServer())
      .post('/leo/conversations')
      .set('Authorization', `Bearer ${ownerIdToken}`)
      .send({ familyId, childId })
      .expect(201);
    const conversationId = startResponse.body.id as string;

    await request(app.getHttpServer())
      .get(`/leo/conversations/${conversationId}/messages`)
      .query({ familyId, childId })
      .set('Authorization', `Bearer ${strangerIdToken}`)
      .expect(500);
  });
});
