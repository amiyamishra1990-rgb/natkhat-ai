# Documentation Index

**Version:** 1.1.0
**Status:** Active
**Owner:** Engineering
**Last Updated:** 2026-07-29

Ten non-overlapping domains, per `docs/sprints/sprint-01.md`, §5. AI
agent operational artifacts live outside this tree, at root-level
`.ai/` — see that folder's own README for why it's kept separate.

| Domain                             | Purpose                                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------------------------- |
| [`constitution/`](./constitution/) | Permanent, non-negotiable decisions (Company, Product, Child Privacy & Safety, Engineering) |
| [`decisions/`](./decisions/)       | ADRs (major) + Decision Log (minor)                                                         |
| [`architecture/`](./architecture/) | Living technical design, including observability philosophy                                 |
| [`api/`](./api/)                   | API contracts/reference, populated once endpoints exist                                     |
| [`engineering/`](./engineering/)   | Practical how-tos, checklists, and process docs implementing the Engineering Constitution   |
| [`product/`](./product/)           | Roadmaps and feature specs                                                                  |
| [`research/`](./research/)         | User and competitive research                                                               |
| [`knowledge/`](./knowledge/)       | Knowledge Vault — reusable lessons that outlive individuals                                 |
| [`modules/`](./modules/)           | Registry/template for future product modules                                                |
| [`sprints/`](./sprints/)           | Sprint Documents, one per sprint                                                            |

Read `PROJECT.md` first, then the Constitution (Company → Product →
Child Privacy & Safety → Engineering), then the relevant ADRs, then
the current Sprint Document — see `.ai/context/agent-workflow.md` for
the full read-first sequence binding on every AI agent.
