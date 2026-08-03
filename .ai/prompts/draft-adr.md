# Prompt: Draft an ADR

**Version:** 1.0.0
**Status:** Active — starter prompt template
**Owner:** Engineering (AI workspace)
**Last Updated:** 2026-08-03

Non-authoritative. Reusable prompt template for the recurring task of
drafting an Architecture Decision Record, per `.ai/prompts/README.md`
and `docs/engineering/change-request-process.md`. Nothing in this file
overrides `docs/` — if this template and
`docs/engineering/change-request-process.md` ever disagree, that
document wins (`docs/sprints/sprint-01.md`, §6).

## When to use this

When a proposed change is architectural, hard to reverse, or affects
more than one app/package — the point at which the Change Request
Process calls for a full ADR rather than a
`docs/decisions/decision-log.md` entry
(`docs/engineering/change-request-process.md`, Scope;
`docs/sprints/sprint-01.md`, §8/§9).

## Prompt

```
Draft an ADR for: <one-sentence description of the decision>.

Before drafting:
1. Read PROJECT.md, then the Constitution in order (ASPOVO → Product →
   Child Privacy & Safety → Engineering), per
   .ai/context/agent-workflow.md.
2. Read the ADR Index in PROJECT.md and every ADR in docs/decisions/
   that this decision might relate to, supersede, or conflict with.
3. Read docs/engineering/change-request-process.md and confirm this
   change genuinely needs a full ADR, not a
   docs/decisions/decision-log.md entry (docs/sprints/sprint-01.md,
   §8/§9).
4. Confirm the decision does not contradict anything above it in the
   Governance Hierarchy (docs/sprints/sprint-01.md, §1). If it does,
   stop and surface the conflict — do not draft around it.

Then draft docs/decisions/ADR-00XX-<slug>.md matching the structure of
the existing files in docs/decisions/:
- Title: "ADR-00XX: <Decision Title>"
- Version / Status / Owner / Last Updated header
- Context — why this decision is needed now
- Decision — the decision itself, stated plainly
- Consequences — what this commits us to, including anything it rules
  out
- Constitution Alignment — which Constitution section(s)/ADR(s) this
  traces to

Do not implement the decision in the same change. Update the ADR Index
table in PROJECT.md and, if the decision affects current milestone
scope, PROJECT.md's Current Status — in the same PR, per the
Documentation workflow standard
(docs/constitution/engineering/engineering-constitution.md).
```

## Notes

- If review finds the proposal contradicts an ADR, the Sprint Document,
  or a Constitution, it is rejected or sent back for resolution at the
  correct layer — never patched around at a lower layer
  (`docs/engineering/change-request-process.md`).
- ADRs are never deleted, only superseded by a later ADR that
  references them (`docs/sprints/sprint-01.md`, §9).
