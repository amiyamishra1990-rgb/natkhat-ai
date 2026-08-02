# AI Review Checklist

**Version:** 1.0.0
**Status:** Active
**Owner:** Engineering
**Last Updated:** 2026-07-30

Applied to any pull request, document, or decision produced by an AI
agent (Claude, ChatGPT, Gemini, Codex, or any future ASPOVO AIOS
agent). Confirms the AI Engineering Rule
(`docs/sprints/sprint-01.md`, §25;
`docs/constitution/engineering/engineering-constitution.md`, AI
Engineering Rule; `.ai/context/agent-workflow.md`) was actually
followed, not assumed.

- [ ] The agent read `PROJECT.md` first.
- [ ] The agent read the Constitutions in order: ASPOVO → Product →
      Child Privacy & Safety → Engineering.
- [ ] The agent read the relevant ADR(s) for anything this work
      touches.
- [ ] The agent read the current Sprint Document.
- [ ] The agent read the assigned module's docs, if the work is
      scoped to a module that exists (`docs/modules/`).
- [ ] Any mismatch between what was requested and what the approved
      Sprint Document/Governance Hierarchy actually authorizes was
      surfaced to a human reviewer, not silently resolved or silently
      expanded (see
      [`change-request-process.md`](../change-request-process.md)).
- [ ] No placeholder, mock, or "TODO later" implementation is
      presented as complete.
- [ ] The working session is logged in `.ai/sessions/` (once that
      workspace is populated with real session records — Sprint 01,
      Milestone 11).

**Any unchecked item means the AI Engineering Rule was not followed
for this work** — send it back before merge, per
`docs/sprints/sprint-01.md`, §25/§26 (AI governance risks).
