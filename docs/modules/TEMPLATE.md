# Module: [Module Name]

**Version:** 0.1.0
**Status:** Draft — [Draft | Proposed | Approved | In Development | Shipped | Deprecated]
**Owner:** [Name / team]
**Last Updated:** [YYYY-MM-DD]

> Copy this file to `docs/modules/<module-slug>/README.md` (one folder
> per module) when a module is actually proposed. Fill in every
> section below — do not delete a section for being "not applicable
> yet"; state that explicitly instead, so reviewers can see it was
> considered. This template itself defines structure only; it is not a
> module, and its existence does not authorize any business feature
> (`docs/sprints/sprint-01.md`, §13).

This document is the module's own root of authority for module-level
detail, but it never outranks anything above it in the Governance
Hierarchy (`docs/sprints/sprint-01.md`, §1). If anything in this module
document conflicts with a Constitution, an ADR, `PROJECT.md`, or the
current Sprint Document, those win — fix this document, not them.

---

## 1. Vision

One paragraph: what this module is, who it's for, and which
Product Constitution principles it serves
(`docs/constitution/product/natkhat-ai-constitution.md`). State
explicitly how it advances the mission (Human-first, Parent
partnership, Safe & Responsible AI, No addictive engagement, etc.) —
do not restate the Constitution, link to it.

## 2. Requirements

Functional and non-functional requirements, in scope vs. explicitly out
of scope for this module's first version. Call out any requirement
that touches child data, parent data, or AI-mediated behavior — those
require the Mandatory Engineering Review Gates below regardless of
module size.

## 3. Architecture

How this module fits the existing monorepo architecture
(`docs/architecture/overview.md`, ADR-0001). Which app(s)/package(s) it
lives in, its major components, and any new shared package it
introduces (see the Shared Package Strategy,
`docs/sprints/sprint-01.md`, §12 — a new shared package needs its own
justification, not just convenience).

## 4. APIs

Endpoints/contracts this module exposes or consumes, referencing
`docs/api/README.md`. Include request/response shapes only once they
are real — no speculative API surface.

## 5. Database

Schema/tables this module owns, referencing ADR-0004 (PostgreSQL via
Supabase, Prisma). Any new table touching child or parent data must
state its retention policy and deletion path per the
[Child Privacy & Safety Constitution](../constitution/product/child-privacy-and-safety-constitution.md)
(Parent Data Ownership — parents can export/delete their data).

## 6. Security

Explicitly answer each item in the
[Mandatory Engineering Review Checklist](../engineering/review-checklist.md)
for this module: Privacy by Default, Child Safety, Parent Trust, Secure
APIs, Audit Logging, Search Engine Protection, Encryption, Parent Data
Ownership, AI Safety, Product Constitution Compliance. Any "NO" blocks
this module from proceeding past design.

## 7. Testing

Which layers of the testing taxonomy apply
([`docs/engineering/testing-strategy.md`](../engineering/testing-strategy.md) —
Unit, Widget, Integration, API, End-to-end, Performance, Accessibility,
Security, Regression) and this module's minimum bar before merge.

## 8. Deployment

How this module ships: feature-flag status
([`docs/engineering/feature-flags.md`](../engineering/feature-flags.md) —
unfinished functionality must ship behind a flag), CI/CD path, and
rollback plan.

---

## Constitution Alignment

State which Constitution(s), ADR(s), and Sprint Document line this
module traces to. A module with no traceable authorization above it
does not proceed to implementation (`docs/sprints/sprint-01.md`, §1,
§10 — Change Request Process).
