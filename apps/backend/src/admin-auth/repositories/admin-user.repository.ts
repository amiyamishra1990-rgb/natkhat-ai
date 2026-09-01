import { Inject, Injectable } from '@nestjs/common';
import { AdminUser } from '@prisma/client';
import { ADMIN_AUTH_PRISMA_CLIENT } from '../prisma-client.provider';
import type { PrismaClientLike } from './types';

// M25 (docs/sprints/sprint-05.md, §4). Repository-layer only, no API
// surface — same convention every other M14/M15/M16 repository already
// follows. Deliberately minimal: no create/update/delete methods exist
// yet because provisioning an AdminUser row is a manual, out-of-band
// step for this milestone (test/synthetic admin accounts only, per
// M25's scope) — an admin-invite/admin-management flow is an explicit
// M25 exclusion, not an oversight.
@Injectable()
export class AdminUserRepository {
  constructor(@Inject(ADMIN_AUTH_PRISMA_CLIENT) private readonly prisma: PrismaClientLike) {}

  // M25 — resolves the AdminUser matching the identity Firebase Auth
  // issued, per AdminUser.authIdentityRef (schema.prisma's own
  // comment). Used by admin-auth.service.ts after a Firebase-issued
  // token is verified; never used to bypass verification, only to look
  // up the already-verified identity. A Parent's authIdentityRef lives
  // in a different table entirely (parent.auth_identity_ref) — this
  // lookup returning null for a real Parent's uid is exactly what
  // makes the admin-principal type distinct, not merely "any logged-in
  // user."
  findByAuthIdentityRef(authIdentityRef: string): Promise<AdminUser | null> {
    return this.prisma.adminUser.findUnique({ where: { authIdentityRef } });
  }
}
