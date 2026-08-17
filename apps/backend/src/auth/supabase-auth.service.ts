import { Injectable } from '@nestjs/common';
import { ParentRepository } from '../identity-family/repositories/parent.repository';
import { getSupabaseClient } from './supabase-client.provider';

export class InvalidAccessTokenError extends Error {
  constructor() {
    super('Supabase access token failed verification');
    this.name = 'InvalidAccessTokenError';
  }
}

export class UnknownParentIdentityError extends Error {
  constructor() {
    super('Verified Supabase identity does not match any Parent record');
    this.name = 'UnknownParentIdentityError';
  }
}

/**
 * M15 (docs/sprints/sprint-03.md, §4; ADR-0005; ADR-0009 §8). Thin
 * wrapper, not a framework: one method, no token issuance or
 * login-flow logic of its own (ADR-0005's implementation-deferred
 * scope is limited to provider selection + this SDK-integration
 * milestone — sign-up/sign-in UI/API is not this milestone's scope
 * either, per sprint-03.md §4's M15 entry, which lists only
 * `authorize(...)`, Supabase Auth SDK integration, the owner-only
 * invariant, family-switch, and revocation cascade).
 *
 * Resolves an already-issued Supabase access token to the Natkhat
 * Parent record it belongs to, via `Parent.authIdentityRef`
 * (ADR-0009 §8: "the placeholder link for that"). Does not create
 * Parent records — that remains an identity-family concern outside
 * this milestone's scope.
 */
@Injectable()
export class SupabaseAuthService {
  constructor(private readonly parentRepository: ParentRepository) {}

  async resolveParentFromAccessToken(accessToken: string) {
    const client = getSupabaseClient();
    const { data, error } = await client.auth.getUser(accessToken);
    if (error || !data?.user) {
      throw new InvalidAccessTokenError();
    }

    const parent = await this.parentRepository.findByAuthIdentityRef(data.user.id);
    if (!parent) {
      throw new UnknownParentIdentityError();
    }

    return parent;
  }
}
