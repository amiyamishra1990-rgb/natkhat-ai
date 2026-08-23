# Natkhat AI — Product Constitution

**Version:** 1.2.0
**Status:** Ratified — governs all product-level decisions for Natkhat AI
**Owner:** Product Owner
**Last Updated:** 2026-08-23
**Position in Governance Hierarchy:** below the ASPOVO Constitution
(currently a placeholder — see
`docs/constitution/company/aspovo-constitution.md`), above the
Engineering Constitution, ADRs, PROJECT.md, and Sprint Documents. See
`docs/sprints/sprint-01.md`, §1, for the full hierarchy. Amended by the
[Child Privacy & Safety Constitution](./child-privacy-and-safety-constitution.md)
(Tier-1 amendment, same authority level as this document) — see
Constitutional Amendment section below.

## Mission

> Help parents raise kind, confident, curious, emotionally strong and
> future-ready children while creating meaningful childhood memories.

## Core Principles

These nine principles are binding on every product and engineering
decision made for Natkhat AI. They are recorded here exactly as
ratified. One-line definitions have not yet been authored and must not
be invented — a principle's name is its full current specification
until amended.

1. Human-first
2. Parent partnership
3. Better Human before Better Student
4. Childhood memories matter
5. Safe & Responsible AI
6. Long-term thinking
7. No addictive engagement
8. No replacing parents
9. AI should strengthen real-world family relationships

## Constitutional Amendment — Trust Above All (2026-07-29)

Added via the [Child Privacy & Safety Constitution](./child-privacy-and-safety-constitution.md)
(Tier-1 Product Constitution Amendment, APPROVED, CRITICAL priority).
Binding on every product, technical, and business decision, alongside
the nine Core Principles above:

> Parents trust Natkhat AI with what they value most—their child.
> Every technical, product, and business decision must protect that
> trust above growth, engagement, convenience, or revenue. Trust is
> our competitive advantage and must never be compromised.

## Constitutional Amendment — Google Cloud Migration (2026-08-23)

Founder-directed technology-decision change, recorded formally as
[ADR-0016](../../decisions/ADR-0016-firebase-auth-and-google-cloud-migration.md):
Natkhat AI migrates off Supabase entirely and onto Google Cloud, because
the founder already holds a Google Cloud billing subscription and wants
to consolidate spend there. This amends the Locked Technology Stack
table below — Authentication (Supabase Auth → Firebase Authentication),
Database hosting (via Supabase → Google Cloud, Cloud SQL for
PostgreSQL as the dev-instance candidate; the PostgreSQL/Prisma choice
itself is unchanged), and Cloud provider (formally recorded as Google
Cloud, superseding "Not yet recorded"). Storage is explicitly not part
of this amendment and remains Supabase Storage as originally locked,
pending a separate, explicit founder decision — see ADR-0016, Decision
item 4.

## Target Audience

**Not yet ratified.** No age range, demographic, or user classification
has been formally decided for Natkhat AI's children-facing product.
This is tracked as an open risk (see `docs/sprints/sprint-01.md`, Risk
Register — Privacy/Compliance rows) and must be resolved via a
dedicated ADR before any user data model, authentication, or
COPPA-relevant feature is designed or implemented.

## Locked Technology Stack

The following technology choices are locked for Natkhat AI. Each is
recorded formally in its corresponding ADR; implementation status
varies per ADR.

| Layer                          | Technology                   | Recorded in                                                                                                   |
| ------------------------------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Monorepo tooling               | Turborepo + pnpm workspaces  | ADR-0001                                                                                                      |
| Mobile application             | Flutter                      | ADR-0002                                                                                                      |
| Backend application            | NestJS                       | ADR-0003                                                                                                      |
| Admin application (Sprint 02+) | Next.js                      | Not yet recorded                                                                                              |
| Marketing website (Sprint 02+) | Next.js                      | Not yet recorded                                                                                              |
| Database                       | PostgreSQL, via Google Cloud | ADR-0004 (implementation deferred; hosting amended by ADR-0016)                                               |
| ORM                            | Prisma                       | ADR-0004 (decision recorded, implementation deferred)                                                         |
| Authentication                 | Firebase Authentication      | ADR-0016 (supersedes ADR-0005's authentication clause)                                                        |
| Storage                        | Supabase Storage             | ADR-0005 (decision recorded, implementation deferred; unaffected by ADR-0016 — see ADR-0016, Decision item 4) |
| Cloud provider                 | Google Cloud (GCP)           | ADR-0016                                                                                                      |
| CI/CD                          | GitHub Actions               | Not yet recorded                                                                                              |

No rationale beyond "locked" has been recorded for stack choices that
predate the ADR process; ADR-0001 through ADR-0005 supply rationale
going forward for the layers they cover. ADR-0016 (2026-08-23) amends
the Database and Authentication rows and formally records the Cloud
provider row, per the Constitutional Amendment above.

## Amendment

Changes to this constitution follow the Change Request Process
(Proposal → Review → Decision → ADR or Decision Log → PROJECT.md
update → Implementation; full process documented in
`docs/engineering/change-request-process.md` once authored). No
principle, mission wording, or stack decision here may be changed by a
lower layer (an ADR, PROJECT.md, or a Sprint Document) — only by an
explicit amendment at this layer.
