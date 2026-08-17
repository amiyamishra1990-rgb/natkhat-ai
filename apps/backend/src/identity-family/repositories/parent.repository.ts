import { Inject, Injectable } from '@nestjs/common';
import { Parent } from '@prisma/client';
import { PRISMA_CLIENT } from '../prisma-client.provider';
import type { PrismaClientLike } from './types';

// module doc §3.2. No API surface (M14 exclusion) — repository-layer
// only, consumed by tests directly and by future NestJS providers.
@Injectable()
export class ParentRepository {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClientLike) {}

  create(data: {
    id?: string;
    authIdentityRef: string;
    displayName: string;
    contactEmail: string;
  }): Promise<Parent> {
    return this.prisma.parent.create({ data });
  }

  findById(id: string): Promise<Parent | null> {
    return this.prisma.parent.findUnique({ where: { id } });
  }

  // M15 (docs/sprints/sprint-03.md, §4) — resolves the Parent record
  // matching the identity Supabase Auth issued, per M1 §3.2's
  // `authIdentityRef` placeholder link (ADR-0009 §8: "already the
  // placeholder link for that"). Used by auth/supabase-auth.service.ts
  // after a Supabase-issued token is verified; never used to bypass
  // verification, only to look up the already-verified identity.
  findByAuthIdentityRef(authIdentityRef: string): Promise<Parent | null> {
    return this.prisma.parent.findUnique({ where: { authIdentityRef } });
  }
}
