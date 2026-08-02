# Engineering Constitution

**Version:** 1.1.0
**Status:** Ratified — governs all engineering decisions for Natkhat AI
**Owner:** Engineering
**Last Updated:** 2026-07-29
**Position in Governance Hierarchy:** below the Product Constitution
and the Child Privacy & Safety Constitution (a Tier-1 Product
Constitution Amendment, same authority level as the Product
Constitution), above ADRs, PROJECT.md, and Sprint Documents. See
`docs/sprints/sprint-01.md`, §1, for the full hierarchy and its
enforcement rules.

## Governance Hierarchy

```
ASPOVO Constitution          (placeholder — docs/constitution/company/)
        ↓
Product Constitution         (docs/constitution/product/)
    +   Child Privacy & Safety Constitution   (Tier-1 amendment, same level)
        ↓
Engineering Constitution     (this document)
        ↓
Architecture Decision Records (docs/decisions/*.md)
        ↓
PROJECT.md                   (root — live summary of current state)
        ↓
Sprint Documents              (docs/sprints/sprint-0X.md)
        ↓
Implementation                (apps/, packages/)
```

## Mandatory Engineering Review Gates

Per the [Child Privacy & Safety Constitution](../product/child-privacy-and-safety-constitution.md),
every feature must clear four mandatory gates before release:

- **Privacy** — private by default; no public profiles, feeds, or
  indexing without an explicit parent-driven publishing workflow.
- **Security** — encryption at rest/in transit, secure auth,
  authorization checks, audit logging, secret management.
- **Parent Trust** — parents retain ownership, visibility, export, and
  deletion control over their child's data at all times.
- **Child Safety** — AI outputs, conversations, and stored media are
  isolated per family and safe for children.

**No feature may bypass these gates.** The mandatory release checklist
enforcing them is `docs/engineering/review-checklist.md`. If any gate
answers "NO," the feature returns to design and is not released.

Rules: each layer may only be authored at its own level; PROJECT.md
never originates a decision; implementation must trace to a Sprint
Document; a Sprint Document must not contradict an ADR; an ADR must
not contradict this Constitution; nothing may contradict the Product
or ASPOVO Constitution. Any exception requires an explicit amendment
at the correct layer — never a workaround at a lower one.

## Engineering Standards

| Standard                    | Core rule                                                                                                                                                              |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repository standards        | One monorepo, one root config source; `PROJECT.md` mandatory first read                                                                                                |
| Naming conventions          | kebab-case dirs/files, PascalCase TS types/components, camelCase functions/vars, SCREAMING_SNAKE_CASE env/constants                                                    |
| Folder conventions          | Apps under `apps/`, shared code under `packages/`, apps never import each other directly                                                                               |
| Package conventions         | Own `package.json` + README; no package without ≥2 consumers except config packages                                                                                    |
| Import conventions          | Absolute workspace imports, no deep cross-package relative imports                                                                                                     |
| Branch strategy             | GitHub Flow — `main` protected, required review + status checks                                                                                                        |
| Commit strategy             | Conventional Commits via commitlint                                                                                                                                    |
| Release strategy            | Continuous deploy (web/backend, once deployable); tagged releases (mobile)                                                                                             |
| Dependency management       | pnpm only, `workspace:*` internally, Renovate for hygiene                                                                                                              |
| Environment management      | `.env.example`, schema-validated at startup, secrets never committed                                                                                                   |
| Testing philosophy          | Full taxonomy documented before code exists (see `docs/engineering/testing-strategy.md`, once authored)                                                                |
| Code review workflow        | ≥1 review + passing CI; PR checklist applied                                                                                                                           |
| CI/CD workflow              | Turborepo-filtered CI; deploy workflows added only when needed                                                                                                         |
| Documentation workflow      | New ADR or Decision Log entry for every decision; `PROJECT.md` updated in the same PR                                                                                  |
| Architecture governance     | Governance Hierarchy above is binding at every layer                                                                                                                   |
| Long-term maintenance rules | No speculative abstractions; ADRs superseded, never deleted; docs reviewed for staleness every sprint                                                                  |
| Feature flag philosophy     | All unfinished/unstable functionality ships behind a feature flag (see `docs/engineering/feature-flags.md`, once authored)                                             |
| Security by design          | Least privilege, secrets management, encryption, PII/child-privacy handling (see `docs/engineering/security-by-design.md`, once authored)                              |
| Mandatory review gates      | Privacy, Security, Parent Trust, Child Safety — no feature may bypass; enforced via `docs/engineering/review-checklist.md` per the Child Privacy & Safety Constitution |

Detailed how-to documentation for each standard above (coding
standards, branching, release strategy, dependency/environment
management, testing strategy, code review workflow, CI/CD, the
change-request process, feature flags, security-by-design, versioning,
and the seven engineering checklists) is authored in a later Sprint 01
milestone (see `docs/sprints/sprint-01.md`, §15, Milestone 6). This
Constitution is binding now; its detailed how-to companions in
`docs/engineering/` mostly do not exist yet — the one exception is
`docs/engineering/review-checklist.md`, created ahead of schedule at
Milestone 1.5 because the Child Privacy & Safety Constitution makes it
a mandatory, effective-immediately gate.

## AI Engineering Rule

Every AI agent must follow this sequence before generating code, with
no step skipped:

```
Read PROJECT.md
   ↓
Read the Constitution (ASPOVO → Product → Child Privacy & Safety → Engineering)
   ↓
Read the relevant ADRs
   ↓
Read the current Sprint Document
   ↓
Read the assigned module's docs (once modules exist)
   ↓
Only then generate code
```

Machine-readable enforcement of this same rule lives in
`.ai/context/agent-workflow.md`. If the two ever disagree, this
Constitution wins.

## Amendment

Changes to this constitution follow the Change Request Process
(Proposal → Review → Decision → ADR or Decision Log → PROJECT.md
update → Implementation). No standard here may be changed by a lower
layer.
