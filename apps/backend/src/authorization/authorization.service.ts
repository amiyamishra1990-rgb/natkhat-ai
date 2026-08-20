import { Injectable } from '@nestjs/common';
import { FamilyRepository } from '../identity-family/repositories/family.repository';
import { CoParentAssignmentRepository } from '../identity-family/repositories/co-parent-assignment.repository';
import { parsePermissionScope } from './permission-scope';
import {
  Action,
  AuthorizeRequest,
  AuthorizeResult,
  OWNER_ONLY_ACTIONS,
  PrincipalType,
  Role,
} from './authorization.types';

// M15 (docs/sprints/sprint-03.md, §4; ADR-0009; §4 and §6.3 of
// docs/architecture/authorization-and-sessions.md). Implements the
// fixed two-gate check:
//
//   authorize(principal_id, principal_type, requested_family_id,
//             requested_action) -> allow | deny
//
// Deliberately a single small service, not a framework: one exported
// method, no plugin/strategy abstraction, no speculative extension
// points for the reserved `child` role beyond the type-level
// placeholder already present in `authorization.types.ts`. The
// reserved `child` role is designed-for (per ADR-0009, Decision item
// 7) but this service permits nothing for it — every parent-only and
// every co-parent action is denied — because no product feature
// authorizes issuing a Child session (M1 §3.4; not this milestone's
// scope).
@Injectable()
export class AuthorizationService {
  constructor(
    private readonly familyRepository: FamilyRepository,
    private readonly coParentAssignmentRepository: CoParentAssignmentRepository,
  ) {}

  /**
   * Resolves the principal's authorized family set — §4 step 1.
   * For a (reserved) Child principal this milestone does not attempt
   * to resolve the singleton family set from a Child record (no
   * Child-session feature exists); a Child principal's authorized set
   * is always empty here, which correctly denies every request via
   * the tenant-scope gate rather than granting anything.
   */
  private async resolveAuthorizedFamilyIds(
    principalId: string,
    principalType: PrincipalType,
  ): Promise<Set<string>> {
    if (principalType === 'Child') {
      return new Set<string>();
    }

    const [ownedFamilies, activeCoParentAssignments] = await Promise.all([
      this.familyRepository.findByOwningParentId(principalId),
      this.coParentAssignmentRepository.findActiveByParentId(principalId),
    ]);

    const familyIds = new Set<string>(ownedFamilies.map((family) => family.id));
    for (const assignment of activeCoParentAssignments) {
      familyIds.add(assignment.familyId);
    }
    return familyIds;
  }

  /**
   * §4 steps 1–2 only — the tenant-scope gate in isolation, with no
   * action-permission check. Used by session-lifecycle.service.ts for
   * family-switch (§6.2), which is itself "an authorization-relevant
   * event" but is not one of the bounded Actions in §5 — establishing
   * a session in an already-authorized family requires no additional
   * action-specific permission.
   */
  async isFamilyAuthorized(
    principalId: string,
    principalType: PrincipalType,
    familyId: string,
  ): Promise<boolean> {
    const authorizedFamilyIds = await this.resolveAuthorizedFamilyIds(principalId, principalType);
    return authorizedFamilyIds.has(familyId);
  }

  /**
   * §4's full five-step check. Step 2 (tenant-scope) and step 4
   * (action-permission) are independent and both required — see the
   * three §6.3 scenarios this must satisfy, exercised in
   * authorization.integration.spec.ts.
   */
  async authorize(request: AuthorizeRequest): Promise<AuthorizeResult> {
    const authorizedFamilyIds = await this.resolveAuthorizedFamilyIds(
      request.principalId,
      request.principalType,
    );

    // Step 2 — tenant-scope gate, evaluated first and unconditionally,
    // before the requested action is even inspected (§4).
    if (!authorizedFamilyIds.has(request.requestedFamilyId)) {
      return { allowed: false, reason: 'family_not_authorized' };
    }

    // Step 3 — resolve role for this specific family_id, and (for
    // co_parent only) the specific granted-action set — never a
    // global "is this a co-parent somewhere" check.
    const { role, grantedActions } = await this.resolveRoleContext(
      request.principalId,
      request.principalType,
      request.requestedFamilyId,
    );

    // Step 4 — action-permission gate.
    if (!this.isActionPermitted(role, request.requestedAction, grantedActions)) {
      return { allowed: false, reason: 'action_not_permitted' };
    }

    // Step 5 — allow only if both gates passed.
    return { allowed: true, role };
  }

  private async resolveRoleContext(
    principalId: string,
    principalType: PrincipalType,
    familyId: string,
  ): Promise<{ role: Role; grantedActions: Set<Action> }> {
    if (principalType === 'Child') {
      // Reserved, not activated (ADR-0009, Decision item 7).
      return { role: 'child', grantedActions: new Set() };
    }

    const family = await this.familyRepository.findById(familyId);
    if (family?.owningParentId === principalId) {
      return { role: 'owner', grantedActions: new Set() };
    }

    const assignment = await this.coParentAssignmentRepository.findActiveByFamilyAndParentId(
      familyId,
      principalId,
    );
    // Reaching here with no active assignment means step 2 already
    // passed on stale/inconsistent data (should not happen — the
    // tenant-scope gate derives its set from the same active-only
    // query). Fail closed rather than assume owner: grant nothing.
    const grantedActions = assignment
      ? parsePermissionScope(assignment.permissionScope)
      : new Set<Action>();
    return { role: 'co_parent', grantedActions };
  }

  private isActionPermitted(role: Role, action: Action, grantedActions: Set<Action>): boolean {
    if (role === 'owner') {
      return true;
    }
    if (role === 'co_parent') {
      // Owner-only actions are hard-excluded regardless of any
      // permission_scope value (ADR-0009, Decision item 3) — checked
      // directly here, not merely relied upon to be absent from
      // grantedActions (parsePermissionScope already re-excludes them
      // too, defense in depth).
      if (OWNER_ONLY_ACTIONS.has(action)) {
        return false;
      }
      return grantedActions.has(action);
    }
    // role === 'child' (reserved): no parent-only or co-parent action
    // is ever permitted (§6, table last column — "No" throughout).
    return false;
  }
}
