# Audit-Event Schema & Access-Logging Design

**Version:** 1.0.0
**Status:** Proposed — Pending Founder/Product-Owner Review (Sprint 02,
Milestone 7 deliverable, reviewed at the Sprint 02 per-milestone
stop-and-report checkpoint; `docs/sprints/sprint-02.md`, §5's
decision-maker note applies — not a standalone engineering/AI-agent
self-certification)
**Owner:** Engineering
**Last Updated:** 2026-08-09

> This document is Sprint 02, Milestone 7's deliverable
> (`docs/sprints/sprint-02.md`, §3, M7). It is an architecture-level
> design document only. It designs no logging pipeline, no database
> table, no storage of any real audit event, and no log-shipping/
> observability-tooling selection — see §14 (Explicit Exclusions). It
> extends, and does not redesign, `docs/architecture/observability.md`'s
> "Audit events" philosophy and `docs/engineering/security-by-design.md`'s
> "Audit logging" standard into a concrete event schema. It builds on,
> and does not alter, the Parent/Family/Child entity model
> ([`docs/modules/identity-family/README.md`](../modules/identity-family/README.md)/[ADR-0008](../decisions/ADR-0008-core-data-model-parent-family-child.md)),
> the authorization model
> ([`docs/architecture/authorization-and-sessions.md`](./authorization-and-sessions.md)/[ADR-0009](../decisions/ADR-0009-authorization-and-session-architecture.md)),
> the classification/encryption/RLS design
> ([`docs/architecture/data-classification-and-isolation.md`](./data-classification-and-isolation.md)/[ADR-0010](../decisions/ADR-0010-encryption-and-tenant-isolation-design.md)),
> the data-lifecycle design
> ([`docs/architecture/data-lifecycle.md`](./data-lifecycle.md)), the
> consent architecture
> ([`docs/architecture/consent-architecture.md`](./consent-architecture.md)/[ADR-0011](../decisions/ADR-0011-consent-architecture.md)),
> and the Leo memory/conversation isolation design
> ([`docs/architecture/ai-memory-isolation.md`](./ai-memory-isolation.md)/[ADR-0012](../decisions/ADR-0012-leo-memory-and-conversation-isolation-design.md)).
> Every example is fictional; no real parent, child, or family data
> appears here. **This document does not redesign, redefine, or
> silently resolve M3's principal/tenant/child isolation model** — see
> §8, which records the exact boundary M3 left open as an explicit,
> non-blocking future design point rather than deciding it here.

---

## 1. Objective

Design the concrete audit-event schema (who/what/when/which record)
required by [ADR-0006](../decisions/ADR-0006-data-privacy-compliance.md)
§22–§23, extending the existing
[`docs/architecture/observability.md`](./observability.md) philosophy
("Audit events" section) into an actionable design. Verbatim from
`docs/sprints/sprint-02.md`, §3, M7.

## 2. Scope

- Audit-log event schema (append-only, non-deletable by the parent,
  distinct from user-content deletion per ADR-0006 §18 — see §6).
- Access-logging design specifically for Privacy Dashboard shared-link
  views (Constitution §10, ADR-0006 §23 — see §7).
- An event-type catalog tracing every included event to a precedent
  already established in M1–M6 (§4) — no event type is invented without
  a citation.

Out of scope (per `docs/sprints/sprint-02.md`, §2.2 and M7's own
Explicit Exclusions, §14): a logging pipeline, a database table, storage
of any real audit event, log-shipping/observability-tooling selection
(a future Decision Log entry once tooling is chosen,
`docs/engineering/security-by-design.md`), M4's founder-gated exact
retention/backup-purge **window values** (this document consumes only
which event types M4 defines, per `docs/sprints/sprint-02.md` §4's
explicit M7 dependency note), and resolution of M3's open isolation-
boundary question for Tier 5 (§8).

## 3. Audit Event Schema

| Field                  | Type / shape                                              | Purpose                                                                                                                                                                                                                                                   |
| ---------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `event_id`             | opaque identifier                                         | Unique reference for this audit record.                                                                                                                                                                                                                   |
| `occurred_at`          | timestamp                                                 | When the event occurred; the append-only ordering key (ADR-0006 §22).                                                                                                                                                                                     |
| `event_type`           | enum, closed set (§4)                                     | Which cataloged action this record describes. No free-text event descriptions — every value traces to §4.                                                                                                                                                 |
| `actor_principal_id`   | reference → Parent, nullable                              | Who performed the action, mirroring M1's existing actor-of-record fields (`created_by_parent_id`, `invited_by_parent_id`, `revoked_by_parent_id` — `docs/modules/identity-family/README.md`, §7). Nullable only for `share_link_accessed` (§7).           |
| `actor_principal_type` | enum (`parent`, `child` — reserved), nullable             | Mirrors M1 §3.1 / M2 §3's existing principal typing — not a new type introduced here.                                                                                                                                                                     |
| `actor_role_at_time`   | enum (`owner`, `co_parent`, `child` — reserved), nullable | Snapshot of the M2 §3 role at the moment of the action. Roles can change later (e.g. a co-parent is subsequently revoked), so this is captured at write time, not derived retroactively from current state.                                               |
| `family_id`            | reference → Family, nullable                              | The tenant/family this event concerns, present on every row describing a family-scoped action (ADR-0006 §16's "every table... must carry a family/tenant identifier"). Whether this column is also the row's RLS partition is an **open point — see §8**. |
| `child_id`             | reference → Child, nullable                               | Which Child the action concerns, when applicable (e.g. memory/conversation events). Null for family-level-only events (e.g. co-parent revoke).                                                                                                            |
| `target_type`          | enum                                                      | Which kind of record the action was performed on — `Conversation`, `Message`, `LeoMemory`, `Child`, `Family`, `Parent`, `CoParentAssignment`, `ShareLink` (prospective per Constitution §4 — no such entity is modeled by M1–M6; see §7), or `Export`.    |
| `target_id`            | opaque identifier, nullable                               | The specific record instance, when one exists. For `deletion_completed`, this is the now-tombstoned identifier M4 §12 already anticipates.                                                                                                                |
| `metadata`             | small structured object, content-free                     | Non-content structured detail needed to interpret the event — e.g. `deletion_completed`'s cascade-target checklist (M4 §12). **Never** contains Tier 3 content, message text, memory text, or any child-identifying free text — see §10.                  |

This schema is a design-level field list, not a table definition — no
column type, index, or storage engine is specified (§14).

## 4. Event Type Catalog

Every row below traces to a precedent already named in M1–M6 or in the
two documents M7's own Definition of Done explicitly says this milestone
extends (`docs/engineering/security-by-design.md`,
[`observability.md`](./observability.md)). No event type is included
without a citation; none is invented from scratch.

| Event type                      | Precedent (doc, section)                                                                                                                                                                                          | ADR-0006 / Constitution clause                                 |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `conversation_message_accessed` | [`ai-memory-isolation.md`](./ai-memory-isolation.md) §11 ("conversation/message access") and §6.1                                                                                                                 | ADR-0006 §22 ("read... Sensitive Child Content")               |
| `leo_memory_viewed`             | [`ai-memory-isolation.md`](./ai-memory-isolation.md) §11 ("memory view") and §6.1                                                                                                                                 | ADR-0006 §22                                                   |
| `leo_memory_corrected`          | [`ai-memory-isolation.md`](./ai-memory-isolation.md) §6.2, §11 ("memory... correct")                                                                                                                              | ADR-0006 §20, §22                                              |
| `leo_memory_vaulted`            | [`ai-memory-isolation.md`](./ai-memory-isolation.md) §6.3, §11 ("memory... vault") — owner-only, per M6's founder decision recorded there                                                                         | ADR-0006 §22                                                   |
| `leo_memory_deleted`            | [`ai-memory-isolation.md`](./ai-memory-isolation.md) §6.5, §11 ("memory... delete")                                                                                                                               | ADR-0006 §18, §22                                              |
| `conversation_deleted`          | [`ai-memory-isolation.md`](./ai-memory-isolation.md) §5.3, §6.5                                                                                                                                                   | ADR-0006 §18, §22                                              |
| `data_export_requested`         | [`authorization-and-sessions.md`](./authorization-and-sessions.md) §5 ("Data export" row); [`data-lifecycle.md`](./data-lifecycle.md) §8 ("Export requests are audit-logged")                                     | ADR-0006 §19, §22                                              |
| `child_deleted`                 | [`data-lifecycle.md`](./data-lifecycle.md) §7.1                                                                                                                                                                   | ADR-0006 §18, §22                                              |
| `family_deleted`                | [`data-lifecycle.md`](./data-lifecycle.md) §7.2                                                                                                                                                                   | ADR-0006 §18, §22                                              |
| `account_deleted`               | [`data-lifecycle.md`](./data-lifecycle.md) §7.3                                                                                                                                                                   | ADR-0006 §18, §22                                              |
| `deletion_completed`            | [`data-lifecycle.md`](./data-lifecycle.md) §12 — this document **formalizes**, not invents, the event M4 already designed ("a single Tier 5 'deletion-completion' audit event")                                   | ADR-0006 §22                                                   |
| `coparent_invited`              | `docs/modules/identity-family/README.md` §7 (`invited_by_parent_id`, "Milestone 7's audit-log schema will need to reference"); [`authorization-and-sessions.md`](./authorization-and-sessions.md) §5 (owner-only) | `security-by-design.md` "Audit logging" ("permission changes") |
| `coparent_revoked`              | `docs/modules/identity-family/README.md` §7 (`revoked_by_parent_id`); [`authorization-and-sessions.md`](./authorization-and-sessions.md) §6.4                                                                     | `security-by-design.md` "Audit logging" ("permission changes") |
| `family_switch`                 | [`authorization-and-sessions.md`](./authorization-and-sessions.md) §6.2 ("named here as one Milestone 7's audit-log schema must capture")                                                                         | ADR-0006 §16 (tenant-scope integrity)                          |
| `share_link_created`            | [`authorization-and-sessions.md`](./authorization-and-sessions.md) §5 ("Create/revoke a share link" row, owner-only)                                                                                              | ADR-0006 §22 ("share"), §24 (Safe Sharing)                     |
| `share_link_revoked`            | Same as above                                                                                                                                                                                                     | Same as above                                                  |
| `share_link_accessed`           | This document, §7 — the specific deliverable `docs/sprints/sprint-02.md` §3 M7 names                                                                                                                              | ADR-0006 §23 (named explicitly); Constitution §4, §10          |

**Explicitly not in this catalog:**

- **`consent_of_record_changed`** — not added here. See §5.
- **Authentication/login events** — `docs/engineering/security-by-design.md`'s
  general "auth events" category is not schematized here: no login flow
  exists yet (ADR-0005, implementation deferred), and no M1–M6 document
  names a concrete auth event for M7 to capture. See §14.
- **Routine Tier 1/2 profile reads/writes** (e.g. viewing or updating a
  Child's name) — ADR-0006 §22 names the Tier 3 ("Sensitive Child
  Content") access verbs specifically; no M1–M6 document extends that
  requirement to ordinary Tier 2 profile CRUD, so this document does not
  invent that extension.

## 5. Consent Events — Explicit Non-Duplication of M5's `ConsentEvent`

Consent-of-record changes are **not** added as a Tier 5 event type in
this catalog. [`consent-architecture.md`](./consent-architecture.md)
§11 already states: `ConsentEvent` **is itself** the auditable record
ADR-0006 §5 requires, and "supplies the actor/event fields Milestone 7's
general audit-log schema will reference for consent-related events" —
an explicit invitation to reference, not duplicate. Adding a parallel
`consent_of_record_changed` Tier 5 row would create two independent
records of the same action with no reconciliation mechanism designed
anywhere — a data-integrity risk this document avoids by simply not
introducing it. `ConsentEvent`'s own append-only, non-mutating design
(ADR-0011 §5.1) already satisfies ADR-0006 §22 for that one category.

## 6. Distinctness from User-Content Deletion (ADR-0006 §18) — Append-Only Guarantee

Per ADR-0006 §22: audit logs are append-only and are not deletable by
the parent — "the system's record, distinct from the user-content
deletion in §18." This document's acceptance criterion (per
`docs/sprints/sprint-02.md` §3, M7) requires that guarantee be explicit:

- Deleting the **subject** of an audit event (e.g. a `Conversation`
  soft-deleted per `ai-memory-isolation.md` §5.2, or a `Child` deleted
  per `data-lifecycle.md` §7.1) never deletes, mutates, or invalidates
  the audit event(s) that reference it. `target_id` (§3) may point to a
  now-tombstoned record — this is expected and required, not an error
  state, exactly as `data-lifecycle.md` §12's `deletion_completed` event
  already anticipates ("the (now-tombstoned, opaque) identifier
  deleted").
- No product-facing or parent-facing "delete my audit history" action
  exists in this design, consistent with ADR-0006 §22's "not deletable
  by the parent."
- Tier 5's own retention is bounded independently (§9) — it is not tied
  to its subject's Tier 1–4 lifecycle state.

## 7. Access-Logging for Privacy Dashboard Shared-Link Views (Constitution §10, ADR-0006 §23)

ADR-0006 §23: "Specifically for the Privacy Dashboard (Constitution
§10): every access to a shared link must be logged and visible to the
parent who created it." This is the specific deliverable
`docs/sprints/sprint-02.md` §3, M7 names in its Scope line.

- **Event:** `share_link_accessed` (§4). Recorded each time a shared
  link (Constitution §4's Safe Sharing feature) is accessed.
- **Open design point, flagged not resolved:** no `ShareLink` entity is
  modeled anywhere in M1–M6, and no principal type in this repository's
  data model (M1 §3.1: Parent; reserved Child) represents an
  unauthenticated external viewer of a shared link. This document does
  **not** invent a new principal type — doing so would be an M1
  redesign, out of scope for M7. Accordingly, `actor_principal_id` and
  `actor_principal_type` (§3) are **nullable** for this event type: the
  schema accommodates an anonymous accessor without asserting who they
  are. What (if anything) beyond a bare access timestamp should be
  captured for an anonymous viewer — e.g. coarse request metadata — is
  left to future implementation-stage design; it is not decided here.
- **Visibility requirement:** ADR-0006 §23 requires this be "visible to
  the parent who created it." This document does not design the Privacy
  Dashboard's query surface (out of scope, Constitution §10 is a future
  UI/API concern) — it only establishes that `share_link_accessed`
  events carry `family_id` (§3) so a future dashboard view can filter to
  the creating parent's own family, the same pattern
  `data-lifecycle.md` §8 already uses for Device/Session export
  ("already covered by the Device/Session export above").
- **Distinct from `share_link_created`/`share_link_revoked`** (§4),
  which record the owner-parent's own actions on the link, not third-
  party access to it.

## 8. Classification, Encryption, and Isolation — Open Point, Not Resolved Here

**This section states the requirement audit records must satisfy and
records what M1–M6 have and have not already decided about it. It does
not invent a new M3 rule, does not add a row to
[`data-classification-and-isolation.md`](./data-classification-and-isolation.md)
§7.2's RLS table, and does not resolve the open boundary question
below.**

### 8.1 What M3 already decided (carried forward unchanged)

- **Tier:** Audit/security records are Tier 5 (System/Operational),
  per ADR-0006 §7 and `data-classification-and-isolation.md` §3.
- **Encryption:** Tier 5 requires managed at-rest/in-transit encryption
  only — `data-classification-and-isolation.md` §5.1 already decided
  **no additional field-level encryption is required** for Tier 5
  ("append-only integrity matters more than confidentiality-in-depth
  here"). This document does not reopen that decision.
- **General RLS enforcement completeness** (`FORCE ROW LEVEL SECURITY`,
  no request-serving role holding `BYPASSRLS` —
  `data-classification-and-isolation.md` §7.4) applies to whatever
  table eventually stores Tier 5 records, unchanged, regardless of how
  §8.2 below is eventually resolved.

### 8.2 What M3 left open, and this document does not resolve

`data-classification-and-isolation.md` §3's classification table lists
Tier 5's isolation boundary, verbatim, as: **"Principal (once modeled —
Milestone 7 audit logs)."** That note is a placeholder, not a decision
— unlike Tier 3/4's row in §7.2 of the same document, which M3 states
explicitly as prospective and which
[`ai-memory-isolation.md`](./ai-memory-isolation.md) §7.2 later filled
in for `Conversation`/`Message`/`LeoMemory`, Tier 5's own row was never
given a concrete partition column in M3, and M3's §7.2 table has no
Tier 5 row at all.

Two candidate directions exist, and this document takes **no position**
between them:

- A `principal_id`-based partition, mirroring `Device`/`Session`'s
  existing exception to family-based partitioning (`data-classification-and-isolation.md`
  §6.1) — appropriate if Tier 5 visibility is ultimately scoped to "the
  acting principal's own actions."
- A `family_id`-based partition, mirroring Tier 3/4's pattern
  (`data-classification-and-isolation.md` §7.2) — appropriate if Tier 5
  visibility must support a parent seeing an action **someone else**
  performed against their family (which §7's `share_link_accessed`
  event requires: the creating parent must see another party's access,
  not their own).

These two candidates are in tension for exactly the reason §7 flags:
`Device`/`Session`'s existing `principal_id` partition works because
that data is genuinely single-owner (M3 §6.1: "a co-parent's device
list is theirs to manage, not shared inventory"), while ADR-0006 §23's
requirement is inherently cross-principal within a family. Resolving
this requires a concrete implementation-stage design (or a future
Change Request against `data-classification-and-isolation.md`, per the
precedent `ai-memory-isolation.md` §7.6 already set for a comparable
open isolation question) — **not** a decision this document is
authorized to make silently. It is recorded here as an explicit,
non-blocking future design dependency (§12).

## 9. Retention

Carried forward exactly as already recorded — not reinterpreted, not
changed. `data-lifecycle.md` §13.3: **"APPROVED PROVISIONALLY — Option
B (3 years), founder decision 2026-08-05, explicitly subject to change
if India legal/privacy review under ADR-0006's open Legal Validation
item on regulatory breach-notification/record-keeping obligations (§30)
requires a different period."** This document adds no new retention
value and does not treat the "provisional" qualifier as resolved. Tier
5's append-only, never-parent-deletable status (ADR-0006 §22,
`data-lifecycle.md` §11) is unchanged.

## 10. Privacy & Data-Minimization Considerations

- **No second copy of sensitive content.** §3's `metadata` field is
  explicitly content-free. An audit event records that an action
  happened — actor, target reference, timestamp — never the target's
  actual payload. `Message.content`, `LeoMemory.content` (Tier 3,
  encrypted per `ai-memory-isolation.md` §7.1) are never duplicated into
  a Tier 5 row. This directly follows ADR-0006 §2's minimization
  principle and `ai-memory-isolation.md` §3.4's precedent (memory itself
  is distilled, never a verbatim copy) applied here to a different
  entity for the same reason.
- **Privacy by Default** (ADR-0006 §1) — no audit-event field defaults
  to visibility beyond what §7's Privacy Dashboard access-logging
  requirement and internal accountability purpose require.
- **No advertising/profiling use** (ADR-0006 §28, Constitution §6) —
  audit records exist for accountability only; this document does not
  design, and explicitly excludes, any analytics or profiling use of
  audit data.
- **Data minimization** (ADR-0006 §2) — §3's schema carries only the
  fields needed to satisfy ADR-0006 §22–§23's who/what/when/which-record
  requirement; no speculative fields are added.

## 11. Consistency Check Against M1–M6

No M1 entity field, M2 authorization rule, M3 classification/encryption
decision, M4 lifecycle rule, M5 consent design, or M6 entity/isolation
design is changed by this document. Specifically:

- `data-classification-and-isolation.md` §3's Tier 5 row and §7.2's RLS
  table are **not modified** — §8.2 records an open question against
  them, it does not answer it or add a row.
- `data-lifecycle.md` §12's `deletion_completed` event and §13.3's
  retention value are restated, not redecided.
- `consent-architecture.md`'s `ConsentEvent` is referenced, not
  duplicated (§5).
- `ai-memory-isolation.md` §11's named event surface (conversation/
  message access; memory view/correct/vault/delete) is the direct source
  for §4's corresponding catalog rows.
- `authorization-and-sessions.md` §6.2's family-switch event and §5's
  owner-only action table are cited, not redesigned.

## 12. Legal/Founder-Decision Items (Separate from Engineering Decisions)

No new founder-level decision is introduced by this document. Items
inherited from ADR-0006 remain open, restated (not re-litigated) here:

1. **[OPEN — inherited from ADR-0006, not new]** Regulatory
   breach-notification/record-keeping obligations under India's DPDP Act
   (ADR-0006 §30) may require a different Tier 5 retention duration than
   §9's provisional 3 years — restated from `data-lifecycle.md` §15,
   not resolved here.
2. **[OPEN — inherited from ADR-0006, not new]** General applicability
   of COPPA/GDPR/India's DPDP Act to audit/security records specifically
   — restated from ADR-0006's existing Legal Validation item 6.

Two **non-founder, non-blocking engineering open points** are also
recorded, per the same append-only "flag, don't silently resolve"
discipline `ai-memory-isolation.md` §7.6 and §13 already established in
this repository:

3. **[OPEN — engineering, not legal/founder]** §8.2 — the exact Tier 5
   RLS partition column (`principal_id` vs. `family_id` vs. a hybrid).
   Left to a future implementation-stage design or Change Request
   against `data-classification-and-isolation.md`. This is a technical
   partitioning question, not a business/product trade-off, so it is not
   escalated as a founder-decision package — but it is recorded, not
   silently assumed.
4. **[OPEN — engineering, not legal/founder]** §7 — what (if any) detail
   beyond a bare timestamp should be captured for an anonymous
   `share_link_accessed` viewer, given no "Viewer" principal type exists
   in M1's model. Left to future implementation-stage design.

## 13. Security Review Checklist

Every item in the
[Mandatory Engineering Review Checklist](../engineering/review-checklist.md)
answered for this design, not as a claim that undesigned code satisfies
it:

- **Privacy by Default** — YES. See §10.
- **Child Safety** — YES. No child-identifying content is ever stored in
  an audit event (§3, §10); no public-facing or searchable field exists.
- **Parent Trust** — YES. Every sensitive action named in §4 is
  attributable (actor fields, §3) and permanently recorded (§6);
  deletion of the subject never erases the accountability record.
- **Secure APIs** — N/A at this design stage; no API surface exists or
  is speculated here.
- **Audit Logging** — This document **is** the schema deliverable for
  this gate (`docs/engineering/security-by-design.md`, "Audit logging");
  it designs, but does not implement, the pipeline.
- **Search Engine Protection** — N/A. No entity here is publicly
  reachable.
- **Encryption** — Tier 5 baseline only (§8.1), per M3's existing,
  unchanged decision.
- **Parent Data Ownership** — Partial by design: Tier 5 is deliberately
  the one category **not** parent-deletable (ADR-0006 §22, §6) — this is
  the documented exception `data-lifecycle.md` §11 already explains, not
  a gap.
- **AI Safety** — N/A at this design stage; no AI/Leo behavior is
  designed here.
- **Product Constitution Compliance** — YES. Directly implements
  Constitution §12 ("Audit logging") and §10 (Privacy Dashboard access
  logging, §7).

No item above is answered "NO." §12 records four open items (two
inherited legal, two non-blocking engineering) — none is silently
resolved.

## 14. Explicit Exclusions

No log-shipping/observability tooling selection or integration — that
remains a future Decision Log item per
`docs/engineering/security-by-design.md`. No logging pipeline, no
database table, no storage of any real audit event. No authentication/
login-event schema (ADR-0005 implementation-gated; no login flow exists
to generate such an event yet). No `ShareLink` entity design beyond the
event fields §7 requires — Constitution §4's other five Safe Sharing
requirements (preview, expiration, password protection, one-time links,
revocation-as-a-feature) are not designed here. No resolution of §12's
open items. No change to
[`data-classification-and-isolation.md`](./data-classification-and-isolation.md),
[`data-lifecycle.md`](./data-lifecycle.md),
[`consent-architecture.md`](./consent-architecture.md),
[`ai-memory-isolation.md`](./ai-memory-isolation.md), or
[`authorization-and-sessions.md`](./authorization-and-sessions.md) —
this document references event surfaces those documents already named
for "Milestone 7," it does not redesign any of them. No real parent,
child, family, conversation, or memory data anywhere in this document.

## 15. Testing Implications (design-level only)

Per `docs/engineering/testing-strategy.md`'s taxonomy: no code exists
yet. Once implemented (post-§12 resolution, post-ADR-0004/0005
implementation gates), this design's minimum bar is **Unit** (schema
field validation, closed-enum `event_type` values), **Integration**
(every §4 event type actually emitted at its named trigger point; the
`deletion_completed` cascade-checklist metadata populated correctly per
`data-lifecycle.md` §12), and **Security** (a test that no audit event
is ever mutated or deleted post-write, per §6; a test that
`share_link_accessed` never leaks another family's events, once §8.2 is
resolved). Widget, End-to-end, Performance, Accessibility, and
Regression layers apply to the features built on top of this design.

## 16. Deployment

Not applicable — documentation-only milestone; nothing is deployed
(`docs/sprints/sprint-02.md`, §2.2).

---

## Constitution Alignment

Traces to:
[Child Privacy & Safety Constitution](../constitution/product/child-privacy-and-safety-constitution.md)
§10 (Privacy Dashboard — access-logging visibility, §7), §12 (Secure
Development Standards — "Audit logging" named explicitly);
[Engineering Constitution](../constitution/engineering/engineering-constitution.md)'s
Mandatory Engineering Review Gates (Audit Logging, Privacy);
[ADR-0006](../decisions/ADR-0006-data-privacy-compliance.md) §16–§20,
§22–§24 (cited throughout); `docs/engineering/security-by-design.md`
("Audit logging" — extended, not redesigned, per this milestone's own
Definition of Done); [`observability.md`](./observability.md) ("Audit
events" — extended, not redesigned); `docs/modules/identity-family/README.md`
§7 (actor fields consumed as precedent); [`authorization-and-sessions.md`](./authorization-and-sessions.md)
§5, §6.2, §6.4 (owner-only actions, family-switch event, revocation —
cited, not redesigned); [`data-classification-and-isolation.md`](./data-classification-and-isolation.md)
§3, §5.1, §7.2, §7.4 (Tier 5 classification and encryption decisions
carried forward unchanged; §7.2's RLS table explicitly **not** amended,
§8.2); [`data-lifecycle.md`](./data-lifecycle.md) §8, §12, §13.3
(export audit-logging, deletion-completion event formalized, retention
carried forward unchanged); [`consent-architecture.md`](./consent-architecture.md)
§11 (`ConsentEvent` referenced, not duplicated, §5); [`ai-memory-isolation.md`](./ai-memory-isolation.md)
§6, §11 (named event surface, source for §4's catalog); `docs/sprints/sprint-02.md`,
§3, Milestone 7.

**Status note:** per Milestone 7's Definition of Done, this document's
Status remains **Proposed** — not "Approved" — until the founder/
product owner reviews it at the Sprint 02 stop-and-report checkpoint.
This document designs no logging pipeline, no database table, and
stores no real audit event. §8.2 and §12 record open points explicitly
left unresolved, per the instruction not to silently resolve a founder-
or architecture-level decision point.
