# Data Classification, Encryption & Tenant-Isolation Design

**Version:** 1.0.0
**Status:** Proposed — Pending Founder/Product-Owner Review (Sprint 02,
Milestone 3 deliverable, reviewed together with
[ADR-0010](../decisions/ADR-0010-encryption-and-tenant-isolation-design.md)
at the Sprint 02 per-milestone stop-and-report checkpoint;
`docs/sprints/sprint-02.md`, §5's decision-maker note applies — not a
standalone engineering/AI-agent self-certification)
**Owner:** Engineering
**Last Updated:** 2026-08-05

> This document is Sprint 02, Milestone 3's deliverable
> (`docs/sprints/sprint-02.md`, §3, M3). It is an architecture-level
> design document only. It designs no real database schema, no RLS
> policy execution, no field-level encryption code, and no key
> generation or storage — see
> [ADR-0010](../decisions/ADR-0010-encryption-and-tenant-isolation-design.md)
> and §10 (Explicit Exclusions) below. It classifies and adds
> database-layer isolation/encryption design on top of, and does not
> redesign, the Parent/Family/Child/CoParentAssignment/Device/Session
> entities from
> [`docs/modules/identity-family/README.md`](../modules/identity-family/README.md)/[ADR-0008](../decisions/ADR-0008-core-data-model-parent-family-child.md),
> and the role × family-scope authorization model from
> [`docs/architecture/authorization-and-sessions.md`](./authorization-and-sessions.md)/[ADR-0009](../decisions/ADR-0009-authorization-and-session-architecture.md).
> Every example is fictional; no real parent, child, or family data
> appears here.

---

## 1. Objective

Resolve the open engineering-design questions
[ADR-0006](../decisions/ADR-0006-data-privacy-compliance.md) explicitly
deferred to Sprint 02: §14 (field-level vs. managed encryption for
highest-sensitivity fields) and §16 (concrete Row-Level Security design
for tenant isolation). Verbatim from `docs/sprints/sprint-02.md`, §3,
M3.

## 2. Scope

Per-tier (ADR-0006 §7) technical design: which fields need
application/field-level encryption beyond Supabase/PostgreSQL's managed
at-rest encryption; PostgreSQL RLS policy design ensuring isolation is
enforced at the database layer, not only in application code.

Out of scope (per `docs/sprints/sprint-02.md`, §2.2 and M3's own
Explicit Exclusions): real Supabase project configuration, RLS policy
execution, field-level encryption key generation or storage, retention/
deletion/backup-purge windows (Milestone 4, founder-gated), consent
architecture (Milestone 5), Leo/conversation entities themselves
(Milestone 6 — this document sets the policy those future entities must
follow), audit-log schema (Milestone 7).

## 3. Data Classification Model

Every field in every M1 entity, mapped to
[ADR-0006](../decisions/ADR-0006-data-privacy-compliance.md) §7's five
tiers. Tier 3 has no fields yet — no Sensitive Child Content entity
exists until Milestone 6 — but its policy is designed prospectively
here so Milestone 6 has a concrete rule to build against, satisfying
this milestone's acceptance criterion that every tier in §7's table
receives a decision, not just the tiers with fields today.

| Tier                           | Existing fields (this Sprint)                                                                                          | Isolation boundary (§6)                                              |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **1. Account/Identity**        | `Parent`(all fields), `Family`(all fields), `CoParentAssignment`(all fields), `Device`(all fields)                     | Family for `Family`/`CoParentAssignment`; Parent for `Device` (§6.2) |
| **2. Child Profile**           | `Child.first_name`, `Child.date_of_birth`, `Child.avatar_ref`                                                          | Family                                                               |
| **3. Sensitive Child Content** | None yet — prospective policy only (future: conversations, Leo memories, voice, images/photos, drawings — Milestone 6) | Family (once modeled)                                                |
| **4. Growth/Progress**         | None yet — prospective policy only (future: achievements, growth reports)                                              | Family (once modeled)                                                |
| **5. System/Operational**      | None yet — `Session`'s own visibility is principal-scoped (§6.3), not classified as Tier 5 (see note below)            | Principal (once modeled — Milestone 7 audit logs)                    |

**Note on `Session`/`Device`:** these are Account/Identity-tier by
content sensitivity (device labels, timestamps — standard PII-adjacent
metadata), but unlike a true Tier 5 audit log they are directly
parent-readable via the future Privacy Dashboard (Constitution §10,
"review login history") rather than an internal-only system record —
so they are classified Tier 1, not Tier 5, and are exempt from Tier 5's
"append-only, non-deletable by the parent" rule (M2
`docs/architecture/authorization-and-sessions.md`, §6.4/§6.5 already
gives the parent an end-session/remove-device action over their own
rows — that stands, unchanged by this document).

**Child row baseline.** `Child.created_by_parent_id`, `created_at`, and
`status` are structural/actor-of-record fields, not child-generated
content — but per this design's rule, **a row's baseline protection is
its highest applicable field's tier**, not an average. Every field in
the `Child` row therefore inherits Tier 2's baseline controls
(encrypted at rest/transit, parent-only write) uniformly, even the
structural fields, so no single field on that row is ever left at a
lower control level than its siblings.

`family_id` columns themselves (the partition key present on `Child`,
`CoParentAssignment`, and — once modeled — every Tier 3/4 table) are
classified as structural/Tier 1 in sensitivity, but their function is
special: they are the RLS discriminant (§7), not ordinary content, and
must remain in plaintext for the database to filter on — see §5.3.

## 4. Highest-Sensitivity Fields and Their Treatment

Per ADR-0006 §7, **Tier 3 (Sensitive Child Content)** is the highest
sensitivity tier: conversations, Leo memories, voice, images/photos,
drawings. None of these exist as an M1 entity today (Milestone 6). Of
fields that exist today, `Child.date_of_birth` and `Child.first_name`
(Tier 2) are the most sensitive currently-modeled fields — directly
child-identifying and, for `date_of_birth`, tied to the ADR-0007 §D
4–10 age-range determination.

Treatment:

- **Tier 2 fields (today: `Child.first_name`, `date_of_birth`,
  `avatar_ref`):** managed at-rest/in-transit encryption (Supabase/
  PostgreSQL) is sufficient, per ADR-0006 §7's own baseline for this
  tier ("Encrypted at rest/transit, parent-only write"). No additional
  field-level encryption is required — see §5.1 for why Tier 3 is
  treated differently.
- **Tier 3 fields (prospective — Milestone 6):** field-level
  (application-layer) encryption is **required**, in addition to
  managed at-rest encryption — see §5 for the full design and
  rationale. This directly resolves ADR-0006 §14's open question.

## 5. Encryption Design

### 5.1 Per-tier decision

| Tier                       | Managed at-rest/in-transit (Supabase/Postgres, TLS) |                Additional field-level (application-layer) encryption                 |
| -------------------------- | :-------------------------------------------------: | :----------------------------------------------------------------------------------: |
| 1. Account/Identity        |                 Required (baseline)                 |                                     Not required                                     |
| 2. Child Profile           |                 Required (baseline)                 |                                     Not required                                     |
| 3. Sensitive Child Content |                 Required (baseline)                 |                         **Required** — resolves ADR-0006 §14                         |
| 4. Growth/Progress         |                 Required (baseline)                 |                                     Not required                                     |
| 5. System/Operational      |                 Required (baseline)                 | Not required (append-only integrity matters more than confidentiality-in-depth here) |

**Rationale for the Tier 1/2/4/5 vs. Tier 3 split:** ADR-0006 §14
itself frames the open question as specifically about "the
highest-sensitivity fields (voice, images, Leo memory content)" — the
tier the Child Privacy & Safety Constitution singles out for enhanced
protection (§6 "Leo Memory Protection," §7 "Voice & Image Security").
Applying the same field-level requirement to every tier would be
disproportionate defense-in-depth with real implementation cost and no
Constitution/ADR mandate behind it for the lower tiers; applying it to
none of Tier 3 would leave §14's own named question unresolved. This
design extends the field-level requirement from §14's three literal
examples (voice, images, Leo memory content) to all five Tier 3
categories in ADR-0006 §7's table (adding conversations and drawings),
for internal consistency — treating one Sensitive Child Content
category more weakly than its siblings with no stated reason would
itself be an unexplained gap.

### 5.2 Tier 3 field-level encryption design: per-Family envelope encryption

**Design decision:** Tier 3 content is encrypted at the application
layer using **envelope encryption with a per-Family Data Encryption
Key (DEK)**, before being written to storage (which then also receives
Supabase/Postgres's own managed at-rest encryption as a second,
independent layer):

- Each `Family` (the tenant boundary, ADR-0008 Decision item 1) has
  exactly one active DEK associated with it (a symmetric content-
  encryption key). This is a **design-level association only** — no
  new field is added to the `Family` entity by this document (that
  would be a Milestone 1 redesign); the DEK-to-Family association is
  metadata a future implementation manages in its own key-management
  layer, not a new column on `Family`.
- The DEK itself is never stored in plaintext. It is wrapped ("enveloped")
  by a Key Encryption Key (KEK) held in a managed key-management
  service consistent with the locked GCP cloud target (`PROJECT.md`,
  Approved Tech Stack — GCP; ADR-0006 §29's "dedicated secrets manager"
  requirement). Which specific KMS product/API is used is an
  implementation-stage decision, not fixed here (§11).
- Tier 3 content fields are encrypted client-of-the-database-side
  (application layer) with the Family's DEK before the write reaches
  Postgres/Supabase Storage; they are decrypted only in application
  memory at authorized read time — never decrypted inside the
  database engine itself.
- **Why per-Family, not one global DEK:** scoping encryption keys to
  the same boundary as tenant isolation means encryption reinforces
  isolation rather than being a parallel, independently-reasoned
  control. A raw database dump, a misconfigured backup, or a bulk
  export bug exposes only ciphertext keyed per Family — not usable
  plaintext across families — even in a scenario where RLS itself was
  bypassed or misconfigured (§8, Scenario 3). This is the direct
  answer to this milestone's stated Security Principle: encryption
  becomes a second, independent boundary, not merely a property
  applied uniformly regardless of tenant.
- Columns needed for querying/filtering (`family_id`, timestamps,
  foreign keys) are **not** encrypted — only the Tier 3 content itself
  (message text, memory content, audio/image blob references) is. RLS
  (§7) still needs `family_id` in plaintext to filter rows; encrypting
  it would defeat the database-layer isolation this same document
  requires.

### 5.3 What this does not decide

Key rotation policy, KMS product selection, DEK-caching strategy,
performance impact of per-Family keys at scale, and exact algorithm/
mode (e.g., AES-256-GCM is the expected default given industry
standard practice, but is not being ratified as a binding
implementation detail here) are implementation-stage decisions — flagged in §11, not
resolved by this design document.

## 6. Tenant/Family-Isolation Boundary

**Family is the tenant/isolation boundary for Family- and Child-scoped
data** — per ADR-0008, Decision item 1, unchanged and not redesigned
here. Every table holding Child, CoParentAssignment, or (once modeled)
Tier 3/4 content must carry `family_id`, and every such table's RLS
policy (§7) partitions on it.

### 6.1 The one boundary exception the M1/M2 architecture itself already establishes

Per the explicit instruction to treat Family as the tenant boundary
**only where the approved M1/M2 architecture and governing documents
actually support it**, two entities are **not** Family-partitioned,
because M1/M2 already designed them that way:

- **`Device` is Parent-scoped, not Family-scoped.**
  `docs/modules/identity-family/README.md`, §3.6, is explicit: "Scoped
  to the Parent, not the Family — a co-parent's device list is theirs
  to manage, not shared inventory." This document does not override
  that — it carries it forward: `Device`'s RLS isolation boundary
  (§7.2) is `parent_id`, not `family_id`.
- **`Session` visibility (login history) is Parent-scoped, not
  Family-scoped**, even though `Session` carries `family_id`.
  `docs/architecture/authorization-and-sessions.md`, §6.5, is explicit:
  a Parent's login-history view is "the set of `Session` rows where
  `principal_id` = that Parent... never another principal's sessions"
  — spanning every Family they're authorized for, in one list.
  `Session.family_id` remains present and is used by the M2
  authorization check (`authorize(...)`, §4 there) — it is not the row-
  visibility partition key for who may read a `Session` row.

Treating this correctly matters: if this document had defaulted every
table — including `Device`/`Session` — to `family_id`-based RLS without
checking M1/M2 first, it would have **silently redesigned** an already-
approved M1/M2 decision, which is explicitly prohibited by this
milestone's constraints.

### 6.2 Parent's own record

A Parent's own `Parent` row is neither Family- nor tenant-partitioned
in the sense this document addresses — it is standard principal-
ownership access control (a Parent may read/update their own row,
matched against their authenticated identity), the same pattern
Supabase Auth's own row-ownership idiom uses. This is a distinct,
simpler concern from Family-tenant isolation and is noted here only to
avoid an apparent gap — it is not designed further in this document.

## 7. Row-Level Security Design

### 7.1 Design principle: RLS is a coarse tenant backstop, not a re-implementation of M2's action-permission table

`docs/architecture/authorization-and-sessions.md`, §4, already defines
a two-gate application-layer check: a tenant-scope gate and an
action-permission gate (owner vs. co-parent vs. reserved child,
bounded by `permission_scope`). This document's RLS design **mirrors
only the tenant-scope gate** at the database layer — it does not
attempt to re-implement `permission_scope`-level, per-action logic in
SQL policy. Rationale: `permission_scope` values are business-logic
concepts (specific action names) that do not map cleanly onto
row-visibility predicates, and duplicating that logic in two places
(application code and RLS policy) creates exactly the kind of drift
risk ADR-0006 §16 exists to prevent for tenant boundaries — one
authoritative tenant-scope check, backstopped at the database layer;
one authoritative action-permission check, at the application layer.
This is a division of labor, not a weaker design — see §8 for why the
combination still closes every scenario considered.

### 7.2 Per-table policy design (conceptual — no SQL is executed by this document)

| Table                                      | Partition column | Policy shape (conceptual)                                                                                                                                                                                                                          |
| ------------------------------------------ | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Family`                                   | `id` (self)      | Visible/writable only where the requesting principal's authorized-family set (M2 §4 step 1) contains this row's `id` — i.e., `owning_parent_id = current_principal` OR an active `CoParentAssignment` exists for (`current_principal`, this `id`). |
| `Child`                                    | `family_id`      | `family_id = current_family_claim` — see §7.3 for what sets the claim.                                                                                                                                                                             |
| `CoParentAssignment`                       | `family_id`      | `family_id = current_family_claim`. (Fine-grained "can this co-parent see other co-parents' rows" is an application-layer, `permission_scope`-level concern — §7.1 — not filtered further here.)                                                   |
| `Device`                                   | `parent_id`      | `parent_id = current_principal` — **not** `family_id` (§6.1).                                                                                                                                                                                      |
| `Session`                                  | `principal_id`   | `principal_id = current_principal` for row visibility (§6.1); `family_id` remains a plain column used by the M2 authorization check, not the RLS predicate.                                                                                        |
| Tier 3/4 tables (prospective, Milestone 6) | `family_id`      | `family_id = current_family_claim`, plus Tier 3 content columns are additionally application-layer-encrypted (§5.2) — RLS and encryption are independent, stacked controls on the same table.                                                      |

Illustrative pattern (conceptual pseudocode, not real DDL/DML, not
executed):

```
-- Illustrative only — no policy is created or applied by this document.
CREATE POLICY family_tenant_isolation ON child
  FOR ALL
  USING (family_id = current_setting('app.current_family_id')::uuid)
  WITH CHECK (family_id = current_setting('app.current_family_id')::uuid);
```

`WITH CHECK` (not only `USING`) is required on every policy so that an
`INSERT`/`UPDATE` can never write a row into a different family than
the active claim — `USING` alone only filters reads/existing rows.

### 7.3 Where the RLS claim comes from — mirrors M2's session design, does not invent a new concept

`docs/architecture/authorization-and-sessions.md`, §6.1, already
decided: "a Session is pinned to exactly one `family_id` at a time."
This design's `current_family_claim` **is that same value** — the
active family context of the caller's current, already-authorized
`Session` — surfaced to Postgres via whatever mechanism the eventual
ADR-0005 implementation uses to pass authenticated context (e.g., a
Supabase/PostgREST JWT claim, or a `SET LOCAL` issued by the
application after independently re-running the M2 `authorize(...)`
check). This document does not invent a second, parallel notion of
"current family" — it requires that RLS trust exactly the value M2
already establishes as authorized, no more and no less.

### 7.4 Enforcement completeness requirements (design-level, for the future ADR-0004 implementation to satisfy)

- **`FORCE ROW LEVEL SECURITY`** must be applied on every partitioned
  table, not only `ENABLE ROW LEVEL SECURITY` — `FORCE` additionally
  applies RLS to the table's own owning role, closing the common
  misconfiguration where an application's database role is also the
  table owner and therefore silently exempt from its own policies.
- **No request-serving database role may hold `BYPASSRLS`.** Only
  genuinely administrative operations (schema migrations, one-off
  operational scripts) may use an elevated role, and any such
  operation touching Tier 2+ data must independently enforce
  family-scoping in its own logic as a compensating control (§8,
  Scenario 3) — RLS bypass must never be the default connection used
  to serve a user request.
- Every table in §7.2 needs a policy for each of `SELECT`, `INSERT`,
  `UPDATE`, `DELETE` (or a single `FOR ALL` policy where the same
  predicate applies to all four, as illustrated) — a table with RLS
  enabled but no policy defined for a given command defaults to
  denying that command entirely, which is the correct fail-closed
  behavior and should not be "fixed" by adding an overly-permissive
  catch-all policy.

## 8. Cross-Family Attack/Failure Scenarios

Building on the three application-layer scenarios already walked
through in `docs/architecture/authorization-and-sessions.md`, §6.3,
this section adds the database-layer scenarios specific to this
milestone — directly addressing the Security Principle stated for M3:
"A defect, compromised session, incorrect query, or authorization
mistake involving one Family must not expose another Family's
protected information."

**Scenario 1 — Application bug: a query missing its `family_id`
filter.** A future backend code path queries `Child` without an
explicit `WHERE family_id = ...` clause (a real, plausible application
bug — exactly the class of defect ADR-0006 §16 names: "so a single
application bug cannot leak data across families"). Because RLS is
enabled and `FORCE`d (§7.4) at the database layer, Postgres itself
still applies the `family_tenant_isolation` policy regardless of what
the application's query text does or omits — the query transparently
returns only rows matching the caller's `current_family_claim`. The
application bug produces at worst an incomplete-looking result set for
one family, never a cross-family leak.

**Scenario 2 — Credentials with database access but no valid
application-issued session.** An attacker obtains raw database
credentials (e.g., a leaked connection string) but has no legitimate
application session and therefore no valid `current_family_claim` to
present. Every RLS-partitioned table's policy evaluates against an
absent/invalid claim and returns zero rows by default (fail-closed) —
this is the concrete demonstration that database-layer isolation does
not depend on the application layer being correct or even being in the
request path at all.

**Scenario 3 — A bulk/administrative operation using an elevated,
RLS-bypassing role.** A backup job, data-migration script, or
analytics export runs under a role with `BYPASSRLS` (§7.4 flags this
should be rare and controlled, but a real system will have some such
role). If that operation has its own bug and reads across families
inadvertently, RLS provides no protection for that specific pathway —
this is exactly why §5.2's per-Family field-level encryption exists as
an **independent second layer**: even a cross-family read at this
elevated-privilege layer yields only ciphertext keyed to each row's
own Family for Tier 3 content, not usable plaintext. Tier 1/2 content
(not field-level encrypted, §5.1) is not protected by this second
layer — this is a residual risk this document surfaces explicitly
rather than silently accepting: elevated/`BYPASSRLS` roles remain the
single highest-leverage failure mode for Tier 1/2 data, and minimizing
their use (§7.4) is the primary, not secondary, mitigation for those
tiers.

**Scenario 4 — Schema/policy-change regression.** A future migration
accidentally drops or narrows a `family_id`-partitioned table's RLS
policy (e.g., during a schema change unrelated to security). This
document does not resolve this — it flags it as an implementation-
stage process gap: any future migration touching a partitioned table's
policy should require an explicit, checklist-level review step (a
candidate addition to `docs/engineering/checklists/security-checklist.md`
at implementation time), not silently trusted to be caught by ordinary
code review. Recorded here as an open item (§11), not resolved.

## 9. Parent/Child Access-Boundary Implications

- Every scenario in §8 applies identically regardless of whether the
  requesting principal's role is `owner`, `co_parent`, or the reserved
  `child` type (`docs/architecture/authorization-and-sessions.md`, §3)
  — the RLS tenant-scope gate does not distinguish role, only
  `family_id` membership, which is exactly the M2 design's own
  "tenant-scope gate... evaluated independently... before the requested
  action is even inspected" (M2 §4). A future Child session (reserved,
  not activated — M1 §3.4, M2 §3) inherits the same database-layer
  protection automatically, with zero additional RLS design needed for
  it specifically.
- The owner-only action list (M2 §5 — billing, family deletion, data
  export, share-link management, consent changes) remains enforced
  exclusively at the application layer (§7.1) — RLS's `family_id`
  partition does not know or care about that distinction. A `co_parent`
  correctly passes every table's RLS check for their authorized
  Family (they are legitimately scoped to it) and is correctly denied
  an owner-only action by M2's action-permission gate, not by RLS. This
  is intentional layering, not a gap — restated from §7.1 because it is
  the single most important non-obvious property of this design: **RLS
  passing is necessary but never sufficient** for an action to be
  allowed.

## 10. Explicit Exclusions

No real Supabase project configuration. No RLS policy actually created
or applied to any database (§7.2's SQL is illustrative only). No
field-level encryption code, key generation, or key storage of any
kind. No KMS product selected or provisioned. No retention/deletion/
backup-purge windows (Milestone 4). No consent-mechanism code
(Milestone 5). No Leo/conversation/growth-report entity created
(Milestone 6 — this document only sets the policy those future entities
must follow). No audit-log schema or storage (Milestone 7). No real
parent, child, or family data anywhere in this document.

## 11. Deferred to Implementation / Legal / Founder

- **KMS product/API selection, key-rotation policy, DEK-caching
  strategy, and encryption algorithm/mode ratification** — engineering
  implementation-stage decisions, not resolved here (§5.3).
- **Actual RLS policy SQL, `FORCE ROW LEVEL SECURITY` application, and
  database-role privilege configuration** — blocked behind ADR-0004's
  implementation gate, which remains closed pending ADR-0006's Legal
  Validation items (unchanged by this document).
- **A security-checklist addition for migration-time RLS-policy review**
  (Scenario 4, §8) — flagged as a process gap for a future engineering
  Decision Log entry or checklist amendment, not resolved here.
- **No new legal-validation item is introduced by this milestone.**
  Data-localization (ADR-0007 §D.3) remains Milestone 9's concern and
  is not reopened or resolved here; per-Family key scoping (§5.2) is
  compatible with, but does not itself satisfy, any future
  data-residency requirement.

## 12. Testing Implications (design-level only)

Per `docs/engineering/testing-strategy.md`'s taxonomy: no code exists
yet. Once implemented (post-ADR-0004 gate clearance), this design's
minimum bar is **Unit** (per-table RLS predicate correctness in
isolation), **Integration** (the four §8 scenarios, executed against a
real Postgres instance with RLS enabled — not just asserted), and
**Security** (an explicit test that a `BYPASSRLS`-free application role
cannot read another family's row under any query shape, including
malformed/missing `WHERE` clauses). Widget, End-to-end, Performance,
Accessibility, and Regression layers apply to the features built on top
of this design, not to this document.

## 13. Deployment

Not applicable — documentation-only milestone; nothing is deployed
(`docs/sprints/sprint-02.md`, §2.2).

---

## Constitution Alignment

Traces to:
[Child Privacy & Safety Constitution](../constitution/product/child-privacy-and-safety-constitution.md)
§1 (Privacy by Default), §6 (Leo Memory Protection — encrypted storage,
directly satisfied by §5.2's design once Milestone 6 builds on it), §7
(Voice & Image Security — encryption, strict access controls), §8
(Conversation isolation is mandatory), §12 (Secure Development
Standards — encryption at rest/in transit, authorization checks);
[Product Constitution](../constitution/product/natkhat-ai-constitution.md)
Core Principle 2 ("Parent partnership") and the Trust-Above-All
amendment; [Engineering Constitution](../constitution/engineering/engineering-constitution.md)
Mandatory Engineering Review Gates (Security, Privacy) and
`docs/engineering/security-by-design.md`'s "Data encryption" and
"Least privilege" standards;
[ADR-0006](../decisions/ADR-0006-data-privacy-compliance.md) §7, §14,
§16 (directly resolved, cited throughout);
[ADR-0008](../decisions/ADR-0008-core-data-model-parent-family-child.md)
(entity shapes and the Family tenant-boundary decision, consumed as-is);
[ADR-0009](../decisions/ADR-0009-authorization-and-session-architecture.md)
(the tenant-scope gate this design mirrors at the database layer, and
the Device/Session parent-scoping this design carries forward
unchanged); `docs/sprints/sprint-02.md`, §3, Milestone 3.

**Status note:** per Milestone 3's Definition of Done, this document's
Status remains **Proposed** — not "Approved" — until the founder/
product owner reviews it at the Sprint 02 stop-and-report checkpoint.
