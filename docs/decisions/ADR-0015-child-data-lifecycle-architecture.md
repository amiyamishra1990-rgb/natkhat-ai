# ADR-0015: Child-Data Lifecycle Architecture (Retention, Deletion, Export, Backup-Purge)

**Version:** 1.0.0
**Status:** Accepted — Implementation Deferred (Founder/Product-Owner
approval recorded 2026-08-05, per `docs/sprints/sprint-02.md`, §5's
decision-maker note and the Sprint 02 Milestone 4 stop-and-report
checkpoint; mirrors ADR-0004/ADR-0005/ADR-0008/ADR-0009/ADR-0010/
ADR-0012's "Accepted — Implementation Deferred" pattern. This ADR alone
still does not authorize any deletion job, backup system, export
pipeline, cron job, or database schema — see Consequences. Decision
item 3's audit/security-log retention period remains **APPROVED
PROVISIONALLY**, not final — see Decision item 3 and Consequences.)
**Owner:** Engineering
**Last Updated:** 2026-08-11

## Context

`docs/sprints/sprint-02.md`, §3, Milestone 4 (Child-Data Lifecycle
Architecture) required resolving the open engineering-design questions
[ADR-0006](./ADR-0006-data-privacy-compliance.md) explicitly deferred
to Sprint 02: §17 (retention windows per category), §18 (deletion —
soft/hard-delete window, precisely defined), §19 (export completeness),
and §21 (backup-retention/purge window). Milestone 4's own text
conditions ADR authorship on founder approval first — "Founder approval
required first... then Yes, a new ADR recording the ratified windows" —
since specific retention/deletion windows are a business/product
decision, not purely engineering (`docs/sprints/sprint-02.md`, §2.3,
category 2).

The full design was produced at
[`docs/architecture/data-lifecycle.md`](../architecture/data-lifecycle.md)
(Version 1.1.0), and the founder reviewed and approved its candidate
options on 2026-08-05: §13.1 (soft→hard-delete window), §13.2
(backup-purge window), and §13.4 (the three-class Leo memory
architecture, decisions D4-A/D4-B/D4-C) are APPROVED; §13.3
(audit/security-log retention) is APPROVED PROVISIONALLY, subject to
change pending India DPDP Act legal review of breach-notification/
record-keeping obligations (ADR-0006 §30, still open). Formal ADR
authorship recording these already-ratified values was identified in
that document as a distinct next step, not performed at the time —
this ADR is that step.

This ADR depends on, and does not redesign,
[ADR-0008](./ADR-0008-core-data-model-parent-family-child.md) (Core
Data Model — Parent/Family/Child Entities),
[ADR-0009](./ADR-0009-authorization-and-session-architecture.md)
(Authorization & Session Architecture), and
[ADR-0010](./ADR-0010-encryption-and-tenant-isolation-design.md)
(Encryption & Tenant-Isolation Implementation Design) — specifically
the entity ownership rules, the owner-only revocation cascade, and the
per-Family Data Encryption Key design, each of which this ADR's
lifecycle rules consume as given.

## Decision

Adopt the child-data lifecycle architecture documented in full at
[`docs/architecture/data-lifecycle.md`](../architecture/data-lifecycle.md)
as Natkhat AI's retention, deletion, export, and backup-purge
architecture. The binding, founder-approved decisions:

1. **Soft-delete → hard-delete window: 90 days** (data-lifecycle.md
   §13.1, APPROVED 2026-08-05). A soft-deleted record remains
   recoverable by its owning Parent for 90 days; past that window, it
   is irrecoverably erased or tombstoned (data-lifecycle.md §6).
2. **Backup-retention/purge window: 90 days**, explicitly paired with
   cryptographic erasure for Tier 3 (Sensitive Child Content) via
   per-Family Data Encryption Key destruction (data-lifecycle.md
   §13.2/§10, APPROVED 2026-08-05, reusing ADR-0010's per-Family
   envelope-encryption design). Tier 1/2 content relies on the 90-day
   generation-expiry mechanism alone; Tier 3 content becomes unreadable
   immediately upon Family hard-delete, independent of any individual
   backup's own age.
3. **Audit/security-log (Tier 5) retention: 3 years** (data-lifecycle.md
   §13.3, **APPROVED PROVISIONALLY**, 2026-08-05). This value is
   explicitly not final — it remains subject to change if India DPDP
   Act legal review of regulatory breach-notification/record-keeping
   obligations (ADR-0006 §30, still open) requires a different period.
   This ADR does not resolve that legal-validation gate; it records the
   provisional engineering default pending that review, exactly as
   data-lifecycle.md §15 states.
4. **Leo Memory Architecture — three independent storage classes**
   (data-lifecycle.md §13.4, prospective, informing Milestone 6):
   - **Class 1 — Active Relationship Memory** (decision D4-A,
     APPROVED): no fixed expiry; retention follows the Child/Family
     entity lifecycle, not a standalone duration.
   - **Class 2 — Memory Version History** (decision D4-B, APPROVED):
     90-day default, parent-configurable range of 30 days to 1 year.
   - **Class 3 — Permanent Parent-Approved Childhood Memory Vault**
     (decision D4-C, APPROVED): indefinite retention, per item, entered
     only by an explicit, per-item parent action.
   - **Architectural rule:** no automatic promotion from Class 1 into
     Class 3 is permitted under any circumstance — promotion requires
     an explicit, per-item parent action. This is a hard architectural
     constraint, not a configurable default.
5. **Supporting design adopted as-is**, unchanged from
   data-lifecycle.md: the seven-state lifecycle model (§3); the
   per-category retention matrix (§4); soft-delete/hard-delete/
   tombstone mechanics (§5–§6); the three Child/Family/account deletion
   cascades (§7); the export-completeness definition (§8); derived/
   AI-generated-data deletion propagation (§9); and Tier 5's
   append-only, non-parent-deletable audit treatment (§11).

## Consequences

- Clears Milestone 4's design prerequisite for a future ADR-0004
  (database) implementation, and gives Milestone 6 (Leo Memory &
  Conversation Isolation) a concrete, founder-approved retention
  contract to build its entity design against.
- Does **not** authorize any deletion job, backup-purge job, export
  pipeline, cron job, RLS policy execution, key-destruction code, or
  database schema/migration of any kind. ADR-0004's "no implementation"
  clause is unchanged; this ADR adds a design layer above it, exactly
  as ADR-0008, ADR-0009, and ADR-0010 did for the data model,
  authorization, and encryption/isolation layers.
- Does **not** resolve the open legal-validation items
  data-lifecycle.md §15 names: India DPDP Act sufficiency of the
  backup-purge and audit-retention windows; other regulatory
  record-keeping requirements; DPDP erasure-equivalence of the
  soft-delete/hard-delete/tombstone design; and, specifically, whether
  the 3-year Tier 5 retention period (Decision item 3) is consistent
  with any confirmed DPDP minimum or maximum. This is the specific
  reason Decision item 3 remains provisional, not final, in this ADR's
  own Status.
- Does not resolve the implementation-stage gaps data-lifecycle.md
  already flags as open and out of this milestone's scope: the missing
  `deleted_at`/status-transition timestamp on M1 entities (§4); the
  full co-parent export field-visibility rule (§8); the absence of an
  "inactive account" auto-deletion policy (§16); and aged-out-child
  (product age-limit) memory disposition (§13.4). Each remains a
  forward note for future implementation-stage work, not decided here.
- Contains no real parent, child, or family data; every example in the
  underlying architecture document is fictional.

## Constitution Alignment

Directly implements
[Child Privacy & Safety Constitution](../constitution/product/child-privacy-and-safety-constitution.md)
§2 (Parent Owns the Child's Data — export/delete/correct), §6 (Leo
Memory Protection — parent-controlled deletion, version history), §10
(Privacy Dashboard — export completeness), §12 (Secure Development
Standards — audit logging). Implements
[ADR-0006](./ADR-0006-data-privacy-compliance.md) §17, §18, §19, §21,
§22 (directly resolved or bounded). Consumes, and does not redesign,
[ADR-0008](./ADR-0008-core-data-model-parent-family-child.md)'s entity
model and ownership rules,
[ADR-0009](./ADR-0009-authorization-and-session-architecture.md)'s
revocation-cascade mechanism, and
[ADR-0010](./ADR-0010-encryption-and-tenant-isolation-design.md)'s
per-Family encryption design, reused here for Decision item 2's
crypto-shredding mechanism. Aligned with the
[Product Constitution](../constitution/product/natkhat-ai-constitution.md)
Core Principle 2 ("Parent partnership") and Core Principle 4
("Childhood memories matter" — directly weighed in the three-class Leo
memory architecture), and the Trust-Above-All amendment. Aligned with
the
[Engineering Constitution](../constitution/engineering/engineering-constitution.md)'s
Mandatory Engineering Review Gates (Privacy, Parent Trust). Nothing in
this ADR amends the Product Constitution, Child Privacy & Safety
Constitution, or any other accepted ADR.
