import { Injectable } from '@nestjs/common';
import { SessionPrincipalType } from '@prisma/client';
import { SessionRepository } from '../identity-family/repositories/session.repository';
import { CoParentAssignmentRepository } from '../identity-family/repositories/co-parent-assignment.repository';
import { AuthorizationService } from './authorization.service';
import { PrincipalType } from './authorization.types';

export class FamilyNotAuthorizedError extends Error {
  constructor(familyId: string) {
    super(`Principal is not authorized for family ${familyId}`);
    this.name = 'FamilyNotAuthorizedError';
  }
}

/**
 * M15 (docs/sprints/sprint-03.md, §4;
 * docs/architecture/authorization-and-sessions.md §6.2, §6.4).
 * Session lifecycle operations that are authorization-relevant events
 * in their own right, not plain CRUD: family-switch and the co-parent
 * revocation cascade. Kept as one small service, not split further —
 * both operations share the same "re-run the authorization check,
 * then mutate Session rows" shape.
 */
@Injectable()
export class SessionLifecycleService {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly sessionRepository: SessionRepository,
    private readonly coParentAssignmentRepository: CoParentAssignmentRepository,
  ) {}

  /**
   * §6.2 — switching active family context. Re-runs the full
   * tenant-scope gate against the target family before establishing
   * any session there; the prior session's authorization for the
   * source family is never carried over. Ends the principal's current
   * active session(s) on this device and creates a new one for the
   * target family, rather than mutating `family_id` in place — this
   * keeps every Session row an accurate point-in-time record (§6.5,
   * "login history"), and the switch itself is a distinct auditable
   * event a Milestone 16 audit log can pick up from the pair of
   * ended/started rows without this service depending on that log
   * existing yet (M16 dependency, not built here).
   */
  async switchFamily(params: {
    principalId: string;
    principalType: PrincipalType;
    targetFamilyId: string;
    deviceId: string;
  }): Promise<{ endedSessionIds: string[]; newSessionId: string }> {
    const authorized = await this.authorizationService.isFamilyAuthorized(
      params.principalId,
      params.principalType,
      params.targetFamilyId,
    );
    if (!authorized) {
      throw new FamilyNotAuthorizedError(params.targetFamilyId);
    }

    const activeSessions = await this.sessionRepository.findActiveByPrincipalId(params.principalId);
    const endedSessionIds: string[] = [];
    for (const session of activeSessions) {
      await this.sessionRepository.endSession(session.id, 'family_switch');
      endedSessionIds.push(session.id);
    }

    const newSession = await this.sessionRepository.create({
      principalId: params.principalId,
      principalType: params.principalType as SessionPrincipalType,
      familyId: params.targetFamilyId,
      deviceId: params.deviceId,
    });

    return { endedSessionIds, newSessionId: newSession.id };
  }

  /**
   * §6.4, row 3 — revokes a `CoParentAssignment` and cascades to end
   * every active session that co-parent holds for that family. The
   * caller is responsible for having already authorized the
   * *requesting* parent as `owner` for this family via
   * `AuthorizationService.authorize(...)` with action
   * `invite_revoke_co_parent` before calling this — this method does
   * not re-check that the revoker is the owner, only performs the
   * revoke + cascade once authorized.
   *
   * ADR-0009, Decision item 6's actual safety net does not depend on
   * this cascade running promptly: the tenant-scope gate re-resolves
   * the authorized family set from current `CoParentAssignment.status`
   * on every request (authorization.service.ts), so a revoked
   * co-parent's very next request is denied regardless of whether
   * this cascade has executed yet. This method exists to make
   * "revoked" also end already-established sessions immediately, not
   * to be the sole enforcement point.
   */
  async revokeCoParentAssignment(params: {
    assignmentId: string;
    revokedByParentId: string;
  }): Promise<{ endedSessionCount: number }> {
    const assignment = await this.coParentAssignmentRepository.revoke(
      params.assignmentId,
      params.revokedByParentId,
    );

    const endedSessionCount = await this.sessionRepository.endActiveSessionsForPrincipalInFamily(
      assignment.parentId,
      assignment.familyId,
      'access_revoked',
    );

    return { endedSessionCount };
  }
}
