# Consent Architecture (Framework-Level Only)

**Version:** 1.1.0
**Status:** Proposed — Founder Decisions Recorded, 2026-08-06 (see §7
and §8): the ConsentEvent-survives-crypto-shredding direction (§7,
Option B) and the consent-mechanism legal-review shortlist direction
(§8: primary/fallback/deprioritized) are founder-approved. **Neither
decision is final or implementation-authorizing** — §7's exact
retention duration and §8's final mechanism both remain open pending
India DPDP legal validation (§11). This document's Status remains
Proposed, not Approved, per Milestone 5's own Definition of Done — see
the Status note at the end of this document for the full explanation
of what founder review at this checkpoint does and does not authorize.
**Owner:** Engineering
**Last Updated:** 2026-08-06

> This document is Sprint 02, Milestone 5's deliverable
> (`docs/sprints/sprint-02.md`, §3, M5). It is an architecture-level
> design document only. It designs no consent-capture code, UI, or
> storage of any real consent record, and does not select or implement
> a specific verifiable-parental-consent mechanism — see
> [ADR-0011](../decisions/ADR-0011-consent-architecture.md) and §12
> (Explicit Exclusions) below. It builds on, and does not redesign, the
> Parent/Family/Child/CoParentAssignment entities
> ([`docs/modules/identity-family/README.md`](../modules/identity-family/README.md)/[ADR-0008](../decisions/ADR-0008-core-data-model-parent-family-child.md)),
> the role × family-scope authorization model and its owner-only
> "consent-of-record changes" action
> ([`docs/architecture/authorization-and-sessions.md`](./authorization-and-sessions.md)/[ADR-0009](../decisions/ADR-0009-authorization-and-session-architecture.md)),
> the classification/encryption/isolation design
> ([`docs/architecture/data-classification-and-isolation.md`](./data-classification-and-isolation.md)/[ADR-0010](../decisions/ADR-0010-encryption-and-tenant-isolation-design.md)),
> and the deletion/lifecycle architecture
> ([`docs/architecture/data-lifecycle.md`](./data-lifecycle.md)). Every
> example is fictional; no real parent, child, or family data appears
> here.

---

## 1. Objective

Design the consent-event/audit-trail architecture (ADR-0006 §5) —
explicitly **not** the specific verifiable-parental-consent mechanism,
which ADR-0007 §C.6/§D.3 gates on legal validation. Verbatim from
`docs/sprints/sprint-02.md`, §3, M5.

## 2. Scope

Design of a versioned, auditable consent-event record (who consented,
when, what was consented to, which privacy-terms version) and how it
gates child-record creation. A short, non-binding shortlist of
candidate consent-verification mechanisms is produced for
founder/legal review — **not selected or implemented here.**

Out of scope (per `docs/sprints/sprint-02.md`, §2.2 and M5's own
Explicit Exclusions): any consent-capture UI, API, or storage of a real
consent record; selection of a specific mechanism; any claim of India
DPDP Act legal sufficiency; database schema, migration, or key
management (ADR-0004/M3 implementation gates unchanged); Leo/
conversation entities (Milestone 6); audit-log schema for non-consent
events (Milestone 7 — this document designs the consent-specific event
record only, per M5's own text, though §6 below notes where the two
will eventually need to interoperate).

## 3. Entity: ConsentEvent

A new entity, not present in M1. Every field has a documented purpose,
per ADR-0006 §2:

| Field                    | Type / shape                                                                                | Purpose                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `id`                     | opaque identifier                                                                           | Referenced by future audit-log entries (Milestone 7) and by this record's own supersession chain (§5.3).                                                                                                                                                                                                                                                                                                           |
| `family_id`              | reference → Family                                                                          | The tenant identifier (ADR-0006 §16) — every ConsentEvent is scoped to exactly one Family, consistent with M1's "a Child belongs to exactly one Family" design decision.                                                                                                                                                                                                                                           |
| `child_id`               | reference → Child, nullable                                                                 | Which Child this consent concerns, once that Child exists. Nullable because the very first consent event for a not-yet-created Child cannot reference a `Child.id` that doesn't exist yet — see §4's ordering.                                                                                                                                                                                                     |
| `consenting_parent_id`   | reference → Parent                                                                          | The actor-of-record. Must resolve to the Family's `owning_parent_id` for any owner-only consent type (§5.4) — enforced by M2's authorization model, not redesigned here.                                                                                                                                                                                                                                           |
| `consent_type`           | bounded enum (`child_account_creation`, `ai_companion_interaction`, `privacy_terms_update`) | What was consented to. A closed set, not free text — every future consent-gated capability must add an explicit new enum value here, not infer consent from an unrelated event.                                                                                                                                                                                                                                    |
| `action`                 | enum (`granted`, `withdrawn`, `renewed`)                                                    | Distinguishes a new grant from a withdrawal or a re-consent triggered by a terms change (§5.3). Never overwritten — see §5.1, append-only.                                                                                                                                                                                                                                                                         |
| `privacy_terms_version`  | version identifier (e.g., semantic version or content hash)                                 | Which version of the privacy terms was in effect at the moment of this event — ADR-0006 §5's explicit requirement ("which version of the privacy terms was in effect"). Enables detecting when re-consent is due.                                                                                                                                                                                                  |
| `verification_method`    | bounded enum, values TBD from §8's shortlist                                                | Which consent-verification mechanism was used. Left as a placeholder enum in this design — no value is populated until the founder/legal process (§8, §11) selects one. Never silently defaulted to "none." Founder-approved direction for legal review (2026-08-06, §8): primary candidate signed/e-signed consent form, fallback payment-card verification — neither is selected or implementation-approved yet. |
| `verification_reference` | opaque reference (external), nullable                                                       | A pointer to verification evidence held by the (not-yet-selected) mechanism's own system of record — e.g., a payment-processor transaction ID or a document-verification provider's reference ID. Deliberately **not** a raw copy of the evidence itself — see §6.3 for why.                                                                                                                                       |
| `created_at`             | timestamp                                                                                   | When this event was recorded. Immutable once written (§5.1).                                                                                                                                                                                                                                                                                                                                                       |
| `ip_address_hash`        | opaque, hashed value, nullable                                                              | Supporting evidence for "verifiable" consent (who/where), stored hashed rather than raw per ADR-0006 §2 minimization — sufficient for a later dispute/audit query without retaining a directly reversible network identifier indefinitely. Design intent, not a specified hashing algorithm (implementation detail).                                                                                               |

## 4. How Consent Gates Child-Record Creation

ADR-0006 §5: "A child identity cannot be created, and no child data may
be collected, without a preceding, verified parent account taking an
explicit consent action." M1's `Child.created_by_parent_id` field
already carries the comment that it "establishes the actor-of-record
that... Milestone 5's consent-event design will reference" — this
section is that reference.

**Design decision — atomic co-creation, not a two-phase "pending
child" state.** M1 does not define a "pending" or "unconfirmed" `Child`
status (only `active` \| `deleted`), and this document does not add one
— extending M1's entity would be a redesign, out of M5's scope (§9).
Instead: a `Child` row and its founding `ConsentEvent`
(`consent_type = child_account_creation`, `action = granted`) are
created as a single atomic operation. `ConsentEvent.child_id` is
populated with the same identifier assigned to the new `Child` row in
that same operation — there is no window in which a `Child` row exists
without a corresponding `ConsentEvent`, and no window in which a
`ConsentEvent` of this type exists referencing a `child_id` that was
never actually created. This is an architectural invariant a future
ADR-0004 implementation must enforce (e.g., a single database
transaction), not a job scheduled to run afterward.

This is consistent with, and does not alter, M2's existing rule that
"Create a Child record within the Family" is an owner-or-scoped-co-parent
action (`docs/architecture/authorization-and-sessions.md`, §5) and that
"consent-of-record changes" is unconditionally owner-only. Reconciling
these two: **creating** a Child (which necessarily includes its founding
consent event) follows the Child-creation permission row; **changing**
consent for a Child that already exists (withdrawal, renewal) follows
the stricter owner-only consent-of-record-changes row. A co-parent with
`manage_child_profile` scope may therefore be able to create a Child
(and thereby produce its founding `ConsentEvent`) but can never later
withdraw or modify that consent — only the owning parent can.
**Flagged, not fully resolved here:** whether a co-parent-initiated
child creation should itself be restricted to owner-only, given that it
implicitly creates a consent record — this is a genuine open design
question this milestone surfaces but does not settle, since M2's
existing table (which M5 does not redesign) already permits scoped
co-parent child-creation, and narrowing that would be a change to M2's
design, not M5's.

## 5. Consent Lifecycle

### 5.1 Append-only, never overwritten

`ConsentEvent` rows are never updated in place and never deleted by a
parent (mirrors ADR-0006 §22's audit-record discipline, applied here to
consent specifically, per §5's own "auditable event" requirement). A
change in consent status is always a **new** row (`action = withdrawn`
or `renewed`), never a mutation of an existing row's `action` field or
its `privacy_terms_version`. The current effective consent state for a
`(family_id, child_id, consent_type)` tuple is derived by reading the
most recent row, not stored redundantly elsewhere.

### 5.2 Withdrawal

A parent may withdraw consent (`action = withdrawn`) for any
`consent_type` at any time — this is a Constitution §2 ("Delete
information") and ADR-0006 §4 (parent ownership/control) guarantee, not
a new one invented here. Withdrawing `child_account_creation` consent
for an existing Child is architecturally defined as **triggering the
same Child soft-delete flow M4 §7.1 already designs** — reusing that
mechanism, not inventing a second deletion pathway. This keeps
"withdraw consent" and "delete my child's data" as one operational
consequence, consistent with ADR-0006 §5's premise that consent is the
precondition for the data existing at all.

### 5.3 Renewal (privacy-terms changes)

When Natkhat AI's privacy terms change materially, a new
`ConsentEvent` (`action = renewed`, updated `privacy_terms_version`) is
required before the affected `consent_type` is considered current.
This document does not design the detection mechanism (e.g., a
version-comparison job) or the parent-facing renewal flow — those are
implementation, out of scope here (§12) — only the data shape that
records the outcome once a renewal happens. This directly implements
ADR-0006 §3 (Purpose Limitation)'s requirement that reused/changed
purposes need "renewed parental consent... where the data is
child-derived."

### 5.4 Owner-only, unconditionally

Every consent **change** action (withdrawal, renewal-initiation) is
owner-only, per M2's existing, unconditional "consent-of-record
changes" row (`docs/architecture/authorization-and-sessions.md`, §5) —
not redesigned here, only invoked.

## 6. Classification & Isolation

M3 (`docs/architecture/data-classification-and-isolation.md`) did not
anticipate this entity — it classifies only M1's existing fields. This
section extends, and does not contradict, M3's classification model for
this new entity, consistent with the way M3 itself prospectively
classified future Tier 3/4 fields before they existed.

### 6.1 `ConsentEvent`'s own tier

`ConsentEvent`'s content fields (who, when, what type, which terms
version, which verification method was used) are **not** child-generated
content (Tier 3) — they are metadata about a parental action, closest in
sensitivity to Tier 1 (Account/Identity). But `ConsentEvent` also needs
a lifecycle property Tier 1 doesn't otherwise require: it must be
**append-only and never deletable by the parent**, the same property M4
§11 assigns to Tier 5 (System/Operational) records, for the identical
underlying reason — a consent record's purpose is to prove a consent
action occurred, and if it could be deleted or rewritten by the same
party whose action it documents, it would stop serving that purpose.

**Design decision:** `ConsentEvent` is classified as **Tier 1 content
sensitivity, with Tier 5 lifecycle behavior** — encrypted at rest/
transit (Tier 1 baseline, no additional field-level encryption
required, per M3 §5.1's Tier 1/2/4/5 vs. Tier 3 split), family-scoped
for RLS isolation (§6.2), but append-only and immune to parent-initiated
deletion, including as part of the M4 §7 deletion cascades — see §6.4
for how this interacts with Child/Family deletion specifically.

### 6.2 Isolation

`ConsentEvent.family_id` is the RLS partition key, exactly as M3 §7
requires for every table carrying child/family data — no new isolation
model is introduced. The cross-family isolation guarantee (M2 §6.3,
M3 §7) applies to `ConsentEvent` identically to every other
family-scoped table.

### 6.3 Verification-evidence artifacts are a separate, higher-tier concern

Several shortlist mechanisms (§8) — a signed form, a government-ID scan
— could produce a raw evidentiary artifact (an image of a form or ID).
**Design decision: `ConsentEvent` never stores such an artifact
directly.** `verification_reference` (§3) holds only an opaque pointer
to wherever that evidence is actually held (e.g., a specialized
verification provider's own system, itself subject to §11's contract-
terms review). If Natkhat AI's own infrastructure ever needs to hold
such an artifact directly, it must be classified **Tier 3 (Sensitive
Child Content)-equivalent** at minimum — arguably higher, since it may
contain a parent's government ID or payment credential, not the child's
own data — requiring the full field-level encryption M3 §5 mandates for
Tier 3. This document flags the requirement; it does not design that
storage, since no mechanism is selected (§8) and no such artifact exists
today.

### 6.4 Interaction with M4 deletion — direction founder-decided, duration still open

M4 (`docs/architecture/data-lifecycle.md`) was authored before this
consent design and explicitly states "No consent mechanism (Milestone
5)" as out of its own scope (M4 §2, §16) — it did not address whether
`ConsentEvent` rows survive a Child/Family hard-delete or M4 §10's
per-Family crypto-shredding. This document identified that tension
rather than silently deciding it, and presented it as founder-decision
candidates in §7. **Founder decision recorded 2026-08-06: §7 Option B**
— `ConsentEvent` may survive Family crypto-shredding, under its own
strictly bounded retention lifecycle. This is a **direction**, not an
implementation: the exact retention duration is explicitly not
approved (§7), remains TBD pending India DPDP legal validation, and
**no change has been made to `docs/architecture/data-lifecycle.md`
itself** — implementing the actual exception to M4 §10's crypto-
shredding cascade requires a separate, follow-on Change Request to that
document once the duration is legally validated, per the founder's
explicit instruction not to rewrite M4 architecture as part of
recording this decision.

## 7. Consent-Record Retention — Founder Decision Recorded

**Decision record.** APPROVED — Option B, founder decision 2026-08-06.
The original candidate-option table and evaluation criteria are
preserved below as the supporting rationale, per this repository's
append-only decision discipline — analysis is not deleted once a
decision is made, only marked with its outcome.

**Approved: Option B — `ConsentEvent` may survive Family
crypto-shredding under its own strictly bounded retention lifecycle.**
Explicit constraints recorded with this decision, none of which are
optional refinements:

- **The exact retention duration is NOT founder-approved.** No number
  of days/months/years is decided here, and none is invented by this
  document. The duration remains **TBD, pending India DPDP/legal
  validation** (§11, item 4).
- **Only the minimum metadata necessary to demonstrate the consent
  event may be retained** under this exception. Every field on
  `ConsentEvent` (§3) — `family_id`, `child_id`, `consenting_parent_id`,
  `consent_type`, `action`, `privacy_terms_version`,
  `verification_method`, `verification_reference`,
  `created_at`, `ip_address_hash` — is who/when/what-type/which-version
  metadata about a parental action; none of it is child conversation,
  memory, photo, or other content. No new field is added to broaden
  what is retained under this exception.
- **This exception covers only the `ConsentEvent` row itself.** It does
  not extend to, and must not be read as authorizing retention of, any
  other data belonging to a deleted Family — child conversations,
  memories, photos, content, unnecessary identifiers, or any other
  record M4 §10 would otherwise crypto-shred on schedule. Everything
  else about a deleted Family is crypto-shredded/purged exactly as M4
  already designs, unchanged by this decision.
- **The exception is itself time-bounded, not a second form of
  indefinite retention.** Once the legally-validated retention duration
  expires, the retained `ConsentEvent` record must itself become
  eligible for deletion — "survives crypto-shredding" means "on its own
  bounded clock," not "forever."
- **This decision does not override any existing legal-validation
  requirement.** It authorizes a design _direction_ only; it does not
  by itself certify DPDP sufficiency of that direction, its duration,
  or the underlying consent mechanism (§8, §11).
- **No change is made to `docs/architecture/data-lifecycle.md`** by
  this decision — see §6.4. Implementing the actual crypto-shredding
  exception in that document is separate, follow-on governance work.

Mirroring M4 §13's candidate-option-table pattern: the table below was
presented for founder review, not decided by this document
unilaterally.

| Option                                   | A — Same lifecycle as the Child/Family                                                           | B — Survives Child/Family deletion, own bounded retention                                                                    | C — Survives deletion, retained indefinitely                                                               |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Purpose                                  | Simplicity — one deletion cascade covers everything, including its own consent trail             | Prove lawful original collection for a bounded post-deletion window, then let even that proof expire                         | Permanent audit trail regardless of how long ago the Family was deleted                                    |
| Privacy impact                           | Best — nothing about a deleted family persists anywhere                                          | Moderate — a minimal metadata record (§6.1) persists for a defined window                                                    | Weakest — some record of every family that ever existed persists forever                                   |
| Compliance/legal impact                  | Weakest — cannot prove lawful original consent once the family is gone, if ever challenged later | Reasonable — matches how M4 §13.3 already treats Tier 5 audit records (bounded, not indefinite)                              | Strongest evidentiary position, but risks ADR-0006 §17's "no indefinite retention without a stated reason" |
| Consistency with M4 §10 crypto-shredding | Consistent — `ConsentEvent` crypto-shreds/hard-deletes alongside its Family, no special case     | Requires `ConsentEvent` to be **exempted** from M4 §10's crypto-shredding cascade — a documented exception, not a silent one | Same exemption as Option B, held longer                                                                    |
| Major trade-off                          | Cleanest architecture, weakest ability to ever prove past-lawful-collection after deletion       | Balances both concerns, adds one bounded-duration exception to M4's otherwise-uniform cascade                                | Strongest proof, in tension with ADR-0006 §17's stated-reason requirement for indefinite retention         |

**Founder-approved direction: Option B** (see the decision record above
this table). Option B's chosen exception to M4 §7's deletion cascades
and §10's crypto-shredding scope is not implemented by this document —
that update to M4 remains out of this milestone's scope to make (§9,
§12) and follows as a separate Change Request once the retention
duration itself is legally validated.

## 8. Consent-Verification Mechanism Shortlist (Non-Binding)

Per `docs/sprints/sprint-02.md`, §3, M5 and ADR-0007 §C.6: a shortlist
for founder/legal review, **not a selection**. None of the below is
adopted, implemented, or asserted to be legally sufficient as
"verifiable parental consent" under India's DPDP Act or any other
regime by this document.

| Option                         | A — Payment-card verification (small authorization charge)                                                                      | B — Signed consent form (uploaded/returned)                                                                                 | C — Government-ID-linked verification (third-party ID-verification provider)                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Mechanism                      | A small, refundable card authorization confirms the consenting party controls a real payment instrument tied to an adult        | Parent downloads/signs/returns a form (physical or e-signature) explicitly describing what is being consented to            | A specialized third-party provider verifies a government-issued ID (or equivalent) against the consenting parent                                       |
| Verification strength          | Moderate — proves payment-instrument control, not identity or age directly                                                      | Weak-to-moderate on its own — proves intent/action, weaker on identity assurance unless combined with e-signature/ID checks | Strongest identity assurance of the three                                                                                                              |
| Privacy impact on the parent   | Requires collecting/processing a payment credential (even if only for verification, not billing) — a new sensitive-data surface | Lowest new data-collection surface of the three, if handled without a third-party e-signature vendor                        | Highest new data-collection surface — a government ID is itself highly sensitive; introduces a third-party processor holding it (ADR-0006 §26 applies) |
| Operational impact             | Requires payment-processor integration; refund/void flow needed                                                                 | Requires a document-intake/review flow (manual or vendor-assisted)                                                          | Requires a specialized ID-verification vendor integration and contract-terms review (ADR-0006 §26, ties to M8)                                         |
| Cost impact                    | Low-moderate (per-transaction processor fee)                                                                                    | Low if self-managed, moderate if vendor e-signature is used                                                                 | Highest — specialized verification vendors typically charge per verification                                                                           |
| India DPDP-fit (not evaluated) | **[LEGAL VALIDATION REQUIRED]** — sufficiency as "verifiable parental consent" under DPDP not assessed                          | **[LEGAL VALIDATION REQUIRED]** — same                                                                                      | **[LEGAL VALIDATION REQUIRED]** — same                                                                                                                 |
| Notable trade-off              | Well-precedented in other regimes (COPPA); untested against DPDP specifically                                                   | Simplest to reason about for a small, India-first launch; weakest identity assurance                                        | Strongest assurance; adds a new third-party data processor for a parent's most sensitive identity document — in tension with ADR-0006 §2 minimization  |

**Founder decision recorded 2026-08-06** (`docs/sprints/sprint-02.md`,
§7, item 3):

- **Primary candidate for legal review: Option B** (signed/e-signed
  consent form).
- **Fallback candidate: Option A** (payment-card verification).
- **Deprioritized: Option C** (government-ID-linked verification),
  because of its additional sensitive-data and third-party privacy/
  security burden (§8 table, "Privacy impact on the parent" and
  "Operational impact" rows). Option C may be reconsidered later only
  if evidence or legal requirements justify it, through the normal
  governance process (a Change Request) — it is not eliminated, only
  deprioritized.

**This decision does not select, approve, or authorize implementation
of Option B or Option A.** It determines only which mechanism(s) are
carried forward for India DPDP/legal sufficiency review (ADR-0007
§C.6). **No production consent-verification mechanism is founder-
approved until that legal validation is completed** (§11). All three
options remain compatible with the `verification_method`/
`verification_reference` shape in §3 without further data-model
change — this was a deliberate design goal, so that whichever mechanism
is eventually legally validated does not require revisiting this
document's entity design.

## 9. Consistency Check Against M1–M4

No M1 entity field, M2 authorization rule, M3 classification/RLS
design, or M4 lifecycle rule is changed by this document.
`ConsentEvent` is a new entity that references M1's `Family`/`Child`/
`Parent` by id only (§3); §4's atomic-co-creation design is stated as an
implementation invariant, not a change to `Child`'s own field list;
§5.2's withdrawal-triggers-deletion behavior explicitly reuses M4 §7.1
rather than defining a second deletion pathway; §6.1–§6.2 extend M3's
classification model to a new entity using the same tier system, the
same way M3 itself prospectively classified not-yet-existing Tier 3/4
fields; §6.4/§7 record a founder-approved **direction** (Option B) for
the interaction gap with M4 §10's crypto-shredding scope, but implement
no change to `docs/architecture/data-lifecycle.md` itself — the exact
retention duration remains open (§11), and the actual crypto-shredding
exception is separate, follow-on Change Request work to that document,
not made here or implied to have been made.

## 10. Security Review Checklist

Every item in the
[Mandatory Engineering Review Checklist](../engineering/review-checklist.md)
answered for this design, not as a claim that undesigned code satisfies
it:

- **Privacy by Default** — YES. `ConsentEvent` carries no field that
  defaults to public/shared visibility; `verification_reference` is an
  opaque pointer, never a raw artifact (§6.3).
- **Child Safety** — YES. No public-facing or searchable field; no
  cross-family reference.
- **Parent Trust** — YES. Every consent action is attributable to a
  specific `consenting_parent_id`, immutable once recorded (§5.1), and
  withdrawal is always available to the owning parent (§5.2).
- **Secure APIs** — N/A at this design stage; no API surface exists or
  is speculated here.
- **Audit Logging** — Design-supports, does not implement.
  `ConsentEvent` **is itself** the auditable record ADR-0006 §5
  requires; it also supplies the actor/event fields Milestone 7's
  general audit-log schema will reference for consent-related events.
- **Search Engine Protection** — N/A. No entity here is publicly
  reachable.
- **Encryption** — Tier 1 baseline (managed at-rest/transit) per §6.1;
  any future verification-evidence artifact is flagged Tier 3-or-higher
  (§6.3), not designed further here.
- **Parent Data Ownership** — YES, with one explicit, bounded exception
  under active founder decision: append-only/non-deletable-by-parent is
  a deliberate departure from "parents can delete their data," justified
  identically to M4 §11's justification for Tier 5 (the record's whole
  purpose is to outlive the possibility of being erased by the party it
  documents) — not a silent contradiction of Constitution §2.
- **AI Safety** — N/A. No AI/Leo entity is introduced here.
- **Product Constitution Compliance** — YES. Directly implements
  Core Principle 2 ("Parent partnership") by making consent an
  explicit, attributable, reversible (via withdrawal) parental act, not
  an implicit or assumed one.

No item above is answered "NO"; none blocks this design from proceeding
to review.

## 11. Legal-Validation Items (Separate from Engineering Decisions)

None of the following are resolved, assumed, or silently ratified by
this document:

1. India DPDP Act legal sufficiency of the consent-capture design in
   §3–§5 once reviewed (ADR-0007 §C.3/§D.3, ADR-0006 Legal Validation
   item 1).
2. Legal sufficiency of whichever specific mechanism (§8) the founder
   eventually directs toward legal review, as "verifiable parental
   consent" under India's DPDP Act specifically (ADR-0007 §C.6).
3. Whether §8 Option C's third-party ID-verification provider's own
   data-handling/retention/training-use terms clear ADR-0006 §26's
   contract-terms review — not evaluated here, ties to Milestone 8.
4. Whether §7's founder-approved Option B direction (ConsentEvent
   surviving Family crypto-shredding) satisfies India DPDP Act erasure
   obligations for the underlying Child/Family data while still being
   defensible as a bounded (not indefinite) exception under ADR-0006
   §17 — ties to ADR-0006 Legal Validation item 1 and M4 §15's existing
   open items.
5. The exact retention duration for Option B itself (§7) — explicitly
   not founder-approved and not invented by this document — is a legal-
   validation input, not a pure business trade-off, since it must be
   defensible as "bounded" under ADR-0006 §17 once a specific number is
   proposed.

## 12. Explicit Exclusions

No consent-capture UI, API, or storage of a real consent record. No
mechanism selected from §8 — only a founder-approved shortlist
direction (primary/fallback/deprioritized) for legal review. No claim
that any listed mechanism is legally sufficient under any regime. No
database schema, migration, key management, or RLS policy execution
(M3/ADR-0004 gates unchanged). No verification-evidence-artifact
storage design beyond the tier flag in §6.3. No change to
`docs/architecture/data-lifecycle.md` or its deletion cascades/
crypto-shredding scope — §6.4/§7 record a founder-approved direction
only; the actual exception is a future, separate Change Request to
that document. No Leo/conversation entity (Milestone 6). No audit-log
schema for non-consent events (Milestone 7). No real parent, child, or
family data anywhere in this document.

## 13. Testing Implications (design-level only)

Per `docs/engineering/testing-strategy.md`'s taxonomy: no code exists
yet. Once implemented (post-ADR-0004 gate clearance, post-mechanism
selection, post-legal-validation), this design's minimum bar is
**Unit** (append-only invariant — no code path may update or delete an
existing `ConsentEvent` row; atomic Child/ConsentEvent co-creation, §4),
**Integration** (withdrawal correctly triggers the M4 §7.1 soft-delete
cascade; a Child row can never exist without a corresponding
`ConsentEvent`), and **Security** (a `ConsentEvent` row is never
returned across a `family_id` boundary, per M3 §7's existing RLS test
pattern). Widget, End-to-end, Performance, Accessibility, and
Regression layers apply to the features built on top of this design.

## 14. Deployment

Not applicable — documentation-only milestone; nothing is deployed
(`docs/sprints/sprint-02.md`, §2.2).

---

## Constitution Alignment

Traces to:
[Child Privacy & Safety Constitution](../constitution/product/child-privacy-and-safety-constitution.md)
§2 (Parent Owns the Child's Data), §11 (Child Data Minimization —
`verification_reference` design in §6.3, `ip_address_hash` in §3), §12
(Secure Development Standards — audit logging);
[Product Constitution](../constitution/product/natkhat-ai-constitution.md)
Core Principle 2 ("Parent partnership") and the Trust-Above-All
amendment;
[Engineering Constitution](../constitution/engineering/engineering-constitution.md)
Mandatory Engineering Review Gates (Privacy, Parent Trust, Child
Safety);
[ADR-0006](../decisions/ADR-0006-data-privacy-compliance.md) §5
(directly resolved at the framework level — final mechanism selection
remains open per §8), §2, §3, §17, §22 (cited throughout);
[ADR-0007](../decisions/ADR-0007-target-audience-interim-posture.md)
§C.3/§C.6/§D.3 (the specific legal-sufficiency gates this document
explicitly does not clear — §11);
[ADR-0008](../decisions/ADR-0008-core-data-model-parent-family-child.md)
(entity shapes, consumed not redesigned);
[ADR-0009](../decisions/ADR-0009-authorization-and-session-architecture.md)
(owner-only consent-of-record-changes action, reused in §5.4);
[ADR-0010](../decisions/ADR-0010-encryption-and-tenant-isolation-design.md)
(tier/encryption model, extended in §6); `docs/architecture/data-lifecycle.md`
(deletion cascade reused in §5.2; crypto-shredding interaction —
founder-decided direction, unresolved duration — in §6.4/§7);
`docs/sprints/sprint-02.md`, §3, Milestone 5.

**Status note:** per Milestone 5's Definition of Done, this document's
Status remains **Proposed** — not "Approved" — following the founder/
product-owner review recorded 2026-08-06 at the Sprint 02
stop-and-report checkpoint. That review approved: (A) the §7 Option B
retention-survival **direction**, with duration explicitly deferred to
legal validation; (B) the §8 mechanism shortlist **direction**
(primary: signed consent form; fallback: payment-card verification;
deprioritized: government-ID verification); and (C) confirmed that the
still-outstanding M4 data-lifecycle ADR (`docs/architecture/data-lifecycle.md`'s
founder-ratified retention values are not yet recorded in a formal ADR)
is tracked as **independent, non-blocking** governance work — not a
prerequisite for Milestone 5's acceptance, per the founder's explicit
decision 2026-08-06. That gap remains open and must be closed no later
than Sprint 02's Milestone 11 close-out. None of A, B, or C
authorizes implementation, selects a final mechanism, or certifies
legal sufficiency of anything. Unlike M1–M3, whose ADRs were flipped to
"Accepted — Implementation Deferred" once reviewed, this document's own
ADR ([ADR-0011](../decisions/ADR-0011-consent-architecture.md)) remains
**Proposed even after this founder review** — per
`docs/sprints/sprint-02.md`, §3, M5, it cannot reach "Accepted" until
(a) the founder makes a final mechanism selection and (b) India DPDP
legal validation confirms that mechanism's sufficiency and the §7
retention duration's defensibility. This founder review confirms the
framework design is sound and authorizes §7/§8's directions to proceed
toward legal review — it does not, by itself, move ADR-0011 to
"Accepted."
