# Sprint 01 — Repository Foundation

**Version:** 1.0.0
**Status:** Approved — in execution
**Owner:** Product Owner
**Last Updated:** 2026-07-28
**Phase:** Governance Documentation Foundation — complete, awaiting
user review. Milestone 1 (Root Repository Scaffold) not yet started.
**Origin:** durable, dated record of the approved architecture plan
(originally drafted as plan revision v4, approved 2026-07-28).

## Context

This sprint establishes the Governance Hierarchy and repository
foundation for Natkhat AI — nothing else. It:

1. Places `PROJECT.md` correctly inside the governance chain — it is
   not a peer of the Constitution/ADR layers, and it is not the last
   word either. It sits between "decisions have been made" (ADRs) and
   "here's what we're doing about it this sprint" (Sprint Documents),
   summarizing state without ever overriding anything above it.
2. Adds the infrastructure that keeps that chain from decaying: a
   Knowledge Vault (so lessons survive individual engineers), a
   lightweight Decision Log (so not every small call needs a full
   ADR), a formal Change Request Process (so drift can't happen
   silently), and reusable Engineering Checklists (so the standards in
   the constitution are actually checked, not just read).
3. Locks in the long-term engineering standards that were previously
   implied but not written down: feature flags, observability,
   security-by-design, a full testing taxonomy, and versioning —
   documented now, before any code exists, exactly so a future
   engineer or AI agent never has to guess what "good" looks like.
4. Separates AI-agent operational artifacts from engineering
   knowledge via a root-level `.ai/` workspace, and makes explicit the
   sequence every AI agent must follow before writing a single line of
   code.

This is Sprint 01 in scope — foundation and governance only. No
database, auth, storage, or product features.

---

## 1. Governance Hierarchy

The authoritative chain, top to bottom:

```
ASPOVO Constitution          (placeholder — docs/constitution/company/)
        ↓
Product Constitution         (docs/constitution/product/)
        ↓
Engineering Constitution     (docs/constitution/engineering/)
        ↓
Architecture Decision Records (docs/decisions/*.md)
        ↓
PROJECT.md                   (root — live summary of current state)
        ↓
Sprint Documents              (docs/sprints/sprint-0X.md)
        ↓
Implementation                (apps/, packages/)
```

Rules that make this enforceable rather than aspirational:

- Each layer may only be **authored** at its own level. `PROJECT.md`
  never originates a decision — it reflects ADRs and Decision Log
  entries that already exist above it.
- **`PROJECT.md` summarizes current state. It never overrides a
  Constitution or an ADR.** If `PROJECT.md` and an ADR ever disagree,
  the ADR is correct and `PROJECT.md` is wrong — fix `PROJECT.md`, not
  the ADR.
- **Sprint Documents** are the concrete, dated execution plan for one
  sprint — this document is that plan for Sprint 01. `PROJECT.md`
  always points at the current one; old sprint documents are never
  deleted, only superseded by the next sprint's document.
- **Implementation** must trace to a Sprint Document; a Sprint
  Document must not schedule anything that contradicts an ADR; an ADR
  must not contradict the Engineering Constitution; and nothing may
  contradict the Product or ASPOVO Constitution. Any exception
  requires an explicit amendment at the correct layer — never a
  workaround at a lower one.

---

## 2. PROJECT.md Strategy (Dashboard)

**Location:** repository root — `natkhat-ai/PROJECT.md`. First file
every human or AI agent reads before doing anything else (see §25, AI
Engineering Rule).

**Role:** a live, read-only-in-spirit summary of current state. It
links to the documents that are the actual authority on each topic; it
does not restate or override them (§1).

**Full required section list:**

| Section                             | Content                                                       | Authoritative source                                   |
| ----------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------ |
| Project Vision                      | One-paragraph vision                                          | `docs/constitution/product/`                           |
| Mission                             | Verbatim mission statement                                    | `docs/constitution/product/natkhat-ai-constitution.md` |
| Current Development Phase           | e.g. "Sprint 01 — Repository Foundation"                      | live field                                             |
| Current Sprint                      | Sprint number + name + link to its Sprint Document            | `docs/sprints/sprint-0X.md`                            |
| Sprint Goal                         | One-sentence goal for the active sprint                       | current Sprint Document                                |
| Current Milestone                   | Which milestone is in progress                                | current Sprint Document                                |
| Current Branch                      | The branch this state reflects (usually `main`)               | live field                                             |
| Current Release                     | Version tag, or "pre-release — no deployable environment yet" | `docs/engineering/versioning.md`                       |
| Build Status                        | Pass/fail of the latest `main` CI run                         | GitHub Actions                                         |
| Current Status                      | Freeform status line, updated per PR                          | live field                                             |
| Repository Structure                | High-level tree                                               | §4 Folder Structure                                    |
| Approved Architecture               | One paragraph + link                                          | `docs/architecture/overview.md`                        |
| Approved Tech Stack                 | The locked list                                               | `docs/constitution/product/`                           |
| Product Constitution References     | Links only                                                    | `docs/constitution/product/`                           |
| Engineering Constitution References | Links only                                                    | `docs/constitution/engineering/`                       |
| ADR Index                           | Table: ADR number, title, status                              | `docs/decisions/`                                      |
| Last Decision                       | The most recent ADR or Decision Log entry, one line           | `docs/decisions/decision-log.md` or latest ADR         |
| Feature Roadmap                     | Link, or "not yet started"                                    | `docs/product/`                                        |
| Pending Tasks / Next Tasks          | Short list, current sprint only                               | current Sprint Document                                |
| Completed Tasks                     | Short list, current sprint only                               | current Sprint Document                                |
| Blockers                            | Anything stalling progress, or "none"                         | live field                                             |
| Known Risks                         | Top 3–5 active risks, link to full register                   | §26 Risk Register                                      |
| Repository Health                   | Qualitative: CI status, doc staleness, open blockers count    | live field                                             |
| Major Decisions                     | One-line summary per ADR, newest first                        | `docs/decisions/`                                      |
| Change Log                          | Dated entries: what changed in PROJECT.md and why             | append-only, oldest at bottom                          |
| Last Updated                        | Date + PR link of the most recent edit to this file           | live field                                             |

**Update discipline:**

- Updated in the _same PR_ that changes sprint status, completes a
  milestone, adds an ADR/Decision Log entry, or introduces a blocker.
- Never the place a decision is made — only where it's reflected.
- Reviewed for staleness at the start of every sprint.
- Opens with a banner: `> Read this file first. This summarizes
current state — it never overrides docs/constitution/ or
docs/decisions/. If they disagree, those win; file a correction
here.`

---

## 3. Repository Architecture

Single monorepo (`natkhat-ai/`), Turborepo over pnpm workspaces. Only
the apps, packages, and governance scaffolding needed for Sprint 01
exist — nothing is built speculatively.

```
natkhat-ai/
├── PROJECT.md            # root dashboard — §2
├── apps/                 # only mobile + backend in Sprint 01
├── packages/              # only foundational config packages in Sprint 01
├── docs/                  # constitution, decisions, architecture, api, engineering,
│                          #   product, research, knowledge, modules, sprints
├── .ai/                   # AI agent workspace — §6, kept separate from docs/
├── infrastructure/         # placeholders only — no real IaC until a deployable target exists
├── scripts/               # repo bootstrap + repo-hygiene automation
└── .github/                # CI foundation, no deploy pipelines yet
```

---

## 4. Folder Structure (target — full Sprint 01 scope)

This is the full target structure for Sprint 01. As of this document's
last update, only the Governance Documentation Foundation (Constitution,
Decisions, Knowledge Vault, Sprint Document, `.ai/` workspace) has been
created — see §15 Milestone Breakdown and PROJECT.md for current status.
Everything else below (`apps/`, `packages/`, `docs/architecture/`,
`docs/api/`, `docs/engineering/`, `docs/product/`, `docs/research/`,
`docs/modules/`, `infrastructure/`, `scripts/`, `.github/`, and the root
tooling config files) is created starting at Milestone 1.

```
natkhat-ai/
├── PROJECT.md                            # CREATED
│
├── apps/                                 # NOT YET CREATED — Milestone 8
│   ├── mobile/                        # Flutter scaffold only
│   └── backend/                       # NestJS scaffold only
│   # apps/admin, apps/website: Sprint 02
│
├── packages/                             # NOT YET CREATED — Milestone 7
│   ├── config-typescript/
│   ├── config-eslint/
│   └── config-prettier/
│   # types/, ui/, utils/, api-client/, content-safety/ deferred — §12
│
├── docs/
│   ├── README.md                       # NOT YET CREATED — Milestone 1
│   │
│   ├── constitution/                   # permanent — §1 — CREATED
│   │   ├── company/aspovo-constitution.md          # placeholder, ratified as a stub
│   │   ├── product/natkhat-ai-constitution.md
│   │   └── engineering/engineering-constitution.md
│   │
│   ├── decisions/                      # ADRs + Decision Log — §8, §9 — CREATED
│   │   ├── ADR-0001-monorepo.md
│   │   ├── ADR-0002-flutter.md
│   │   ├── ADR-0003-backend.md
│   │   ├── ADR-0004-database.md
│   │   ├── ADR-0005-authentication.md
│   │   └── decision-log.md             # lightweight, append-only, non-architectural decisions
│   │
│   ├── architecture/                   # NOT YET CREATED — Milestone 1 (overview.md), Milestone 6 (observability.md)
│   │   ├── overview.md
│   │   └── observability.md            # §21 — philosophy, not implementation
│   │
│   ├── api/                             # NOT YET CREATED — Milestone 1
│   │   └── README.md                   # placeholder until backend has endpoints
│   │
│   ├── engineering/                    # NOT YET CREATED — Milestone 6 — how-tos implementing the Engineering Constitution
│   │   ├── coding-standards.md
│   │   ├── branching-and-commits.md
│   │   ├── release-strategy.md
│   │   ├── dependency-management.md
│   │   ├── environment-management.md
│   │   ├── testing-strategy.md         # §23 — expanded taxonomy
│   │   ├── code-review-workflow.md
│   │   ├── ci-cd.md
│   │   ├── change-request-process.md   # §10
│   │   ├── feature-flags.md            # §19
│   │   ├── security-by-design.md       # §21
│   │   ├── versioning.md               # §24
│   │   └── checklists/                 # §19
│   │       ├── repository-checklist.md
│   │       ├── sprint-checklist.md
│   │       ├── pull-request-checklist.md
│   │       ├── release-checklist.md
│   │       ├── security-checklist.md
│   │       ├── production-checklist.md
│   │       └── ai-review-checklist.md
│   │
│   ├── product/                        # NOT YET CREATED — Milestone 1 — product management docs, not the constitution
│   │   └── README.md
│   │
│   ├── research/                       # NOT YET CREATED — Milestone 1 — user/competitive research
│   │   └── README.md
│   │
│   ├── knowledge/                      # Knowledge Vault — §7 — CREATED
│   │   ├── README.md
│   │   ├── lessons-learned/
│   │   ├── performance-findings/
│   │   ├── security-discoveries/
│   │   ├── flutter-best-practices/
│   │   ├── nestjs-best-practices/
│   │   ├── supabase-findings/
│   │   ├── developer-onboarding/
│   │   └── ai-agent-learnings/
│   │
│   ├── modules/                        # NOT YET CREATED — Milestone 1 (TEMPLATE.md only) — Product Module Registry, §13, empty in Sprint 01
│   │   └── TEMPLATE.md                 # Vision/Requirements/Architecture/APIs/Database/Security/Testing/Deployment
│   │
│   └── sprints/                        # Sprint Documents — §1 — CREATED
│       └── sprint-01.md                # this document
│
├── .ai/                                 # AI agent workspace — §6 — CREATED
│   ├── prompts/                         # reusable prompt templates
│   ├── context/                         # curated, agent-consumable summaries
│   │   └── agent-workflow.md            # AI Engineering Rule (§25)
│   ├── sessions/                        # append-only log of AI working sessions
│   └── reviews/                         # AI-generated review reports
│
├── infrastructure/                       # NOT YET CREATED — Milestone 1 (placeholders only)
│   ├── gcp/
│   ├── supabase/
│   └── docker/
│
├── scripts/                              # NOT YET CREATED — Milestone 1
│   ├── setup.sh
│   └── check-env.ts
│
├── .github/                              # NOT YET CREATED — Milestone 10 (workflows), Milestone 1 (templates)
│   ├── workflows/ci.yml
│   ├── CODEOWNERS
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE/
│
├── turbo.json                            # NOT YET CREATED — Milestone 1
├── pnpm-workspace.yaml                   # NOT YET CREATED — Milestone 1
├── package.json                          # NOT YET CREATED — Milestone 1
├── .npmrc / .nvmrc / .editorconfig / .gitignore / .env.example   # NOT YET CREATED — Milestone 1
└── README.md                            # NOT YET CREATED — Milestone 1 — short, points to PROJECT.md and docs/README.md
```

---

## 5. Documentation Strategy

Ten non-overlapping domains under `docs/`, plus one sibling directory
outside `docs/` entirely for AI artifacts:

| Domain          | Purpose                                                     | Changes how often                 | Status          |
| --------------- | ----------------------------------------------------------- | --------------------------------- | --------------- |
| `constitution/` | Permanent, non-negotiable decisions                         | Rarely, deliberate amendment only | Created         |
| `decisions/`    | ADRs (major) + Decision Log (minor)                         | Append-only                       | Created         |
| `architecture/` | Living technical design, incl. observability philosophy     | As the system evolves             | Not yet created |
| `api/`          | API contracts/reference                                     | As endpoints are added            | Not yet created |
| `engineering/`  | Practical how-tos, checklists, process docs                 | As tooling/process evolves        | Not yet created |
| `product/`      | Roadmaps, feature specs                                     | Frequently                        | Not yet created |
| `research/`     | User/competitive research                                   | As research happens               | Not yet created |
| `knowledge/`    | Knowledge Vault — reusable lessons that outlive individuals | Continuously, additive            | Created         |
| `modules/`      | Registry/template for future product modules                | Empty until Sprint 02+            | Not yet created |
| `sprints/`      | Sprint Documents, one per sprint                            | One new file per sprint           | Created         |

`.ai/` (root-level, **not** under `docs/`): AI-agent operational
artifacts — prompts, context bundles, session logs, review reports.
Created. Kept separate on purpose — `docs/` is human/engineering
knowledge that must remain durable and authoritative; `.ai/` is working
scaffolding for how agents operate, and may be regenerated or pruned
without touching the knowledge base.

---

## 6. AI Agent Workspace (`.ai/`)

| Folder      | Purpose                                                                                                                                               |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prompts/`  | Reusable prompt templates for recurring agent tasks — keeps agent output consistent across sessions and providers                                     |
| `context/`  | Curated, condensed summaries meant for agent consumption (e.g. `agent-workflow.md`) — distinct from `docs/`, which is written for humans first        |
| `sessions/` | Append-only log of AI working sessions: what was done, when, which PR it produced — an audit trail, directly mitigating the AI-governance risk in §26 |
| `reviews/`  | AI-generated review reports, kept for traceability, not for authoring new decisions                                                                   |

Rule: nothing in `.ai/` is authoritative. If an agent's session notes
or generated context ever conflict with `docs/`, `docs/` wins. `.ai/`
describes _how agents work_, not _what is true about the system_.

---

## 7. Knowledge Vault (`docs/knowledge/`)

Purpose: capture reusable engineering knowledge that would otherwise
be lost when an individual engineer moves on or a session ends —
lessons learned, performance findings, security discoveries,
framework-specific best practices (Flutter, NestJS, Supabase),
developer onboarding notes, and AI agent learnings.

- Structured as one subfolder per knowledge category; each entry is a
  short, dated markdown note — not a formal document requiring review,
  just a durable record.
- Distinct from `engineering/` (which documents _standards_) and
  `decisions/` (which documents _why a choice was made_) — the
  Knowledge Vault documents _what was learned by doing_.
- Created empty at Sprint 01 start except for a README per subfolder;
  content accumulates naturally as Sprint 01 execution happens.

---

## 8. ADR Strategy

`docs/decisions/ADR-00XX-*.md`, immutable once accepted (superseded,
never rewritten). Format: Title, Status, Context, Decision,
Consequences, Constitution alignment.

**Initial ADR set for Sprint 01 (created):** ADR-0001 Monorepo,
ADR-0002 Flutter, ADR-0003 Backend, ADR-0004 Database (decision
recorded, implementation deferred), ADR-0005 Authentication (decision
recorded, implementation deferred).

**ADR vs. Decision Log split (§9):** an ADR is reserved for decisions
that are architectural, hard to reverse, or affect more than one
app/package. Everything smaller goes in the Decision Log instead, so
ADRs stay few and weighty.

---

## 9. Decision Log

`docs/decisions/decision-log.md` — a single append-only markdown file
for small implementation decisions that don't warrant a full ADR.

- One entry per decision: date, one-line decision, one-line
  rationale, author.
- `PROJECT.md`'s "Last Decision" field points at whichever is more
  recent — an ADR or a Decision Log entry.
- Escalation rule: if a Decision Log entry turns out to have
  architectural consequences after all, it gets promoted to a full
  ADR that references the original log entry — the log entry itself
  is never deleted or rewritten.

---

## 10. Change Request Process

Formal flow for any proposed change, to prevent undocumented
architectural drift:

```
Proposal → Review → Decision → ADR (if major) or Decision Log (if minor)
        → PROJECT.md update → Implementation
```

To be documented in full at `docs/engineering/change-request-process.md`
(Milestone 6, not yet created). Interim summary:

- **Proposal**: a short written description (a GitHub issue or PR
  description is sufficient).
- **Review**: at least one other engineer (or an AI agent that has
  completed the read-first sequence, §25) evaluates it against the
  Governance Hierarchy (§1).
- **Decision**: accept, reject, or request changes — recorded as an
  ADR or a Decision Log entry depending on weight (§8/§9).
- **PROJECT.md update**: same PR, per the update discipline in §2.
- **Implementation**: only after the above steps.

---

## 11. Monorepo Strategy

- **pnpm workspaces** (`apps/*`, `packages/*`) define the graph.
- **Turborepo** (`turbo.json`) orchestrates `lint`, `typecheck`,
  `test`, `build`, `dev`. Sprint 01's graph is small (backend + 3
  config packages) — this proves pipeline shape, not scale.
- Flutter (`apps/mobile`) is a Turborepo _task_, never a
  dependency-graph member.
- Remote caching deferred until Sprint 02+ triples the graph size.

---

## 12. Shared Package Strategy

Only three packages in Sprint 01, all tooling-config:

| Package                                                | Include in Sprint 01? | Rationale                                                  |
| ------------------------------------------------------ | --------------------- | ---------------------------------------------------------- |
| `config-typescript`                                    | Yes                   | Needed immediately by `backend`; avoids retrofitting later |
| `config-eslint`                                        | Yes                   | One shared lint standard from day one                      |
| `config-prettier`                                      | Yes                   | One shared formatting standard from day one                |
| `types`, `ui`, `utils`, `api-client`, `content-safety` | **No**                | No second consumer or real need yet                        |

---

## 13. Product Module Registry (`docs/modules/`)

Reserved, currently empty except for `docs/modules/TEMPLATE.md` (not
yet created — Milestone 1), which defines the fixed structure every
future product module will follow: **Vision, Requirements,
Architecture, APIs, Database, Security, Testing, Deployment.**

- No modules exist yet — Sprint 01 has no business features (§14).
- A module's docs, once created, become the thing its own ADRs and
  Sprint Documents reference — same hierarchy, scoped to that module.

---

## 14. Sprint 01 Roadmap

**Explicitly excluded:** PostgreSQL integration, Prisma
implementation, Authentication implementation, Storage
implementation, business modules, product features, `apps/admin`,
`apps/website`, any deploy pipeline.

**Explicitly included — repository foundation and governance only:**

- `PROJECT.md` (dashboard)
- Governance Hierarchy populated: ASPOVO (placeholder)/Product/
  Engineering constitutions, ADR set, Decision Log, Change Request
  Process
- Knowledge Vault, Module Registry template, first Sprint Document
  (this file)
- `.ai/` workspace scaffolded
- Repository initialization, monorepo tooling, shared config packages
- Folder structure (all ten `docs/` domains + `.ai/`)
- Developer tooling (Husky, lint-staged, commitlint, EditorConfig)
- CI/CD foundation (lint/typecheck/test/build only)
- Engineering standards fully documented: checklists, feature-flag
  philosophy, observability philosophy, security-by-design, testing
  strategy, versioning strategy — documented now, implemented later
- Flutter application scaffold, NestJS scaffold — no business logic

---

## 15. Milestone Breakdown

0. **Governance Documentation Foundation** _(pre-Milestone-1,
   completed 2026-07-28)_ — `PROJECT.md`, Constitutions (ASPOVO
   placeholder, Product, Engineering), ADR-0001–0005, Decision Log,
   Knowledge Vault, `.ai/` workspace, and this Sprint Document.
1. **Root scaffolding** — git init, workspace/tooling config files,
   remaining `docs/` domain directories (`architecture/`, `api/`,
   `engineering/`, `product/`, `research/`, `modules/`) with
   placeholder READMEs.
2. **Governance population (remaining)** — `change-request-process.md`
   written in full.
3. **PROJECT.md close-out of this phase** — already created in
   Milestone 0; revisited here only if Milestone 1 scaffolding changes
   any dashboard field.
4. _(superseded by Milestone 0 — this Sprint Document is already
   created)_
5. **Module Registry scaffolding** — `docs/modules/TEMPLATE.md`.
6. **Engineering standards docs** — checklists (7 files),
   feature-flags.md, security-by-design.md, testing-strategy.md,
   versioning.md, observability.md — each referencing the Engineering
   Constitution.
7. **Shared config packages** — `config-typescript`, `config-eslint`,
   `config-prettier`, validated against a trivial dummy consumer.
8. **App scaffolds** — `flutter create` for `apps/mobile`; `nest new`
   for `apps/backend`; both wired to shared config where applicable;
   both run/build with no business logic.
9. **Developer tooling** — Husky, lint-staged, commitlint.
10. **CI foundation** — `ci.yml` (lint/typecheck/test/build,
    Turborepo-filtered); branch protection on `main`.
11. **`.ai/` workspace population (remaining)** — starter prompt
    template(s) in `.ai/prompts/`.
12. **PROJECT.md final close-out** — Current Status, Completed Tasks,
    Next Actions updated to reflect the finished foundation.

**Definition of done:** a new engineer or AI agent clones the repo,
reads `PROJECT.md` → Constitution → ADRs → the current Sprint Document
(per §25), then runs one setup script and gets `apps/backend` running
locally and `apps/mobile` building, with CI green on a trivial PR.
Every standard referenced in this plan (testing, security,
observability, feature flags, versioning) is documented and
discoverable, even though none is implemented yet. No database, auth,
storage, or feature code exists.

---

## 16. CI/CD Strategy

- **`ci.yml`** on every PR: pnpm install (cached) → `turbo run lint
typecheck test build`, Turborepo-filtered to changed packages.
- Flutter checks (`flutter analyze`, `flutter test`) in the same
  workflow, gated on `apps/mobile/**` changes.
- No deploy workflows in Sprint 01 — deferred until a real deploy
  target exists.
- Required status checks on `main`: lint, typecheck, test, build.

---

## 17. Branching Strategy

- **GitHub Flow**: `main` protected, required review + status checks.
- Branch naming: `feat/`, `fix/`, `chore/`, `docs/` prefixes with a
  scope (`mobile`, `backend`, a package name, `repo`, or `project` for
  `PROJECT.md`-only changes).
- Mobile release branches (`release/mobile-vX.Y.Z`) documented now,
  used once there's a real app to release.
- Conventional Commits enforced via commitlint from day one.

---

## 18. Engineering Standards (Engineering Constitution)

See `docs/constitution/engineering/engineering-constitution.md` for
the full, binding table. Two rows are new relative to the original
implied standards: **Feature flag philosophy** (§19) and **Security by
design** (§21).

---

## 19. Engineering Checklists (`docs/engineering/checklists/`)

Not yet created (Milestone 6). Seven reusable checklists planned:
Repository, Sprint, Pull Request, Release, Security, Production, and
AI Review checklists.

---

## 20. Feature Flag Philosophy

To be documented in full at `docs/engineering/feature-flags.md`
(Milestone 6). Interim standard: all unfinished or unstable
functionality ships behind a feature flag — never exposed to real
users by default. No feature-flag system is implemented in Sprint 01
(no features exist yet).

---

## 21. Observability Philosophy

To be documented in full at `docs/architecture/observability.md`
(Milestone 6). Covers logging, metrics, tracing, audit events, error
reporting, monitoring, and health checks — documented as a standard
now so it's implemented consistently later, not invented under
deadline pressure.

---

## 22. Security by Design

To be documented in full at `docs/engineering/security-by-design.md`
(Milestone 6). Covers least privilege, secrets management, data
encryption, PII handling, child privacy (a dedicated, stricter tier
above general PII handling), audit logging, dependency scanning, SBOM,
and vulnerability management. Sprint 01 delivers this as
**documentation only** in Milestone 6 — no scanning tooling yet.

---

## 23. Testing Strategy

To be documented in full at `docs/engineering/testing-strategy.md`
(Milestone 6). Full taxonomy: Unit, Widget, Integration, API,
End-to-end, Performance, Accessibility, Security, Regression. Sprint
01 applies only Unit/Widget minimally, to prove the scaffolds work.

---

## 24. Versioning Strategy

To be documented in full at `docs/engineering/versioning.md`
(Milestone 6). Covers repository version, API version, database
version (Prisma migration history, post–Sprint 01), mobile version,
release version, and migration strategy.

---

## 25. AI Engineering Rule

Every AI agent — Claude, ChatGPT, Gemini, Codex, or any future ASPOVO
AIOS agent — must follow this sequence before generating code, with no
step skipped:

```
Read PROJECT.md
   ↓
Read the Constitution (ASPOVO → Product → Engineering)
   ↓
Read the relevant ADRs
   ↓
Read the current Sprint Document
   ↓
Read the assigned module's docs (once modules exist, §13)
   ↓
Only then generate code
```

- Written in two places: as the opening banner logic in `PROJECT.md`
  (§2) for human-readable enforcement, and in
  `.ai/context/agent-workflow.md` (created) for machine-readable/
  agent-consumed enforcement.
- Also a named row in the Engineering Constitution (§18).
- Sprint 01 enforces this by convention and PR review (the AI Review
  checklist, once authored, includes a line item confirming the
  sequence was followed) — not by automated tooling yet.

---

## 26. Risk Register

| Category               | Risk                                                                                          | Impact                                                                                                            | Recommendation                                                                                                                                                          |
| ---------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Technical              | Flutter doesn't fit pnpm/Turborepo's dependency graph natively                                | Mobile tooling drifts from JS conventions                                                                         | Treat mobile as a Turborepo task, not a graph member (§11); documented in ADR-0002                                                                                      |
| Technical              | Sprint 01 foundation decisions are expensive to reverse later                                 | Costly rework                                                                                                     | Keep Sprint 01 strictly to foundation (§14)                                                                                                                             |
| Security               | Secrets sprawl once GCP/Supabase/CI are all in play                                           | Leaked credentials                                                                                                | GCP Secret Manager as single source of truth (§22, once documented)                                                                                                     |
| Privacy                | Child/family data handling designed reactively once Postgres/Auth work starts                 | Legal/reputational exposure                                                                                       | Data-privacy ADR + compliance doc required _before_ ADR-0004/0005 are implemented; tracked as a Blocker in `PROJECT.md` when that sprint begins                         |
| Child safety           | AI-touching features built before `content-safety` guardrails exist                           | "Safe & Responsible AI" principle violated before a review checkpoint exists                                      | No AI-mediated feature merges without a `content-safety` package or equivalent ADR (§12); AI Review checklist (§19, once authored) as a gate                            |
| Compliance             | COPPA/GDPR-K-equivalent obligations treated as a later add-on                                 | Regulatory risk                                                                                                   | Compliance ADR required before any real user data model (ties to ADR-0004, §22 PII/child-privacy standard); target audience not yet ratified (see Product Constitution) |
| Scalability            | Monorepo CI time grows unbounded as Sprint 02+ adds apps                                      | Slower feedback loops                                                                                             | Turborepo `--filter`-scoped CI from Sprint 01 (§16); revisit remote caching when the graph triples                                                                      |
| Developer productivity | Sprint 01's documentation surface is large relative to its 2-app code scope                   | Sprint 01 timeline risk if treated as "just scaffolding"                                                          | Explicitly timebox/resource Sprint 01 as a documentation-heavy foundation sprint                                                                                        |
| AI governance          | "No addictive engagement" / "Safe & Responsible AI" remain slogans with no engineering teeth  | Principle-washing                                                                                                 | Governance Hierarchy (§1) requires every ADR touching user-facing/AI behavior to state principle alignment; AI Engineering Rule (§25) gates agent behavior              |
| AI governance          | AI agents skip the read-first sequence (§25) and generate code against stale or wrong context | Contradicts prior decisions the agent never saw                                                                   | AI Review checklist (§19, once authored) explicitly checks the sequence was followed; `.ai/sessions/` provides an audit trail                                           |
| Governance/process     | Constitution or ADRs edited silently to match whatever was already built                      | Loss of institutional decision trail                                                                              | Append-only ADRs, explicit-amendment-only constitution changes (§8)                                                                                                     |
| Governance/process     | `PROJECT.md` drifts out of sync with reality or becomes a competing source of truth           | Agents/engineers act on stale/wrong context                                                                       | Same-PR update discipline (§2); precedence banner; staleness review every sprint                                                                                        |
| Governance/process     | Decision Log becomes a dumping ground that should have been ADRs, or vice versa               | Either loses the weight of real architectural decisions, or over-formalizes trivial ones                          | Clear escalation rule (§9): promote to ADR the moment a "small" decision turns out to have architectural consequences                                                   |
| Governance/process     | ASPOVO Constitution remains a placeholder indefinitely                                        | Product Constitution has no company-level backstop; any future ASPOVO-level conflict has nothing to check against | Track as an open item; the placeholder must be explicitly replaced via amendment, not silently forgotten                                                                |

---

## 27. Recommendations

1. Adopt the full Governance Hierarchy (§1) as permanent — every
   future sprint produces its own Sprint Document under this same
   chain.
2. Root scaffolding (Milestone 1) begins only after this Governance
   Documentation Foundation (Milestone 0) is reviewed and approved.
3. Confirm the Sprint 01 documentation load remains acceptable before
   Milestone 6 — this sprint adds five new standard documents, seven
   checklists, a Knowledge Vault, a Module Registry, and an AI
   workspace as permanent infrastructure.
4. Keep `PROJECT.md` a dashboard, not an authoring surface — decisions
   go through ADRs or the Decision Log first (§8, §9).
5. Treat the AI Engineering Rule (§25) as binding on this very
   documentation process.
6. Revisit `docs/` domain boundaries, the Knowledge Vault's category
   list, and `.ai/` structure at the end of Sprint 01 to confirm they
   held up in practice before Sprint 02 adds real product modules.
7. Resolve the ASPOVO Constitution placeholder and the Product
   Constitution's unratified Target Audience section before any
   COPPA-relevant work begins — both are tracked in the Risk Register
   above.

---

## Next Step

Governance Documentation Foundation is complete: `PROJECT.md`,
Constitutions (ASPOVO placeholder, Product, Engineering), ADR-0001
through ADR-0005, Decision Log, Knowledge Vault, `.ai/` workspace, and
this Sprint Document. No application source code, packages, or
scaffolding has been created. On explicit approval, Sprint 01
execution continues with Milestone 1 — Root Repository Scaffold.
