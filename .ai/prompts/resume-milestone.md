# Prompt: Resume a Milestone from an Approved Checkpoint

**Version:** 1.0.0
**Status:** Active — starter prompt template
**Owner:** Engineering (AI workspace)
**Last Updated:** 2026-08-03

Non-authoritative. Reusable prompt template describing the pattern
already used to open every Sprint 01 milestone session (see
`docs/sprints/sprint-01.md`'s Change Log — each milestone entry follows
this same shape). Captured here per `.ai/prompts/README.md` rather than
re-invented each time. If this template and the current Sprint Document
ever disagree about what a milestone requires, the Sprint Document wins
(`docs/sprints/sprint-01.md`, §6).

## When to use this

At the start of a new working session that continues repository work
from the last approved milestone, per the read-first sequence in
`.ai/context/agent-workflow.md`.

## Prompt

```
Resume <product> from the latest approved checkpoint.

Repository: <path>
Treat the repository as the Single Source of Truth.

Current completed milestones: <list, from PROJECT.md's "Current
Milestone">

Resume from: Sprint 0X → Milestone <N> → <name, quoted from
docs/sprints/sprint-0X.md, §15, Milestone Breakdown>

Before implementing:
1. Read PROJECT.md.
2. Read the current Sprint Document (docs/sprints/sprint-0X.md).
3. Read all applicable Constitutions and ADRs.
4. Inspect the existing repository state relevant to this milestone.
5. Confirm the exact milestone scope from the repository SSOT — quote
   the Milestone Breakdown entry; do not paraphrase from memory or from
   this resume request if it disagrees with the Sprint Document.

Implement ONLY this milestone exactly as defined.

Do not redesign architecture. Do not revisit planning. Do not modify
approved governance documents. Do not implement business features. Do
not implement future milestones. Do not weaken privacy, child safety,
security, CI, or branch protection.

If this resume request's description of the milestone disagrees with
the Sprint Document, surface the mismatch and follow the Sprint
Document — per docs/engineering/change-request-process.md and the
"surfaced, not silently resolved or silently expanded" rule in
docs/engineering/checklists/ai-review-checklist.md.

When complete:
1. Show every file created.
2. Show every file modified.
3. Show the .ai workspace tree.
4. Show the repository tree.
5. Summarize all work completed.
6. Show all validations performed.
7. List issues encountered.
8. Confirm every acceptance criterion for this milestone.
9. State the next milestone according to PROJECT.md.

Then STOP and wait for approval before proceeding further.
```

## Notes

- This template describes an already-recurring pattern — ten prior
  Sprint 01 milestone sessions follow this shape in
  `docs/sprints/sprint-01.md`'s Change Log — it does not introduce a
  new process.
- Nothing in `.ai/` is authoritative: if this template and the Sprint
  Document disagree on what a milestone actually requires, the Sprint
  Document wins (`docs/sprints/sprint-01.md`, §6).
