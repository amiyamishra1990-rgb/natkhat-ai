import { AuthorizationService } from './authorization.service';
import { serializePermissionScope } from './permission-scope';

// M15 — Unit tests for the four-step authorize() function in
// isolation, each gate tested independently, per
// docs/architecture/authorization-and-sessions.md §10's minimum bar.
// Repositories are mocked here deliberately (no DB) — the same three
// §6.3 scenarios are additionally proven against real Postgres in
// authorization.integration.spec.ts, per the M14 lesson that
// mock-only tests are not sufficient for anything security-sensitive;
// this file covers the pure decision logic, not persistence.
describe('AuthorizationService', () => {
  const FAMILY_A = 'family-a';
  const FAMILY_B = 'family-b';
  const OWNER_PARENT = 'owner-parent';
  const CO_PARENT = 'co-parent';
  const STRANGER_PARENT = 'stranger-parent';

  function buildService(options: {
    ownedFamilies?: Array<{ id: string; owningParentId: string }>;
    activeAssignments?: Array<{ familyId: string; parentId: string; permissionScope: string }>;
  }) {
    const ownedFamilies = options.ownedFamilies ?? [];
    const activeAssignments = options.activeAssignments ?? [];

    const familyRepository = {
      findByOwningParentId: jest.fn((parentId: string) =>
        Promise.resolve(ownedFamilies.filter((f) => f.owningParentId === parentId)),
      ),
      findById: jest.fn((id: string) =>
        Promise.resolve(ownedFamilies.find((f) => f.id === id) ?? null),
      ),
    };

    const coParentAssignmentRepository = {
      findActiveByParentId: jest.fn((parentId: string) =>
        Promise.resolve(activeAssignments.filter((a) => a.parentId === parentId)),
      ),
      findActiveByFamilyAndParentId: jest.fn((familyId: string, parentId: string) =>
        Promise.resolve(
          activeAssignments.find((a) => a.familyId === familyId && a.parentId === parentId) ?? null,
        ),
      ),
    };

    return new AuthorizationService(
      familyRepository as never,
      coParentAssignmentRepository as never,
    );
  }

  it('Scenario A (§6.3) — denies a Parent requesting a family they hold no role in', async () => {
    const service = buildService({
      ownedFamilies: [{ id: FAMILY_A, owningParentId: OWNER_PARENT }],
    });

    const result = await service.authorize({
      principalId: OWNER_PARENT,
      principalType: 'Parent',
      requestedFamilyId: FAMILY_B,
      requestedAction: 'view_child_profile',
    });

    expect(result).toEqual({ allowed: false, reason: 'family_not_authorized' });
  });

  it('Scenario B (§6.3) — denies a reserved Child principal requesting any family', async () => {
    const service = buildService({});

    const result = await service.authorize({
      principalId: 'child-session-principal',
      principalType: 'Child',
      requestedFamilyId: FAMILY_A,
      requestedAction: 'view_child_profile',
    });

    expect(result).toEqual({ allowed: false, reason: 'family_not_authorized' });
  });

  it('Scenario C (§6.3) — denies a co-parent an owner-only action within their own authorized family', async () => {
    const service = buildService({
      ownedFamilies: [{ id: FAMILY_A, owningParentId: OWNER_PARENT }],
      activeAssignments: [
        {
          familyId: FAMILY_A,
          parentId: CO_PARENT,
          permissionScope: serializePermissionScope(['view_child_profile', 'manage_child_profile']),
        },
      ],
    });

    const result = await service.authorize({
      principalId: CO_PARENT,
      principalType: 'Parent',
      requestedFamilyId: FAMILY_A,
      requestedAction: 'invite_revoke_co_parent',
    });

    expect(result).toEqual({ allowed: false, reason: 'action_not_permitted' });
  });

  it('allows the owner every action within their own family', async () => {
    const service = buildService({
      ownedFamilies: [{ id: FAMILY_A, owningParentId: OWNER_PARENT }],
    });

    const result = await service.authorize({
      principalId: OWNER_PARENT,
      principalType: 'Parent',
      requestedFamilyId: FAMILY_A,
      requestedAction: 'billing_management',
    });

    expect(result).toEqual({ allowed: true, role: 'owner' });
  });

  it('allows a co-parent an action explicitly within their permissionScope', async () => {
    const service = buildService({
      ownedFamilies: [{ id: FAMILY_A, owningParentId: OWNER_PARENT }],
      activeAssignments: [
        {
          familyId: FAMILY_A,
          parentId: CO_PARENT,
          permissionScope: serializePermissionScope(['view_child_profile']),
        },
      ],
    });

    const result = await service.authorize({
      principalId: CO_PARENT,
      principalType: 'Parent',
      requestedFamilyId: FAMILY_A,
      requestedAction: 'view_child_profile',
    });

    expect(result).toEqual({ allowed: true, role: 'co_parent' });
  });

  it('denies a co-parent an action not present in their permissionScope, even if not owner-only', async () => {
    const service = buildService({
      ownedFamilies: [{ id: FAMILY_A, owningParentId: OWNER_PARENT }],
      activeAssignments: [
        {
          familyId: FAMILY_A,
          parentId: CO_PARENT,
          permissionScope: serializePermissionScope(['view_child_profile']),
        },
      ],
    });

    const result = await service.authorize({
      principalId: CO_PARENT,
      principalType: 'Parent',
      requestedFamilyId: FAMILY_A,
      requestedAction: 'manage_child_profile',
    });

    expect(result).toEqual({ allowed: false, reason: 'action_not_permitted' });
  });

  it('never grants an owner-only action to a co-parent even if a stray value smuggles it into permissionScope', async () => {
    const service = buildService({
      ownedFamilies: [{ id: FAMILY_A, owningParentId: OWNER_PARENT }],
      activeAssignments: [
        {
          familyId: FAMILY_A,
          parentId: CO_PARENT,
          // Not producible via serializePermissionScope's own Action
          // type, but a defensive test against a corrupted/manually
          // written DB value — parsePermissionScope must still drop it.
          permissionScope: 'view_child_profile,billing_management',
        },
      ],
    });

    const result = await service.authorize({
      principalId: CO_PARENT,
      principalType: 'Parent',
      requestedFamilyId: FAMILY_A,
      requestedAction: 'billing_management',
    });

    expect(result).toEqual({ allowed: false, reason: 'action_not_permitted' });
  });

  it('denies a stranger with no owned family and no assignment anywhere', async () => {
    const service = buildService({
      ownedFamilies: [{ id: FAMILY_A, owningParentId: OWNER_PARENT }],
    });

    const result = await service.authorize({
      principalId: STRANGER_PARENT,
      principalType: 'Parent',
      requestedFamilyId: FAMILY_A,
      requestedAction: 'view_child_profile',
    });

    expect(result).toEqual({ allowed: false, reason: 'family_not_authorized' });
  });
});
