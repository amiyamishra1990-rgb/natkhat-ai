import { Injectable } from '@nestjs/common';
import { ParentRepository } from '../identity-family/repositories/parent.repository';
import { getFirebaseAuth } from './firebase-admin.provider';

export class InvalidAccessTokenError extends Error {
  constructor() {
    super('Firebase ID token failed verification');
    this.name = 'InvalidAccessTokenError';
  }
}

export class UnknownParentIdentityError extends Error {
  constructor() {
    super('Verified Firebase identity does not match any Parent record');
    this.name = 'UnknownParentIdentityError';
  }
}

/**
 * M15 (docs/sprints/sprint-03.md, §4; ADR-0016 — supersedes ADR-0005's
 * authentication clause; ADR-0009 §8). Thin wrapper, not a framework:
 * one method, no token issuance or login-flow logic of its own
 * (ADR-0016's scope is limited to provider selection + this
 * SDK-integration milestone — sign-up/sign-in UI/API is not this
 * milestone's scope either, per sprint-03.md §4's M15 entry, which
 * lists only `authorize(...)`, the auth SDK integration, the
 * owner-only invariant, family-switch, and revocation cascade).
 *
 * Resolves an already-issued Firebase ID token to the Natkhat Parent
 * record it belongs to, via `Parent.authIdentityRef` (ADR-0009 §8:
 * "the placeholder link for that"). Does not create Parent records —
 * that remains an identity-family concern outside this milestone's
 * scope.
 */
@Injectable()
export class FirebaseAuthService {
  constructor(private readonly parentRepository: ParentRepository) {}

  async resolveParentFromIdToken(idToken: string) {
    const auth = getFirebaseAuth();
    let uid: string;
    try {
      const decoded = await auth.verifyIdToken(idToken);
      uid = decoded.uid;
    } catch {
      throw new InvalidAccessTokenError();
    }

    const parent = await this.parentRepository.findByAuthIdentityRef(uid);
    if (!parent) {
      throw new UnknownParentIdentityError();
    }

    return parent;
  }
}
