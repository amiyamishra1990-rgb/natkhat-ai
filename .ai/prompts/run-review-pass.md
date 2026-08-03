# Prompt: Run a Review Pass

**Version:** 1.0.0
**Status:** Active — starter prompt template
**Owner:** Engineering (AI workspace)
**Last Updated:** 2026-08-03

Non-authoritative. Reusable prompt template for the recurring task of
reviewing a pull request, document, or decision, per
`.ai/prompts/README.md`. Nothing in this file overrides
`docs/engineering/review-checklist.md` or
`docs/engineering/checklists/ai-review-checklist.md` — if they ever
disagree, those win (`docs/sprints/sprint-01.md`, §6).

## When to use this

For any pull request, document, or decision produced by an AI agent
(`docs/engineering/checklists/ai-review-checklist.md`), and for any
feature that is user- or data-facing before it releases
(`docs/engineering/review-checklist.md`).

## Prompt

```
Run a review pass on: <PR / document / change under review>.

Two checklists apply — check whether each is in scope for this change,
do not skip either without saying why:

1. docs/engineering/checklists/ai-review-checklist.md — applies to any
   PR, document, or decision produced by an AI agent. Confirms the AI
   Engineering Rule was actually followed for this specific piece of
   work: the read-first sequence, any scope mismatch surfaced (not
   silently resolved or expanded), no placeholder/mock/"TODO later"
   presented as complete, and the session logged in .ai/sessions/.

2. docs/engineering/review-checklist.md — the Mandatory Engineering
   Review Gates (Privacy, Security, Parent Trust, Child Safety) from
   the Child Privacy & Safety Constitution. Required whenever the
   change is user- or data-facing
   (docs/engineering/change-request-process.md, Review). Any single
   "NO" blocks release — the feature returns to design, it is not
   shipped with a caveat.

Answer every item on both checklists explicitly (not "looks fine") and
record the result in .ai/reviews/ as a dated review report. The report
documents that the check happened — per .ai/'s own non-authoritative
rule (docs/sprints/sprint-01.md, §6), it does not itself authorize
anything; the checklists it's checked against remain the authority.

Report any unchecked or "NO" item as a blocker, not a note.
```

## Notes

- `docs/engineering/checklists/ai-review-checklist.md` and
  `docs/engineering/review-checklist.md` answer different questions —
  one confirms process was followed, the other confirms the work
  itself is safe to release. A change can pass one and fail the other.
