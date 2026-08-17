import { parsePermissionScope, serializePermissionScope } from './permission-scope';
import { OWNER_ONLY_ACTIONS, CO_PARENT_ELIGIBLE_ACTIONS } from './authorization.types';

describe('permission-scope', () => {
  it('round-trips a set of co-parent-eligible actions', () => {
    const stored = serializePermissionScope(['view_child_profile', 'manage_child_profile']);
    const parsed = parsePermissionScope(stored);
    expect(parsed).toEqual(new Set(['view_child_profile', 'manage_child_profile']));
  });

  it('drops unknown/garbage values rather than throwing', () => {
    const parsed = parsePermissionScope('view_child_profile, not_a_real_action ,');
    expect(parsed).toEqual(new Set(['view_child_profile']));
  });

  it('never returns an owner-only action, even if present in the stored string (defense in depth)', () => {
    for (const ownerOnlyAction of OWNER_ONLY_ACTIONS) {
      const parsed = parsePermissionScope(`view_child_profile,${ownerOnlyAction}`);
      expect(parsed.has(ownerOnlyAction)).toBe(false);
    }
  });

  it('CO_PARENT_ELIGIBLE_ACTIONS and OWNER_ONLY_ACTIONS partition the full action set with no overlap', () => {
    for (const action of CO_PARENT_ELIGIBLE_ACTIONS) {
      expect(OWNER_ONLY_ACTIONS.has(action)).toBe(false);
    }
  });
});
