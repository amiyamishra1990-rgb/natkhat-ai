# Repository Checklist

**Version:** 1.0.0
**Status:** Active
**Owner:** Engineering
**Last Updated:** 2026-07-30

Used when setting up the repository or periodically auditing its
health. Enforces the Engineering Constitution's Repository, Naming,
Folder, and Package conventions
(`docs/constitution/engineering/engineering-constitution.md`).

- [ ] `PROJECT.md` exists at the repository root, has its precedence
      banner intact, and reflects current state.
- [ ] Every Governance Hierarchy layer that should exist does, at the
      correct layer — no decision has been authored below its proper
      level (`docs/sprints/sprint-01.md`, §1).
- [ ] `pnpm-workspace.yaml` and `turbo.json` correctly define the
      `apps/*`, `packages/*` graph (ADR-0001).
- [ ] No app imports another app directly; shared code only flows
      through `packages/*`.
- [ ] Every package has its own `package.json` and README.
- [ ] No package exists with fewer than two consumers, except the
      tooling-config packages (`config-typescript`, `config-eslint`,
      `config-prettier` — `docs/sprints/sprint-01.md`, §12).
- [ ] `.env.example` exists, is current, and no secret has been
      committed anywhere in the tree.
- [ ] Naming conventions hold: kebab-case directories/files,
      PascalCase TS types/components, camelCase functions/variables,
      `SCREAMING_SNAKE_CASE` env vars/constants.
- [ ] `.github/CODEOWNERS` is current for the folders that exist.
- [ ] No folder exists without at least a README explaining its
      purpose and current status.

**Any unchecked item blocks calling the repository "healthy"** — file
a Decision Log entry or fix directly, per
[`change-request-process.md`](../change-request-process.md).
