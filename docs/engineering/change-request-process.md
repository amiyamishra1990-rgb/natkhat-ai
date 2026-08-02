# Change Request Process

**Version:** 1.0.0
**Status:** Active
**Owner:** Engineering
**Last Updated:** 2026-07-30

Full authorship of the process summarized at
[`docs/sprints/sprint-01.md`](../sprints/sprint-01.md), §10 — Sprint 01,
Milestone 2. Governs any proposed change to architecture, shared
infrastructure, dependencies, or process, so that drift cannot happen
silently (see the Governance Hierarchy,
`docs/sprints/sprint-01.md`, §1, and the
[Engineering Constitution](../constitution/engineering/engineering-constitution.md)).

## Scope

Applies to any change that is architectural, hard to reverse, affects
more than one app/package, touches the Governance Hierarchy, or expands
an approved Sprint Document's scope. Routine implementation work that
stays inside an already-approved Sprint Document does not need a new
change request — it proceeds directly to a pull request.

Does **not** apply to Constitution amendments themselves, which require
their own explicit, dated amendment at the Constitution layer (see the
[Engineering Constitution](../constitution/engineering/engineering-constitution.md)
and the [Child Privacy & Safety Constitution](../constitution/product/child-privacy-and-safety-constitution.md));
this process assumes the Constitutions are fixed and asks only whether
a change is consistent with them.

## The Flow

```
Proposal → Review → Decision → ADR (if major) or Decision Log (if minor)
        → PROJECT.md update → Implementation
```

### 1. Proposal

A short written description of the change: what, why, and what it
affects. A GitHub issue or a pull request description is sufficient —
no separate document is required. The proposal must state which layer
of the Governance Hierarchy it touches (ADR, Sprint Document, shared
package, etc.) and confirm it does not contradict a layer above that
point.

### 2. Review

At least one other engineer — or an AI agent that has completed the
read-first sequence (`docs/sprints/sprint-01.md`, §25; the AI
Engineering Rule) — evaluates the proposal against:

- The Governance Hierarchy (`docs/sprints/sprint-01.md`, §1).
- The current Sprint Document's stated scope and milestone breakdown.
- The [Mandatory Engineering Review Gates](../constitution/engineering/engineering-constitution.md#mandatory-engineering-review-gates)
  and [`review-checklist.md`](./review-checklist.md), when the change
  touches anything user- or data-facing.

If the review finds the proposal contradicts an ADR, the Sprint
Document, or a Constitution, it is rejected or sent back for
resolution at the correct layer — never patched around at a lower
layer (`docs/sprints/sprint-01.md`, §1).

### 3. Decision

One of: **accept**, **reject**, or **request changes**. Recorded at the
weight appropriate to the change:

- **Architectural, hard to reverse, or affecting more than one
  app/package** → a full ADR (`docs/decisions/ADR-00XX-*.md`), per the
  ADR vs. Decision Log split (`docs/sprints/sprint-01.md`, §8/§9).
- **Small implementation decision** → an entry in
  [`docs/decisions/decision-log.md`](../decisions/decision-log.md).

**Escalation rule:** if a Decision Log entry later turns out to have
architectural consequences, it is promoted to a full ADR that
references the original entry. The original entry is never deleted or
rewritten (`docs/sprints/sprint-01.md`, §9).

A rejected or expanded-scope proposal is not silently absorbed into the
current Sprint Document — if a change genuinely needs to expand an
approved sprint's scope, that expansion itself goes through this same
Proposal → Review → Decision flow, is recorded in the Decision Log or a
new ADR, and the Sprint Document is amended openly rather than
reinterpreted.

### 4. `PROJECT.md` Update

`PROJECT.md` is updated in the same pull request as the ADR or Decision
Log entry, per its update discipline
(`docs/sprints/sprint-01.md`, §2). `PROJECT.md` never originates a
decision — it only reflects one that was already recorded above it.

### 5. Implementation

Implementation begins only after the above steps are complete, and only
against the change as recorded — not a broader or narrower version of
it. Pull requests must be traceable back to the ADR, Decision Log
entry, or Sprint Document line that authorized them.

## Roles

- **Proposer** — anyone: an engineer, the product owner, or an AI agent
  that has completed the read-first sequence.
- **Reviewer** — at least one other engineer, or an AI agent that has
  completed the read-first sequence and is evaluating against the
  Governance Hierarchy rather than its own judgment alone.
- **Decision-maker** — the product owner for anything touching the
  Product Constitution, Child Privacy & Safety Constitution, or Sprint
  scope; Engineering for ADRs and Decision Log entries that stay inside
  already-approved scope.

## Relationship to Constitutions and ADRs

This process never overrides the Constitutions, ADRs, or the current
Sprint Document — it is the mechanism by which changes are correctly
routed to whichever of those layers actually governs them
(`docs/sprints/sprint-01.md`, §1). If this document and the Governance
Hierarchy ever disagree, the Governance Hierarchy wins; file a
correction here.

## Constitution Alignment

Engineering Constitution — Governance Hierarchy, change management.
Directly implements `docs/sprints/sprint-01.md`, §10, and closes Sprint
01, Milestone 2.
