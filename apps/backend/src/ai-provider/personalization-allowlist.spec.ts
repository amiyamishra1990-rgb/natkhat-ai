import { taskType } from './contract';
import {
  isPersonalizationCrossingAllowed,
  PERSONALIZATION_DATA_ALLOWLIST,
} from './personalization-allowlist';

// M19 — Unit test, no DB. Every value here is fictional.
describe('Personalization Data Allowlist (M19, §9.1, Option C)', () => {
  it('defaults to empty — no task_type is pre-approved by this milestone', () => {
    expect(PERSONALIZATION_DATA_ALLOWLIST).toEqual([]);
  });

  it('denies crossing for any field other than first_name, regardless of task_type', () => {
    expect(
      isPersonalizationCrossingAllowed(taskType('fictional_conversational_turn'), 'first_name'),
    ).toBe(false); // still false: the allowlist itself is empty
    expect(
      isPersonalizationCrossingAllowed(taskType('fictional_conversational_turn'), 'date_of_birth'),
    ).toBe(false);
    expect(
      isPersonalizationCrossingAllowed(taskType('fictional_conversational_turn'), 'avatar_ref'),
    ).toBe(false);
  });

  it('denies first_name crossing for any task_type, since the allowlist has no entries', () => {
    expect(isPersonalizationCrossingAllowed(taskType('anything'), 'first_name')).toBe(false);
  });
});
