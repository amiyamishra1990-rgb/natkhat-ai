import { Injectable } from '@nestjs/common';
import { AdminUserRepository } from './repositories/admin-user.repository';
import { getFirebaseAuth } from '../auth/firebase-admin.provider';

export class InvalidAccessTokenError extends Error {
  constructor() {
    super('Firebase ID token failed verification');
    this.name = 'InvalidAccessTokenError';
  }
}

export class UnknownAdminIdentityError extends Error {
  constructor() {
    super('Verified Firebase identity does not match any AdminUser record');
    this.name = 'UnknownAdminIdentityError';
  }
}

/**
 * M25 (docs/sprints/sprint-05.md, §4; Founder Decision G.2). Deliberate
 * mirror of auth/firebase-auth.service.ts's resolveParentFromIdToken —
 * same shape, same Firebase Admin SDK verification step (reuses
 * auth/firebase-admin.provider.ts's getFirebaseAuth() directly rather
 * than duplicating the ADC/project-id wiring), but resolved against
 * AdminUser, never Parent. This is what makes the admin-principal type
 * distinct rather than "any logged-in user": a Firebase ID token
 * issued to a real Parent verifies successfully (the token itself is
 * valid) but still fails here with UnknownAdminIdentityError, because
 * no AdminUser row exists for that uid — the two lookups are against
 * entirely separate tables.
 *
 * No admin-invite/admin-management flow exists (M25 explicit
 * exclusion) — AdminUser rows are provisioned out-of-band, test/
 * synthetic accounts only.
 */
@Injectable()
export class AdminAuthService {
  constructor(private readonly adminUserRepository: AdminUserRepository) {}

  async resolveAdminFromIdToken(idToken: string) {
    const auth = getFirebaseAuth();
    let uid: string;
    try {
      const decoded = await auth.verifyIdToken(idToken);
      uid = decoded.uid;
    } catch {
      throw new InvalidAccessTokenError();
    }

    const admin = await this.adminUserRepository.findByAuthIdentityRef(uid);
    if (!admin) {
      throw new UnknownAdminIdentityError();
    }

    return admin;
  }
}
