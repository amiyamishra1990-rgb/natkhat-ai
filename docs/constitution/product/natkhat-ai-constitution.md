# Natkhat AI — Product Constitution

**Version:** 1.4.0
**Status:** Ratified — governs all product-level decisions for Natkhat AI
**Owner:** Product Owner
**Last Updated:** 2026-08-31
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

## Constitutional Amendment — Storage and CI/CD (2026-08-31)

Founder-directed governance-sync correction, made as part of
`docs/sprints/sprint-05.md`'s Milestone 24 (Sprint 04 Close-Out &
Governance Sync), recording two Founder Decisions (G.3, G.4):

- **Storage.** Founder Decision G.4 resolves the open item the Google
  Cloud Migration amendment above (2026-08-23) deliberately left open:
  Storage moves to Google Cloud Storage, superseding the Supabase
  Storage decision originally locked by ADR-0005, recorded as a dated
  amendment to [ADR-0016](../../decisions/ADR-0016-firebase-auth-and-google-cloud-migration.md)
  ("Amendment — Storage (2026-08-31)"). This is a documentation decision
  only — no Storage implementation code exists anywhere in this
  repository, and none is authorized by this amendment.
- **CI/CD.** Founder Decision G.3 closes the "Not yet recorded" citation
  gap the Locked Technology Stack table below has carried since Sprint
  01: [ADR-0017](../../decisions/ADR-0017-github-actions-cicd.md) formally
  records GitHub Actions — already the de facto, and only, CI system
  since Sprint 01 Milestone 10 — as the locked choice. This ADR
  documents an existing, unchanged fact; it does not alter CI behavior.

Both amendments update the Locked Technology Stack table below (Storage,
CI/CD rows) and are documentation-only — neither authorizes any
implementation code.

## Constitutional Amendment — Target Audience Reconciliation (2026-08-26)

Founder-directed governance-sync correction, made as part of
`docs/sprints/sprint-04.md`'s Milestone 21 (Sprint 03 Close-Out &
Governance Sync). The Target Audience section immediately below still
reads "Not yet ratified," while
[ADR-0007](../../decisions/ADR-0007-target-audience-interim-posture.md),
§D records that the founder has since explicitly ratified an initial
target market (India, single market at launch) and age range (4–10) for
engineering-compliance purposes (2026-08-04). ADR-0007's own
Constitution Alignment section already supplies the reconciling logic:
this section's wording is left unedited below — not silently
rewritten — per the Governance Hierarchy (only an explicit amendment at
this layer may change this section's text; a lower-layer ADR cannot),
but is no longer in tension with it now that ADR-0007 §D exists. This
amendment formalizes that reconciliation in the Constitution itself,
rather than leaving it implicit in ADR-0007 alone.

Two things ADR-0007 §D explicitly is **not**: it is a founder
business/product decision, **not** a legal certification that Natkhat
AI's data practices comply with India's Digital Personal Data Protection
(DPDP) Act or any other regime for the 4–10 age range; and it does not
by itself authorize collecting real child data. India DPDP Act
legal-sufficiency review of the actual consent-capture design, and
selection of the specific verifiable-parental-consent mechanism, remain
open (ADR-0007 §D.3, §C.3/§C.6) and are unaffected by this amendment.

The original "Not yet ratified" text below is retained, not deleted, as
historical context for the pre-ADR-0007 gap it originally described —
per this project's append-only/explicit-reconciliation discipline (see
`docs/decisions/decision-log.md`'s own append-only rule for the same
principle applied at that layer).

## Target Audience

**Not yet ratified** as of this section's original text (pre-2026-08-04).
**Superseded for engineering-compliance purposes by
[ADR-0007](../../decisions/ADR-0007-target-audience-interim-posture.md),
§D — see the Constitutional Amendment immediately above.** No age
range, demographic, or user classification had been formally decided
for Natkhat AI's children-facing product at the time this section was
first ratified. This was tracked as an open risk (see
`docs/sprints/sprint-01.md`, Risk Register — Privacy/Compliance rows)
and required resolution via a dedicated ADR before any user data model,
authentication, or COPPA-relevant feature could be designed or
implemented — ADR-0007 §D now supplies that resolution (India, ages
4–10), exactly as this section's original text anticipated.

## Locked Technology Stack

The following technology choices are locked for Natkhat AI. Each is
recorded formally in its corresponding ADR; implementation status
varies per ADR.

| Layer                          | Technology                   | Recorded in                                                                                                                                                            |
| ------------------------------ | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Monorepo tooling               | Turborepo + pnpm workspaces  | ADR-0001                                                                                                                                                               |
| Mobile application             | Flutter                      | ADR-0002                                                                                                                                                               |
| Backend application            | NestJS                       | ADR-0003                                                                                                                                                               |
| Admin application (Sprint 02+) | Next.js                      | ADR-0014                                                                                                                                                               |
| Marketing website (Sprint 02+) | Next.js                      | ADR-0014                                                                                                                                                               |
| Database                       | PostgreSQL, via Google Cloud | ADR-0004 (implementation deferred; hosting amended by ADR-0016)                                                                                                        |
| ORM                            | Prisma                       | ADR-0004 (decision recorded, implementation deferred)                                                                                                                  |
| Authentication                 | Firebase Authentication      | ADR-0016 (supersedes ADR-0005's authentication clause)                                                                                                                 |
| Storage                        | Google Cloud Storage         | ADR-0016 amendment, "Amendment — Storage (2026-08-31)" (decision recorded, no implementation exists or is authorized; supersedes ADR-0005's Supabase Storage decision) |
| Cloud provider                 | Google Cloud (GCP)           | ADR-0016                                                                                                                                                               |
| CI/CD                          | GitHub Actions               | ADR-0017 (records the already-implemented choice, in effect since Sprint 01 Milestone 10)                                                                              |

No rationale beyond "locked" has been recorded for stack choices that
predate the ADR process; ADR-0001 through ADR-0005 supply rationale
going forward for the layers they cover. ADR-0016 (2026-08-23) amends
the Database and Authentication rows and formally records the Cloud
provider row, per the Constitutional Amendment above; its 2026-08-31
amendment further updates the Storage row (see the Storage and CI/CD
Constitutional Amendment above). ADR-0014 (2026-08-10) formally records
the Admin application and Marketing website rows, both corrected from
"Not yet recorded" to ADR-0014 on 2026-08-26 as part of
`docs/sprints/sprint-04.md`'s Milestone 21 (Sprint 03 Close-Out &
Governance Sync) — this citation fix was originally due at Sprint 02
Milestone 11 (ADR-0014's own Consequences clause names it) but was
missed until now; ADR-0014 itself records the decision only and does not
authorize scaffolding `apps/admin` or `apps/website` (both scaffolded
separately at Sprint 04 Milestone 22, per `docs/sprints/sprint-04.md`,
§4). ADR-0017 (2026-08-31) formally records the CI/CD row, per the
Storage and CI/CD Constitutional Amendment above.

## Amendment

Changes to this constitution follow the Change Request Process
(Proposal → Review → Decision → ADR or Decision Log → PROJECT.md
update → Implementation; full process documented in
`docs/engineering/change-request-process.md` once authored). No
principle, mission wording, or stack decision here may be changed by a
lower layer (an ADR, PROJECT.md, or a Sprint Document) — only by an
explicit amendment at this layer.
