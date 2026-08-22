import { TaskType } from './contract';

/**
 * M19 (docs/sprints/sprint-03.md, §4; ADR-0013 Decision item 3;
 * ai-provider-boundary.md §9.1). Founder decision, 2026-08-09,
 * Option C: a narrow, task-enumerated allowlist, not a blanket
 * "first name if a task seems to benefit from it" default. §9.1's
 * entry-requirement row: each entry must name the specific task_type,
 * the specific field (first_name — the only field ever eligible), and
 * a written minimization/necessity justification.
 */
export interface PersonalizationAllowlistEntry {
  taskType: TaskType;
  /**
   * §9.1's own eligible-field row: "first_name only. No other Tier 2
   * field (date_of_birth, avatar_ref, or any future Tier 2 field) may
   * ever be added to this allowlist by this document." That
   * restriction is carried into the type itself, not merely into a
   * comment — the literal type `'first_name'` makes any other value a
   * compile error, not a runtime check that could be skipped.
   */
  field: 'first_name';
  justification: string;
}

/**
 * Default state per §9.1: EMPTY. No task_type is pre-approved by this
 * milestone — populating a real entry is a separate, future,
 * founder-governed action (§24), never performed by this module.
 */
export const PERSONALIZATION_DATA_ALLOWLIST: readonly PersonalizationAllowlistEntry[] = [];

/**
 * The one enforcement point a future boundary checkpoint (§9, §21 —
 * not built by this milestone, since no task pipeline exists yet)
 * would call before letting any Tier 2 field cross. Denies by default
 * for any field other than `first_name` and for any task_type with no
 * matching allowlist entry — which, given the allowlist is currently
 * empty, means this always denies today, by construction, not by
 * accident.
 */
export function isPersonalizationCrossingAllowed(taskType: TaskType, field: string): boolean {
  if (field !== 'first_name') {
    return false;
  }
  return PERSONALIZATION_DATA_ALLOWLIST.some((entry) => entry.taskType === taskType);
}
