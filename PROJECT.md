> Read this file first. This summarizes current state — it never
> overrides `docs/constitution/` or `docs/decisions/`. If they
> disagree, those win; file a correction here.

# Natkhat AI — Project Dashboard

**Version:** 1.12.0
**Status:** Living — updated in the same PR as any sprint/milestone/decision change
**Owner:** Repository maintainers
**Last Updated:** 2026-08-03 (Milestone 12 — Sprint 01 close-out — complete; **Sprint 01 is 100% complete**)

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

Sprint 01 — Repository Foundation — **complete** (all 12 Milestone
Breakdown entries in `docs/sprints/sprint-01.md`, §15 satisfied).
Awaiting user approval to begin Sprint 02; no Sprint 02 Sprint Document
exists yet (see Pending Tasks).

## Current Sprint

Sprint 01 — Repository Foundation. Sprint Document:
[docs/sprints/sprint-01.md](docs/sprints/sprint-01.md).

## Sprint Goal

Establish governance documentation and repository foundation only — no
business features, no database/auth/storage implementation.

## Current Milestone

**Sprint 01 is complete — all 12 Milestone Breakdown entries
satisfied.** Milestones 0, 1, 1.5, 2, 5, 6, 7, 8, 9, 10, and 11 are
**approved and complete**. Milestone 3 (PROJECT.md close-out of the
Governance Documentation phase) was satisfied by prior updates;
Milestone 4 is superseded (see §15). **Milestone 12 — PROJECT.md final
close-out is now complete**: this file's Current Status, Completed
Tasks, and Next Actions have been updated to reflect the finished
Sprint 01 foundation, and the Definition of Done (§15) was
re-validated locally — see Current Status for full detail. There is no
next Sprint 01 milestone. The next actionable step is Sprint 02, which
does not yet have an approved Sprint Document — see Pending Tasks and
the final section of Current Status for the recommendation.

## Current Branch

`main` — first commit `6ff7e44` ("chore(repo): establish Sprint 01
repository foundation (Milestones 0-10)") pushed to `origin/main` at
[github.com/amiyamishra1990-rgb/natkhat-ai](https://github.com/amiyamishra1990-rgb/natkhat-ai)
(pre-existing empty repo, created 2026-07-26 by the user, verified
empty before push — 0 branches, 0 size, never previously pushed to;
**public** visibility, a pre-existing decision from repo creation, not
made in this session). PR
[#1](https://github.com/amiyamishra1990-rgb/natkhat-ai/pull/1)
(`chore/project-milestone-10-ci-verification` → `main`) is open,
CI-green, but **blocked on required review** (`mergeStateStatus:
BLOCKED`, `reviewDecision: REVIEW_REQUIRED`) — branch protection's
`enforce_admins: true` means even the repo owner cannot self-merge it;
see Blockers.

## Current Release

Pre-release — no deployable environment yet.

## Build Status

**Green** — verified on real GitHub Actions, not just locally: all
five `ci.yml` jobs (`lint`, `typecheck`, `test`, `build`, `mobile`)
pass on
[run 30753691637](https://github.com/amiyamishra1990-rgb/natkhat-ai/actions/runs/30753691637)
against PR #1. Two real defects were caught by this real run (neither
had surfaced in local validation) and fixed on the same PR branch — see
Current Status.

## Current Status

**Milestone 12 (PROJECT.md final close-out) is now complete — Sprint 01
is 100% complete.** Per `docs/sprints/sprint-01.md`, §15, Milestone
12 is exactly: "PROJECT.md final close-out — Current Status, Completed
Tasks, Next Actions updated to reflect the finished foundation." Before
implementing, verified the resume request's own prerequisite claims
against the repository rather than assuming them: confirmed Milestones
0, 1, 1.5, 2, 5, 6, 7, 8, 9, 10, and 11 are each recorded as complete in
this file's own Completed Tasks/Change Log (all 11 present, none
missing), and confirmed no unresolved blocker prevents Milestone 12 —
the Blockers section already stated "None blocking Sprint 01 progress"
before this session began; the one open operational item (PR #1
merge-blocked pending a second reviewer) is explicitly recorded
elsewhere in this file as "not a Sprint 01 blocker," so it does not gate
this close-out.

Re-validated the Definition of Done (`docs/sprints/sprint-01.md`, §15)
directly, rather than relying solely on Milestone 10's prior CI run:
`pnpm install --frozen-lockfile` against the current `pnpm-lock.yaml`
succeeds cleanly; `pnpm exec turbo run lint typecheck test build`
passes 5/5 tasks (all cache-hit, confirming no drift since Milestone
10's real CI run); `flutter analyze` in `apps/mobile` reports "No
issues found"; `flutter test` reports "All tests passed." Combined with
Milestone 10's independently-verified real GitHub Actions run
([run 30753691637](https://github.com/amiyamishra1990-rgb/natkhat-ai/actions/runs/30753691637))
and branch protection, this satisfies §15's Definition of Done in full:
a new engineer or AI agent cloning the repo, reading `PROJECT.md` →
Constitution → ADRs → the current Sprint Document, running
`scripts/setup.sh`, gets `apps/backend` building/testing and
`apps/mobile` building/testing locally, with CI green on a real PR.

Reviewed `docs/sprints/sprint-01.md`, §27, Recommendation 6 ("Revisit
`docs/` domain boundaries, the Knowledge Vault's category list, and
`.ai/` structure at the end of Sprint 01 to confirm they held up in
practice before Sprint 02 adds real product modules") as a read-only
confirmation, not a redesign — Milestone 12 does not authorize
structural changes: the ten `docs/` domains (§5) were each populated
by exactly the milestone that owns them, with no domain needing a
scope it wasn't given (Milestone 6's how-to-docs discrepancy and
Milestone 11's `.ai/sessions/` discrepancy are the only two boundary
frictions found across all 12 milestones, and both were flagged and
deferred to a Change Request rather than silently resolved — neither
required a structural change); the Knowledge Vault's eight categories
(`docs/knowledge/`) were never populated with real entries in Sprint 01
(expected — Sprint 01 has no implementation to generate lessons from
yet) but the category list itself was never found to be wrong or
missing a needed category; `.ai/`'s four folders are each now used
for what §6 defines them for (`prompts/` populated at Milestone 11;
`context/` populated at Milestone 0/1.5; `sessions/` and `reviews/`
correctly still empty — no AI session has been logged there across all
12 milestones, which is itself the discrepancy flagged at Milestone 11
and carried forward below, not resolved here). Conclusion: the
structure held up in practice: no domain boundary or `.ai/` folder
needs to change before Sprint 02. This is a finding, not a decision —
no `docs/` or `.ai/` structural change was made.

**Sprint 01 Completion Checklist** (§15's twelve Milestone Breakdown
entries):

| #   | Milestone                                                        | Status                                |
| --- | ---------------------------------------------------------------- | ------------------------------------- |
| 0   | Governance Documentation Foundation                              | Complete                              |
| 1   | Root scaffolding                                                 | Complete                              |
| 1.5 | Governance Synchronization (Child Privacy & Safety Constitution) | Complete                              |
| 2   | Governance population (`change-request-process.md`)              | Complete                              |
| 3   | PROJECT.md close-out of Governance phase                         | Complete (satisfied by prior updates) |
| 4   | _(superseded by Milestone 0)_                                    | N/A                                   |
| 5   | Module Registry scaffolding                                      | Complete                              |
| 6   | Engineering standards docs                                       | Complete                              |
| 7   | Shared config packages                                           | Complete                              |
| 8   | App scaffolds                                                    | Complete                              |
| 9   | Developer tooling                                                | Complete                              |
| 10  | CI foundation                                                    | Complete                              |
| 11  | `.ai/` workspace population                                      | Complete                              |
| 12  | PROJECT.md final close-out                                       | Complete (this entry)                 |

No application code, business logic, database, auth, or product
functionality touched; no architecture, ADR, Constitution, or other
governance document modified — only `PROJECT.md` (this file). Sprint 02
has no approved Sprint Document yet (`docs/sprints/` contains only
`sprint-01.md`) — see Pending Tasks for the recommended first step.

Milestone 11 (`.ai/` workspace population) is complete, per
`docs/sprints/sprint-01.md`, §15's exact Milestone 11 definition:
"`.ai/` workspace population (remaining) — starter prompt template(s)
in `.ai/prompts/`." Before implementing, confirmed this exact scope
directly from the Sprint Document (§15) rather than from this session's
resume-request wording, per the AI Engineering Rule
(`.ai/context/agent-workflow.md`); the resume request's own wording
("starter prompt template(s) in `.ai/prompts/`") matched §15 verbatim,
so no scope mismatch needed surfacing this time.

Authored four starter prompt templates in `.ai/prompts/`:
`draft-adr.md`, `draft-module-doc.md`, `run-review-pass.md`, and
`resume-milestone.md`. The first three are not new process invention —
they are the exact three recurring tasks `.ai/prompts/README.md`
already named ("draft an ADR, draft a module doc, run a review pass")
before this milestone began. The fourth,
`resume-milestone.md`, generalizes the resume-and-implement-one-milestone
pattern this Sprint's own Change Log shows repeated identically across
all ten prior milestone sessions (each: read PROJECT.md → Constitution
→ ADRs → Sprint Document → confirm exact milestone scope → implement
only that milestone → report files/trees/validations/issues/acceptance
criteria → stop for approval) — captured as a template rather than
re-derived from scratch next time, per the same "keeps agent output
consistent across sessions and providers" rationale
`.ai/prompts/README.md` already states for this folder's purpose. Each
template is explicit that it is non-authoritative
(`docs/sprints/sprint-01.md`, §6) and defers to the governing
`docs/` document (`change-request-process.md`,
`docs/modules/TEMPLATE.md`, `review-checklist.md`/`ai-review-checklist.md`,
and the Sprint Document itself, respectively) wherever the two could
ever disagree.

Updated `.ai/prompts/README.md` from a structural placeholder (empty,
`Version 1.0.0`) to an active index (`Version 1.1.0`) listing all four
templates in a table, matching the update pattern every prior milestone
used for the `docs/` README each milestone populated (e.g.
`docs/modules/README.md` at Milestone 5, `docs/engineering/README.md`
at Milestone 6). Validated: `pnpm exec prettier --check .ai/prompts/*.md`
initially failed only on `README.md`'s table alignment; `pnpm exec
prettier --write` fixed it (table column widths only, no content
change), and a re-run of `--check` then passed for all five files in
the folder. No other file in the repository references
`.ai/prompts/` by path (checked via a repo-wide grep for `.ai/prompts`)
outside `PROJECT.md`, `docs/sprints/sprint-01.md`, and the folder's own
files, so no other document needed updating for this milestone.

No application code, business logic, database, auth, or product
functionality touched; no architecture, ADR, or Constitution changed;
`docs/modules/TEMPLATE.md`, `docs/engineering/change-request-process.md`,
`docs/engineering/review-checklist.md`, and
`docs/engineering/checklists/ai-review-checklist.md` were read for
grounding but not modified — the new prompt templates reference them,
they do not restate or alter them. `.ai/sessions/` and `.ai/reviews/`
remain empty structural placeholders: `docs/sprints/sprint-01.md`, §15's
Milestone 11 definition scopes this milestone to `.ai/prompts/` only.
One documentation forward-reference is worth flagging, not silently
resolved: `docs/engineering/checklists/ai-review-checklist.md` (line
31–33) says a session log in `.ai/sessions/` is expected "once that
workspace is populated with real session records — Sprint 01, Milestone
11," which reads as if Milestone 11 also covers `.ai/sessions/`. §15's
own Milestone 11 line is unambiguous and names only `.ai/prompts/`, so
§15 (the operative Milestone Breakdown) was followed here, consistent
with how this Sprint's own precedent (Milestone 6's similar
how-to-docs discrepancy) treats §15 as the deciding text over other
docs' forward-references. Recorded here, not resolved unilaterally —
`.ai/sessions/`/`.ai/reviews/` population remains unscheduled pending a
Change Request, same disposition as the Milestone 6 precedent.

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
tooling additions.

**Update — the workflow has now actually executed on GitHub, and real
CI found two real bugs local validation missed.** First commit
`6ff7e44` was pushed to `origin/main` (pre-existing, verified-empty
repo at `github.com/amiyamishra1990-rgb/natkhat-ai`), then PR
[#1](https://github.com/amiyamishra1990-rgb/natkhat-ai/pull/1)
(`chore/project-milestone-10-ci-verification`, content limited to
`PROJECT.md` tracking updates per the user's explicit scope
instruction) was opened specifically to exercise `ci.yml`'s
`pull_request` trigger. The first real run failed 4/5 jobs (`mobile`
correctly passed — no `apps/mobile/**` changes to gate on):
`lint`/`typecheck`/`test`/`build` all failed identically at `pnpm
install --frozen-lockfile` with `ERR_PNPM_OUTDATED_LOCKFILE` —
`package.json` declared `"@natkhat-ai/config-prettier": "workspace:*"`
but `pnpm-lock.yaml` still had `workspace:^`, because that field was
hand-edited for convention-consistency at Milestone 9 without
re-running `pnpm install` afterward. Reproduced locally (`pnpm install
--frozen-lockfile` failed identically), fixed with a plain `pnpm
install` (resyncs the lockfile; 1-line diff, nothing else changed),
verified, committed (`fix(repo): sync pnpm-lock.yaml specifier for
@natkhat-ai/config-prettier`), and pushed. The second run then failed
the same 4 jobs differently: `ERR_PNPM_UNSUPPORTED_ENGINE` —
`@commitlint/cli@21.2.1` requires Node `>=22.12.0`, but `.nvmrc`/
`engines.node` still targeted the Milestone 1 default of Node 20,
which `ci.yml` correctly installs via `setup-node`. This had never
surfaced locally because the local dev environment already runs Node
v24. Confirmed no ADR or constitution pins a specific Node version (a
`docs/` grep for "Node" version references returned nothing), so this
is a tooling-config fix, not an architecture change: bumped `.nvmrc`
(`20` → `22`) and root `package.json`'s `engines.node` (`>=20.0.0` →
`>=22.12.0`), re-verified `pnpm install --frozen-lockfile` and `turbo
run lint typecheck test build` locally, committed (`fix(repo): bump
Node engine requirement to >=22.12.0`) and pushed. The third run
passed all 5 jobs:
[run 30753691637](https://github.com/amiyamishra1990-rgb/natkhat-ai/actions/runs/30753691637)
— `lint`, `typecheck`, `test`, `build`, `mobile` all green. This is
exactly the class of defect Milestone 10 exists to catch (real,
clean-room CI vs. a long-lived local dev environment with stale state)
— see Build Status.

Job names (`lint`, `typecheck`, `test`, `build`) were deliberately made
four separate jobs, not one job running the combined `turbo run lint
typecheck test build` command from §16's first bullet as a single
status check — this is a judgment call, not an unambiguous reading of
§16: the second bullet ("Required status checks on main: lint,
typecheck, test, build") names four independently-selectable check
names, which only exist as four distinct GitHub status checks if they
are four distinct jobs. Recorded here as an interpretation, not a
silent architecture decision.

**Branch protection on `main` is now configured and independently
verified**, completing the other half of Milestone 10. After all five
checks were confirmed passing with their exact real GitHub Actions
context names (`lint`, `typecheck`, `test`, `build`, `mobile` — read
directly from `gh pr checks`, not assumed from the YAML), applied:

```
gh api repos/amiyamishra1990-rgb/natkhat-ai/branches/main/protection \
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

Combines §16's required status checks with §17's "main protected,
required review + status checks." Verified by an independent `GET`
(not just trusting the `PUT` response) — the returned config matches
exactly: 5 required contexts, `strict: true` (branches must be
up-to-date before merging), `required_approving_review_count: 1`,
`enforce_admins: true`, force-push and branch deletion both disabled.
Also verified functionally, not just by reading config back: PR #1's
own `gh pr view` now reports `mergeStateStatus: BLOCKED` /
`reviewDecision: REVIEW_REQUIRED` — branch protection is actually
being enforced by GitHub, not just recorded as configured.

**Practical consequence worth flagging directly**: `enforce_admins:
true` means this is not bypassable by repo admins either — **the repo
owner cannot self-merge PR #1** (or any future PR) without at least one
approving review from a different account. `.github/CODEOWNERS` is
still a placeholder with no real reviewers assigned (Milestone 1), and
this is currently a single-maintainer repository, so as configured,
_nothing can be merged to `main` right now without either adding a
second collaborator to review, or the user deliberately relaxing
`required_approving_review_count`/`enforce_admins` themselves._ This
was not silently softened (e.g. by dropping `enforce_admins` or the
review requirement) because §17 explicitly calls for "required review

- status checks" and doing so unilaterally would be weakening
  governance this session wasn't asked to touch — surfaced instead so
  the user can make that call. PR #1 is left open, unmerged, for the
  user's own review/merge decision.

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
│   ├── prompts/                  # Milestone 11 — populated
│   │   ├── README.md
│   │   ├── draft-adr.md
│   │   ├── draft-module-doc.md
│   │   ├── run-review-pass.md
│   │   └── resume-milestone.md
│   ├── context/README.md
│   ├── context/agent-workflow.md
│   ├── sessions/README.md          # still a placeholder — not in Milestone 11's scope
│   └── reviews/README.md           # still a placeholder — not in Milestone 11's scope
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

- **PR [#1](https://github.com/amiyamishra1990-rgb/natkhat-ai/pull/1)
  is open, CI-green, but blocked on required review** —
  `enforce_admins: true` on the new branch protection means even the
  repo owner cannot self-merge it. Needs either a second collaborator
  to review/approve, or the user to deliberately relax
  `required_approving_review_count`/`enforce_admins` themselves (not
  done unilaterally here — see Current Status). This is not a Sprint
  01 blocker, just an immediate next action for the user.
- **Sprint 01 is complete. Sprint 02 has no approved Sprint Document
  yet** — `docs/sprints/` contains only `sprint-01.md`. Per
  `docs/sprints/sprint-01.md`, §27, Recommendation 1 ("every future
  sprint produces its own Sprint Document under this same chain"), the
  literal next actionable step is authoring and getting approval for
  `docs/sprints/sprint-02.md` (Proposal → Review → Decision, per
  `docs/engineering/change-request-process.md`) — not any specific
  implementation milestone, since none is recorded anywhere as Sprint
  02's Milestone Breakdown yet. If Sprint 02 is intended to implement
  ADR-0004 (database) or ADR-0005 (auth), Known Risks #1 and #2 below
  (data-privacy/compliance ADR, COPPA/GDPR-K target-audience
  ratification) are explicit prerequisites per the Risk Register
  (`docs/sprints/sprint-01.md`, §26) and must be addressed before, not
  during, that implementation.
- Unscheduled: `.ai/sessions/` and `.ai/reviews/` remain empty
  structural placeholders — Milestone 11 scoped only to
  `.ai/prompts/` per `docs/sprints/sprint-01.md`, §15's exact wording.
  `docs/engineering/checklists/ai-review-checklist.md` (line 31–33)
  reads as if session-log population was also part of Milestone 11;
  flagged, not resolved — needs a Change Request to assign, or a
  correction to that checklist's cross-reference.
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
- Milestone 10: **fully complete**, per `docs/sprints/sprint-01.md`,
  §15, §16, §17 — `.github/workflows/ci.yml` authored (five jobs:
  `lint`, `typecheck`, `test`, `build`, `mobile`); first commit
  `6ff7e44` pushed to the pre-existing, verified-empty
  `github.com/amiyamishra1990-rgb/natkhat-ai`; the real workflow
  triggered via PR #1 and, after fixing two real bugs it caught (a
  `pnpm-lock.yaml` specifier drift and a Node engine requirement too
  low for `@commitlint/cli@21`), all five jobs verified passing on
  GitHub; branch protection on `main` configured with the confirmed
  real check names and independently verified both by reading the
  config back and by observing PR #1 actually become merge-blocked.
  Also corrected a factual error in Milestone 9's own record
  (executable-bit concern; see that entry above and Change Log). No
  application code, business logic, database, auth, or product
  functionality touched; no architecture, ADR, or Constitution changed.
  PR #1 left open, unmerged, for the user's own review — see Pending
  Tasks.
- Milestone 11: authored four starter prompt templates in
  `.ai/prompts/` (`draft-adr.md`, `draft-module-doc.md`,
  `run-review-pass.md`, `resume-milestone.md`), per
  `docs/sprints/sprint-01.md`, §15; updated `.ai/prompts/README.md`
  from a structural placeholder to an active index. Documentation
  only — see Current Status for full detail, including a flagged (not
  resolved) forward-reference discrepancy in
  `docs/engineering/checklists/ai-review-checklist.md` about
  `.ai/sessions/`.
- Milestone 12: **Sprint 01 close-out, fully complete** — verified all
  eleven prior milestones (0, 1, 1.5, 2, 5, 6, 7, 8, 9, 10, 11) and
  confirmed no unresolved Sprint 01 blocker; re-validated the
  Definition of Done (`docs/sprints/sprint-01.md`, §15) locally
  (`pnpm install --frozen-lockfile`, `turbo run lint typecheck test
build` 5/5, `flutter analyze`/`flutter test` both clean); reviewed §27
  Recommendation 6 (domain boundaries, Knowledge Vault categories,
  `.ai/` structure) as a read-only confirmation — no structural change
  needed; updated this file's Current Status, Completed Tasks,
  Pending Tasks, Blockers, Known Risks framing, Repository Health, and
  Change Log to reflect Sprint 01 as 100% complete. Documentation
  only — no application code, architecture, ADR, or governance
  document touched. See Current Status for the full Sprint 01
  Completion Checklist.

## Blockers

**None. Sprint 01 is 100% complete** — all 12 Milestone Breakdown
entries satisfied (see Current Status, Sprint 01 Completion Checklist).
**One operational item needs the user's attention**, unrelated to
Sprint 01 completion: PR #1 is CI-green but merge-blocked by the branch
protection configured at Milestone 10 (`enforce_admins: true` + 1
required review, and this is currently a single-maintainer repo) — see
Pending Tasks/Current Status.

Known Risk #5 (missing Child Privacy & Safety Constitution) is resolved
as of Milestone 1.5 — see Known Risks below. Known Risks #6, #7, #8
(scope discrepancies) remain recorded as historical/resolved-by-precedent.
Known Risk #9 (branch protection blocked) is now **resolved** — see
Known Risks below. Known Risks #1–#4 remain open by design (Privacy,
Compliance, AI governance, ASPOVO Constitution placeholder) — Sprint 01
never required resolving them, but they gate specific future work (see
Known Risks below and Pending Tasks). Awaiting user approval before
Sprint 02 begins.

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
9. **Infrastructure — RESOLVED (2026-08-02, Milestone 10)** — branch
   protection on `main` was blocked (no remote, no commits) as of the
   prior session; the user explicitly approved unblocking it this
   session ("we will finish the blocked Git/GitHub portion"). First
   commit `6ff7e44` pushed to the pre-existing, verified-empty
   `github.com/amiyamishra1990-rgb/natkhat-ai`; real `ci.yml` triggered
   via PR #1 and verified green (after fixing two real bugs it caught —
   see Current Status/Change Log); branch protection configured with
   the confirmed real check names and independently verified (config
   read back via `GET`, and PR #1 observed to actually be
   merge-blocked). New operational item surfaced by this resolution,
   not itself a Sprint 01 risk: `enforce_admins: true` blocks even the
   repo owner from self-merging without a second reviewer — see
   Blockers/Pending Tasks.

## Repository Health

Foundation stage, now live on GitHub. Three tooling-config packages
(Milestone 7) and two application scaffolds — `apps/backend` (NestJS)
and `apps/mobile` (Flutter) — exist and are validated (Milestone 8),
with no business logic in either. Developer tooling — Husky,
lint-staged, commitlint — installed and validated (Milestone 9; the
executable-bit concern originally recorded against this milestone was
corrected at Milestone 10 — no action was actually needed).
`.github/workflows/ci.yml` authored, pushed, and verified green on real
GitHub Actions (Milestone 10) after fixing two real bugs it caught
(lockfile specifier drift; Node engine requirement). Branch protection
on `main` configured and independently verified. First commit `6ff7e44`
pushed to `github.com/amiyamishra1990-rgb/natkhat-ai` (public,
pre-existing). The `.ai/` workspace's `prompts/` folder is now
populated (Milestone 11) with four starter templates; `.ai/sessions/`
and `.ai/reviews/` remain empty placeholders, out of Milestone 11's
scope. **Sprint 01 (Repository Foundation) is now 100% complete**
(Milestone 12) — the Definition of Done was re-validated locally in
this session and matches Milestone 10's real GitHub Actions run. Known
Risks #5–#9 are resolved/historical; #1–#4 remain open by design (they
were never Sprint 01 exit criteria, but gate specific future work — see
Known Risks). One operational item outstanding, unrelated to Sprint 01
completion: PR #1 is CI-green but needs a second reviewer (or a
deliberate protection-rule change by the user) to merge.

## Major Decisions

- [ADR-0005](docs/decisions/ADR-0005-authentication.md) — Adopt Supabase Auth — Decision Recorded, Implementation Deferred
- [ADR-0004](docs/decisions/ADR-0004-database.md) — Adopt PostgreSQL (via Supabase) with Prisma — Decision Recorded, Implementation Deferred
- [ADR-0003](docs/decisions/ADR-0003-backend.md) — Adopt NestJS for the Backend Application
- [ADR-0002](docs/decisions/ADR-0002-flutter.md) — Adopt Flutter for the Mobile Application
- [ADR-0001](docs/decisions/ADR-0001-monorepo.md) — Adopt a Single Monorepo (Turborepo + pnpm Workspaces)

## Change Log

- **2026-08-03** — Milestone 12 (PROJECT.md final close-out) complete —
  **Sprint 01 is now 100% complete**: before implementing, verified
  (rather than assumed) that Milestones 0, 1, 1.5, 2, 5, 6, 7, 8, 9,
  10, and 11 are each recorded complete in this file's own Completed
  Tasks/Change Log, and confirmed no unresolved blocker prevents this
  close-out (the one open item, PR #1's merge-review block, is
  explicitly recorded elsewhere as "not a Sprint 01 blocker"). Per
  `docs/sprints/sprint-01.md`, §15's exact Milestone 12 definition
  ("PROJECT.md final close-out — Current Status, Completed Tasks, Next
  Actions updated to reflect the finished foundation"), updated exactly
  those fields plus Blockers, Repository Health, and Known Risks
  framing — no other file touched. Re-validated §15's Definition of
  Done directly rather than relying solely on Milestone 10's prior run:
  `pnpm install --frozen-lockfile` clean, `pnpm exec turbo run lint
typecheck test build` 5/5 (all cache-hit — no drift since Milestone
  10), `flutter analyze`/`flutter test` in `apps/mobile` both clean.
  Reviewed `docs/sprints/sprint-01.md`, §27, Recommendation 6 (revisit
  `docs/` domain boundaries, Knowledge Vault categories, `.ai/`
  structure before Sprint 02) as a read-only confirmation, not a
  redesign — Milestone 12 does not authorize structural change; found
  the structure held up in practice across all 12 milestones, with the
  Milestone 6 and Milestone 11 documentation-discrepancy precedents as
  the only two boundary frictions found, both already flagged and
  deferred to a Change Request rather than requiring a structural fix.
  Recorded a full twelve-row Sprint 01 Completion Checklist in Current
  Status. Confirmed no approved Sprint 02 Sprint Document exists yet
  (`docs/sprints/` contains only `sprint-01.md`); recommended, per §27
  Recommendation 1, that the literal next step is authoring
  `docs/sprints/sprint-02.md` through the Change Request Process, not
  any specific implementation milestone (none is recorded as Sprint
  02's Milestone Breakdown anywhere) — and flagged that Known Risks #1
  (privacy/compliance ADR) and #2 (COPPA/GDPR-K ratification) are
  explicit prerequisites, per the Risk Register (§26), if Sprint 02
  turns out to implement ADR-0004/ADR-0005. No application code,
  business logic, database, auth, or product functionality touched; no
  architecture, ADR, Constitution, or other governance document
  modified; no Sprint 02 planning performed — only this file. — AI
  agent (Claude Code), pending user review before Sprint 02.
- **2026-08-03** — Milestone 11 (`.ai/` workspace population) complete:
  confirmed the exact scope directly from `docs/sprints/sprint-01.md`,
  §15 ("`.ai/` workspace population (remaining) — starter prompt
  template(s) in `.ai/prompts/`") before implementing, per the AI
  Engineering Rule read-first sequence — the resume request's own
  wording matched §15 verbatim, so no mismatch needed surfacing this
  time (contrast Known Risks #6–#8, where prior resume requests did not
  match). Authored four starter prompt templates in `.ai/prompts/`:
  `draft-adr.md`, `draft-module-doc.md`, and `run-review-pass.md`
  formalize the three recurring tasks `.ai/prompts/README.md` already
  named before this milestone ("draft an ADR, draft a module doc, run a
  review pass"); `resume-milestone.md` generalizes the
  resume-and-implement-one-milestone pattern this Sprint's own Change
  Log shows repeated identically across all ten prior milestone
  sessions. Each template states it is non-authoritative
  (`docs/sprints/sprint-01.md`, §6) and points to the governing `docs/`
  document it summarizes rather than restating it. Updated
  `.ai/prompts/README.md` from a structural placeholder
  (`Version 1.0.0`) to an active index (`Version 1.1.0`) listing all
  four templates, matching the update pattern every prior milestone
  used for the `docs/` README it populated. Validated:
  `pnpm exec prettier --check .ai/prompts/*.md` (failed once on
  `README.md`'s table alignment, fixed with `--write` — table
  formatting only, no content change — then passed for all five files);
  a repo-wide grep for `.ai/prompts` confirmed no other document
  references the folder by path and needed updating. Flagged, not
  resolved: `docs/engineering/checklists/ai-review-checklist.md` (line
  31–33) reads as if `.ai/sessions/` population were also part of
  Milestone 11, but `docs/sprints/sprint-01.md`, §15's own Milestone 11
  definition names only `.ai/prompts/` — §15 was followed as the
  operative Milestone Breakdown, consistent with the Milestone 6
  precedent for resolving this class of documentation discrepancy;
  `.ai/sessions/` and `.ai/reviews/` remain empty placeholders, tracked
  in Pending Tasks. No application code, business logic, database,
  auth, or product functionality touched; no architecture, ADR, or
  Constitution changed; no governance document modified — only
  `.ai/prompts/` and this file. — AI agent (Claude Code), pending user
  review before Milestone 12.
- **2026-08-02** — Milestone 10 (CI foundation) **fully complete**:
  this session's request explicitly approved finishing the
  Git/GitHub-remote prerequisite that the prior session's Milestone 10
  work had left blocked. Before touching anything: verified the
  repository was safe to push — `git add -A --dry-run` listed exactly
  164 files (no `node_modules/`, `dist/`, `build/`, `.turbo/`,
  `coverage/`, `.dart_tool/`, Android/iOS build artifacts, or `.idea/`
  — all correctly gitignored, confirmed by both the file listing and
  direct `git check-ignore -v` tests, including one live test that
  created and removed a real `apps/backend/coverage/` directory to
  confirm the pattern actually works, not just reads correctly);
  filename- and content-scanned all 164 candidate files for secrets
  (`.env`, `.pem`/`.key`/`.keystore`/`.jks`, `local.properties`,
  `key.properties`, AWS/GitHub/Google/OpenAI/Slack token patterns) —
  none found, only the intentional placeholder `.env.example`; and
  confirmed via `gh repo list`/`gh api repos/.../branches` that
  `github.com/amiyamishra1990-rgb/natkhat-ai` already existed
  (created 2026-07-26 by the user, public) and was genuinely empty (0
  branches, 0 size, `pushed_at` == `created_at`) before pushing
  anything to it.

  Created the first commit, `6ff7e44` ("chore(repo): establish Sprint
  01 repository foundation (Milestones 0-10)"), through the real
  `pre-commit`/`commit-msg` hooks (no `--no-verify`) — lint-staged
  auto-fixed formatting on 91 matching files and ran ESLint on 6
  backend files with no errors, commitlint accepted the message
  cleanly. Added `origin` and pushed `main` directly (the standard
  bootstrap exception to GitHub Flow — there is no prior `main` to
  branch from for an empty repo). Since `ci.yml` only triggers on
  `pull_request`, opened
  [PR #1](https://github.com/amiyamishra1990-rgb/natkhat-ai/pull/1)
  from branch `chore/project-milestone-10-ci-verification` (scope
  `project`, per §17's convention for `PROJECT.md`-only changes) to
  exercise the real workflow — its content is limited to `PROJECT.md`
  tracking updates, per this session's explicit scope instruction.

  The first real run failed 4/5 jobs with `ERR_PNPM_OUTDATED_LOCKFILE`
  (`pnpm-lock.yaml` still had `workspace:^` for
  `@natkhat-ai/config-prettier` after that field was hand-edited to
  `workspace:*` at Milestone 9 without re-running `pnpm install`) —
  reproduced locally, fixed with `pnpm install`, committed and pushed.
  The second run failed the same 4 jobs with
  `ERR_PNPM_UNSUPPORTED_ENGINE` (`@commitlint/cli@21.2.1` requires Node
  `>=22.12.0`; `.nvmrc`/`engines.node` still targeted Milestone 1's
  Node 20 default, never caught locally because the local environment
  already runs Node v24) — confirmed no ADR/constitution pins a Node
  version, bumped `.nvmrc` and `engines.node` to `>=22.12.0`, verified,
  committed, and pushed. The third run passed all five jobs
  (`lint`, `typecheck`, `test`, `build`, `mobile`) — see
  [run 30753691637](https://github.com/amiyamishra1990-rgb/natkhat-ai/actions/runs/30753691637).
  Both fixes are real, narrowly-scoped tooling-config corrections, not
  architecture changes.

  Configured branch protection on `main` using the confirmed real
  check-context names (exact `gh api` command in Current Status),
  combining §16's required status checks with §17's required review.
  Verified two ways: an independent `GET` of the protection config
  (not just trusting the `PUT` response) matched exactly, and PR #1
  itself was observed to flip to `mergeStateStatus: BLOCKED` /
  `reviewDecision: REVIEW_REQUIRED` — proof GitHub is actually
  enforcing it, not just recording it. Flagged directly, not silently
  absorbed: `enforce_admins: true` means the repo owner cannot
  self-merge PR #1 (or anything else) without a second reviewer, given
  this is currently a single-maintainer repo with `CODEOWNERS` still a
  placeholder — this was not softened unilaterally, since §17
  explicitly calls for required review and loosening it wasn't asked
  for; left for the user to decide. PR #1 itself left open and
  unmerged — merging wasn't part of this session's explicit instruction
  set, and self-merging under freshly-set review rules would be an
  odd thing for the agent that just configured those rules to do
  unilaterally.

  No application code, business logic, database, auth, or product
  functionality touched; no architecture, ADR, Constitution, or
  approved governance document changed; no force-push, no deletion, no
  destructive git operation; only the two real bugs above and
  `PROJECT.md` tracking fields were modified. — AI agent (Claude Code),
  pending user review before Milestone 11 and before merging PR #1.

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

2026-08-03 — Milestone 12 (PROJECT.md final close-out) complete —
**Sprint 01 (Repository Foundation) is now 100% complete**, all 12
Milestone Breakdown entries satisfied per `docs/sprints/sprint-01.md`,
§15. Definition of Done re-validated locally (`pnpm install
--frozen-lockfile`, `turbo run lint typecheck test build` 5/5,
`flutter analyze`/`flutter test` both clean). Documentation only — only
`PROJECT.md` modified. No approved Sprint 02 Sprint Document exists
yet; recommended next step is authoring `docs/sprints/sprint-02.md`.
PR #1 (Milestone 10) remains open, unmerged, pending a second reviewer
or a user decision on the review requirement — unrelated to Sprint 01
completion.
