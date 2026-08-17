// M15 — Authorization & Session Implementation (docs/sprints/sprint-03.md,
// §4; ADR-0009; docs/architecture/authorization-and-sessions.md, §3–§5).
//
// This module defines the bounded `Action` set and the owner-only
// hard invariant that `docs/modules/identity-family/README.md` §3.5
// explicitly deferred to this milestone ("Milestone 2 designs the
// actual enforcement check; this field only defines the shape").
// `CoParentAssignment.permissionScope` remains a plain Prisma String
// column (schema.prisma's own comment: "not enumerated by the
// approved documents... modeled as plain String... to avoid inventing
// a bounded set the governing documents do not themselves fix") — the
// bounded set below is an application-layer enforcement concern, not
// a schema/migration change, so no M14 migration is touched here.

/**
 * The complete bounded action set, per
 * authorization-and-sessions.md §5's table. Names follow the module
 * doc §3.5 illustrative examples (`view_child_profile`,
 * `manage_child_profile`) where given, and are chosen consistently
 * for the remaining table rows.
 */
export const ACTIONS = [
  'view_child_profile',
  'manage_child_profile',
  'create_child',
  'invite_revoke_co_parent',
  'billing_management',
  'family_account_deletion',
  'data_export',
  'share_link_management',
  'consent_of_record_changes',
  'view_own_devices',
  'manage_own_sessions',
] as const;

export type Action = (typeof ACTIONS)[number];

/**
 * ADR-0009, Decision item 3: "Five actions are owner-only,
 * unconditionally, by construction: billing, family/account
 * deletion, data export, share-link creation/revocation, and
 * consent-of-record changes — exactly ADR-0006 §6's named list. No
 * `CoParentAssignment.permission_scope` value may include any of
 * them; this is a design invariant, not a default that a future
 * scope value could override."
 *
 * NOTE — flagged ambiguity, not silently resolved: the architecture
 * document's own §5 table additionally marks `invite_revoke_co_parent`
 * as "No — owner-only, unconditional" for the co_parent column, but
 * ADR-0009's Decision item 3 text names only five actions and does
 * not include co-parent invite/revoke in "exactly ADR-0006 §6's named
 * list" (ADR-0006 §6 itself names only: billing, account deletion,
 * data export, sharing, consent changes). This constant conservatively
 * treats `invite_revoke_co_parent` as owner-only-unconditional too —
 * consistent with the architecture doc's table and with the
 * Trust-Above-All / fail-closed posture — rather than allowing a
 * co-parent to manage other co-parents' access by omission. This
 * conservative reading should be confirmed with the founder; it is
 * not a silent amendment of ADR-0009 or the architecture document.
 */
export const OWNER_ONLY_ACTIONS: ReadonlySet<Action> = new Set<Action>([
  'billing_management',
  'family_account_deletion',
  'data_export',
  'share_link_management',
  'consent_of_record_changes',
  'invite_revoke_co_parent',
]);

/** Actions a co-parent's `permissionScope` may legally grant. */
export const CO_PARENT_ELIGIBLE_ACTIONS: ReadonlySet<Action> = new Set<Action>(
  ACTIONS.filter((action) => !OWNER_ONLY_ACTIONS.has(action)),
);

/**
 * Role is always resolved per `(Parent, family_id)` — never a global
 * attribute of the principal (ADR-0009, Decision item 1). `child` is
 * reserved, not activated (ADR-0009, Decision item 7; M15 explicit
 * exclusion — no child-session activation).
 */
export type Role = 'owner' | 'co_parent' | 'child';

export type PrincipalType = 'Parent' | 'Child';

export interface AuthorizeRequest {
  principalId: string;
  principalType: PrincipalType;
  requestedFamilyId: string;
  requestedAction: Action;
}

export type AuthorizeDenyReason = 'family_not_authorized' | 'action_not_permitted';

export type AuthorizeResult =
  { allowed: true; role: Role } | { allowed: false; reason: AuthorizeDenyReason };
