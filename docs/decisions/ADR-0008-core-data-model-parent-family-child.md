# ADR-0008: Core Data Model — Parent/Family/Child Entities

**Version:** 1.1.0
**Status:** Accepted — Implementation Deferred (Founder/Product-Owner
approval recorded 2026-08-05, per `docs/sprints/sprint-02.md`, §5's
decision-maker note and the Sprint 02 Milestone 1 stop-and-report
checkpoint; mirrors ADR-0004/ADR-0005's "Accepted — Implementation
Deferred" pattern. This ADR alone still does not authorize any Prisma
schema, migration, or database connection code — see Consequences.)
**Owner:** Engineering
**Last Updated:** 2026-08-05

## Context

`docs/sprints/sprint-02.md`, §3, Milestone 1 (Identity & Family
Architecture) requires an ER-level design of the core Parent/Family/
Child/Co-Parent entity model and the isolation boundary between
families, per [ADR-0006](./ADR-0006-data-privacy-compliance.md) §4
(Parent Ownership), §6 (Parent/Child Authorization Boundaries), §16
(Tenant/Family Isolation), and the
[Child Privacy & Safety Constitution](../constitution/product/child-privacy-and-safety-constitution.md)
§2 (Parent Owns the Child's Data) and §9 (Session & Device Security).
Milestone 1's own text names this as an architectural, hard-to-reverse
data-model decision requiring a new ADR before implementation, with a
candidate title of "Core Data Model — Parent/Family/Child Entities,"
numbered sequentially after ADR-0007. §5's ADR table records this
ADR as achievable at "Accepted — Implementation Deferred" within
Sprint 02, mirroring how [ADR-0004](./ADR-0004-database.md) (database)
recorded a decision without implementing it.

[ADR-0004](./ADR-0004-database.md) records PostgreSQL/Supabase/Prisma
as the eventual implementation target but remains implementation-
deferred; this ADR records the entity-level design decision a future
ADR-0004 implementation must follow. It does not itself implement
anything, and does not clear ADR-0004's or ADR-0005's implementation
gates.

## Decision

Adopt the entity model documented in full at
[`docs/modules/identity-family/README.md`](../modules/identity-family/README.md)
as Natkhat AI's core identity/family data model. The binding design
decisions:

1. **Family is the sole tenant/isolation boundary.** Every Child record
   belongs to exactly one Family via `family_id`; no Child record may
   exist without one. This satisfies ADR-0006 §16.
2. **Parent is the single principal type for adult actors.** "Owning
   Parent" and "Co-Parent" are relationship roles a Parent principal
   holds with respect to a specific Family (via `Family.owning_parent_id`
   and a `CoParentAssignment` record, respectively) — not separate
   principal types with independently-justified fields. This avoids a
   duplicate identity entity that ADR-0006 §2 (data minimization; every
   field needs a documented purpose) would otherwise flag.
3. **Ownership is non-transferable and singular.** Each Family has
   exactly one `owning_parent_id`. Co-parent access is delegated,
   revocable, and explicitly scoped (`permission_scope`) — never
   ownership-equivalent — per ADR-0006 §4.
4. **A Parent principal may be associated with more than one Family**
   (as owner of one and co-parent of another — e.g. shared-custody or
   blended-family cases), but no Child ever belongs to more than one
   Family. Isolation is enforced at the Family/Child boundary, not the
   Parent boundary — a future authorization check (Sprint 02 Milestone 2) must evaluate "is this Parent authorized for this specific
   `family_id`," not "is this a valid parent."
5. **Device and Session inventories are modeled at the design level
   only** (Constitution §9), to support a future "view/remove devices,
   end sessions, review login history" capability. No token issuance,
   credential storage, or authorization-check logic is decided here —
   that is Milestone 2's scope (extends
   [ADR-0005](./ADR-0005-authentication.md)). `Session` carries
   `family_id` so Milestone 2 can design the explicit "a valid
   credential must still be rejected outside its own family" check
   (ADR-0006 §6) at the session level.
6. Every field in every entity has a stated purpose (see the module
   document's field tables); no speculative field was added.

## Consequences

- Clears the entity-model design prerequisite for Sprint 02 Milestones
  2 (Authorization & Sessions), 3 (Classification/Encryption/
  Isolation), 4 (Data Lifecycle), 5 (Consent Architecture), and 6 (Leo
  Memory/Conversation Isolation) — each depends on this model per
  `docs/sprints/sprint-02.md`, §4.
- Does **not** authorize any Prisma schema, migration, or database
  connection code. ADR-0004's and ADR-0005's "no implementation"
  clauses are unchanged; this ADR adds a design layer above them, it
  does not clear their implementation gates.
- Does not resolve retention windows (Milestone 4, founder-gated),
  consent-event schema (Milestone 5), RLS/encryption specifics
  (Milestone 3), or authorization-check logic (Milestone 2) — each
  remains that milestone's own open item.
- Records, but does not resolve, one explicitly out-of-scope edge case:
  multi-household child access (a Child needing membership in more than
  one Family). If a future product decision requires this, it is a new
  ADR superseding this one, not a silent edit — per this repository's
  append-only ADR discipline (see
  `docs/modules/identity-family/README.md`, §3.4).
- Contains no real parent, child, or family data; all examples in the
  accompanying module document are fictional.

## Constitution Alignment

Directly implements
[Child Privacy & Safety Constitution](../constitution/product/child-privacy-and-safety-constitution.md)
§2 (Parent Owns the Child's Data — ownership modeled as non-
transferable, singular, and revocable-delegation-only) and §9 (Session
& Device Security — device/session inventory shape). Implements
[ADR-0006](./ADR-0006-data-privacy-compliance.md) §4 (Parent
Ownership), §6 (Parent/Child Authorization Boundaries), §16 (Tenant/
Family Isolation). Consistent with
[ADR-0007](./ADR-0007-target-audience-interim-posture.md)'s interim
posture — the `date_of_birth` field supports but does not itself decide
the 4–10 age range/India-market posture, which remains ADR-0007's own
decision. Aligned with the
[Product Constitution](../constitution/product/natkhat-ai-constitution.md)
Core Principle 2 ("Parent partnership") and the Trust-Above-All
amendment. Nothing in this ADR amends the Product Constitution, Child
Privacy & Safety Constitution, or any other accepted ADR.
