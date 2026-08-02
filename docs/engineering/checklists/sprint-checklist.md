# Sprint Checklist

**Version:** 1.0.0
**Status:** Active
**Owner:** Product Owner / Engineering
**Last Updated:** 2026-07-30

Used at the start and close of every sprint, per the Sprint Document
strategy (`docs/sprints/sprint-01.md`, §1).

## Sprint start

- [ ] The previous Sprint Document was never deleted, only superseded.
- [ ] A new Sprint Document exists at `docs/sprints/sprint-0X.md`,
      following the same Governance Hierarchy as prior sprints.
- [ ] `PROJECT.md`'s Current Sprint, Sprint Goal, and Current Milestone
      fields point at the new document.
- [ ] The sprint's milestone breakdown states explicit scope and
      explicit exclusions (mirroring `docs/sprints/sprint-01.md`, §14).
- [ ] The Known Risks register (§26-equivalent) was reviewed and
      carried forward, not silently dropped.

## Sprint close

- [ ] Every milestone in the sprint is either complete or explicitly
      deferred with a stated reason — none is left ambiguous.
- [ ] `PROJECT.md`'s Completed Tasks, Change Log, and Repository
      Health fully reflect the sprint's final state.
- [ ] All documentation touched this sprint was reviewed for staleness
      (Engineering Constitution's long-term maintenance rule).
- [ ] Any Decision Log entry that turned out to have architectural
      consequences was promoted to a full ADR
      (`docs/sprints/sprint-01.md`, §9).
- [ ] Any scope discrepancy between what was requested and what the
      Sprint Document actually defines was flagged and resolved via
      [`change-request-process.md`](../change-request-process.md),
      never silently expanded or silently ignored.
