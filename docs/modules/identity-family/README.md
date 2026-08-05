# Module: Identity & Family

**Version:** 0.1.0
**Status:** Proposed
**Owner:** Engineering
**Last Updated:** 2026-08-04

> This document is Sprint 02, Milestone 1's deliverable
> (`docs/sprints/sprint-02.md`, §3, M1). It is an ER-level design
> document only. It produces no schema, no migration, and no database
> of any kind, and does not itself authorize implementation — see
> [ADR-0008](../../decisions/ADR-0008-core-data-model-parent-family-child.md)
> and the Explicit Exclusions section below. Every example in this
> document is fictional; no real parent, child, or family data appears
> anywhere here.

This document is the module's own root of authority for module-level
detail, but it never outranks anything above it in the Governance
Hierarchy (`docs/sprints/sprint-01.md`, §1). If anything in this module
document conflicts with a Constitution, an ADR, `PROJECT.md`, or the
current Sprint Document, those win — fix this document, not them.

---

## 1. Vision

The Identity & Family module defines who Natkhat AI's principals are —
Parent, Family, Co-Parent (a relationship role, not a separate
principal type — see §3), and Child — and the ownership/isolation
boundary between them. It exists to serve
[Core Principle 2, "Parent partnership,"](../../constitution/product/natkhat-ai-constitution.md)
and the Trust-Above-All amendment directly: every other module (Leo
memory, conversations, growth reports, sharing) depends on this
module's guarantee that a child's data is reachable only through an
accountable, non-transferable parent-ownership chain, and never crosses
into another family. This module does not itself deliver a user-facing
feature; it is the identity foundation every future feature is built
on.

## 2. Requirements

### In scope (this version)

- ER-level entity design for **Parent**, **Family**, **Child**, and the
  **Co-Parent** relationship role (per
  [ADR-0006](../../decisions/ADR-0006-data-privacy-compliance.md) §4,
  §6; [Child Privacy & Safety Constitution](../../constitution/product/child-privacy-and-safety-constitution.md)
  §2).
- Non-transferable parent→child ownership references.
- The family/tenant isolation boundary between families — which entity
  carries the tenant identifier, and why no entity may cross it (ADR-0006
  §16).
- Device and session **inventory shape** at design level only — the
  data shape needed to eventually support "view/remove devices, end
  sessions, review login history" (Constitution §9). No token issuance
  or authorization-check logic.
- A documented purpose for every field (ADR-0006 §2; no speculative
  fields).

### Explicitly out of scope (this version)

- Authorization-check logic, RBAC rules, and real session/token
  lifecycle — Sprint 02 Milestone 2 (extends ADR-0005).
- Field-level encryption decisions and Row-Level Security policy design
  — Milestone 3.
- Retention, deletion, export, and backup-purge windows — Milestone 4
  (founder-gated).
- Consent-event schema and consent-verification mechanism — Milestone 5.
- Leo memory, conversation, or any AI-related entity — Milestone 6.
- Audit-log schema — Milestone 7 (this module only supplies the actor
  fields a future audit log would reference).
- Any Prisma schema, migration, database connection, authentication
  code, or storage wiring of any kind (ADR-0004/ADR-0005 implementation
  gates unchanged).
- Any real parent, child, or family data.

## 3. Architecture

This module introduces no new app or package — it fits the existing
monorepo (`docs/architecture/overview.md`, ADR-0001) as a design
document only, informing the future `apps/backend` Prisma schema once
ADR-0004's implementation gate clears. No new shared package is
justified at this stage (`docs/sprints/sprint-01.md`, §12) — there is
no code yet to share.

### 3.1 Principal types and their relationship

Sprint 02's Milestone 1 scope (`docs/sprints/sprint-02.md`, §3) names
four principal types to design: **Parent, Family, Child, and
Co-Parent.** This design resolves that as three entities plus one
relationship:

- **Parent** — the single principal type for every adult actor. A
  Parent's relationship to any one Family is either "owning" or
  "co-parent" — these are **roles a Parent holds with respect to a
  specific Family**, not separate principal types with different
  fields. Modeling Co-Parent as a second, near-duplicate person-entity
  would itself violate ADR-0006 §2 (every field needs a documented
  purpose; a duplicate identity entity has none beyond convenience).
- **Family** — the tenant/isolation boundary (ADR-0006 §16). Exactly
  one Parent is the Family's non-transferable owner
  (`Family.owning_parent_id`).
- **CoParentAssignment** — the relationship entity recording that a
  (different) Parent has been granted scoped, revocable access to a
  specific Family. This is where "Co-Parent" lives structurally.
- **Child** — belongs to exactly one Family. A Child is never a
  principal with independent login credentials in this design; see
  §3.4 for why, and the explicitly-deferred question this leaves open.

### 3.2 Entity: Parent

| Field               | Type / shape                         | Purpose                                                                                                                      |
| ------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `id`                | opaque identifier                    | Referenced by `Family.owning_parent_id`, `CoParentAssignment`, `Child.created_by_parent_id`, `Device`, `Session`.            |
| `auth_identity_ref` | opaque reference (external)          | Links this principal to the future authentication system's identity record (ADR-0005). This module does not own credentials. |
| `display_name`      | short text, parent-chosen            | In-product personalization (e.g., "Mom's account"). Not used for verification.                                               |
| `contact_email`     | email address                        | Consent-event correspondence, account recovery, Privacy Dashboard notifications (Constitution §10). Not used for marketing.  |
| `created_at`        | timestamp                            | Lifecycle/audit trail.                                                                                                       |
| `status`            | `active` \| `suspended` \| `deleted` | Supports parent-initiated account deletion (Constitution §2) while preserving referential history until deletion completes.  |

### 3.3 Entity: Family

| Field              | Type / shape                         | Purpose                                                                                                                                                                       |
| ------------------ | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`               | opaque identifier                    | **The tenant identifier.** Every Child record, and every future content record (conversations, memories, photos, growth reports), must carry this `family_id` (ADR-0006 §16). |
| `owning_parent_id` | reference → Parent                   | The single, non-transferable owner (ADR-0006 §4). Only this Parent (or an authorized Co-Parent, within their granted scope) may act on this Family's children.                |
| `display_name`     | short text, parent-chosen            | In-product label only; never public (Constitution §3 — no public profiles).                                                                                                   |
| `created_at`       | timestamp                            | Lifecycle/audit trail.                                                                                                                                                        |
| `status`           | `active` \| `suspended` \| `deleted` | Supports parent-initiated deletion at the family level.                                                                                                                       |

### 3.4 Entity: Child

| Field                  | Type / shape                      | Purpose                                                                                                                                                                                                                                                                                                                                    |
| ---------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `id`                   | opaque identifier                 | Referenced by every future child-content record.                                                                                                                                                                                                                                                                                           |
| `family_id`            | reference → Family                | The tenant identifier (ADR-0006 §16). A Child belongs to **exactly one** Family — see the design decision below.                                                                                                                                                                                                                           |
| `first_name`           | short text                        | Minimum needed for Leo's companion experience to address the child by name (ADR-0006 §2, data minimization — no last name collected in this design).                                                                                                                                                                                       |
| `date_of_birth`        | date                              | Age-appropriate content gating and the 4–10 target-age determination (ADR-0007 §D). Not used for analytics or profiling (ADR-0006 §28).                                                                                                                                                                                                    |
| `avatar_ref`           | opaque reference (external asset) | Personalization. The asset itself is out of scope (no storage wiring, §2) — this field only records that a reference will exist.                                                                                                                                                                                                           |
| `created_by_parent_id` | reference → Parent                | Records which Parent principal initiated creation — must be the Family's `owning_parent_id` or a Co-Parent with creation scope (§6, enforced by Milestone 2, not here). Establishes the actor-of-record that ADR-0006 §5's "preceding, verified parent consent action" precondition and Milestone 5's consent-event design will reference. |
| `created_at`           | timestamp                         | Lifecycle/audit trail.                                                                                                                                                                                                                                                                                                                     |
| `status`               | `active` \| `deleted`             | Soft-delete flag; the hard-delete window itself is Milestone 4's (founder-gated) decision, not fixed here.                                                                                                                                                                                                                                 |

**Design decision — a Child belongs to exactly one Family, never
more than one.** Shared-custody or blended-family arrangements are
modeled by inviting the other parent as a **Co-Parent of the same
Family** (§3.5), not by letting a Child span two Families. This keeps
the isolation guarantee in ADR-0006 §16 unconditional — "does this
Child record belong to Family X" never has more than one right answer.
The alternative (Child ↔ Family many-to-many) was considered and
rejected here because it would require every future isolation check
(RLS policy, Milestone 3; authorization check, Milestone 2) to reason
about a set of families instead of one, multiplying the surface for a
cross-family leak. If a real product need for multi-household child
access emerges, that is a data-model change requiring a new ADR that
supersedes [ADR-0008](../../decisions/ADR-0008-core-data-model-parent-family-child.md),
not a silent extension of this one — flagged here, not resolved.

**Explicitly not decided here: whether a Child ever has their own
login/session.** This module models Child as a data subject, not
(yet) as an independent authenticatable principal. Constitution §9's
device/session requirements are phrased in terms of what "parents can"
do (view/remove devices, end sessions) — nothing in the Constitution or
ADR-0006 requires a child-initiated login for the 4–10 target age range
(ADR-0007 §D). §3.6 below still reserves a `principal_type` field on
Session for `Parent | Child` so Milestone 2 is not blocked if a future
product decision (e.g., an older sibling / independent-device scenario)
requires it — but no such feature is designed or authorized here.

### 3.5 Entity: CoParentAssignment

| Field                                | Type / shape                                                          | Purpose                                                                                                                                                                                                                                                                           |
| ------------------------------------ | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                                 | opaque identifier                                                     | Referenced by future audit-log entries (Milestone 7).                                                                                                                                                                                                                             |
| `family_id`                          | reference → Family                                                    | Which Family this grants access to.                                                                                                                                                                                                                                               |
| `parent_id`                          | reference → Parent                                                    | Which Parent principal is being granted co-parent access. Must not equal the Family's `owning_parent_id` (a Parent cannot co-parent their own owned Family).                                                                                                                      |
| `invited_by_parent_id`               | reference → Parent                                                    | Must equal the Family's `owning_parent_id` at the time of invitation — proves only the owning parent can grant access (ADR-0006 §4, §6).                                                                                                                                          |
| `permission_scope`                   | bounded enum set (e.g., `view_child_profile`, `manage_child_profile`) | Explicitly excludes owner-only actions (account deletion, ownership transfer, consent-of-record changes) — enforces ADR-0006 §6's parent-only-vs-shared distinction at the data-model level. Milestone 2 designs the actual enforcement check; this field only defines the shape. |
| `status`                             | `active` \| `revoked`                                                 | Supports "access can be revoked immediately" (Mandatory Security Review Checklist).                                                                                                                                                                                               |
| `revoked_at`, `revoked_by_parent_id` | timestamp, reference → Parent                                         | Audit trail for revocation — must be the owning parent (§6).                                                                                                                                                                                                                      |
| `created_at`                         | timestamp                                                             | Lifecycle/audit trail.                                                                                                                                                                                                                                                            |

### 3.6 Device and Session — inventory shape only (Constitution §9)

Modeled at design level only, to support a future "view active
devices, remove devices, end sessions remotely, review login history"
capability. **No token issuance, credential validation, or
authorization-check logic is designed here** — that is Milestone 2's
scope, extending ADR-0005.

| Entity    | Field                                                                                                                                                           | Purpose                                                                                                                                                                                                                                                                                                      |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Device`  | `id`, `parent_id`, `device_label`, `device_type`, `first_seen_at`, `last_seen_at`, `status`                                                                     | A parent's own device inventory ("View active devices," "Remove devices"). Scoped to the Parent, not the Family — a co-parent's device list is theirs to manage, not shared inventory.                                                                                                                       |
| `Session` | `id`, `principal_id`, `principal_type` (`Parent` \| `Child`, see §3.4 note), `family_id`, `device_id`, `started_at`, `last_active_at`, `ended_at`, `end_reason` | "End sessions remotely," "Review login history." Carries `family_id` on every session (not only on Child-scoped data) so that Milestone 2's authorization design can test "a valid credential must still be rejected outside its own family" (ADR-0006 §6) as a session-level, not just a data-level, check. |

## 4. APIs

None. No API surface exists yet, and none is speculated here — the
template's own instruction is to include request/response shapes "only
once they are real." This module's entities are the future basis for
API contracts once Milestone 2 (authorization) and eventual ADR-0004/
ADR-0005 implementation exist.

## 5. Database

No schema is implemented by this document (ADR-0004's implementation
gate is unchanged; see
[ADR-0008](../../decisions/ADR-0008-core-data-model-parent-family-child.md)).
The entities in §3 are the design a future Prisma schema (PostgreSQL
via Supabase, ADR-0004) would implement. Per the
[Child Privacy & Safety Constitution](../../constitution/product/child-privacy-and-safety-constitution.md)
(Parent Data Ownership), every table backing `Child` or `Family` must
support parent-initiated export and deletion once implemented — the
exact retention/deletion window is explicitly deferred to Sprint 02
Milestone 4 (founder decision required), not fixed here. Field-level
encryption and Row-Level Security policy for these tables are deferred
to Milestone 3.

## 6. Security

Every item in the
[Mandatory Engineering Review Checklist](../../engineering/review-checklist.md)
is answered below **for this design**, not as a claim that undesigned
code satisfies it:

- **Privacy by Default** — YES. Every Family and Child record is
  scoped to exactly one `family_id` with no public/shared-by-default
  field anywhere in §3. Enforcing this at runtime (RLS, authorization
  checks) is Milestone 2/3's job; this design leaves no field that
  could default to public.
- **Child Safety** — YES. The Child entity carries no public-facing
  identifier, no searchable field, and no cross-family reference of any
  kind (Constitution §3).
- **Parent Trust** — YES. Every Child record traces to exactly one
  accountable `owning_parent_id` (non-transferable), and every
  Co-Parent grant is fully attributable (`invited_by_parent_id`,
  revocable, scoped).
- **Secure APIs** — N/A at this design stage; no API surface exists
  (§4). Not a "NO" — there is nothing insecure to evaluate yet, and
  none is spec'd here.
- **Audit Logging** — Design-supports, does not implement. This module
  supplies the actor fields (`created_by_parent_id`,
  `invited_by_parent_id`, `revoked_by_parent_id`) that Milestone 7's
  audit-log schema will need to reference; no logging pipeline exists
  yet.
- **Search Engine Protection** — N/A. No entity in this design is
  publicly reachable; none is being made so.
- **Encryption** — Deferred to Milestone 3 by design (ADR-0006 §14
  explicitly assigns this to Sprint 02 architecture work); this module
  flags which fields are Child-Profile tier (`first_name`,
  `date_of_birth`, `avatar_ref`) per ADR-0006 §7's classification table
  for that future work to consume.
- **Parent Data Ownership** — YES. This is the module's central
  guarantee — see §3.2–§3.5 and the Decision section of
  [ADR-0008](../../decisions/ADR-0008-core-data-model-parent-family-child.md).
- **AI Safety** — N/A. This module contains no AI/Leo-specific entity
  (Milestone 6's scope). It does establish the `family_id` every future
  Leo/conversation record must carry, per ADR-0006 §16.
- **Product Constitution Compliance** — YES. Traces to Core Principle 2
  ("Parent partnership") and the Trust-Above-All amendment — parents
  are structurally the accountable owners of every Child record, not
  incidental actors.

No item above is answered "NO"; none blocks this design from
proceeding to review.

### Cross-family isolation walk-through (informal, formalized by Milestone 2)

A Parent authenticated against Family A's `owning_parent_id` attempts
to read a Child record belonging to Family B. Under this design, that
read requires resolving the target Child's `family_id` and comparing it
against the requesting Parent's authorized Family set (their own
`owning_parent_id` Families plus any active `CoParentAssignment`
Families) — Family B is in neither set, so the request has no valid
authorization path. This module defines the data shape that check
reasons over; Milestone 2 is where the check itself, and its explicit
test case ("a valid child-role token must still be rejected outside its
own family," ADR-0006 §6), is designed.

## 7. Testing

Per the testing taxonomy
([`docs/engineering/testing-strategy.md`](../../engineering/testing-strategy.md)):
no automated tests exist yet — this is a design document, not code.
Once implemented (post-ADR-0004/ADR-0005 gate clearance), this
entity model's minimum bar is: **Unit** (entity/repository-level
invariants — e.g., a Child cannot be created without a `family_id`),
**Integration/API** (the cross-family authorization-bypass scenario in
§6, once Milestone 2 defines the check), and **Security** (isolation
boundary tests). Widget, End-to-end, Performance, Accessibility, and
Regression layers are not applicable to a data-model-only module and
would apply to the features built on top of it.

## 8. Deployment

Not applicable. This is a documentation-only milestone — no
feature-flag, CI/CD, or rollback plan exists because nothing is
deployed (`docs/sprints/sprint-02.md`, §2.2).

---

## Constitution Alignment

Traces to: [Product Constitution](../../constitution/product/natkhat-ai-constitution.md)
Core Principle 2 ("Parent partnership") and the Trust-Above-All
amendment; [Child Privacy & Safety Constitution](../../constitution/product/child-privacy-and-safety-constitution.md)
§2 (Parent Owns the Child's Data) and §9 (Session & Device Security);
[ADR-0006](../../decisions/ADR-0006-data-privacy-compliance.md) §4, §6,
§16; [ADR-0007](../../decisions/ADR-0007-target-audience-interim-posture.md)
(the `date_of_birth` field supports, but does not itself decide, the
4–10 age posture); [ADR-0008](../../decisions/ADR-0008-core-data-model-parent-family-child.md)
(records this document's design as the accepted-pending-review data
model decision); `docs/sprints/sprint-02.md`, §3, Milestone 1.

**Status note:** per Milestone 1's Definition of Done, this document's
Status remains **Proposed** — not "Approved" — until the founder/
product owner reviews it at the Sprint 02 stop-and-report checkpoint.
