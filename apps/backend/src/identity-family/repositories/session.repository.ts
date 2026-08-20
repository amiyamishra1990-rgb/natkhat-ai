import { Inject, Injectable } from '@nestjs/common';
import { Session, SessionPrincipalType } from '@prisma/client';
import { PRISMA_CLIENT } from '../prisma-client.provider';
import type { PrismaClientLike } from './types';

// module doc §3.6. No API surface, no token issuance, no
// authorization-check logic (M14 exclusion — M15 scope). Row
// *visibility* is principal-scoped (see rls-context.ts /
// migration.sql), not family-scoped, even though familyId is stored.
@Injectable()
export class SessionRepository {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClientLike) {}

  create(data: {
    id?: string;
    principalId: string;
    principalType: SessionPrincipalType;
    familyId: string;
    deviceId: string;
  }): Promise<Session> {
    return this.prisma.session.create({ data });
  }

  findMany(): Promise<Session[]> {
    return this.prisma.session.findMany();
  }

  // M15 (docs/sprints/sprint-03.md, §4;
  // authorization-and-sessions.md §6.4/§6.5) — session-lifecycle
  // support. Still no API surface; consumed by
  // session-lifecycle.service.ts and tests only.

  findActiveByPrincipalId(principalId: string): Promise<Session[]> {
    return this.prisma.session.findMany({ where: { principalId, endedAt: null } });
  }

  findActiveByPrincipalInFamily(principalId: string, familyId: string): Promise<Session[]> {
    return this.prisma.session.findMany({
      where: { principalId, familyId, endedAt: null },
    });
  }

  endSession(id: string, endReason: string): Promise<Session> {
    return this.prisma.session.update({
      where: { id },
      data: { endedAt: new Date(), endReason },
    });
  }

  // authorization-and-sessions.md §6.4, row 3 — the co-parent-
  // revocation cascade. Ends every active session for the given
  // (revoked co-parent, family) pair. Returns the count ended, not
  // the rows, since callers only need to know the cascade ran.
  async endActiveSessionsForPrincipalInFamily(
    principalId: string,
    familyId: string,
    endReason: string,
  ): Promise<number> {
    const result = await this.prisma.session.updateMany({
      where: { principalId, familyId, endedAt: null },
      data: { endedAt: new Date(), endReason },
    });
    return result.count;
  }

  // M16 (docs/sprints/sprint-03.md, §4; ADR-0015 §7.2) — the
  // family-delete cascade's "every active Session currently pinned to
  // that family_id (ended)" step — every principal's session for the
  // family, not one specific principal, unlike the method above.
  async endActiveSessionsForFamily(familyId: string, endReason: string): Promise<number> {
    const result = await this.prisma.session.updateMany({
      where: { familyId, endedAt: null },
      data: { endedAt: new Date(), endReason },
    });
    return result.count;
  }

  // M16 (ADR-0015 §8 — "their own Session/login history" as part of
  // export completeness) — every session ever recorded for this
  // principal, active or ended, unlike findActiveByPrincipalId above.
  findByPrincipalId(principalId: string): Promise<Session[]> {
    return this.prisma.session.findMany({ where: { principalId } });
  }
}
