# ADR-0010: Encryption & Tenant-Isolation Implementation Design

**Version:** 1.1.0
**Status:** Accepted — Implementation Deferred (Founder/Product-Owner
approval recorded 2026-08-05, per `docs/sprints/sprint-02.md`, §5's
decision-maker note and the Sprint 02 Milestone 3 stop-and-report
checkpoint; mirrors ADR-0004/ADR-0005/ADR-0008/ADR-0009's "Accepted —
Implementation Deferred" pattern. This ADR alone still does not
authorize any Prisma schema, migration, RLS policy execution, or
field-level encryption code — see Consequences.)
**Owner:** Engineering
**Last Updated:** 2026-08-05

## Context

`docs/sprints/sprint-02.md`, §3, Milestone 3 (Data Classification,
Encryption & Tenant-Isolation Design) requires resolving the open
engineering-design questions
[ADR-0006](./ADR-0006-data-privacy-compliance.md) explicitly deferred
to Sprint 02: §14 (field-level vs. managed encryption for
highest-sensitivity fields) and §16 (concrete Row-Level Security design
for tenant isolation). Milestone 3's own text names this as an
architectural decision extending
[ADR-0004](./ADR-0004-database.md) (database) and
[ADR-0006](./ADR-0006-data-privacy-compliance.md), requiring a new ADR
before implementation, numbered sequentially after ADR-0009.

This ADR depends on, and does not redesign,
[ADR-0008](./ADR-0008-core-data-model-parent-family-child.md) (Core
Data Model) and
[ADR-0009](./ADR-0009-authorization-and-session-architecture.md)
(Authorization & Session Architecture) — specifically the Family
tenant-boundary decision, the Parent/Family/Child/CoParentAssignment/
Device/Session entity shapes, and the M2 role × family-scope
authorization-check model, all of which this ADR consumes as given.

## Decision

Adopt the classification, encryption, and isolation design documented
in full at
[`docs/architecture/data-classification-and-isolation.md`](../architecture/data-classification-and-isolation.md)
as Natkhat AI's data-classification, encryption, and tenant-isolation
architecture. The binding design decisions:

1. **Every field in every existing entity is mapped to one of ADR-0006
   §7's five classification tiers**, including a prospective policy for
   Tier 3 (Sensitive Child Content) and Tier 4 (Growth/Progress), which
   have no entities yet (Milestone 6+) — so those future milestones
   have a concrete, pre-agreed rule to build against rather than an
   open question at that time.
2. **Field-level (application-layer) encryption, in addition to managed
   at-rest encryption, is required for Tier 3 (Sensitive Child Content)
   only** — resolving ADR-0006 §14. This extends §14's three literally
   named examples (voice, images, Leo memory content) to all five Tier
   3 categories in §7's table (adding conversations and drawings) for
   internal consistency. Tiers 1, 2, 4, and 5 rely on Supabase/
   PostgreSQL's managed at-rest/in-transit encryption alone — not
   because they are unimportant, but because ADR-0006 §14 and the Child
   Privacy & Safety Constitution's enhanced-protection sections (§6,
   §7) single out Tier 3 specifically, and extending field-level
   encryption to every tier would be disproportionate cost with no
   Constitution/ADR mandate behind it for the lower tiers.
3. **Tier 3 field-level encryption uses per-Family envelope
   encryption** — one Data Encryption Key (DEK) per `Family`, wrapped by
   a Key Encryption Key held in a managed KMS. Scoping the encryption
   boundary to the same boundary as tenant isolation (`Family`) means a
   raw database dump, misconfigured backup, or a bulk operation that
   bypasses Row-Level Security still yields only per-Family ciphertext
   for Tier 3 content, not cross-family plaintext — a second,
   independent isolation layer, not merely encryption applied uniformly
   regardless of tenant.
4. **Row-Level Security enforces the same tenant-scope boundary M2's
   `authorize(...)` check already establishes at the application
   layer — mirrored, not duplicated in spirit.** RLS is deliberately
   scoped to be a coarse tenant backstop (`family_id`/`parent_id`
   partitioning only); it does not re-implement M2's fine-grained,
   `permission_scope`-level action-permission logic, which remains
   exclusively application-layer. `FORCE ROW LEVEL SECURITY` is
   required on every partitioned table, and no request-serving database
   role may hold `BYPASSRLS`.
5. **`Device` is Parent-scoped, and `Session` row-visibility is
   Parent-scoped (`principal_id`), not Family-scoped** — carrying
   forward, unchanged, the M1 (`docs/modules/identity-family/README.md`,
   §3.6) and M2 (`docs/architecture/authorization-and-sessions.md`,
   §6.5) decisions that these two entities are explicitly not
   Family-partitioned. This ADR does not introduce a new isolation rule
   for them; it only confirms the existing one governs their RLS
   design.
6. **The `family_id`/`parent_id` partition columns themselves are never
   encrypted** — they must remain in plaintext for the database to
   filter rows; only Tier 3 content columns receive field-level
   encryption (item 2).

## Consequences

- Clears the encryption/isolation design prerequisite for a future
  ADR-0004 implementation, and gives Milestone 6 (Leo Memory &
  Conversation Isolation) a concrete Tier 3 policy to build its entity
  design against rather than an open question.
- Does **not** authorize any Prisma schema, migration, database
  connection code, RLS policy execution, or field-level encryption
  code. ADR-0004's "no implementation" clause is unchanged; this ADR
  adds a design layer above it, exactly as ADR-0008 and ADR-0009 did
  for the data model and authorization layers.
- Does not select a KMS product, define a key-rotation policy, or fix
  an encryption algorithm/mode — those are implementation-stage
  engineering decisions (see the architecture document, §11).
- Does not resolve retention/deletion/backup-purge windows (Milestone
  4, founder-gated), consent-event schema (Milestone 5), or the actual
  Tier 3/4 entity definitions (Milestone 6) — each remains that
  milestone's own open item.
- Surfaces, rather than silently accepts, a residual risk: an elevated/
  `BYPASSRLS` database role remains the single highest-leverage failure
  mode for Tier 1/2 data (which is not field-level encrypted); item 4's
  "no request-serving role may hold `BYPASSRLS`" is the primary
  mitigation for that risk, not a secondary one.
- Contains no real parent, child, or family data; all examples in the
  accompanying architecture document are fictional.

## Constitution Alignment

Directly implements
[Child Privacy & Safety Constitution](../constitution/product/child-privacy-and-safety-constitution.md)
§1 (Privacy by Default), §6 (Leo Memory Protection), §7 (Voice & Image
Security), §8 (Conversation isolation is mandatory), §12 (Secure
Development Standards). Implements
[ADR-0006](./ADR-0006-data-privacy-compliance.md) §7, §14, §16
(directly resolved). Consumes, and does not redesign,
[ADR-0008](./ADR-0008-core-data-model-parent-family-child.md)'s entity
model and Family tenant-boundary decision, and
[ADR-0009](./ADR-0009-authorization-and-session-architecture.md)'s
authorization-check model and Device/Session parent-scoping decision.
Aligned with the
[Product Constitution](../constitution/product/natkhat-ai-constitution.md)
Core Principle 2 ("Parent partnership") and the Trust-Above-All
amendment, and the
[Engineering Constitution](../constitution/engineering/engineering-constitution.md)'s
Mandatory Engineering Review Gates (Security, Privacy) and
`docs/engineering/security-by-design.md`. Nothing in this ADR amends
the Product Constitution, Child Privacy & Safety Constitution, or any
other accepted ADR.
