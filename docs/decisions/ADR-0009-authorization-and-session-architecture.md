# ADR-0009: Authorization & Session Architecture

**Version:** 1.1.0
**Status:** Accepted — Implementation Deferred (Founder/Product-Owner
approval recorded 2026-08-05, per `docs/sprints/sprint-02.md`, §5's
decision-maker note and the Sprint 02 Milestone 2 stop-and-report
checkpoint; mirrors ADR-0004/ADR-0005's "Accepted — Implementation
Deferred" pattern. This ADR alone still does not authorize any
Supabase Auth integration, token issuance, or session-storage code —
see Consequences.)
**Owner:** Engineering
**Last Updated:** 2026-08-05

## Context

`docs/sprints/sprint-02.md`, §3, Milestone 2 (Authorization & Session
Architecture) requires designing the RBAC/tenant-scoped authorization
model — parent-only actions, any-child-session restrictions, and
device/session management — per
[ADR-0006](./ADR-0006-data-privacy-compliance.md) §6 (Parent/Child
Authorization Boundaries) and §16 (Tenant/Family Isolation), and the
[Child Privacy & Safety Constitution](../constitution/product/child-privacy-and-safety-constitution.md)
§9 (Session & Device Security). Milestone 2's own text names this as
an architectural decision extending [ADR-0005](./ADR-0005-authentication.md)
(Supabase Auth, Accepted — Implementation Deferred), requiring a new
ADR before implementation, numbered sequentially after ADR-0008.

This ADR depends on, and does not redesign,
[ADR-0008](./ADR-0008-core-data-model-parent-family-child.md) (Core
Data Model — Parent/Family/Child Entities) and its accompanying
[`docs/modules/identity-family/README.md`](../modules/identity-family/README.md)
— specifically the Parent/Family/Child/`CoParentAssignment`/`Device`/
`Session` entity shapes, which this ADR consumes as given.

## Decision

Adopt the authorization and session model documented in full at
[`docs/architecture/authorization-and-sessions.md`](../architecture/authorization-and-sessions.md)
as Natkhat AI's authorization and session architecture. The binding
design decisions:

1. **Role is always evaluated per `(Parent, family_id)` pair, never per
   principal alone.** "Owner" and "Co-Parent" are roles a Parent holds
   with respect to one specific Family, not global attributes. This
   directly implements ADR-0006 §6's "every authorization check must
   also be tenant/family-scoped, not role-scoped alone."
2. **Every authorization decision runs a fixed two-gate check:** a
   tenant-scope gate (is the requested `family_id` in the principal's
   authorized family set) evaluated independently and first, then an
   action-permission gate (does the resolved role permit the requested
   action). Both gates are required; neither substitutes for the
   other. This generalizes ADR-0006 §6's named test case — "a valid
   child-role token must still be rejected outside its own family" —
   to every principal type, using one non-bypassable check rather than
   role-specific checks that could individually be forgotten.
3. **Five actions are owner-only, unconditionally, by construction:**
   billing, family/account deletion, data export, share-link
   creation/revocation, and consent-of-record changes — exactly
   ADR-0006 §6's named list. No `CoParentAssignment.permission_scope`
   value may include any of them; this is a design invariant, not a
   default that a future scope value could override.
4. **A Session is pinned to exactly one `family_id` at a time.** A
   Parent authorized across multiple Families (owner of one, co-parent
   of another) does not get one ambient multi-family session. Acting
   on a second Family requires an explicit family-switch operation
   that re-runs the full authorization check against the target
   `family_id` before a session for that family is established. This
   keeps a compromised or misused session's blast radius bounded to
   one Family, per ADR-0006 §16's isolation intent.
5. **Device is scoped to the owning Parent, not the Family** — no
   principal ever views or manages another principal's device
   inventory, satisfying Constitution §9 as an individual capability.
6. **Revoking a `CoParentAssignment` cascades to end that co-parent's
   active sessions for that Family**, and — independently of whether
   any cascade job has run — the tenant-scope gate re-resolves the
   authorized family set from current `CoParentAssignment.status` on
   every request, so a revoked co-parent's very next request is denied
   regardless of cascade timing. This is the architectural mechanism
   behind "access can be revoked immediately" (Mandatory Security
   Review Checklist).
7. **The Child role is designed but not activated.** `Session.principal_type
= Child` is supported by the authorization-check model (identical
   two-gate check, family set is always a singleton per M1 §3.4) so
   the model is not blocked if a future product decision authorizes
   child-initiated sessions — but no such feature is authorized by
   this ADR or by Milestone 2.

## Consequences

- Clears the authorization-model design prerequisite for Milestone 3
  (Row-Level Security must enforce the same tenant-scope invariant at
  the database layer — not redesigned here, but this ADR's tenant-scope
  gate is the model Milestone 3's RLS policies must mirror) and for any
  later milestone assuming an authorization boundary exists.
- Does **not** authorize any Supabase Auth integration, token issuance,
  session-storage implementation, or login-flow code. ADR-0005's "no
  implementation" clause is unchanged; this ADR adds a design layer
  above it, exactly as ADR-0008 did for the data model.
- Does not fix session-timeout values, token format, or any
  cryptographic detail — those are implementation parameters for
  ADR-0005's eventual implementation, not resolved here.
- Does not authorize a child-login/child-session feature. §Decision
  item 7 is a design-completeness measure required by ADR-0006 §6, not
  a product decision to ship such a feature; that would require its
  own founder-approved Change Request.
- Contains no real parent, child, or family data; all examples in the
  accompanying architecture document are fictional.

## Constitution Alignment

Directly implements
[Child Privacy & Safety Constitution](../constitution/product/child-privacy-and-safety-constitution.md)
§8 (Conversation isolation is mandatory — generalized here to every
tenant-scoped resource) and §9 (Session & Device Security — view/remove
devices, end sessions remotely, review login history, each mapped to a
specific design element). Implements
[ADR-0006](./ADR-0006-data-privacy-compliance.md) §6 (Parent/Child
Authorization Boundaries) and §16 (Tenant/Family Isolation). Extends,
and does not contradict,
[ADR-0005](./ADR-0005-authentication.md) (Supabase Auth remains the
recorded provider; this ADR adds authorization-model detail on top of
it, per `docs/architecture/authorization-and-sessions.md`, §8).
Consumes, and does not redesign,
[ADR-0008](./ADR-0008-core-data-model-parent-family-child.md)'s entity
model. Aligned with the
[Product Constitution](../constitution/product/natkhat-ai-constitution.md)
Core Principle 2 ("Parent partnership") and the Trust-Above-All
amendment, and the
[Engineering Constitution](../constitution/engineering/engineering-constitution.md)'s
Mandatory Engineering Review Gates (Security, Parent Trust). Nothing in
this ADR amends the Product Constitution, Child Privacy & Safety
Constitution, or any other accepted ADR.
