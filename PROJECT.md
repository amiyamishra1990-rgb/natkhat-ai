> Read this file first. This summarizes current state — it never
> overrides `docs/constitution/` or `docs/decisions/`. If they
> disagree, those win; file a correction here.

# Natkhat AI — Project Dashboard

**Version:** 1.9.0
**Status:** Living — updated in the same PR as any sprint/milestone/decision change
**Owner:** Repository maintainers
**Last Updated:** 2026-08-02 (Milestone 10)

## Governance Compliance

Every engineering milestone must comply with all of the following
(the strict read/authority order — Company above Product, Child
Privacy & Safety at the same tier as Product — is the Governance
Hierarchy in `docs/sprints/sprint-01.md`, §1):

- [Product Constitution](docs/constitution/product/natkhat-ai-constitution.md)
- [Engineering Constitution](docs/constitution/engineering/engineering-constitution.md)
- [Company (ASPOVO) Constitution](docs/constitution/company/aspovo-constitution.md) — currently a placeholder
- [Child Privacy & Safety Constitution](docs/constitution/product/child-privacy-and-safety-constitution.md) — Tier-1 Product Constitution Amendment, APPROVED, CRITICAL priority
- [ADRs](docs/decisions/)
- [Sprint Documents](docs/sprints/)

This section is a dashboard pointer only — it does not restate or
override any of the above (see banner and `docs/sprints/sprint-01.md`,
§1).

## Project Vision

Natkhat AI (an ASPOVO product) exists to help parents raise kind,
confident, curious, emotionally strong, future-ready children while
creating meaningful childhood memories — built on nine binding
principles including Human-first, Parent partnership, Safe &
Responsible AI, and No addictive engagement. Full detail:
`docs/constitution/product/natkhat-ai-constitution.md`. No standalone
vision paragraph beyond the mission has been ratified separately — see
that constitution's note on this gap.

## Mission

> Help parents raise kind, confident, curious, emotionally strong and
> future-ready children while creating meaningful childhood memories.

Source: [docs/constitution/product/natkhat-ai-constitution.md](docs/constitution/product/natkhat-ai-constitution.md).

## Current Development Phase

Sprint 01 — Repository Foundation (Governance Documentation phase).

## Current Sprint

Sprint 01 — Repository Foundation. Sprint Document:
[docs/sprints/sprint-01.md](docs/sprints/sprint-01.md).

## Sprint Goal

Establish governance documentation and repository foundation only — no
business features, no database/auth/storage implementation.

## Current Milestone

Milestones 0, 1, 1.5, 2, 5, 6, 7, 8, and 9 are **approved and complete**.
Milestone 3 (PROJECT.md close-out) is satisfied by prior updates;
Milestone 4 is superseded (see §15). Milestone 10 — CI foundation: **the
`ci.yml` half is complete** (`.github/workflows/ci.yml`, five jobs —
`lint`, `typecheck`, `test`, `build`, `mobile` — validated for YAML
correctness and against the underlying commands, which all pass
locally). **The branch-protection half is blocked**, not silently
skipped: this repository has zero commits and no configured Git remote
(`git log`/`git remote -v` both confirm this), so there is no GitHub
repository for `gh api .../branches/main/protection` to target — see
Current Status and Blockers for the exact configuration to apply once
one exists. No further Sprint 01 milestone has been started.

## Current Branch

`main` — git initialized this milestone; no commits yet (repository
initialization only, per `docs/sprints/sprint-01.md`, §15, Milestone
1).

## Current Release

Pre-release — no deployable environment yet.

## Build Status

N/A — `.github/workflows/ci.yml` now exists and its underlying commands
are validated locally (see Current Status), but it has never actually
run on GitHub: there is no remote/pushed commits yet for `pull_request`
events to trigger against.

## Current Status

Milestone 10 (CI foundation) is now underway: authored
`.github/workflows/ci.yml`, per `docs/sprints/sprint-01.md`, §15, §16.
Five jobs on `pull_request` → `main`: `lint`, `typecheck`, `test`,
`build` each run `pnpm install --frozen-lockfile` then `pnpm exec turbo
run <task> --filter="...[${{ github.event.pull_request.base.sha }}]"`
(Turborepo-filtered to packages changed since the PR base, per §16;
using the PR base commit SHA directly rather than `origin/<branch>`,
because `actions/checkout`'s `fetch-depth: 0` is not guaranteed to
create a resolvable `origin/main` remote-tracking ref — the SHA is
always present in a full-history checkout and is the pattern
Turborepo's own GitHub Actions guide recommends). A fifth job, `mobile`,
runs `flutter analyze`/`flutter test` (pinned to Flutter 3.44.8,
matching the version validated at Milestone 8) but only gated on
`apps/mobile/**` changes (§16) — since `apps/mobile` is not a
pnpm/Turborepo workspace member (ADR-0002), gating is done with a
`git diff --quiet <base-sha>...HEAD -- apps/mobile` step rather than
`turbo --filter`; the job always runs but its Flutter steps are
individually skipped (not the whole job) when irrelevant, so it stays
green and safely required without blocking non-mobile PRs. Validated:
YAML parses correctly (Prettier `--check` passes; a standalone
`pip install pyyaml` + `yaml.safe_load` parse confirms 5 jobs with the
expected step counts — no `actionlint`/`yamllint` binary was available
in this environment, so this is the deepest local static validation
possible), and every underlying command the workflow calls
(`turbo run lint typecheck test build`, `flutter analyze`, `flutter
test`) was re-run directly and still passes after the Milestone 9
tooling additions. **The workflow has not actually executed on
GitHub** — see Build Status.

Job names (`lint`, `typecheck`, `test`, `build`) were deliberately made
four separate jobs, not one job running the combined `turbo run lint
typecheck test build` command from §16's first bullet as a single
status check — this is a judgment call, not an unambiguous reading of
§16: the second bullet ("Required status checks on main: lint,
typecheck, test, build") names four independently-selectable check
names, which only exist as four distinct GitHub status checks if they
are four distinct jobs. Recorded here as an interpretation, not a
silent architecture decision.

**Branch protection on `main` (the other half of Milestone 10) is
blocked, not completed:** this repository has zero commits
(`git log` on `main` still errors with "does not have any commits
yet") and no configured remote (`git remote -v` returns nothing), so
there is no GitHub repository for `gh api
repos/<owner>/<repo>/branches/main/protection` to target — `gh auth
status` confirms an authenticated account with `repo`/`workflow`
scopes, but having API access is not the same as there being a
repository to call it against, and creating one (plus making the
first-ever commit and pushing) is a materially different, shared-state
action than "author `ci.yml`," not something this milestone's approved
scope or the session's instructions authorized. The exact configuration
to apply once a remote and at least one commit exist (combining §16's
required status checks with §17's "main protected, required review +
status checks"):

```
gh api repos/<owner>/<repo>/branches/main/protection \
  --method PUT \
  -F required_status_checks[strict]=true \
  -F 'required_status_checks[contexts][]=lint' \
  -F 'required_status_checks[contexts][]=typecheck' \
  -F 'required_status_checks[contexts][]=test' \
  -F 'required_status_checks[contexts][]=build' \
  -F 'required_status_checks[contexts][]=mobile' \
  -F enforce_admins=true \
  -F 'required_pull_request_reviews[required_approving_review_count]=1' \
  -F restrictions=null
```

**A correction to Milestone 9's own record**, found while following
this session's explicit instruction to revisit Milestone 9's
developer-tooling issues before building CI on top of them: the
Milestone 9 Change Log/Pending-Tasks entry stating that
`core.filemode=false` would prevent `.husky/pre-commit` and
`.husky/commit-msg` from running on Linux/Mac (because `chmod +x`
doesn't survive into the git index here) **was wrong, and the
recommended fix (`git update-index --chmod=+x ...`) was unnecessary.**
Reading `node_modules/husky/index.js` and `node_modules/husky/husky`
shows Husky v9 sets `core.hooksPath` to `.husky/_` (the gitignored,
auto-regenerated directory — **not** `.husky/` itself, correcting
another inaccuracy in the Milestone 9 write-up), and the shim git
actually executes there sources a dispatcher (`h`) that runs the
matching top-level file via `sh -e ".husky/<hook-name>" "$@"` — an
explicit interpreter invocation, not a direct `execve` of that file.
`sh` only needs the target file to be _readable_, not executable.
Verified empirically, not just by reading the source: with
`.husky/commit-msg` at mode `644` (confirmed via `ls -la`), directly
invoking `.husky/_/commit-msg` (what git actually calls) against a
non-conventional message correctly failed with commitlint's
`subject-empty`/`type-empty` errors and exit code 1, and against a
conventional message correctly exited 0 — proving the hook fires and
enforces correctly with no executable bit on the tracked file. The
`.husky/_/` shim layer itself (which _does_ need to be executable) is
never committed — Husky's own `.husky/_/.gitignore` (`*`) excludes it,
and `pnpm install`'s `"prepare": "husky"` script regenerates it fresh
with mode `0o755` on whichever machine runs the install, including
Linux CI runners. **No git-index or repository state needed changing
to fix this** — it was already correct; only the Milestone 9 record was
wrong. See Pending Tasks/Blockers for the correction to that entry, and
the original Change Log entry is left as-is (append-only, per this
project's own decision-log discipline) rather than rewritten.

Milestone 9 (Developer tooling) remains complete, modulo the correction
above: installed `husky`,
`lint-staged`, `@commitlint/cli`, and `@commitlint/config-conventional`
as root devDependencies (`pnpm add -D -w`), per
`docs/sprints/sprint-01.md`, §15, §17. `pnpm exec husky init` added the
`"prepare": "husky"` script, which sets `core.hooksPath` to `.husky/_`
(not `.husky/` itself — see the correction above) on every `pnpm
install`; `.husky/pre-commit` runs `pnpm exec lint-staged` and
`.husky/commit-msg` runs `pnpm exec commitlint --edit "$1"`.
`commitlint.config.js` extends `@commitlint/config-conventional`
(Conventional Commits, per §17) — validated directly against both a
non-conventional message (correctly rejected: `subject-empty`,
`type-empty`) and a conventional one (`chore(repo): ...`, correctly
accepted). Lint-staged is configured in `.lintstagedrc.cjs` rather than
inline in `package.json` because it needs a function-based entry: since
ESLint v9's flat config resolves `eslint.config.*` relative to
`process.cwd()` and not per linted file, backend files must be linted
via `pnpm --filter backend exec eslint --fix` (which sets `cwd` to
`apps/backend`) rather than a plain `eslint --fix` run from the repo
root — a plain root-level invocation was tried first and failed with
"ESLint couldn't find an eslint.config.(js|mjs|cjs) file", confirming
this is a real constraint, not a hypothetical one. A second glob,
`**/*.{ts,tsx,js,jsx,json,md,mdx,yml,yaml}`, runs `prettier --write`
repo-wide; the root `package.json` now has a `"prettier":
"@natkhat-ai/config-prettier"` field (plus `@natkhat-ai/config-prettier`
and `prettier` added as root devDependencies, matching the consumption
pattern documented in `packages/config-prettier/README.md`) so
root-level files (docs, scripts, config files) format against the
Milestone 7 shared config rather than Prettier's defaults. Added
`.prettierignore` excluding `apps/mobile/` (Flutter/Dart, not a
Prettier consumer per ADR-0002) and generated output. Validated
end-to-end with disposable fixtures created inside `apps/backend/src/`
(staged, run through `pnpm exec lint-staged`, then unstaged and
deleted — never committed, same disposable-fixture pattern as
Milestone 7): a badly-formatted-but-lint-clean file was correctly
reformatted by both tasks; a file with a real lint violation
(`@typescript-eslint/no-unused-vars`) was correctly caught and the
task run correctly failed (non-zero exit), proving the hook would
actually block a real commit rather than silently passing.

~~One item is flagged, not silently resolved: this environment has
`core.filemode=false`... whoever performs the first real commit must
explicitly force the bit...~~ — **superseded by the correction above**:
this was a false alarm (the executable bit on these two files is not
required at all), left struck through rather than deleted so the
correction is traceable, per this project's append-only discipline.

Milestones 1, 1.5, 2, 5, 6, 7, and 8 remain complete and approved (see
prior Change Log entries for detail: Root Repository Scaffold;
Repository Governance Synchronization, including ratification of the
Child Privacy & Safety Constitution; Governance population/
`change-request-process.md`; Module Registry scaffolding/
`docs/modules/TEMPLATE.md`; Engineering standards docs; Shared config
packages — `packages/config-typescript`, `packages/config-eslint`,
`packages/config-prettier`). Milestone 8 (App scaffolds): `apps/backend`
created via `nest new` (NestJS 11), wired to all three Milestone 7
shared config packages —
`tsconfig.json` extends `@natkhat-ai/config-typescript/base.json`
(overriding only the Nest-required decorator/CommonJS-interop fields),
`eslint.config.mjs` imports `@natkhat-ai/config-eslint/base`, and
`package.json`'s `"prettier"` field points at
`@natkhat-ai/config-prettier`. Added a `typecheck` script (`tsc
--noEmit`) and a `dev` script (`nest start --watch`) so the app
participates in all five `turbo.json` tasks. `turbo run typecheck lint
test build` all pass for `apps/backend`; `flutter analyze` and `flutter
test` both pass for `apps/mobile`. Fixed a real bug surfaced during
wiring: `@natkhat-ai/config-eslint` needed an explicit `"exports"` map
(`"./base": "./base.js"`) — Node's ESM resolver does not
extension-guess bare subpath imports, so the documented `import ...
from '@natkhat-ai/config-eslint/base'` usage was previously unusable by
a real consumer; this is now fixed and re-verified. `apps/mobile`
created via `flutter create --platforms=android,ios --org ai.natkhat
--project-name mobile` (org is a placeholder — no ASPOVO/Natkhat domain
convention is ratified anywhere yet; easy to change before any store
submission, not a Sprint 01 blocker). Per ADR-0002, `apps/mobile` is
intentionally **not** a pnpm workspace member (no `package.json`) and
does not consume the shared TS/ESLint/Prettier packages — confirmed via
`pnpm list -r` still showing exactly 4 workspace projects
(`backend` + 3 config packages) after `flutter create`. No `turbo.json`
root-task wiring was added for `flutter analyze`/`flutter test`; that is
left to Milestone 10 (CI foundation), which is better positioned to
decide root-task vs. plain CI-workflow-step given full `ci.yml`
context — see Change Log for detail. Application scaffolds only — no
business logic, authentication, RBAC, database, storage, APIs, or AI
integration was implemented in either app; both are exactly the default
generator output plus tooling wiring (and, for `apps/backend`, a
re-format to the shared Prettier style) and a one-line `pubspec.yaml`
description. No CI workflow yet (Milestone 10). No commits exist yet in
git; that remains the user's call.

A documentation discrepancy (not a scope conflict) was found and
recorded, not silently resolved: the Engineering Constitution's own
text (line "Detailed how-to documentation... is authored in a later
Sprint 01 milestone... Milestone 6") implies coding-standards.md,
branching-and-commits.md, release-strategy.md, dependency-management.md,
environment-management.md, code-review-workflow.md, and ci-cd.md are
also Milestone 6 deliverables, and `docs/sprints/sprint-01.md` §4's
folder-structure target lists them under the same `docs/engineering/`
annotation. However, §15's explicit Milestone 6 definition — the
operative Milestone Breakdown, and the one the user's own instructions
for this milestone matched verbatim — lists only the seven checklists
plus feature-flags/security-by-design/testing-strategy/versioning/
observability. Those seven other how-tos were treated as out of
Milestone 6's actual scope and are now tracked in
`docs/engineering/README.md` as unscheduled, pending a Change Request
to assign them to a future milestone.

## Repository Structure

Current state (governance documentation + root scaffold):

```
natkhat-ai/
├── PROJECT.md
├── README.md
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── turbo.json
├── .npmrc
├── .nvmrc
├── .editorconfig
├── .gitignore
├── .env.example
├── .prettierignore              # Milestone 9
├── commitlint.config.js         # Milestone 9
├── .lintstagedrc.cjs            # Milestone 9
├── .husky/                      # Milestone 9
│   ├── pre-commit                # runs `pnpm exec lint-staged`
│   └── commit-msg                # runs `pnpm exec commitlint --edit "$1"`
├── apps/
│   ├── backend/               # NestJS — pnpm workspace member, wired to packages/config-*
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tsconfig.build.json
│   │   ├── nest-cli.json
│   │   ├── eslint.config.mjs
│   │   ├── src/
│   │   └── test/
│   └── mobile/                 # Flutter — NOT a pnpm workspace member (ADR-0002)
│       ├── pubspec.yaml
│       ├── analysis_options.yaml
│       ├── lib/main.dart
│       ├── test/widget_test.dart
│       ├── android/
│       └── ios/
├── packages/
│   ├── config-typescript/
│   │   ├── package.json
│   │   ├── base.json
│   │   └── README.md
│   ├── config-eslint/
│   │   ├── package.json
│   │   ├── base.js
│   │   ├── eslint.config.js
│   │   └── README.md
│   └── config-prettier/
│       ├── package.json
│       ├── index.json
│       └── README.md
├── docs/
│   ├── README.md
│   ├── constitution/
│   │   ├── company/aspovo-constitution.md      # placeholder
│   │   ├── product/natkhat-ai-constitution.md
│   │   ├── product/child-privacy-and-safety-constitution.md
│   │   └── engineering/engineering-constitution.md
│   ├── decisions/
│   │   ├── ADR-0001-monorepo.md
│   │   ├── ADR-0002-flutter.md
│   │   ├── ADR-0003-backend.md
│   │   ├── ADR-0004-database.md
│   │   ├── ADR-0005-authentication.md
│   │   └── decision-log.md
│   ├── architecture/
│   │   ├── overview.md
│   │   └── observability.md
│   ├── api/README.md
│   ├── engineering/
│   │   ├── README.md
│   │   ├── review-checklist.md
│   │   ├── change-request-process.md
│   │   ├── feature-flags.md
│   │   ├── security-by-design.md
│   │   ├── testing-strategy.md
│   │   ├── versioning.md
│   │   └── checklists/
│   │       ├── repository-checklist.md
│   │       ├── sprint-checklist.md
│   │       ├── pull-request-checklist.md
│   │       ├── release-checklist.md
│   │       ├── security-checklist.md
│   │       ├── production-checklist.md
│   │       └── ai-review-checklist.md
│   ├── product/README.md
│   ├── research/README.md
│   ├── modules/
│   │   ├── README.md
│   │   └── TEMPLATE.md
│   ├── knowledge/
│   │   ├── README.md
│   │   ├── lessons-learned/
│   │   ├── performance-findings/
│   │   ├── security-discoveries/
│   │   ├── flutter-best-practices/
│   │   ├── nestjs-best-practices/
│   │   ├── supabase-findings/
│   │   ├── developer-onboarding/
│   │   └── ai-agent-learnings/
│   └── sprints/
│       └── sprint-01.md
├── .ai/
│   ├── prompts/README.md
│   ├── context/README.md
│   ├── context/agent-workflow.md
│   ├── sessions/README.md
│   └── reviews/README.md
├── infrastructure/
│   ├── README.md
│   ├── gcp/README.md
│   ├── supabase/README.md
│   └── docker/README.md
├── scripts/
│   ├── setup.sh
│   └── check-env.ts
└── .github/
    ├── CODEOWNERS
    ├── PULL_REQUEST_TEMPLATE.md
    ├── ISSUE_TEMPLATE/
    │   ├── bug_report.md
    │   └── feature_request.md
    └── workflows/
        └── ci.yml         # Milestone 10 — lint, typecheck, test, build, mobile
```

`apps/backend` and `apps/mobile` are scaffolds only (Milestone 8) — no
business logic, database, auth, storage, APIs, or AI integration.
`node_modules/`, `dist/`, `.turbo/`, `.dart_tool/`, `build/`, `.idea/`,
and other generated/local files under `apps/` are gitignored (nested
`.gitignore` files for `apps/mobile`, root `.gitignore` for
`apps/backend`) and are not shown above. `.husky/_/` (Husky's internal
helper directory) is self-gitignored via its own generated
`.husky/_/.gitignore` (`*`) and is also not shown above.

## Approved Architecture

Single monorepo (`natkhat-ai/`), Turborepo over pnpm workspaces. Only
the apps, packages, and governance scaffolding needed for Sprint 01
exist — nothing is built speculatively. Full description:
`docs/sprints/sprint-01.md`, §3 (`docs/architecture/overview.md` not
yet authored).

## Approved Tech Stack

| Layer                | Technology                  | ADR                                |
| -------------------- | --------------------------- | ---------------------------------- |
| Monorepo tooling     | Turborepo + pnpm workspaces | ADR-0001                           |
| Mobile               | Flutter                     | ADR-0002                           |
| Backend              | NestJS                      | ADR-0003                           |
| Admin (Sprint 02+)   | Next.js                     | Not yet recorded                   |
| Website (Sprint 02+) | Next.js                     | Not yet recorded                   |
| Database             | PostgreSQL, via Supabase    | ADR-0004 (implementation deferred) |
| ORM                  | Prisma                      | ADR-0004 (implementation deferred) |
| Auth                 | Supabase Auth               | ADR-0005 (implementation deferred) |
| Storage              | Supabase Storage            | ADR-0005 (implementation deferred) |
| Cloud                | Google Cloud (GCP)          | Not yet recorded                   |
| CI/CD                | GitHub Actions              | Not yet recorded                   |

Full detail: `docs/constitution/product/natkhat-ai-constitution.md`.

## Product Constitution References

- [docs/constitution/product/natkhat-ai-constitution.md](docs/constitution/product/natkhat-ai-constitution.md)
- [docs/constitution/product/child-privacy-and-safety-constitution.md](docs/constitution/product/child-privacy-and-safety-constitution.md) — Tier-1 amendment, same authority level as the Product Constitution

## Engineering Constitution References

- [docs/constitution/engineering/engineering-constitution.md](docs/constitution/engineering/engineering-constitution.md)

## ADR Index

| ADR                                                   | Title                                                                                    | Status                             |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------- |
| [ADR-0001](docs/decisions/ADR-0001-monorepo.md)       | Adopt a Single Monorepo (Turborepo + pnpm Workspaces)                                    | Accepted                           |
| [ADR-0002](docs/decisions/ADR-0002-flutter.md)        | Adopt Flutter for the Mobile Application                                                 | Accepted                           |
| [ADR-0003](docs/decisions/ADR-0003-backend.md)        | Adopt NestJS for the Backend Application                                                 | Accepted                           |
| [ADR-0004](docs/decisions/ADR-0004-database.md)       | Adopt PostgreSQL (via Supabase) with Prisma — Decision Recorded, Implementation Deferred | Accepted — Implementation Deferred |
| [ADR-0005](docs/decisions/ADR-0005-authentication.md) | Adopt Supabase Auth — Decision Recorded, Implementation Deferred                         | Accepted — Implementation Deferred |

All ADRs above are additionally governed by the
[Child Privacy & Safety Constitution](docs/constitution/product/child-privacy-and-safety-constitution.md)
(Tier-1 Product Constitution Amendment). No ADR may contradict it; on
any privacy/child-safety question the constitution controls, per the
Governance Hierarchy (`docs/sprints/sprint-01.md`, §1). This is a
registered reference only — no new ADR was created for it.

## Last Decision

2026-07-28 — Decision Log: author governance documentation before any
repository scaffolding or source code (see
[docs/decisions/decision-log.md](docs/decisions/decision-log.md)).

## Feature Roadmap

Not yet started. Sprint 01 has no business features (see Product
Constitution).

## Pending Tasks / Next Tasks

- **Branch protection on `main` (rest of Milestone 10) is blocked on a
  prerequisite, not pending approval**: needs a GitHub remote and at
  least one pushed commit before `gh api
repos/<owner>/<repo>/branches/main/protection` (exact command in
  Current Status) can be run. Await explicit user instruction before
  creating a remote and/or making the first commit — that is a
  separate, shared-state decision from authoring `ci.yml`.
- Await user approval before starting Milestone 11 (`.ai/` workspace
  population — starter prompt template(s) in `.ai/prompts/`), per
  `docs/sprints/sprint-01.md`, §15.
- Turborepo root-task wiring for `flutter analyze`/`flutter test`
  (referenced by ADR-0002/`sprint-01.md` §11 as "a Turborepo task") was
  decided at Milestone 10: **not added** — `apps/mobile` stays outside
  the pnpm/turbo dependency graph per ADR-0002, and `ci.yml`'s `mobile`
  job invokes the Flutter CLI directly instead (see Current Status).
- Unscheduled: coding-standards.md, branching-and-commits.md,
  release-strategy.md, dependency-management.md,
  environment-management.md, code-review-workflow.md, ci-cd.md — named
  in the Engineering Constitution's text and `sprint-01.md` §4's folder
  target, but not in §15's explicit Milestone 6 definition. Needs a
  Change Request to assign to a milestone.
- No shared-infrastructure implementation (auth, RBAC, audit logging,
  event framework, database connection, security middleware,
  observability, or any packages beyond the three tooling-config
  packages created at Milestone 7) is scheduled in Sprint 01 — any such
  work requires a new Change Request
  (`docs/engineering/change-request-process.md`) resulting in a Sprint
  Document amendment/new ADR before implementation begins.

## Completed Tasks

- Milestone 0 (prior): governance documentation foundation — see
  Change Log below.
- Milestone 1: `git init` (default branch renamed `master` → `main` to
  match §17); root tooling config (`package.json`,
  `pnpm-workspace.yaml`, `turbo.json`, `.npmrc`, `.nvmrc`,
  `.editorconfig`, `.gitignore`, `.env.example`, root `README.md`);
  remaining `docs/` domains scaffolded with placeholder READMEs
  (`architecture/` incl. `overview.md`, `api/`, `engineering/`,
  `product/`, `research/`, `modules/`); `infrastructure/`
  (`gcp/`, `supabase/`, `docker/`) placeholders; `scripts/setup.sh` and
  `scripts/check-env.ts`; `.github/CODEOWNERS`,
  `PULL_REQUEST_TEMPLATE.md`, `ISSUE_TEMPLATE/`. No `apps/`,
  `packages/`, CI workflow, or shared config packages — those are
  Milestones 7–10.
- Milestone 1.5: created
  `docs/constitution/product/child-privacy-and-safety-constitution.md`
  (Tier-1 Product Constitution Amendment) verbatim from the directive
  the user supplied; updated `PROJECT.md` (this file), the Engineering
  Constitution (mandatory review gates + hierarchy reference), the
  Product Constitution (Trust-Above-All amendment), the ADR Index
  (governing-reference note, no new ADR), root `README.md` (Repository
  Governance reading order), `docs/engineering/README.md`, and
  `.ai/context/agent-workflow.md`; created
  `docs/engineering/review-checklist.md`. Documentation only. Approved
  by the user 2026-07-30.
- Milestone 2: authored `docs/engineering/change-request-process.md`
  in full (Proposal → Review → Decision → ADR/Decision Log →
  `PROJECT.md` update → Implementation, plus scope/roles/escalation
  rules), per `docs/sprints/sprint-01.md`, §10, §15; updated
  `docs/engineering/README.md` to reflect it. Documentation only.
- Milestone 5: authored `docs/modules/TEMPLATE.md` (fixed
  Vision/Requirements/Architecture/APIs/Database/Security/Testing/Deployment
  structure for future product modules), per
  `docs/sprints/sprint-01.md`, §13, §15; updated
  `docs/modules/README.md`. Documentation only — no module created.
- Milestone 6: authored the seven engineering checklists
  (`docs/engineering/checklists/`), `feature-flags.md`,
  `security-by-design.md`, `testing-strategy.md`, `versioning.md`, and
  `docs/architecture/observability.md`, per
  `docs/sprints/sprint-01.md`, §15, §19–§24; updated
  `docs/engineering/README.md`, `docs/architecture/overview.md`, and
  resolved forward-references in `docs/modules/TEMPLATE.md`.
  Documentation only.
- Milestone 7: created `packages/config-typescript`,
  `packages/config-eslint`, `packages/config-prettier` (each with its
  own `package.json`, config file, and README), per
  `docs/sprints/sprint-01.md`, §12, §15; ran `pnpm install` (now
  tracked via committed `pnpm-lock.yaml`) and validated all three
  against disposable out-of-repo fixtures and self-lint/self-format-check
  scripts — see Current Status above for detail. Updated
  `pnpm-workspace.yaml`'s comment. Tooling-config only — no apps, no
  business logic, no backend/AI/auth/RBAC/database/storage/API code.
- Milestone 8: scaffolded `apps/backend` (`nest new`, NestJS 11) and
  `apps/mobile` (`flutter create`), per `docs/sprints/sprint-01.md`,
  §15, ADR-0002, ADR-0003; wired `apps/backend` to all three Milestone
  7 shared config packages and validated `turbo run typecheck lint
test build`; validated `apps/mobile` via `flutter analyze`/`flutter
test` — see Current Status above for full detail. Fixed a missing
  `exports` map in `packages/config-eslint/package.json` discovered
  during wiring. Scaffolds only — no business logic, auth, APIs,
  database, AI integration, or Flutter features beyond the default
  generator output.
- Milestone 9: installed and wired `husky`, `lint-staged`, and
  commitlint (`@commitlint/cli` + `@commitlint/config-conventional`)
  as root devDependencies, per `docs/sprints/sprint-01.md`, §15, §17;
  `.husky/pre-commit` → `lint-staged`, `.husky/commit-msg` →
  `commitlint`, `.lintstagedrc.cjs` (ESLint on `apps/backend/**`,
  Prettier repo-wide), `commitlint.config.js`, `.prettierignore` — see
  Current Status above for full detail, including the discovered
  ESLint-v9-flat-config cwd constraint. Tooling only — no application
  code, business logic, or CI workflow changed. **Correction (Milestone
  10, 2026-08-02):** the executable-bit concern originally recorded
  here was a false alarm — see Current Status/Change Log for the
  empirical correction; no action was actually needed.
- Milestone 10: authored `.github/workflows/ci.yml` (`ci.yml` half of
  CI foundation complete, per `docs/sprints/sprint-01.md`, §15, §16) —
  five jobs (`lint`, `typecheck`, `test`, `build`, `mobile`), Turborepo
  `--filter`-scoped to the PR base SHA, Flutter checks gated on
  `apps/mobile/**` changes via `git diff`. Branch protection on `main`
  (the other half) is **blocked**, not completed — no GitHub remote or
  commits exist yet; see Current Status/Blockers for the exact
  configuration to apply once they do. Also corrected a factual error
  in Milestone 9's own record (executable-bit concern; see that entry
  above and Change Log). No application code, business logic, database,
  auth, or product functionality touched.

## Blockers

**One open blocker**: branch protection on `main` (part of Milestone
10, per §15) cannot be configured — no GitHub remote and no commits
exist yet in this repository. Not a design gap: the exact `gh api`
command to run once a remote and a first commit exist is documented in
Current Status. Unblocking this requires an explicit user decision to
create a remote and make the first commit — a separate, shared-state
action from anything authorized so far.

Known Risk #5 (missing Child Privacy & Safety Constitution) is resolved
as of Milestone 1.5 — see Known Risks below. Known Risk #6 (Milestone 1
scope discrepancy), Known Risk #7 (Milestone 2 scope discrepancy), and
Known Risk #8 (Milestone 9 scope discrepancy) remain recorded as
historical/resolved-by-precedent — see Known Risks below. Awaiting user
approval before Milestone 11 begins (independent of the branch-protection
blocker above).

## Known Risks

Top risks (full register: [docs/sprints/sprint-01.md](docs/sprints/sprint-01.md), §26):

1. **Privacy** — child/family data handling must not be designed
   reactively; a data-privacy/compliance ADR is required before
   ADR-0004/ADR-0005 implementation begins.
2. **Compliance** — COPPA/GDPR-K-equivalent obligations and the
   product's target age range are not yet ratified (see Product
   Constitution).
3. **AI governance** — "Safe & Responsible AI" and "No addictive
   engagement" need engineering teeth, not just naming; enforced via
   the Governance Hierarchy and the AI Engineering Rule.
4. **Governance** — the ASPOVO Constitution remains a placeholder;
   must be explicitly replaced via amendment, not forgotten.
5. **Governance — RESOLVED (2026-07-29, Milestone 1.5)** — the Child
   Privacy & Safety Constitution (Trust-by-Design) flagged as missing
   after Milestone 1 was supplied by the user in full and ratified at
   `docs/constitution/product/child-privacy-and-safety-constitution.md`
   (Tier-1 Product Constitution Amendment, APPROVED, CRITICAL
   priority). Wired into the Engineering Constitution's mandatory
   review gates, the Product Constitution's Trust-Above-All amendment,
   the ADR Index, `docs/engineering/review-checklist.md`, root
   `README.md`, and `.ai/context/agent-workflow.md`.
6. **Process** — Milestone 1 was scaffolded strictly to
   `docs/sprints/sprint-01.md`, §15's definition, which excludes
   `apps/`, `packages/`, the CI workflow, Husky/commitlint, and the
   `config-typescript`/`config-eslint`/`config-prettier` packages
   (Milestones 7–10). A broader Milestone 1 scope was requested in the
   session that produced this update; flagged here rather than
   silently expanding an approved plan.
7. **Process — RESOLVED (2026-07-30, Milestone 2)** — a resume request
   this session asked to begin "Milestone 2 — Shared Infrastructure"
   (shared config, auth/RBAC/audit-logging/event-framework/database-
   connection foundations, security middleware, observability),
   none of which appears in `docs/sprints/sprint-01.md`. The actual
   Milestone 2 is documentation-only (§10, §15); Sprint 01 §14
   explicitly excludes auth/database/storage implementation; and Known
   Risk #1/#2's required data-privacy/compliance ADR does not yet
   exist to gate any of it. Surfaced to the user directly rather than
   silently resolved or silently expanded; the user chose the
   strict-repo-truth path — Milestone 1.5 approved, Milestone 2
   executed exactly as written (which produced
   `docs/engineering/change-request-process.md` itself), all requested
   shared-infrastructure work deferred to its real milestones/ADRs.
8. **Process — RESOLVED (2026-08-02, Milestone 9)** — this session's
   resume request labeled the target as "Milestone 9 → CI / GitHub
   Actions." Per `docs/sprints/sprint-01.md`, §15 and this file's own
   prior Current Milestone / Pending Tasks fields, the actual Milestone
   9 is **Developer tooling** (Husky, lint-staged, commitlint); CI /
   GitHub Actions is Milestone 10. Surfaced to the user directly rather
   than silently picking either interpretation; the user again chose
   the strict-repo-truth path (`docs/sprints/sprint-01.md` as Single
   Source of Truth) — Milestone 9 executed exactly as written in §15,
   CI / GitHub Actions deferred to its real milestone (10).
9. **Infrastructure — OPEN (2026-08-02, Milestone 10)** — branch
   protection on `main` (§15, §16, §17) cannot be configured: this
   repository has no GitHub remote and no commits. `ci.yml` (the other
   Milestone 10 deliverable) does not depend on this and is complete.
   Not resolved by this session because creating a remote and making
   the first commit is a distinct, shared-state decision outside this
   milestone's authorized scope ("implement ONLY Milestone 10"); the
   exact `gh api ... branches/main/protection` command to run once
   unblocked is documented in Current Status/Pending Tasks. Tracked
   here as open, not resolved-by-precedent like #6–#8, because the
   underlying prerequisite genuinely does not exist yet.

## Repository Health

Foundation stage. Three tooling-config packages (Milestone 7) and two
application scaffolds — `apps/backend` (NestJS) and `apps/mobile`
(Flutter) — exist and are validated (Milestone 8), with no business
logic in either. Developer tooling — Husky, lint-staged, commitlint —
installed and validated (Milestone 9; the executable-bit concern
originally recorded against this milestone was corrected at Milestone
10 — no action was actually needed). `.github/workflows/ci.yml`
authored and validated locally (Milestone 10) but never executed on
GitHub. Git initialized at Milestone 1; still zero commits, no remote —
that remains the user's call, and is now also the one open blocker
(branch protection, Known Risk #9). Known Risks #5, #6, #7, #8 are
resolved/historical; Known Risk #9 is open.

## Major Decisions

- [ADR-0005](docs/decisions/ADR-0005-authentication.md) — Adopt Supabase Auth — Decision Recorded, Implementation Deferred
- [ADR-0004](docs/decisions/ADR-0004-database.md) — Adopt PostgreSQL (via Supabase) with Prisma — Decision Recorded, Implementation Deferred
- [ADR-0003](docs/decisions/ADR-0003-backend.md) — Adopt NestJS for the Backend Application
- [ADR-0002](docs/decisions/ADR-0002-flutter.md) — Adopt Flutter for the Mobile Application
- [ADR-0001](docs/decisions/ADR-0001-monorepo.md) — Adopt a Single Monorepo (Turborepo + pnpm Workspaces)

## Change Log

- **2026-08-02** — Milestone 10 (CI foundation) — `ci.yml` half
  complete, branch-protection half blocked: per this session's explicit
  instruction to "pay particular attention to the developer-tooling
  issues recorded during Milestone 9," re-examined Husky's actual
  mechanism before building CI on top of it (`node_modules/husky/*.js`)
  and found the Milestone 9 record was wrong on two points — (1)
  `core.hooksPath` is `.husky/_`, not `.husky/`; (2) that means git
  never directly executes `.husky/pre-commit`/`.husky/commit-msg` — a
  shim in the gitignored, auto-regenerated `.husky/_/` sources a
  dispatcher that runs the top-level hook file via `sh -e "<path>"`, an
  explicit interpreter invocation that only needs the file to be
  _readable_. Verified empirically (not just by reading source):
  directly invoked `.husky/_/commit-msg` (what git actually calls) with
  `.husky/commit-msg` still at mode `644`, against both a
  non-conventional message (correctly rejected, exit 1) and a
  conventional one (correctly accepted, exit 0). The Milestone 9
  Pending-Tasks item recommending `git update-index --chmod=+x
.husky/pre-commit .husky/commit-msg` before the first commit was
  therefore unnecessary and has been struck through (not deleted) in
  that entry, with this entry as the append-only correction record —
  see Current Status for full detail. No git-index or repository state
  needed changing; only the written record was wrong.

  Authored `.github/workflows/ci.yml` per `docs/sprints/sprint-01.md`,
  §15, §16: five jobs — `lint`, `typecheck`, `test`, `build` (each
  `pnpm install --frozen-lockfile` then `pnpm exec turbo run <task>
--filter="...[${{ github.event.pull_request.base.sha }}]"`, using the
  PR base commit SHA rather than `origin/<branch>` because
  `actions/checkout`'s `fetch-depth: 0` does not guarantee a
  resolvable `origin/main` ref — this is the pattern Turborepo's own
  GitHub Actions guide recommends) and `mobile` (Flutter 3.44.8,
  matching the version validated at Milestone 8; gated on
  `apps/mobile/**` changes via a `git diff --quiet <base-sha>...HEAD --
apps/mobile` step rather than `turbo --filter`, since `apps/mobile`
  is not a pnpm/Turborepo workspace member per ADR-0002 — steps are
  skipped when irrelevant, not the whole job, so the check stays green
  and safely required without blocking non-mobile PRs). Chose four
  separate `lint`/`typecheck`/`test`/`build` jobs rather than one job
  running the combined `turbo run lint typecheck test build` command
  literally shown in §16's first bullet, because §16's second bullet
  ("Required status checks on main: lint, typecheck, test, build")
  names four independently-selectable check names, which only exist as
  four distinct GitHub status checks if they are four distinct jobs —
  recorded as an interpretation, not a silent architecture call. This
  also settles the Turborepo-root-task-wiring question left open by
  Milestone 8: `turbo.json` was **not** changed — `apps/mobile` stays
  outside the pnpm/turbo graph (ADR-0002) and the `mobile` job invokes
  the Flutter CLI directly instead.

  Validated: `pnpm exec prettier --check .github/workflows/ci.yml`
  passes; installed `pyyaml` (`pip install --user pyyaml`, a local,
  non-repo dev-time check, not a project dependency) and
  `yaml.safe_load`-parsed the file, confirming 5 well-formed jobs with
  the expected step counts (no `actionlint`/`yamllint` binary was
  available in this environment for deeper schema validation); re-ran
  `pnpm exec turbo run lint typecheck test build` (5/5 tasks pass,
  matching Milestone 8's baseline — one pre-existing, unrelated
  warning: `no output files found for task backend#test`, present
  since Milestone 1's `turbo.json` and not touched here) and
  `flutter analyze`/`flutter test` in `apps/mobile` (both still pass)
  directly, confirming every command the workflow calls is itself
  sound. **The workflow itself has never executed on GitHub** — no
  remote or commits exist to trigger it.

  Branch protection on `main` (§15, §16, §17's "required review +
  status checks") is **not implemented — blocked, not deferred by
  choice**: `git log`/`git remote -v` confirm zero commits and no
  configured remote, so there is no GitHub repository for `gh api
repos/<owner>/<repo>/branches/main/protection` to target, even though
  `gh auth status` shows an authenticated account with `repo`/`workflow`
  scopes. Creating a remote and making the first-ever commit are
  materially different, shared-state actions from authoring `ci.yml`
  and were not authorized by this session's "Implement ONLY Milestone
  10" instruction; the exact command to run once unblocked is in
  Current Status. Recorded as Known Risk #9 (open, not
  resolved-by-precedent). No application code, business logic,
  database, auth, or product functionality touched; no architecture
  redesigned; no Constitution/ADR changed; no commit made. — AI agent
  (Claude Code), pending user review before Milestone 11.

- **2026-08-02** — Milestone 9 (Developer tooling) complete: this
  session's resume request labeled the target "Milestone 9 → CI /
  GitHub Actions," which does not match `docs/sprints/sprint-01.md`,
  §15 (Milestone 9 = Developer tooling; CI is Milestone 10). Surfaced
  to the user rather than silently picking an interpretation; the user
  chose the strict-repo-truth path (resolves/records Known Risk #8).
  Installed `husky@^9`, `lint-staged@^17`, `@commitlint/cli@^21`,
  `@commitlint/config-conventional@^21` as root devDependencies via
  `pnpm add -D -w`. Ran `pnpm exec husky init`, which set
  `core.hooksPath=.husky` and added `"prepare": "husky"` to
  `package.json`; replaced the generated default `.husky/pre-commit`
  (`pnpm test`) with `pnpm exec lint-staged`, and added
  `.husky/commit-msg` running `pnpm exec commitlint --edit "$1"`.
  Added `commitlint.config.js` (`module.exports = { extends:
['@commitlint/config-conventional'] }`) — validated directly (not
  just by inspection) against a non-conventional message (correctly
  rejected, `subject-empty`/`type-empty`) and a conventional one
  (correctly accepted). Added `.lintstagedrc.cjs` rather than an inline
  `"lint-staged"` key in `package.json`, because a plain
  `"apps/backend/**/*.{ts,js}": "eslint --fix"` entry was tried first
  and failed: ESLint v9's flat config resolves `eslint.config.*`
  relative to `process.cwd()`, not per linted file, so running from the
  repo root (lint-staged's invocation context) could not find
  `apps/backend/eslint.config.mjs`. The working fix uses a
  function-based entry that computes each file's path relative to
  `apps/backend` and runs `pnpm --filter backend exec eslint --fix`
  (which sets `cwd` to `apps/backend`, matching how `turbo run lint`
  already succeeds for that package). A second glob,
  `**/*.{ts,tsx,js,jsx,json,md,mdx,yml,yaml}`, runs `prettier --write`
  repo-wide; added `"@natkhat-ai/config-prettier": "workspace:*"` and
  `"prettier": "^3.4.0"` as new root devDependencies and a root
  `"prettier": "@natkhat-ai/config-prettier"` field (matching the
  consumption pattern documented in
  `packages/config-prettier/README.md`) so root-level files (docs,
  scripts, root configs) format against the Milestone 7 shared config
  instead of Prettier's defaults — verified via `pnpm exec prettier
--check package.json commitlint.config.js`. Added `.prettierignore`
  excluding `apps/mobile/` (Flutter/Dart, not a Prettier consumer per
  ADR-0002) and generated output (`node_modules/`, `.turbo/`, `dist/`,
  `build/`, `coverage/`, `pnpm-lock.yaml`). Validated the full
  pre-commit path end-to-end twice with disposable fixtures created
  inside `apps/backend/src/` (staged via `git add`, run through `pnpm
exec lint-staged`, then unstaged and deleted — never committed, same
  disposable-fixture discipline as Milestone 7): a badly-formatted but
  lint-clean file was correctly fixed by both tasks (exit 0); a file
  with a real `@typescript-eslint/no-unused-vars` violation was
  correctly caught and the task run correctly failed (non-zero exit),
  confirming the hook would actually block a bad commit rather than
  silently passing. Flagged, not silently fixed: this environment has
  `core.filemode=false` (confirmed via `git config core.filemode`), so
  `chmod +x` on the two hook files does not survive into the git index
  — a test `git add` + `git ls-files -s` showed both staged as `100644`
  despite being `-rwxr-xr-x` on disk; since `.husky/*` hooks require the
  executable bit on Linux/Mac, whoever makes the first real commit must
  run `git update-index --chmod=+x .husky/pre-commit
.husky/commit-msg` (or equivalent) at that time — recorded in
  Pending Tasks rather than force-staged unilaterally, to preserve this
  repo's zero-commits/zero-staged-state pattern to date. No application
  code, business logic, or CI workflow changed; no commit made — that
  remains the user's call. — AI agent (Claude Code), pending user
  review before Milestone 10.
- **2026-07-31** — Milestone 8 (App scaffolds) complete: created
  `apps/backend` via `nest new backend --package-manager pnpm
--skip-git --skip-install --strict` (NestJS 11), per
  `docs/sprints/sprint-01.md`, §15, ADR-0003. Wired it to all three
  Milestone 7 shared config packages: `tsconfig.json` now `extends
"@natkhat-ai/config-typescript/base.json"` with only the
  Nest-required overrides added (`emitDecoratorMetadata`,
  `experimentalDecorators`, `target: ES2023`, `baseUrl`, `incremental`,
  `outDir`, `removeComments`, `resolvePackageJsonExports`,
  `allowSyntheticDefaultImports`); `eslint.config.mjs` now imports
  `@natkhat-ai/config-eslint/base` instead of Nest's generated
  type-aware config, with a `files`-scoped override adding Jest
  globals for `**/*.spec.ts`; removed the generated `.prettierrc` and
  added `"prettier": "@natkhat-ai/config-prettier"` to `package.json`;
  removed now-unused direct devDependencies (`eslint-plugin-prettier`,
  `eslint-config-prettier`, `typescript-eslint`) that were superseded
  by the shared config's own internal dependencies; added
  `@natkhat-ai/config-typescript`, `@natkhat-ai/config-eslint`,
  `@natkhat-ai/config-prettier` as `workspace:*` devDependencies; added
  a `typecheck` script (`tsc --noEmit -p tsconfig.json`, not part of
  Nest's default template) and a `dev` script (`nest start --watch`)
  so the app participates in every `turbo.json` task name. Reformatted
  the generated `src/`/`test/` files to the shared Prettier style (`pnpm
run format`). While wiring, found and fixed a real defect in
  `packages/config-eslint/package.json`: it had no `"exports"` map, so
  the documented `import ... from '@natkhat-ai/config-eslint/base'`
  usage failed under Node's ESM resolver (`ERR_MODULE_NOT_FOUND` — ESM
  does not extension-guess bare subpath imports the way CommonJS
  `require` does); added `"exports": {".": "./base.js", "./base":
"./base.js"}` and re-verified both the fix and `apps/backend`'s lint
  task pass. Ran `pnpm install` at the root (backend now present in
  the committed `pnpm-lock.yaml`) and confirmed via `turbo run
typecheck lint test build` that all four tasks pass for
  `apps/backend`. Created `apps/mobile` via `flutter create
--platforms=android,ios --org ai.natkhat --project-name mobile
apps/mobile` (Flutter 3.44.8), per ADR-0002. `--org ai.natkhat` is a
  placeholder reverse-domain identifier — no ASPOVO/Natkhat domain or
  bundle-ID convention is ratified in any governance document; recorded
  here rather than decided silently, and trivially changeable before
  any real store submission, so not treated as a blocker. Per
  ADR-0002, `apps/mobile` intentionally has no `package.json` (not a
  pnpm workspace member, does not consume the shared TS/ESLint/Prettier
  packages) — confirmed `pnpm list -r` still shows exactly 4 workspace
  projects after scaffolding. Validated with `flutter analyze` (no
  issues) and `flutter test` (1 passed, the generator's own smoke
  test); did not attempt a native platform build (APK/IPA) in this
  environment — Xcode isn't available on Windows, and `analyze`/`test`
  are the two checks `docs/sprints/sprint-01.md` §16 actually specifies
  for CI. Updated the default `pubspec.yaml` `description` field only
  (no code changes) and confirmed `.dart_tool/`, `build/`, `.idea/`,
  `*.iml`, and `android/local.properties` are all gitignored via
  Flutter's own generated nested `.gitignore` files. Updated root
  `.gitignore`'s stale forward-reference comment. Deliberately did
  **not** add `turbo.json` root-task wiring (`//#...`) for `flutter
analyze`/`flutter test`, even though ADR-0002/`sprint-01.md` §11
  describe Flutter as "a Turborepo task" — that CI-integration decision
  is Milestone 10's (CI foundation) to make with full `ci.yml` context,
  not implied by anything Milestone 8's own definition of done
  requires (§15: "wired to shared config **where applicable**" — N/A
  for Flutter per ADR-0002 — and "both run/build," which is validated
  above via direct Flutter CLI). Updated `PROJECT.md` (this file) per
  the Sprint Document's same-PR update discipline (§2), which Milestone
  8's own instructions treat as an explicit requirement. No `apps/`
  content beyond the two scaffolds, no business logic, authentication,
  RBAC, database, storage, APIs, or AI integration implemented; no
  commit made — that remains the user's call. — AI agent (Claude
  Code), pending user review before Milestone 9.
- **2026-07-31** — Milestone 7 (Shared config packages) complete:
  created `packages/config-typescript` (`base.json`), `packages/config-eslint`
  (`base.js`), `packages/config-prettier` (`index.json`) — each with
  its own scoped `package.json` (`@natkhat-ai/*`, private,
  workspace-internal) and README, per `docs/sprints/sprint-01.md`, §12,
  §15. Ran `pnpm install` (`pnpm-lock.yaml` now committed to the tree)
  and validated: `config-eslint`/`config-prettier` self-lint and
  self-format-check against their own shared config via
  `pnpm --filter <pkg> run lint|format:check`; `turbo run lint`
  correctly scopes to the 3 packages via the pnpm workspace graph;
  `config-typescript`'s `base.json` and `config-eslint`'s `base.js`
  were each validated as real `extends`/import targets against
  disposable fixture files created outside the repo (session
  scratchpad only, never committed) — both correctly passed valid code
  and caught an intentionally broken example. No `apps/` or dummy
  in-repo consumer packages were created, per this milestone's explicit
  "no apps" instruction. Updated `pnpm-workspace.yaml`'s comment
  (`packages/` now exists). Tooling-config only — no application code,
  business logic, backend services, Flutter code, AI integration,
  authentication, RBAC, database, storage, or APIs implemented; no
  commit made (repo has no commits yet, per prior milestones' pattern —
  committing remains the user's call). — AI agent (Claude Code),
  pending user review before Milestone 8.
- **2026-07-30** — Milestone 6 (Engineering standards docs) complete:
  authored the seven engineering checklists
  (`docs/engineering/checklists/`: repository, sprint, pull-request,
  release, security, production, ai-review), `feature-flags.md`,
  `security-by-design.md`, `testing-strategy.md`, `versioning.md`, and
  `docs/architecture/observability.md`, per
  `docs/sprints/sprint-01.md`, §15, §19–§24; updated
  `docs/engineering/README.md`, `docs/architecture/overview.md`, and
  `docs/modules/TEMPLATE.md`'s forward-references. Recorded (not
  resolved unilaterally) a documentation gap: seven further how-tos
  (coding-standards, branching-and-commits, release-strategy,
  dependency-management, environment-management, code-review-workflow,
  ci-cd) are named by the Engineering Constitution's text and
  `sprint-01.md` §4 as belonging under `docs/engineering/`, but are not
  part of §15's explicit Milestone 6 definition; left unscheduled
  pending a Change Request. Documentation only — no application code,
  auth, RBAC, database, storage, APIs, AI models, business features,
  UI, or infrastructure implemented; no commit made. — AI agent
  (Claude Code), pending user review before Milestone 7.
- **2026-07-30** — Milestone 5 (Module Registry scaffolding) complete:
  authored `docs/modules/TEMPLATE.md` in full (Vision, Requirements,
  Architecture, APIs, Database, Security, Testing, Deployment — per
  `docs/sprints/sprint-01.md`, §13) and updated `docs/modules/README.md`.
  No scope discrepancy this session — the resume request matched
  `sprint-01.md`, §15's Milestone 5 definition exactly. Documentation
  only — no module created, no structure/architecture/code changed, no
  commit made. — AI agent (Claude Code), pending user review before
  Milestone 6.
- **2026-07-30** — Milestone 1.5 approved by the user. Milestone 2
  (Governance population — remaining) complete: authored
  `docs/engineering/change-request-process.md` in full
  (`docs/sprints/sprint-01.md`, §10) and updated
  `docs/engineering/README.md`. This session's resume request asked to
  begin "Milestone 2 — Shared Infrastructure," which does not match the
  approved Sprint 01 document (actual Milestone 2 is documentation-only;
  auth/database/RBAC/audit-logging/event-framework/security-middleware/
  observability implementation is not in Sprint 01's scope at all, and
  is further gated by Known Risk #1/#2's still-unwritten data-privacy
  ADR). Flagged to the user rather than silently resolved; user chose
  to follow the Sprint Document strictly and defer all
  shared-infrastructure code. Documentation only — no structure,
  architecture, or code changed; no commit made. Resolves/records Known
  Risk #7. — AI agent (Claude Code), pending user review before
  Milestone 5.
- **2026-07-29** — Milestone 1.5 (Repository Governance
  Synchronization) complete: ratified
  `docs/constitution/product/child-privacy-and-safety-constitution.md`
  (Tier-1 Product Constitution Amendment) from the user-supplied
  directive; synchronized `PROJECT.md`, Engineering Constitution
  (mandatory review gates), Product Constitution (Trust-Above-All
  amendment), ADR Index (governing reference, no new ADR), root
  `README.md`, `.ai/context/agent-workflow.md`; created
  `docs/engineering/review-checklist.md`. Documentation only — no
  structure, architecture, or code changed. Resolves Known Risk #5. —
  AI agent (Claude Code), pending user review.
- **2026-07-29** — Milestone 1 (Root Repository Scaffold) complete:
  `git init` (default branch set to `main`), root tooling config,
  remaining `docs/` domains with placeholder READMEs,
  `infrastructure/` and `scripts/` placeholders, `.github/` templates.
  Flagged two discrepancies against the resuming brief (missing Child
  Privacy & Safety Constitution file; requested scope beyond §15's
  Milestone 1) rather than resolving them unilaterally. — AI agent
  (Claude Code), pending user review.
- **2026-07-28** — Initial creation: `PROJECT.md`, documentation
  structure, Company/Product/Engineering Constitutions, ADR-0001
  through ADR-0005, Decision Log, Knowledge Vault, `.ai/` workspace,
  Sprint 01 document. — AI agent (Claude Code), pending user review.

## Last Updated

2026-08-02 — Milestone 10 (CI foundation): `ci.yml` complete, branch
protection blocked (no remote/commits yet)
(pre-commit; no PR yet, no commits made in this session).
