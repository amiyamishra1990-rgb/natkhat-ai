# Pull Request Checklist

**Version:** 1.0.0
**Status:** Active — replaces the inline placeholder checklist in
`.github/PULL_REQUEST_TEMPLATE.md`
**Owner:** Engineering
**Last Updated:** 2026-07-30

Applied to every pull request, per the Engineering Constitution's
Code review workflow standard.

## Governance

- [ ] Traces to a Sprint Document (`docs/sprints/`) and does not
      contradict an ADR, the Engineering Constitution, or the Product
      Constitution (`docs/sprints/sprint-01.md`, §1).
- [ ] `PROJECT.md` updated in this PR if it changes sprint/milestone
      status, adds an ADR/Decision Log entry, or introduces a blocker.
- [ ] A new ADR or Decision Log entry was added if this PR makes a
      decision (`docs/sprints/sprint-01.md`, §8/§9), routed through
      [`change-request-process.md`](../change-request-process.md) if
      it expands previously-approved scope.

## Code quality

- [ ] Conventional Commit messages; passes commitlint.
- [ ] At least one review and passing CI, per branch strategy
      (`docs/sprints/sprint-01.md`, §17).
- [ ] No speculative abstractions, unused code, or half-finished
      implementations introduced.
- [ ] No secret committed; `.env.example` updated if a new environment
      variable was introduced.

## Testing

- [ ] Tests added or updated per
      [`testing-strategy.md`](../testing-strategy.md) for the layer(s)
      this change touches.

## Trust & safety (only if this PR touches anything user-, child-, or

data-facing)

- [ ] [`review-checklist.md`](../review-checklist.md) fully answered
      YES.
- [ ] [`security-checklist.md`](./security-checklist.md) fully
      answered YES.
- [ ] Unfinished/unstable functionality shipped behind a feature flag,
      per [`feature-flags.md`](../feature-flags.md).

**Any unchecked governance or trust-and-safety item blocks merge.**
