# Prompt: Draft a Module Doc

**Version:** 1.0.0
**Status:** Active — starter prompt template
**Owner:** Engineering (AI workspace)
**Last Updated:** 2026-08-03

Non-authoritative. Reusable prompt template for the recurring task of
drafting a product module document from `docs/modules/TEMPLATE.md`, per
`.ai/prompts/README.md`. Nothing in this file overrides
`docs/modules/TEMPLATE.md` or the Governance Hierarchy — if they ever
disagree, those win (`docs/sprints/sprint-01.md`, §6).

## When to use this

When a product module has been authorized above the module layer (a
Constitution, ADR, or the current Sprint Document) and needs its own
module document. `docs/modules/TEMPLATE.md`'s existence does not itself
authorize any business feature (`docs/sprints/sprint-01.md`, §13) —
confirm authorization exists before drafting, not after.

## Prompt

```
Draft the module doc for: <module name>.

Before drafting:
1. Read PROJECT.md, the Constitution in order (ASPOVO → Product →
   Child Privacy & Safety → Engineering), the relevant ADR(s), and the
   current Sprint Document, per .ai/context/agent-workflow.md.
2. Confirm this module is actually authorized to be documented now —
   quote the Constitution section, ADR, or Sprint Document line that
   authorizes it. A module doc with no traceable authorization above it
   does not proceed to implementation (docs/sprints/sprint-01.md, §1,
   §10).

Then copy docs/modules/TEMPLATE.md to
docs/modules/<module-slug>/README.md and fill in every section — do
not delete a section for being "not applicable yet"; state that
explicitly instead, so reviewers can see it was considered:
1. Vision
2. Requirements
3. Architecture
4. APIs
5. Database
6. Security — explicitly answer every item in
   docs/engineering/review-checklist.md (Privacy by Default, Child
   Safety, Parent Trust, Secure APIs, Audit Logging, Search Engine
   Protection, Encryption, Parent Data Ownership, AI Safety, Product
   Constitution Compliance). Any "NO" blocks this module past design.
7. Testing
8. Deployment
Constitution Alignment — which Constitution(s), ADR(s), and Sprint
Document line this module traces to.

This document does not outrank anything above it in the Governance
Hierarchy (docs/sprints/sprint-01.md, §1) — if anything here conflicts
with a Constitution, an ADR, PROJECT.md, or the current Sprint
Document, fix this document, not them.
```

## Notes

- Any requirement touching child data, parent data, or AI-mediated
  behavior requires the Mandatory Engineering Review Gates regardless
  of module size (`docs/modules/TEMPLATE.md`, §2).
- No speculative API surface — request/response shapes belong in §4
  only once they are real (`docs/modules/TEMPLATE.md`, §4).
