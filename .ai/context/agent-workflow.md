# Agent Workflow — Read-First Sequence

**Version:** 1.1.0
**Status:** Active — binding on all AI agents working in this repository
**Owner:** Engineering (AI workspace)
**Last Updated:** 2026-07-29

Every AI agent — Claude, ChatGPT, Gemini, Codex, or any future ASPOVO
AIOS agent — must complete this sequence before generating any code in
this repository. No step may be skipped.

1. Read `/PROJECT.md`
2. Read the Constitution, in order:
   `docs/constitution/company/aspovo-constitution.md` (placeholder) →
   `docs/constitution/product/natkhat-ai-constitution.md` →
   `docs/constitution/product/child-privacy-and-safety-constitution.md`
   (Tier-1 amendment, same level as the Product Constitution) →
   `docs/constitution/engineering/engineering-constitution.md`
3. Read the relevant ADRs in `docs/decisions/`
4. Read the current Sprint Document (`PROJECT.md` → "Current Sprint"
   links to it; currently `docs/sprints/sprint-01.md`)
5. Read the assigned module's docs, once modules exist
   (`docs/modules/`)
6. Only then generate code

This rule is authoritative in the Engineering Constitution
(`docs/constitution/engineering/engineering-constitution.md`). If this
file and the Engineering Constitution ever disagree, the Engineering
Constitution wins — file a correction here.

Sprint 01 enforces this by convention and PR review (the AI Review
checklist, once authored, includes a line item confirming the
sequence was followed), not by automated tooling.
