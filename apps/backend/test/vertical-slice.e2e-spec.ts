import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { ParentRepository } from '../src/identity-family/repositories/parent.repository';
import { FamilyRepository } from '../src/identity-family/repositories/family.repository';
import { ChildRepository } from '../src/identity-family/repositories/child.repository';
import { CoParentAssignmentRepository } from '../src/identity-family/repositories/co-parent-assignment.repository';
import { DeviceRepository } from '../src/identity-family/repositories/device.repository';
import { SessionRepository } from '../src/identity-family/repositories/session.repository';
import { AuditEventRepository } from '../src/audit/repositories/audit-event.repository';
import { AuditService } from '../src/audit/audit.service';
import { loadAuditConfig } from '../src/audit/audit.config';
import { AuthorizationService } from '../src/authorization/authorization.service';
import { SessionLifecycleService } from '../src/authorization/session-lifecycle.service';
import { LifecycleService } from '../src/lifecycle/lifecycle.service';
import { loadLifecycleConfig } from '../src/lifecycle/lifecycle.config';
import { ConsentEventRepository } from '../src/consent/repositories/consent-event.repository';
import { ConsentService } from '../src/consent/consent.service';
import { loadConsentConfig } from '../src/consent/consent.config';
import { ConversationRepository } from '../src/leo/repositories/conversation.repository';
import { MessageRepository } from '../src/leo/repositories/message.repository';
import { LeoMemoryRepository } from '../src/leo/repositories/leo-memory.repository';
import { FamilyEncryptionKeyRepository } from '../src/leo/repositories/family-encryption-key.repository';
import { LeoEncryptionService } from '../src/leo/leo-encryption.service';
import { LeoLifecycleService } from '../src/leo/leo-lifecycle.service';
import { LeoConversationNotFoundError, LeoService } from '../src/leo/leo.service';
import { loadLeoConfig } from '../src/leo/leo.config';
import { AdapterRegistry } from '../src/ai-provider/adapter-registry';
import { MockAiProviderAdapter } from '../src/ai-provider/adapters/mock.adapter';
import { loadAiProviderConfig } from '../src/ai-provider/ai-provider.config';
import { NeutralAiRequest, taskType } from '../src/ai-provider/contract';
import { isPersonalizationCrossingAllowed } from '../src/ai-provider/personalization-allowlist';
import { initializeApp as initializeClientApp, deleteApp as deleteClientApp } from 'firebase/app';
import { getAuth as getClientAuth, signInWithCustomToken } from 'firebase/auth';
import { getFirebaseAuth, resetFirebaseAdminForTests } from '../src/auth/firebase-admin.provider';
import { FirebaseAuthService } from '../src/auth/firebase-auth.service';

// M20 — First End-to-End Vertical Slice (docs/sprints/sprint-03.md,
// §4). "Entirely behind a feature flag defaulting off" — same
// deliberate stopgap as consent/consent.config.ts's
// CONSENT_TRACK_A_ENABLED (docs/engineering/feature-flags.md's own
// Status line: no feature-flag system exists in this repository yet).
// This flag lives here, inline, rather than as a new
// src/<module>/*.config.ts: the thing being flagged off-by-default is
// this test/demo path itself, not a new runtime production feature —
// M20's own "Expected files/directories" names only an integration-
// test suite, "no new production surface." There is also no
// "production environment" concept anywhere in this codebase to
// additionally guard against (Sprint 03 has none at all — §9's own
// Definition of Done) — the off-by-default flag is the entire
// guardrail, same as every other Track A flag this sprint has shipped.
function parseBooleanEnv(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (raw === undefined || raw === '') {
    return fallback;
  }
  if (raw === 'true') {
    return true;
  }
  if (raw === 'false') {
    return false;
  }
  throw new Error(`${name} must be "true" or "false", got: ${raw}`);
}

const verticalSliceEnabled = parseBooleanEnv('VERTICAL_SLICE_ENABLED', false);
const describeIfEnabled = verticalSliceEnabled ? describe : describe.skip;

// M15's own established pattern (auth/firebase-auth.integration.spec.ts)
// — skipped, not failed, when no real dev Firebase project is
// configured. See that file's header comment for the full rationale;
// this suite reuses it rather than inventing a second convention.
const hasFirebaseCredentials = Boolean(
  process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_WEB_API_KEY,
);

/**
 * M20 (docs/sprints/sprint-03.md, §4). Wires M14-M19's Track A
 * scaffolds into one flow — parent signup → family → child (via the
 * M17 consent scaffold) → Leo chat (via the M19 mock adapter) —
 * against a real local Postgres instance and (when configured) the
 * real, non-production dev Firebase project `natkhat-ai-dev`
 * (ADR-0016), entirely with synthetic/fictional data.
 *
 * Every service below is constructed directly (`new`), not through a
 * NestJS `TestingModule` — the same convention every M14-M19
 * `*.integration.spec.ts` in this repository already uses (see e.g.
 * consent/consent.service.integration.spec.ts's identical wiring).
 *
 * The `it` blocks in this suite are deliberately sequential and share
 * this `describe`'s fixtures — each one is one step of a single
 * realistic flow, not an independent unit (Jest itself guarantees
 * in-file declaration order, so this is safe). This differs from most
 * other specs in this repository, whose `it`s are independent by
 * design; here, "one flow" is the entire point of the milestone.
 *
 * Deliberately NOT exercised here (out of scope for this milestone,
 * per §4's own exclusions): any real consent-verification mechanism,
 * any real AI/LLM provider, any child-session/child-principal
 * authorization path (none exists — ADR-0009 Decision item 7 reserves
 * it), and a new `Action` for "interact with Leo" (see this file's
 * final `it` block comment and `docs/decisions/decision-log.md`'s
 * 2026-08-22 entry for why that gap is deliberately left open here).
 */
describeIfEnabled(
  'Sprint 03 M20 — first end-to-end vertical slice (internal, dev-only, feature-flagged)',
  () => {
    const admin = new PrismaClient();

    const parentRepository = new ParentRepository(admin);
    const familyRepository = new FamilyRepository(admin);
    const childRepository = new ChildRepository(admin);
    const coParentAssignmentRepository = new CoParentAssignmentRepository(admin);
    const deviceRepository = new DeviceRepository(admin);
    const sessionRepository = new SessionRepository(admin);
    const auditEventRepository = new AuditEventRepository(admin);
    const auditService = new AuditService(auditEventRepository, loadAuditConfig());

    const authorizationService = new AuthorizationService(
      familyRepository,
      coParentAssignmentRepository,
    );
    const sessionLifecycleService = new SessionLifecycleService(
      authorizationService,
      sessionRepository,
      coParentAssignmentRepository,
      auditService,
    );

    const leoLifecycleService = new LeoLifecycleService(
      loadLeoConfig(),
      new ConversationRepository(admin),
      new MessageRepository(admin),
      new LeoMemoryRepository(admin),
      new FamilyEncryptionKeyRepository(admin),
    );
    const lifecycleService = new LifecycleService(
      childRepository,
      familyRepository,
      parentRepository,
      coParentAssignmentRepository,
      deviceRepository,
      sessionRepository,
      auditService,
      leoLifecycleService,
      loadLifecycleConfig(),
    );

    const consentService = new ConsentService(
      admin,
      new ConsentEventRepository(admin),
      lifecycleService,
      loadConsentConfig(),
    );

    const leoService = new LeoService(
      admin,
      new LeoEncryptionService(loadLeoConfig(), new FamilyEncryptionKeyRepository(admin)),
      new ConversationRepository(admin),
      new MessageRepository(admin),
      new LeoMemoryRepository(admin),
    );

    const adapterRegistry = new AdapterRegistry(loadAiProviderConfig());
    const mockAdapter = new MockAiProviderAdapter();
    adapterRegistry.register(mockAdapter);

    const firebaseAuthService = new FirebaseAuthService(parentRepository);

    // Primary flow fixtures.
    const owner = { id: randomUUID() };
    const family = { id: randomUUID() };
    const device = { id: randomUUID() };
    const testEmail = `m20-vertical-slice-${randomUUID()}@example.invalid`;
    let firebaseUid: string;
    let clientApp: ReturnType<typeof initializeClientApp>;
    let childId: string;
    let conversationId: string;

    // Control-group fixtures — a second, unrelated Family — used only
    // by the final "isolation chain holds" step, so a single composed
    // flow proves cross-family isolation too, not just the happy path.
    const otherOwner = { id: randomUUID() };
    const otherFamily = { id: randomUUID() };

    beforeAll(async () => {
      if (hasFirebaseCredentials) {
        resetFirebaseAdminForTests();
        const adminAuth = getFirebaseAuth();
        const user = await adminAuth.createUser({ email: testEmail });
        firebaseUid = user.uid;
        clientApp = initializeClientApp(
          {
            apiKey: process.env.FIREBASE_WEB_API_KEY,
            projectId: process.env.FIREBASE_PROJECT_ID,
          },
          `m20-vertical-slice-${randomUUID()}`,
        );
      } else {
        // No real dev Firebase project configured in this environment
        // — same fictional-auth-ref placeholder convention every
        // non-Firebase M14-M18 fixture in this repository already
        // uses (e.g. leo-cross-child-isolation.integration.spec.ts).
        firebaseUid = `fictional-auth-ref-${owner.id}`;
      }

      await parentRepository.create({
        id: owner.id,
        authIdentityRef: firebaseUid,
        displayName: 'Fictional M20 Parent',
        contactEmail: testEmail,
      });
      await parentRepository.create({
        id: otherOwner.id,
        authIdentityRef: `fictional-auth-ref-${otherOwner.id}`,
        displayName: 'Fictional M20 Control Parent',
        contactEmail: `m20-control-${randomUUID()}@example.invalid`,
      });
      await deviceRepository.create({
        id: device.id,
        parentId: owner.id,
        deviceLabel: "Fictional M20 Parent's tablet",
        deviceType: 'tablet',
        status: 'active',
      });
    });

    afterAll(async () => {
      if (hasFirebaseCredentials) {
        if (clientApp) {
          await deleteClientApp(clientApp);
        }
        const adminAuth = getFirebaseAuth();
        await adminAuth.deleteUser(firebaseUid);
      }
      const familyIds = [family.id, otherFamily.id];
      await admin.leoMemory.deleteMany({ where: { familyId: { in: familyIds } } });
      await admin.message.deleteMany({ where: { familyId: { in: familyIds } } });
      await admin.conversation.deleteMany({ where: { familyId: { in: familyIds } } });
      await admin.familyEncryptionKey.deleteMany({ where: { familyId: { in: familyIds } } });
      await admin.consentEvent.deleteMany({ where: { familyId: { in: familyIds } } });
      await admin.auditEvent.deleteMany({ where: { familyId: { in: familyIds } } });
      await admin.child.deleteMany({ where: { familyId: { in: familyIds } } });
      await admin.session.deleteMany({ where: { familyId: { in: familyIds } } });
      await admin.family.deleteMany({ where: { id: { in: familyIds } } });
      await admin.device.deleteMany({ where: { id: device.id } });
      await admin.parent.deleteMany({ where: { id: { in: [owner.id, otherOwner.id] } } });
      await admin.$disconnect();
    });

    // Only runs for real against the dev Firebase project (ADR-0016)
    // when FIREBASE_PROJECT_ID/FIREBASE_WEB_API_KEY are configured —
    // identical skip condition to M15's own
    // firebase-auth.integration.spec.ts. This is the "parent signup"
    // half of the flow's first step; Parent-record creation itself
    // (above, in beforeAll) is unconditional, per
    // auth/firebase-auth.service.ts's own documented scope ("does not
    // create Parent records — that remains an identity-family
    // concern").
    (hasFirebaseCredentials ? it : it.skip)(
      'step 1 — parent signup: a real dev Firebase ID token resolves to the Parent record (M15)',
      async () => {
        const adminAuth = getFirebaseAuth();
        const customToken = await adminAuth.createCustomToken(firebaseUid);

        const clientAuth = getClientAuth(clientApp);
        const credential = await signInWithCustomToken(clientAuth, customToken);
        const idToken = await credential.user.getIdToken();

        const resolvedParent = await firebaseAuthService.resolveParentFromIdToken(idToken);
        expect(resolvedParent.id).toBe(owner.id);
        expect(resolvedParent.authIdentityRef).toBe(firebaseUid);
      },
    );

    it('step 2 — family: creating it, then the M15 authorize() two-gate check permits the owner to create a child', async () => {
      const createdFamily = await familyRepository.create({
        id: family.id,
        owningParentId: owner.id,
        displayName: 'Fictional M20 Family',
      });
      expect(createdFamily.id).toBe(family.id);

      const authResult = await authorizationService.authorize({
        principalId: owner.id,
        principalType: 'Parent',
        requestedFamilyId: family.id,
        requestedAction: 'create_child',
      });
      expect(authResult).toEqual({ allowed: true, role: 'owner' });
    });

    it('step 3 — session: establishing the parents session in the new family produces a real M16 audit event', async () => {
      // Reuses session-lifecycle.service.ts's `switchFamily` to
      // establish the parent's first active session for this Family —
      // "switch" reads oddly for a brand-new session, but the method's
      // own logic (end any active sessions, start one in the target
      // family, audit the event) is exactly "establish a session
      // here" regardless of whether a prior one existed. This is the
      // one step in this flow that both (a) requires no new
      // production code and (b) already emits a real AuditEvent row,
      // which is what makes it this milestone's audit-log-coverage
      // assertion. ConsentService/LeoService below do NOT call
      // AuditService anywhere in this codebase (ConsentEvent already
      // serves as consent's own audit-equivalent record, per
      // audit-logging.md §5; Leo's actions have no audit hook at all)
      // — extending either to add one is a real production-code
      // change to two already-shipped milestones, out of scope for
      // this integration-test-only milestone. Not asserted here as
      // full audit coverage of the flow; noted explicitly, not a
      // silent gap.
      const { newSessionId } = await sessionLifecycleService.switchFamily({
        principalId: owner.id,
        principalType: 'Parent',
        targetFamilyId: family.id,
        deviceId: device.id,
      });
      expect(newSessionId).toEqual(expect.any(String));

      const events = await admin.auditEvent.findMany({ where: { familyId: family.id } });
      const switchEvent = events.find((event) => event.eventType === 'family_switch');
      expect(switchEvent).toBeDefined();
      expect(switchEvent?.actorPrincipalId).toBe(owner.id);
      expect(switchEvent?.targetId).toBe(family.id);
    });

    it('step 4 — child: created via the M17 consent scaffold, atomically with its founding ConsentEvent', async () => {
      const { child, consentEvent } = await consentService.createChildWithFoundingConsent({
        familyId: family.id,
        createdByParentId: owner.id,
        firstName: 'Fictional M20 Child',
        dateOfBirth: new Date('2019-06-01'),
        consentingParentId: owner.id,
        privacyTermsVersion: 'fictional-terms-v1',
      });
      childId = child.id;

      expect(child.id).toBe(consentEvent.childId);
      expect(consentEvent.consentType).toBe('child_account_creation');
      expect(consentEvent.action).toBe('granted');
    });

    it('step 5 — Leo chat: a child message goes through the M19 mock adapter and back, with no child PII crossing into the AI request', async () => {
      const conversation = await leoService.startConversation({ familyId: family.id, childId });
      conversationId = conversation.id;

      const childMessage = await leoService.appendMessage({
        conversationId,
        familyId: family.id,
        childId,
        sender: 'child',
        content: 'Fictional: Hi Leo, want to play a game?',
      });

      // §9's Personalization Data Allowlist is empty by design (M19) —
      // this request is built from generic, non-personalized text
      // only, never the child's first_name, family displayName, or
      // any identifier, and requestId is a fresh opaque UUID, never
      // derived from family/child/parent ids (contract.ts §8/§10).
      const aiRequest: NeutralAiRequest = {
        requestId: randomUUID(),
        taskType: taskType('leo_conversational_turn'),
        systemInstructions:
          'You are Leo, a friendly companion for a child. Reply kindly and briefly.',
        context: 'A child is having a casual conversation with Leo.',
        taskInput: childMessage.content,
      };

      // Required assertion (not optional): no child/parent/family PII
      // anywhere in the request this flow actually sends to the AI
      // boundary. Checks both the concrete values this flow's own
      // fixtures carry, and the general allowlist rule itself.
      const serializedRequest = JSON.stringify(aiRequest);
      const piiValues = [
        'Fictional M20 Child',
        'Fictional M20 Parent',
        'Fictional M20 Family',
        testEmail,
        childId,
        family.id,
        owner.id,
      ];
      for (const value of piiValues) {
        expect(serializedRequest).not.toContain(value);
      }
      expect(isPersonalizationCrossingAllowed(aiRequest.taskType, 'first_name')).toBe(false);

      const aiResponse = await adapterRegistry.execute(mockAdapter.id, aiRequest);
      expect(aiResponse.error).toBeNull();
      // §4 — providerMetadata must never reach a caller of
      // AdapterRegistry.execute(); re-proven here against the actual
      // response object this flow received, not just in isolation
      // (adapter-registry.spec.ts already covers the unit case).
      expect(Object.prototype.hasOwnProperty.call(aiResponse, 'providerMetadata')).toBe(false);

      const leoMessage = await leoService.appendMessage({
        conversationId,
        familyId: family.id,
        childId,
        sender: 'leo',
        content: aiResponse.outputContent,
      });
      expect(leoMessage.sender).toBe('leo');

      const transcript = await leoService.listMessages({
        conversationId,
        familyId: family.id,
        childId,
      });
      expect(transcript.map((message) => message.sender)).toEqual(['child', 'leo']);
    });

    // No `Action` exists for "interact with Leo for a given child"
    // (authorization.types.ts's bounded set, M15, already closed out),
    // and LeoService never calls AuthorizationService anywhere in this
    // codebase (M18 shipped it that way). This flow therefore
    // authorizes only the parent-facing steps above (create_child) and
    // leaves the Leo-chat step itself ungated at the authorization
    // layer, matching M18's own scope exactly rather than quietly
    // introducing a new Action into a closed M15 file. See
    // docs/decisions/decision-log.md's 2026-08-22 entry for this
    // recorded as a deliberate, known gap for a future milestone —
    // this step proves the isolation chain that DOES exist today
    // (family/child scoping), not authorization that doesn't.
    it('step 6 — isolation: the full chain (family → child → conversation → memory) holds against a second, unrelated family', async () => {
      await familyRepository.create({
        id: otherFamily.id,
        owningParentId: otherOwner.id,
        displayName: 'Fictional M20 Control Family',
      });

      const crossFamilyAuth = await authorizationService.authorize({
        principalId: otherOwner.id,
        principalType: 'Parent',
        requestedFamilyId: family.id,
        requestedAction: 'create_child',
      });
      expect(crossFamilyAuth).toEqual({ allowed: false, reason: 'family_not_authorized' });

      // Same conversation id, wrong familyId — must be refused, not
      // silently scoped down (leo.service.ts's own re-validation, the
      // same discipline leo-tenant-isolation.integration.spec.ts already
      // proves in isolation; this proves it holds in the composed flow).
      await expect(
        leoService.appendMessage({
          conversationId,
          familyId: otherFamily.id,
          childId,
          sender: 'child',
          content: 'should never be written under the control family',
        }),
      ).rejects.toThrow(LeoConversationNotFoundError);

      const otherFamilyMemories = await leoService.listActiveMemories({
        familyId: otherFamily.id,
        childId,
      });
      expect(otherFamilyMemories).toEqual([]);
    });
  },
);
