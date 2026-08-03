# Prompts

**Version:** 1.1.0
**Status:** Active — populated (Milestone 11)
**Owner:** Engineering (AI workspace)
**Last Updated:** 2026-08-03

Reusable prompt templates for recurring agent tasks — keeps agent
output consistent across sessions and providers
(`docs/sprints/sprint-01.md`, §6). Populated at Sprint 01, Milestone 11
(`docs/sprints/sprint-01.md`, §15) with starter templates for the
recurring tasks already identified across Sprint 01: drafting an ADR,
drafting a module doc, running a review pass, and resuming a milestone
from an approved checkpoint.

| Template                                     | Recurring task                                                    |
| -------------------------------------------- | ----------------------------------------------------------------- |
| [`draft-adr.md`](draft-adr.md)               | Draft an Architecture Decision Record                             |
| [`draft-module-doc.md`](draft-module-doc.md) | Draft a product module document from `docs/modules/TEMPLATE.md`   |
| [`run-review-pass.md`](run-review-pass.md)   | Review a PR/document/decision against both engineering checklists |
| [`resume-milestone.md`](resume-milestone.md) | Resume a working session from the last approved Sprint milestone  |

Nothing in this folder is authoritative — per `docs/sprints/sprint-01.md`,
§6, if a template here ever conflicts with `docs/`, `docs/` wins. Add a
new template here as further recurring agent tasks are identified;
follow the existing files' shape (When to use this → Prompt → Notes).
