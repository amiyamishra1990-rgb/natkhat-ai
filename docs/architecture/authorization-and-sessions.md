# Authorization & Session Architecture

**Version:** 1.0.0
**Status:** Proposed — Pending Founder/Product-Owner Review (Sprint 02,
Milestone 2 deliverable, reviewed together with
[ADR-0009](../decisions/ADR-0009-authorization-and-session-architecture.md)
at the Sprint 02 per-milestone stop-and-report checkpoint;
`docs/sprints/sprint-02.md`, §5's decision-maker note applies — not a
standalone engineering/AI-agent self-certification)
**Owner:** Engineering
**Last Updated:** 2026-08-05

> This document is Sprint 02, Milestone 2's deliverable
> (`docs/sprints/sprint-02.md`, §3, M2). It is an architecture-level
> design document only. It designs no real token issuance, no
> credential validation, no Supabase Auth integration, and no login
> flow — see [ADR-0009](../decisions/ADR-0009-authorization-and-session-architecture.md)
> and §7 (Explicit Exclusions) below. It builds on, and does not
> redesign, the Parent/Family/Child/CoParentAssignment/Device/Session
> entity shapes from
> [`docs/modules/identity-family/README.md`](../modules/identity-family/README.md)
> and [ADR-0008](../decisions/ADR-0008-core-data-model-parent-family-child.md).
> Every example is fictional; no real parent, child, or family data
> appears here.

---

## 1. Objective

Design the RBAC/tenant-scoped authorization model — parent-only
actions, any-child-session restrictions, and device/session management
— per [ADR-0006](../decisions/ADR-0006-data-privacy-compliance.md) §6
(Parent/Child Authorization Boundaries), §16 (Tenant/Family Isolation),
and the
[Child Privacy & Safety Constitution](../constitution/product/child-privacy-and-safety-constitution.md)
§9 (Session & Device Security). Verbatim from
`docs/sprints/sprint-02.md`, §3, M2.

## 2. Scope

- Authorization-check model design: **role × family-scope**, not role
  alone.
- Session/token lifecycle design at the architecture level — no real
  token issuance.
- An explicit statement of which actions are parent-only vs. shared
  (co-parent-capable).
- Device/session management design supporting Constitution §9
  (view/remove devices, end sessions remotely, review login history).

Out of scope (per `docs/sprints/sprint-02.md`, §2.2 and M2's own
Explicit Exclusions): Supabase Auth integration, real
session/token issuance or validation code, login-flow implementation,
Row-Level Security policy syntax (Milestone 3), retention/deletion
windows (Milestone 4), consent architecture (Milestone 5), any
Leo/conversation entity (Milestone 6), audit-log schema (Milestone 7 —
this document only names the events a future audit log must capture).

## 3. Principals and Roles

Per the M1 entity model, there is exactly one adult principal type:
**Parent**. "Owner" and "Co-Parent" are not separate principal types —
they are **roles a Parent holds with respect to one specific
`family_id`** (`docs/modules/identity-family/README.md`, §3.1). A
Parent's authorization is therefore never evaluated as "is this a
valid parent" — it is always evaluated as "is this Parent authorized
for this specific `family_id`, in this specific role" (ADR-0008,
Decision item 4).

| Role (per `family_id`)                | Held by                                                                 | Authority                                                                                                                                                                                                  |
| ------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `owner`                               | The Parent matching that Family's `owning_parent_id`                    | Full authority over that Family — including every parent-only action (§5).                                                                                                                                 |
| `co_parent`                           | A Parent with an `active` `CoParentAssignment` row for that `family_id` | Authority bounded by that assignment's `permission_scope`; parent-only actions are never in scope regardless of `permission_scope`'s contents (§5).                                                        |
| `child` _(reserved, not implemented)_ | A `Session` with `principal_type = Child` for that `family_id`          | No parent-only action, ever, unconditionally — see §6.3. No product feature authorizes issuing a Child session today (M1 §3.4); this role is designed so the model is not blocked if one is ever approved. |

A single Parent principal may hold `owner` for one `family_id` and
`co_parent` for another (M1 §3.1, ADR-0008 Decision item 4 — e.g.
shared-custody or blended-family cases). Role is never a property of
the Parent alone; it is always a property of the `(Parent, family_id)`
pair.

## 4. Authorization-Check Model: Role × Family-Scope

Every authorization check is a pure function of four inputs — never
fewer:

```
authorize(principal_id, principal_type, requested_family_id, requested_action) → allow | deny
```

Evaluated in this fixed order, per ADR-0006 §6's "tenant/family-scoped,
not role-scoped alone" requirement:

1. **Resolve the principal's authorized family set.** For a Parent:
   `{ family_id : Family.owning_parent_id = principal_id }` ∪
   `{ family_id : ∃ active CoParentAssignment where parent_id = principal_id }`.
   For a (reserved) Child: the single `family_id` on their own `Child`
   record — always exactly one, never a set (M1 §3.4's "a Child
   belongs to exactly one Family" invariant).
2. **Tenant-scope gate.** If `requested_family_id` is not a member of
   that set, **deny** — unconditionally, before the requested action is
   even inspected. This is the check ADR-0006 §6 names explicitly: "a
   valid child-role token must still be rejected outside its own
   family," generalized here to every principal type, not only Child.
3. **Resolve role for that specific `family_id`.** `owner` if
   `Family.owning_parent_id = principal_id`; `co_parent` if an active
   `CoParentAssignment` matches; `child` if `principal_type = Child`
   (reserved).
4. **Action-permission gate.** Look up `requested_action` against the
   resolved role's permitted-action set (§5). `owner` — all actions.
   `co_parent` — only actions within `CoParentAssignment.permission_scope`,
   with parent-only actions (§5) hard-excluded regardless of what
   `permission_scope` contains. `child` (reserved) — only
   child-permitted actions (none defined in this Sprint; every
   parent-only and every co-parent action is denied).
5. **Allow** only if both gates (2) and (4) pass.

Step 2 (tenant scope) and step 4 (action permission) are independent
gates — a request must clear both. This is deliberate: it prevents a
future bug in the action-permission table from ever becoming a
cross-family leak, and prevents a future bug in family-set resolution
from ever granting an out-of-scope action. Satisfies ADR-0006 §16
("isolation... not solely in application-layer query filters") at the
authorization-model level; the database-layer enforcement (RLS) of the
same invariant is Milestone 3's job, not redesigned here.

## 5. Parent-Only vs. Shared Actions

Per ADR-0006 §6's explicit list plus the Constitution's ownership
principle (§2) and safe-sharing requirements (§4):

| Action                                                       |                             `owner`                              |            `co_parent`             | `child` (reserved) |
| ------------------------------------------------------------ | :--------------------------------------------------------------: | :--------------------------------: | :----------------: |
| View child profile / growth reports                          |                               Yes                                |   Only if in `permission_scope`    |         No         |
| Update child profile (name, avatar, DOB)                     |                               Yes                                |   Only if in `permission_scope`    |         No         |
| Create a Child record within the Family                      |                               Yes                                |   Only if in `permission_scope`    |         No         |
| Invite / revoke a Co-Parent [^1]                             |                               Yes                                |   Only if in `permission_scope`    |         No         |
| Billing / subscription changes                               |                               Yes                                | **No — owner-only, unconditional** |         No         |
| Family/account deletion                                      |                               Yes                                | **No — owner-only, unconditional** |         No         |
| Data export (Constitution §10)                               |                               Yes                                | **No — owner-only, unconditional** |         No         |
| Create/revoke a share link (Constitution §4)                 |                               Yes                                | **No — owner-only, unconditional** |         No         |
| Consent-of-record changes (ADR-0006 §5, Milestone 5's scope) |                               Yes                                | **No — owner-only, unconditional** |         No         |
| View own device list / end own sessions (Constitution §9)    |                        Yes (own devices)                         |         Yes (own devices)          |         No         |
| View/remove _another_ principal's devices or sessions        | No — no principal ever manages another's device inventory (§6.4) |                 No                 |         No         |

[^1]:
    **Correction, founder-confirmed 2026-08-18 (Sprint 03, M15):**
    this row originally read "No — owner-only, unconditional," which
    conflicted with the prose immediately below the table naming
    exactly _five_ owner-only-unconditional rows (ADR-0006 §6's named
    list, which does not include co-parent invite/revoke) and with
    ADR-0009's Decision item 3, which likewise names only five. The
    founder confirmed the literal ADR-0009 reading during M15
    implementation: inviting/revoking a co-parent is a co-parent-
    eligible action, grantable via `permission_scope` like any other
    non-owner-only action, not a sixth hard invariant. Corrected here
    rather than silently left inconsistent; the original wording is
    preserved in this footnote for traceability, not deleted from
    history. See `apps/backend/src/authorization/authorization.types.ts`
    for the implementation this now matches.

The five rows marked **owner-only, unconditional** are exactly
ADR-0006 §6's named list ("billing, account deletion, data export,
sharing, consent changes") — they are excluded from every
`CoParentAssignment.permission_scope` value by construction (M1 §3.5:
"`permission_scope`... explicitly excludes owner-only actions"), not
merely by convention. A future `permission_scope` enum that somehow
included one of these five is itself a design defect against this
table, not a valid scope value.

## 6. Session and Token Lifecycle (Architecture-Level Only)

No token format, signing scheme, or Supabase Auth call is designed
here — that is ADR-0005's eventual implementation. This section
designs the lifecycle states and the family-scoping rule a real
implementation must satisfy.

### 6.1 Session establishment

A `Session` (M1 §3.6 shape: `principal_id`, `principal_type`,
`family_id`, `device_id`, `started_at`, `last_active_at`, `ended_at`,
`end_reason`) is created once a principal authenticates (mechanism:
ADR-0005, deferred) and selects an **active family context**.

**Design decision — a Session is pinned to exactly one `family_id` at
a time, even for a Parent authorized across multiple Families.** A
Parent who is `owner` of Family A and `co_parent` of Family B does not
get one ambient session valid for both. Rationale: the M1 module
explicitly assigns Milestone 2 the job of designing "is this Parent
authorized for this specific `family_id`" (ADR-0008, Decision item 4)
rather than a broader "is this a valid parent for any family they
touch." A session-wide, multi-family grant would silently widen the
blast radius of a stolen or misused session token beyond what any
single request needs — the opposite of ADR-0006 §16's isolation intent.
This also keeps `Session.family_id` meaningful as a single value,
matching the M1 entity shape as authored (not extended into a set).

### 6.2 Switching active family context

A Parent authorized for more than one Family switches context via an
explicit **family-switch operation**, not silent session reuse:

1. The requesting principal specifies the target `family_id`.
2. §4's full `authorize(...)` check runs against that `family_id` —
   including the tenant-scope gate — exactly as it would for any other
   action.
3. Only on success is a **new** `Session` established for the target
   `family_id` (or the existing session's `family_id` is rotated, with
   the change itself recorded as a lifecycle event) — the prior
   session's authorization for Family A is never silently carried over
   to Family B.

Family-switch is itself an authorization-relevant event and is named
here as one Milestone 7's audit-log schema must capture (`who`
switched, `from`/`to family_id`, `when`) — not designed or implemented
in this milestone.

### 6.3 Cross-family authorization-bypass walkthrough (acceptance criterion)

**Scenario A — Parent, family-scoped session.** A Parent is `owner` of
Family A and holds no role in Family B (no `owning_parent_id` match,
no active `CoParentAssignment`). Their current `Session.family_id =
Family A`. They attempt to read a Child record belonging to Family B.

- Step 2 of §4 (tenant-scope gate) resolves the Parent's authorized
  family set as `{ Family A }`. Family B is not a member.
- **Denied** — before any action-permission logic runs. No
  `permission_scope`, role elevation, or session field can override
  this gate; it is evaluated first and independently (§4).

**Scenario B — the ADR-0006 §6 named case, generalized.** A `child`
(reserved) principal type holds a valid `Session` with `family_id =
Family A`. A request targets `family_id = Family B` (e.g., a
maliciously modified request or a copied/replayed session artifact).

- Family A ≠ Family B → the Child's authorized family set (always a
  singleton, M1 §3.4) does not contain Family B.
- **Denied**, by the identical tenant-scope gate used in Scenario A —
  the same check, not a parallel one, closing the risk (M1 §6) that
  "Design work for M8... implicitly favors a specific provider" kind of
  drift, here applied to authorization: one non-bypassable gate, not
  role-specific gates that could individually be forgotten.

**Scenario C — a co-parent attempting an owner-only action within
their own authorized family.** A Parent holds `co_parent` for Family A
(passes the tenant-scope gate) and requests `family/account deletion`
[^2] — an owner-only action (§5).

- Tenant-scope gate (step 2): passes — Family A is in their authorized
  set.
- Action-permission gate (step 4): `family/account deletion` is
  excluded from `permission_scope` by construction (§5, M1 §3.5) —
  **denied**, even though the requester is legitimately scoped to the
  family. This demonstrates the two gates are independent: passing
  tenant-scope does not imply passing action-permission.

[^2]:
    **Correction, founder-confirmed 2026-08-18 (Sprint 03, M15):**
    this example originally used `revoke co-parent access` as the
    illustrative owner-only action — no longer accurate after the §5
    table correction ([^1]) reclassified co-parent invite/revoke as
    `permission_scope`-eligible, not owner-only. Replaced with an
    action still genuinely on the five-item owner-only list so this
    walkthrough continues to demonstrate the two gates correctly.

All three scenarios resolve to the correct deny outcome using the same
two-gate check from §4 — satisfying M2's acceptance criterion of
walking through at least one cross-family authorization-bypass
scenario and showing the design rejects it.

### 6.4 Device inventory and session revocation (Constitution §9)

Per the M1 `Device` shape (`docs/modules/identity-family/README.md`,
§3.6): **Device is scoped to the owning Parent, not to the Family.**
A co-parent's device list is theirs alone to view/manage — no
principal ever views or removes another principal's device (§5, last
row). This directly satisfies Constitution §9's "Parents can: view
active devices, remove devices" as an individual, not shared, capability.

Revocation/end-session paths this architecture must support:

| Trigger                                                                       | Effect                                                                                                                                                                                                                                                                                                                                              |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Parent removes their own device (Constitution §9)                             | Device.status → removed; every Session with that `device_id` gets `ended_at` set, `end_reason = device_removed`.                                                                                                                                                                                                                                    |
| Parent ends a session remotely (Constitution §9, "review login history")      | Targeted Session gets `ended_at` set, `end_reason = user_initiated`. Requires the same §4 authorization check — a Parent may only end their own sessions.                                                                                                                                                                                           |
| Owning Parent revokes a `CoParentAssignment` (M1 §3.5)                        | `CoParentAssignment.status → revoked`; **cascades**: every active `Session` with `principal_type = Parent`, `principal_id = revoked co-parent`, `family_id` = that Family gets `ended_at` set, `end_reason = access_revoked`. This is the architectural guarantee behind "access can be revoked immediately" (Mandatory Security Review Checklist). |
| Session simply expires (age/inactivity — exact timeout values not fixed here) | `ended_at` set, `end_reason = expired`. Exact timeout window is an implementation parameter for ADR-0005's eventual implementation, not fixed by this design.                                                                                                                                                                                       |

The co-parent-revocation cascade (row 3) is the design detail that
makes "revoked" mean something operationally, not just a status flag
with no session-level effect — a revoked `CoParentAssignment` with a
still-live `Session` would be a real authorization gap, not merely an
inconsistency, and step 2 of §4 (tenant-scope gate, re-evaluated on
every request, not cached for a session's lifetime) is what actually
closes it: even before any cascade job runs, the very next request on
that session re-resolves the authorized family set from current
`CoParentAssignment.status`, so a revoked co-parent's next request is
denied regardless of whether the cascade has already run.

### 6.5 Login history (Constitution §9)

"Review login history" is satisfied by treating every `Session` row
(including ended ones) as append-only history from the Parent's own
point of view — a Parent's login history view is exactly the set of
`Session` rows where `principal_id` = that Parent, across every
`family_id` they are authorized for (their own, per §4 step 1) — never
another principal's sessions. No new entity is introduced for this;
the M1 `Session` shape already carries every field needed
(`started_at`, `device_id`, `ended_at`, `end_reason`).

## 7. Explicit Exclusions

No Supabase Auth integration or account/credential code. No real
token issuance, signing, or validation. No login-flow UI or API. No
Row-Level Security policy syntax (Milestone 3). No retention/deletion
windows for `Session`/`Device` history (Milestone 4, founder-gated). No
audit-log storage or pipeline (Milestone 7 — this document only names
the events such a log must capture). No consent-mechanism code
(Milestone 5). No Leo/conversation entity or isolation design
(Milestone 6). No real parent, child, or family data anywhere in this
document.

## 8. Consistency Check Against ADR-0005

ADR-0005 (Supabase Auth, Accepted — Implementation Deferred) commits
only to a provider choice, not to any authorization-model detail. This
design does not contradict it: role × family-scope authorization is
implementable as application-layer + database-layer (Milestone 3 RLS)
logic on top of whatever principal identity Supabase Auth eventually
issues (`Parent.auth_identity_ref`, per M1 §3.2, is already the
placeholder link for that). Nothing here requires a different
authentication provider or blocks Supabase Auth's eventual adoption.

## 9. Constitution/ADR Traceability

| Design element                                                | Traces to                                                                                  |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Role × family-scope check, never role alone                   | ADR-0006 §6                                                                                |
| Tenant-scope gate evaluated independently and first           | ADR-0006 §16; Constitution §8 ("Conversation isolation is mandatory")                      |
| Parent-only action list (§5)                                  | ADR-0006 §6 ("billing, account deletion, data export, sharing, consent changes")           |
| Child-role rejection-outside-family design (§6.3, Scenario B) | ADR-0006 §6, named verbatim                                                                |
| Device/session view, remove, end-remotely, login-history      | Constitution §9                                                                            |
| Co-parent revocation cascades to sessions                     | Constitution §9 ("access can be revoked immediately," Mandatory Security Review Checklist) |
| No principal views/manages another's devices                  | Constitution §2 (Parent ownership), §3 (no cross-principal exposure)                       |
| Session-pinned-to-one-family / explicit family-switch         | ADR-0008 Decision item 4; ADR-0006 §16                                                     |

## 10. Testing Implications (design-level only)

Per `docs/engineering/testing-strategy.md`'s taxonomy: no code exists
yet. Once implemented (post-ADR-0005 implementation-gate clearance),
this design's minimum bar is **Unit** (the four-step `authorize(...)`
function in isolation, each gate tested independently), **Integration**
(the three §6.3 scenarios, plus the co-parent-revocation cascade),
and **Security** (session-hijack/replay resistance of the family-pinning
rule). Widget, End-to-end, Performance, Accessibility, and Regression
layers apply to the features built on top of this design, not to this
document.

## 11. Deployment

Not applicable — documentation-only milestone; nothing is deployed
(`docs/sprints/sprint-02.md`, §2.2).

---

## Constitution Alignment

Traces to:
[Child Privacy & Safety Constitution](../constitution/product/child-privacy-and-safety-constitution.md)
§8 (Conversation isolation mandatory), §9 (Session & Device Security),
§12 (Secure Development Standards — authorization checks); [Product
Constitution](../constitution/product/natkhat-ai-constitution.md) Core
Principle 2 ("Parent partnership") and the Trust-Above-All amendment;
[Engineering Constitution](../constitution/engineering/engineering-constitution.md)
Mandatory Engineering Review Gates (Security, Parent Trust);
[ADR-0005](../decisions/ADR-0005-authentication.md) (extended, not
contradicted — see §8 above); [ADR-0006](../decisions/ADR-0006-data-privacy-compliance.md)
§6, §16 (implemented directly, cited throughout);
[ADR-0008](../decisions/ADR-0008-core-data-model-parent-family-child.md)
(entity shapes consumed as-is, not redesigned);
`docs/sprints/sprint-02.md`, §3, Milestone 2.

**Status note:** per Milestone 2's Definition of Done, this document's
Status remains **Proposed** — not "Approved" — until the founder/
product owner reviews it at the Sprint 02 stop-and-report checkpoint.
