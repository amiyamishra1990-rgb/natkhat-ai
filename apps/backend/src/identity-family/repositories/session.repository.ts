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
}
