import { Action, CO_PARENT_ELIGIBLE_ACTIONS } from './authorization.types';

// M15 — `CoParentAssignment.permissionScope` is a single Prisma
// String column (schema.prisma's own comment: the module doc gives
// "only illustrative examples, not a closed set," so the column is
// deliberately untyped at the schema layer — M14 explicit decision,
// not reopened here). This milestone must still decide *some*
// concrete serialization to store more than one granted action in
// one String column; a comma-separated list of `Action` names is the
// simplest encoding that needs no schema/migration change. If a
// future milestone needs richer scope semantics, that is a schema
// change requiring its own review, not something this parsing
// convention should be stretched to cover silently.

const DELIMITER = ',';

export function serializePermissionScope(actions: readonly Action[]): string {
  return actions.join(DELIMITER);
}

/**
 * Parses a stored `permissionScope` string into the set of actions it
 * grants, defensively re-excluding anything that is not a
 * co-parent-eligible action. ADR-0009, Decision item 3 requires
 * owner-only actions to be excluded "by construction" — this parser
 * never trusts a stored value to already satisfy that; it re-applies
 * the exclusion on every read, the same fail-closed posture
 * rls-context.ts uses for RLS claims (never assume upstream state is
 * already safe).
 */
export function parsePermissionScope(permissionScope: string): Set<Action> {
  const granted = new Set<Action>();
  for (const raw of permissionScope.split(DELIMITER)) {
    const candidate = raw.trim() as Action;
    if (CO_PARENT_ELIGIBLE_ACTIONS.has(candidate)) {
      granted.add(candidate);
    }
  }
  return granted;
}
