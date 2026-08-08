# Leo Memory & Conversation Isolation Design

**Version:** 1.1.0
**Status:** Proposed — Pending Founder/Product-Owner Review (Sprint 02,
Milestone 6 deliverable, reviewed together with
[ADR-0012](../decisions/ADR-0012-leo-memory-and-conversation-isolation-design.md)
at the Sprint 02 per-milestone stop-and-report checkpoint;
`docs/sprints/sprint-02.md`, §5's decision-maker note applies — not a
standalone engineering/AI-agent self-certification)
**Owner:** Engineering
**Last Updated:** 2026-08-08

> This document is Sprint 02, Milestone 6's supporting deliverable
> (`docs/sprints/sprint-02.md`, §3, M6), read together with
> [`docs/modules/leo-companion/README.md`](../modules/leo-companion/README.md).
> It is an architecture-level design document only. It designs no AI/LLM
> integration, no vector database selection or wiring, no embedding
> pipeline, and stores no real conversation or memory data — see §14
> (Explicit Exclusions). It builds on, and does not redesign, the
> Parent/Family/Child entity model
> ([`docs/modules/identity-family/README.md`](../modules/identity-family/README.md)/[ADR-0008](../decisions/ADR-0008-core-data-model-parent-family-child.md)),
> the authorization model
> ([`docs/architecture/authorization-and-sessions.md`](./authorization-and-sessions.md)/[ADR-0009](../decisions/ADR-0009-authorization-and-session-architecture.md)),
> the classification/encryption/RLS design
> ([`docs/architecture/data-classification-and-isolation.md`](./data-classification-and-isolation.md)/[ADR-0010](../decisions/ADR-0010-encryption-and-tenant-isolation-design.md)),
> and — most directly — the already **founder-approved** three-class Leo
> memory architecture in
> [`docs/architecture/data-lifecycle.md`](./data-lifecycle.md), §13.4,
> which this document applies to a concrete entity/isolation design and
> does not redecide. Every example is fictional; no real parent, child,
> family, conversation, or memory data appears here.

---

## 1. Objective

Design the memory-versioning/deletion-cascade model and conversation
tenant-isolation approach (ADR-0006 §8–§9, §16). Verbatim from
`docs/sprints/sprint-02.md`, §3, M6.

## 2. Scope

Leo-memory data-model design (version history, parent-deletion cascade
to derived/cached copies — embeddings, summaries, indexes); conversation
isolation design (family/tenant identifier on every record, enforced at
the data layer per M3's RLS design).

Out of scope (per `docs/sprints/sprint-02.md`, §2.2 and M6's own Explicit
Exclusions): AI/LLM integration; vector database selection or wiring;
any actual conversation or memory data; memory-extraction/summarization
algorithms; database schema, migration, or key management (ADR-0004/M3
implementation gates unchanged); audit-log schema for these events
(Milestone 7 — this document identifies which events exist, not their
log schema); AI-provider data-boundary questions (Milestone 8, which
depends on this document per `docs/sprints/sprint-02.md` §4).

## 3. Entities

Three new entities, not present in M1. Every field has a documented
purpose, per ADR-0006 §2.

### 3.1 `Conversation`

| Field             | Type / shape          | Purpose                                                                                                                                                                                                  |
| ----------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`              | opaque identifier     | Referenced by every `Message` in the thread and by future audit-log entries (Milestone 7).                                                                                                               |
| `family_id`       | reference → Family    | The tenant identifier (ADR-0006 §16) — every `Conversation` is scoped to exactly one Family, consistent with M1's "a Child belongs to exactly one Family" design decision.                               |
| `child_id`        | reference → Child     | Which Child this conversation is with. Not nullable — unlike M5's `ConsentEvent.child_id`, a `Conversation` cannot exist before its Child does (§4).                                                     |
| `started_at`      | timestamp             | Lifecycle/audit trail; conversation-thread grouping boundary.                                                                                                                                            |
| `last_message_at` | timestamp             | Denormalized for ordering/recency queries without scanning `Message` — a read-optimization field, not a new source of truth (the `Message` rows themselves remain authoritative for content and timing). |
| `status`          | `active` \| `deleted` | Soft-delete flag, mirrors `Child.status` (M1 §3.4) and `ConsentEvent`'s pattern; the hard-delete window is M4 §13.1's already-approved 90 days, not redecided here.                                      |

### 3.2 `Message`

| Field             | Type / shape                      | Purpose                                                                                                                                                                                                                                                                                                  |
| ----------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`              | opaque identifier                 | Referenced by future audit-log entries (Milestone 7) and by any future correction/moderation record.                                                                                                                                                                                                     |
| `conversation_id` | reference → Conversation          | Which thread this message belongs to.                                                                                                                                                                                                                                                                    |
| `family_id`       | reference → Family (denormalized) | Carried directly on `Message`, not derived only via a `Conversation` join, per ADR-0006 §16's "every table containing child or family data must carry a family/tenant identifier" and M3 §7.2's per-table RLS design — RLS must be able to partition this table on its own column, not depend on a join. |
| `child_id`        | reference → Child (denormalized)  | Same rationale as `family_id` — needed directly on the row for the cross-child isolation check (§5), not only reachable via a join.                                                                                                                                                                      |
| `sender`          | enum (`child`, `leo`)             | Who produced this message. A closed set — Natkhat AI has no other message-producing principal in this design (no parent-authored messages within a Leo conversation thread; a parent's own actions are `Conversation`/`LeoMemory`-level, not message-level).                                             |
| `content`         | Tier 3 content (encrypted)        | The message text. Sensitive Child Content (ADR-0006 §7/§8) — full Tier 3 protection (§7 below).                                                                                                                                                                                                          |
| `created_at`      | timestamp                         | Ordering and lifecycle/audit trail. Immutable once written — a `Message` is never edited in place (§5.1).                                                                                                                                                                                                |
| `status`          | `active` \| `deleted`             | Soft-delete flag. Individual per-message deletion is not designed as a parent-facing feature here (§9's Explicit Exclusions) — this field exists so the schema does not foreclose it, and so `Conversation`-level cascade has something to set.                                                          |

### 3.3 `LeoMemory`

Implements the three independent storage classes M4 §13.4 already
designed and the founder already approved (2026-08-05) — this ADR
supplies the entity shape for that already-decided architecture, it does
not redecide the classes, their retention rules, or the no-automatic-
promotion business rule.

| Field                                | Type / shape                                                       | Purpose                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------ | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                                 | opaque identifier                                                  | Referenced by version-chain fields below and by future audit-log entries.                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `family_id`                          | reference → Family                                                 | Tenant identifier (ADR-0006 §16), identical role to `Conversation.family_id`.                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `child_id`                           | reference → Child                                                  | Which Child this memory concerns.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `memory_class`                       | enum (`active_relationship`, `version_history`, `permanent_vault`) | Discriminates M4 §13.4's Class 1/2/3. Each class has its own retention/deletion trigger (§6) — this field selects which rule set governs a given row; it does not itself implement that rule set.                                                                                                                                                                                                                                                                                                                                        |
| `content`                            | Tier 3 content (encrypted)                                         | The memory content itself — a distilled fact/understanding, not a raw transcript (§3.4 below discusses the minimization question M4 §13.4 already flagged as an M6 design point).                                                                                                                                                                                                                                                                                                                                                        |
| `created_at`                         | timestamp                                                          | When this specific row (this version, for Class 1/2) was written.                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `supersedes_memory_id`               | reference → LeoMemory, nullable, self-referential                  | When a Class 1 (active) memory item is corrected or updated, the **prior** row is retained as a Class 2 (version-history) row and this field on the new Class 1 row points to it — implements ADR-0006 §20's "forget/override entry rather than silently rewriting history" requirement (§5.1 explains why this is not an in-place UPDATE).                                                                                                                                                                                              |
| `vaulted_from_memory_id`             | reference → LeoMemory, nullable                                    | Populated only when `memory_class = permanent_vault`. Points to the Class 1 (or Class 2) row a parent chose to preserve. A Vault row is always a **new** row created by an explicit parent action (§6.3) — never an existing row's `memory_class` field being mutated in place, per M4 §13.4's no-automatic-promotion business rule.                                                                                                                                                                                                     |
| `vaulted_at`, `vaulted_by_parent_id` | timestamp, reference → Parent, both nullable                       | Populated only for `permanent_vault` rows. Records the explicit per-item parent action and actor-of-record M4 §13.4 requires ("only an explicit, per-item parent action may preserve a memory permanently") — the direct `LeoMemory` analog of `ConsentEvent.consenting_parent_id` (ADR-0011 §3). **`vaulted_by_parent_id` must resolve to the Family's `owning_parent_id`** — Founder decision, 2026-08-08 (§6.3): only the Owner Parent may create a Vault entry; a scoped/shared Co-Parent may not, regardless of `permission_scope`. |
| `status`                             | `active` \| `deleted`                                              | Soft-delete flag, same pattern as `Conversation`/`Message`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

### 3.4 Minimization question flagged by M4, addressed here at the design level

M4 §13.4 (Class 1) flagged: "a distilled/summarized memory profile is
favored over indefinitely retaining raw verbatim transcripts, per
ADR-0006 §2's minimization principle — an implementation-stage design
point for Milestone 6, not resolved further here." This document's
answer, at the architecture level (not implementation): `LeoMemory.content`
is defined as holding **distilled memory content** (a fact, preference,
or relationship-context statement Leo derived), never a verbatim copy of
`Message.content`. The two entities are related (§6) but structurally
distinct — a `Conversation`/`Message` thread is raw interaction history
governed by its own lifecycle (§3.1–3.2); `LeoMemory` is a separate,
derived representation governed by M4 §13.4's three-class rules. This
document does not design the extraction/summarization mechanism that
produces `LeoMemory.content` from `Message.content` — that is an AI/LLM
concern, explicitly out of scope (§14) and likely Milestone 8 territory
(AI-provider boundary).

## 4. How Conversations and Memory Relate to Child/Family

A `Conversation` cannot exist without its `Child` and `Family` already
existing — unlike M5's `ConsentEvent.child_id` (nullable, because a
consent event can precede its Child), a `Conversation` is always a
consequence of an already-created, already-consented-to Child (ADR-0006
§5, ADR-0011). This document does not add a "pending conversation" state
and does not redesign M1's `Child` entity.

**Design decision — no principal-authored `Conversation`.** M1 §3.4
explicitly leaves open "whether a Child ever has their own login/session"
and states the current design does not require one for the 4–10 target
age range (ADR-0007 §D). Consistent with that: `Conversation` and
`Message` carry no `principal_id`/session-actor field. The interaction
happens through the product on the Child's behalf, but the entity model
does not assert the Child is an authenticated principal taking the
action — it only records `family_id`/`child_id` (the tenant and subject)
and, on `Message`, `sender` (`child` | `leo`, describing which side of
the exchange produced the content, not an authorization actor). If a
future product decision gives a Child their own session (M1 §3.6's
reserved `principal_type` field), that is a Milestone 2 extension to
revisit, not something this document resolves or forecloses.

## 5. Conversation & Message Lifecycle

### 5.1 Append-mostly, correction via new-row-not-mutation

`Message` rows are immutable once written and never edited in place —
there is no parent-facing or Leo-facing "edit a past message" feature in
this design. `LeoMemory` Class 1 rows are logically "correctable" (a
parent can direct Leo to forget or override a fact) but, per §3.3's
`supersedes_memory_id` design, a correction is always a **new** row, with
the previous row's `memory_class` reassigned to `version_history` — never
an in-place content mutation. This directly implements ADR-0006 §20's
requirement that memory correction preserve "the audit trail," reusing
the same append-oriented discipline `ConsentEvent` (ADR-0011 §5.1) and
Tier 5 audit records (M4 §11) already establish in this repository,
applied here to a Tier 3 entity for a different reason (correctability
with history, not immutability-as-proof).

### 5.2 Soft-delete → hard-delete

`Conversation`, `Message`, and `LeoMemory` all use the same `active` \|
`deleted` soft-delete flag (§3) and the same founder-approved 90-day
soft-delete → hard-delete window (M4 §13.1) — not a new window, not
redecided here.

### 5.3 Cascade from Child/Family deletion (extends M4 §7, does not redesign it)

| M4 §7 flow                              | Effect on `Conversation`/`Message`                                                                                                                                                                                                                                 | Effect on `LeoMemory`                                                                                                                                                                                                                                                                                                                                                       |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| §7.1 — Parent deletes one Child profile | Every `Conversation` (and its `Message` rows) for that `child_id` is soft-deleted — this is exactly the cascade M4 §7.1 already names ("Once Milestone 6 exists, cascades to soft-delete every Tier 3/4 record keyed to that `Child`") and this document fulfills. | Every `LeoMemory` row (all three classes) for that `child_id` is soft-deleted, same cascade.                                                                                                                                                                                                                                                                                |
| §7.2 — Parent deletes an entire Family  | Every `Conversation`/`Message` with that `family_id` is soft-deleted (M4 §7.2's "every Tier 3/4 record with that `family_id`").                                                                                                                                    | Every `LeoMemory` row (all three classes, including `permanent_vault`) with that `family_id` is soft-deleted — Class 3's "permanent" retention is explicitly bounded by the owning Parent's own deletion authority, not beyond it (M4 §13.4, Class 3: "'Permanent' means 'until the parent decides otherwise,' never 'beyond the owning parent's own deletion authority'"). |
| §7.3 — Parent deletes their own account | Cascades exactly as §7.2, for every Family this Parent solely owns; unaffected for Families where this Parent is only a co-parent (M4 §7.3).                                                                                                                       | Same as the `Conversation` column, same scoping rule.                                                                                                                                                                                                                                                                                                                       |

### 5.4 Class-specific retention (M4 §13.4 — cited, not redecided)

- **`active_relationship`** — no fixed expiry; retained until the Parent
  deletes it directly or via §5.3's cascades (M4 §13.4, D4-A).
- **`version_history`** — default 90 days, parent-configurable 30
  days–1 year, aging out independently of the current active row (M4
  §13.4, D4-B).
- **`permanent_vault`** — indefinite per item, deleted only by explicit
  parent action or by §5.3's account/Family-level cascades (M4 §13.4,
  D4-C). Entry into this class is **never** automatic (§6.3).

## 6. Authorization Boundaries

This document does not add a row to
[`docs/architecture/authorization-and-sessions.md`](./authorization-and-sessions.md),
§5's Parent-Only vs. Shared Actions table — that would be a Milestone 2
redesign, out of scope. It maps Leo-memory/conversation actions onto
M2's **existing** categories by extension, and flags the one action that
does not cleanly fit an existing row.

### 6.1 Viewing conversation/memory content

Maps to M2 §5's "View child profile / growth reports" row: `owner` —
yes; `co_parent` — only if in `permission_scope`; `child` (reserved) —
no independent access, consistent with §4's "no principal-authored
Conversation" design.

### 6.2 Correcting/forgetting a specific memory (Class 1 → Class 2 transition, §5.1)

Maps to M2 §5's "Update child profile" row — a data-correction action on
child-related content, not an export/deletion/consent/billing action, so
it does not fall into the five owner-only-unconditional rows: `owner` —
yes; `co_parent` — only if in `permission_scope`.

### 6.3 Adding a memory to the Permanent Vault — Founder Decision Recorded

**Decision record.** APPROVED — Option B, founder decision 2026-08-08.
This did not map cleanly onto an existing M2 §5 row on first pass —
vaulting is a per-item, indefinite-retention decision (M4 §13.4, Class
3), arguably closer in weight to the owner-only-unconditional actions
(data export, consent-of-record changes) than to routine profile
updates, since it creates a standing exception to ADR-0006 §17's "no
indefinite retention without a stated reason" that persists until
explicitly reversed. The original candidate-option table and evaluation
criteria are preserved below as the supporting rationale, per this
repository's append-only decision discipline — analysis is not deleted
once a decision is made, only marked with its outcome.

| Option        | A — Shared, if scoped                                                                           | B — Owner-only, unconditional                                                                                       | C — Shared to create, owner-only to make irreversible-feeling (UX only, no data-model difference)                                                              |
| ------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rationale     | Consistent with "Update child profile" — vaulting is still a form of memory correction/curation | Consistent with the weight of an indefinite-retention decision, mirrors export/consent/sharing's owner-only pattern | Splits the difference operationally, but the underlying data-model permission is still binary (Option A or B) — this is a UX framing, not a fourth real option |
| Risk if wrong | A co-parent could create standing indefinite-retention records without the owner's awareness    | May be an unnecessary restriction if co-parents are already trusted with full child-profile management              | Does not resolve the actual authorization question, only defers it to UI copy                                                                                  |

**Approved: Option B — owner-only, unconditional.** Only the Family's
Owner Parent may explicitly add a memory to the Permanent Parent-
Approved Childhood Memory Vault; a scoped/shared Co-Parent may **not**
create a Vault entry, regardless of what `permission_scope` values that
Co-Parent otherwise holds. This joins M2 §5's five existing
owner-only-unconditional actions (billing, account deletion, data
export, sharing, consent-of-record changes) **by extension** — this
document does **not** add a literal new row to
[`docs/architecture/authorization-and-sessions.md`](./authorization-and-sessions.md),
§5's table, since doing so would be a Milestone 2 redesign, out of
scope for this milestone. `LeoMemory.vaulted_by_parent_id` (§3.3) must
resolve to the Family's `owning_parent_id` — enforced by a future
Milestone 2/implementation-stage check, not built here. Rationale:
vaulting's indefinite-retention weight is closer to export/consent than
to routine profile curation, and restricting it to the Owner Parent
avoids a scoped Co-Parent unilaterally creating a standing
indefinite-retention record the owner may never see (Option A's named
risk).

### 6.4 Exporting conversation/memory content

Maps directly to M2 §5's existing "Data export (Constitution §10)"
row — already owner-only, unconditional. No extension needed; M4 §8's
export-completeness definition already anticipates this once Milestone 6
exists.

### 6.5 Deleting a Conversation or a `LeoMemory` item directly (not via cascade)

Maps to M2 §5's "Update child profile" category by the same reasoning as
§6.2 — a content-management action, not an owner-only-unconditional one —
`owner`: yes; `co_parent`: only if in `permission_scope`. Distinguished
from §5.3's Child/Family/account-level cascades, which are not a
per-item parent choice but a consequence of a broader deletion already
governed by M2's existing rules for that broader action.

## 7. Classification & Isolation

### 7.1 Tier and encryption

`Conversation`, `Message`, and `LeoMemory` content fields are **Sensitive
Child Content — Tier 3** (ADR-0006 §7–§9: "Conversations," "Leo
Memories," explicitly named). Full Tier 3 protection applies, per M3
§5.2, unchanged and not redesigned here: application-layer envelope
encryption with a per-Family Data Encryption Key (DEK), encrypted before
the write reaches storage, decrypted only in application memory at
authorized read time. Columns needed for querying/filtering (`family_id`,
`child_id`, timestamps, foreign keys, `memory_class`, `sender`, `status`)
are **not** encrypted — identical rule to M3 §5.2's treatment of
`ConsentEvent`'s equivalent columns (ADR-0011 §6.1).

### 7.2 Row-Level Security — filling in M3's own placeholder

M3 §7.2 already lists a row for this exact case: "Tier 3/4 tables
(prospective, Milestone 6) | `family_id` | `family_id =
current_family_claim`, plus Tier 3 content columns are additionally
application-layer-encrypted." This document **fills in** that placeholder
for `Conversation`, `Message`, and `LeoMemory` — it does not introduce a
new isolation concept. `current_family_claim` is the same value M3 §7.3
already defines (the active family context of the caller's current,
already-authorized `Session`, per M2 §6.1) — not a second, parallel
notion of "current family."

### 7.3 Cross-family isolation

Identical guarantee to every other family-scoped table (M2 §6.3, M3 §7,
Constitution §8 "Conversation isolation is mandatory"): `family_id =
current_family_claim` on every `Conversation`, `Message`, and `LeoMemory`
row. No new isolation model.

### 7.4 Cross-child isolation — a boundary within the family boundary, new to this document

Family isolation (§7.2–7.3) is a hard, database-layer (RLS) boundary. A
Family may contain **more than one Child** (M1 does not cap Child count
per Family) — cross-child isolation is a **narrower, application-layer**
boundary _within_ an already-authorized family context, analogous to how
M3 §7.1 describes RLS as "a coarse tenant backstop, not a
re-implementation of M2's action-permission table": RLS's `family_id`
predicate correctly admits a Parent authorized for the Family, but does
not by itself prevent that Parent's client (or, more importantly, Leo's
own per-child session context) from reading or writing Sibling B's
`Conversation`/`Message`/`LeoMemory` rows while operating Sibling A's Leo
experience.

**Design decision:** every read/write path into `Conversation`, `Message`,
or `LeoMemory` must be scoped by both `family_id` (RLS, §7.2) **and**
`child_id` (application-layer check, enforced the same way M2 §4's
action-permission gate is enforced — independently re-checked, not
inferred from the RLS pass). A Leo session operating on behalf of Child A
must be structurally unable to read or write any row where `child_id`
does not equal Child A's id, even though both children's rows pass the
same `family_id` RLS predicate. This is new application-layer scope this
document establishes (it did not exist before Milestone 6, since no
Tier 3/4 entity existed) — it is an extension consistent with M2/M3's
existing division of labor (RLS = coarse tenant backstop; application
layer = finer-grained scope/action logic), not a redesign of either.

A Parent (owner or scoped co-parent) legitimately views multiple
children's data through the Privacy Dashboard (Constitution §10) — that
is a Parent-principal, multi-child, already-authorized view, distinct
from a live Leo companion session, which is single-child-scoped by
product design. This document does not further design the Privacy
Dashboard's own query pattern, only states that it operates under the
Parent's full family authorization (§6.1), not under the child-scoped
constraint this section defines for Leo sessions specifically.

### 7.5 Crypto-Shredding Applicability (M4 §10) — Traceability Clarification, Not a Redesign

**`Conversation`, `Message`, and `LeoMemory` are Tier 3, per-Family-DEK-
protected data (§7.1) and are therefore subject to M4 §10's Family-level
DEK crypto-shredding cascade**, exactly as every other Tier 3 entity in
this repository is. This subsection makes that applicability explicit;
it does not add, alter, or reopen any part of M4 §10's mechanism.

- M4 §10 establishes that once a Family completes hard-delete, its Data
  Encryption Key is destroyed/rotated out, and every copy of that
  Family's Tier 3 content in any existing backup — regardless of the
  backup's own age — becomes permanently unreadable immediately.
- Because §7.1 classifies all three of this document's entities as Tier
  3 and encrypts them with that same per-Family DEK, **destruction of
  the applicable Family DEK irreversibly destroys `Conversation`,
  `Message`, and `LeoMemory` content**, including `permanent_vault`
  rows, according to M4's already-approved lifecycle — consistent with,
  and not a new statement beyond, M4 §13.4's own existing text ("even
  Vault content is destroyed instantly and irreversibly if the parent
  deletes the Family/account").
- This applies identically across all three `memory_class` values (§3.3)
  — the Vault's "permanent" retention is not, and was never designed to
  be, an exception to crypto-shredding; it is only an exception to the
  _routine_ 90-day/version-history expiry rules (§5.4).
- No change is made to `docs/architecture/data-lifecycle.md` §10 by this
  subsection — it restates that section's applicability to three new
  entities, it does not amend the mechanism itself.

### 7.6 Residual Risk — Child-Level Isolation

**Recorded explicitly, not silently accepted.** §7.4 establishes
cross-child isolation as a requirement; this subsection records the gap
between that requirement and the guarantee strength this document is
actually able to provide at the design level:

- **Family isolation has two independent layers:** application-layer
  authorization (M2 §4) _and_ database-layer Row-Level Security (§7.2,
  M3 §7). A single application bug is not, by itself, sufficient to leak
  data across families, because RLS provides an independent backstop.
- **Child isolation currently has one layer only:** the application-layer
  `child_id` check §7.4 requires. No database-layer (RLS) enforcement of
  the child boundary is designed here, because no child-scoped session
  claim exists anywhere in the current M1/M2 model — `Session` is
  pinned to a `family_id` (M2 §6.1), not to a `child_id`. This document
  does **not** invent one; doing so would be a Milestone 2 redesign, out
  of scope for this milestone.
- **No M2 redesign is authorized by this document.** This subsection
  records a risk against the _current, unchanged_ M1/M2 model — it does
  not propose, imply, or silently adopt a session-model change.
- **Requirement on future implementation:** a future implementation
  **must** independently enforce the child boundary on every
  read/write/retrieval path into `Conversation`, `Message`, and
  `LeoMemory` — including any future retrieval/search layer (§8) — and
  must not rely on `family_id`/RLS filtering alone to satisfy it.
- **Cross-child leakage must be treated as a security/privacy failure**,
  not a minor bug, on the same severity footing as cross-family leakage
  would be, notwithstanding the difference in enforcement layers noted
  above.
- **Open for future evaluation, not decided here:** whether a
  child-scoped session claim (extending M2's session model) or an
  equivalent database-level enforcement mechanism is ultimately required
  is a question for a future Change Request against
  [`docs/architecture/authorization-and-sessions.md`](./authorization-and-sessions.md)
  and/or
  [`docs/architecture/data-classification-and-isolation.md`](./data-classification-and-isolation.md) —
  not resolved, and not foreclosed, by this document.

## 8. Derived/AI-Generated Data: Embeddings, Summaries, Caches, Indexes

This document does not select or design any embedding pipeline, vector
database, cache layer, or search index (§14). It states only the
isolation and lifecycle rules any future implementation of those systems
must satisfy, extending M4 §9's already-stated table (not redesigned
here):

- **Tenant boundary applies identically.** Whatever storage technology is
  eventually chosen for embeddings/summaries/caches/indexes derived from
  `Conversation`, `Message`, or `LeoMemory` content, it must partition by
  `family_id` at minimum (ADR-0006 §16) — a shared, cross-family vector
  index or cache is not permitted by this architecture, full stop,
  regardless of implementation convenience.
- **Invalidation timing is already decided (M4 §9), not redecided here:**
  embeddings, caches, and search indexes are invalidated **immediately at
  soft-delete** of their source (`Conversation`, `Message`, or
  `LeoMemory` row) — not held for the 90-day soft-delete grace window.
  M4 §9's stated rationale applies unchanged: "there is no product reason
  for a search/recommendation index to keep surfacing soft-deleted
  content during the recovery window."
- **Source-tracking requirement, new to this document:** any derived
  artifact (an embedding, a summary) must be traceable back to which
  `Conversation`/`Message`/`LeoMemory` row(s) produced it, specifically
  so the immediate-invalidation rule above is enforceable — an
  un-attributed embedding cannot be correctly invalidated when its source
  is soft-deleted. This is a requirement on the future implementation,
  not a schema this document designs.

## 9. Conversation-to-Memory Interaction on Per-Conversation Deletion — Deferred to Milestone 8

**Founder decision, 2026-08-08: this question is explicitly deferred to
Milestone 8** (AI-Provider Data-Boundary & Multi-Provider/Self-Hosted
Compatibility Architecture), when the memory-extraction/AI pipeline is
actually designed — it is **not** resolved in M6, and this document does
not invent an extraction or provenance algorithm to resolve it now.

**Distinct from §6.3's authorization question, and unlike it, not
decidable by founder direction alone.** §4/§3.4 establish that
`LeoMemory` content is distilled from `Conversation`/`Message` history,
not a verbatim copy — this makes "delete one Conversation" and "scrub
whatever Leo learned from it" **not the same operation**, unlike, e.g.,
withdrawal-triggers-deletion in M5's `ConsentEvent` design (ADR-0011
§5.2), where withdrawal and deletion genuinely are architecturally
identical. A parent deleting a single past conversation thread may
reasonably expect any memory Leo formed _from that conversation
specifically_ to also be reconsidered — but Class 1 memory is typically
an aggregate distillation across many conversations, which makes precise
per-conversation attribution and selective "un-learn just this part" a
hard technical and product question that depends on how Milestone 8
actually designs memory extraction — it cannot be answered correctly in
the abstract, ahead of that design.

**Forward requirement for Milestone 8, recorded here so it is not lost:**
whichever direction Milestone 8 eventually adopts, its design **must
address provenance between `Conversation`/`Message` and derived
`LeoMemory`** — i.e., it must define whether, and how, a `LeoMemory` row
can be traced back to the specific `Conversation`(s)/`Message`(s) that
produced it, since that provenance question is the load-bearing
prerequisite for resolving this section's deferred decision. This
document deliberately does not design that provenance mechanism (§14) —
it only records that Milestone 8 must.

Candidate directions considered during M6, preserved here as context for
Milestone 8's future reference — **not a decision matrix M6 resolves,
and none adopted or implemented here:**

| Option                                     | A — No automatic effect                                                                                             | B — Full memory re-derivation on conversation deletion                                                                                                                       | C — Source-attributed memory (targeted removal)                                                                                    |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Mechanism                                  | Deleting a `Conversation` only soft-deletes that `Conversation`/its `Message` rows (§5.3); `LeoMemory` is untouched | Deleting a `Conversation` triggers a full re-derivation of the affected Child's Class 1 memory from remaining conversation history                                           | Each `LeoMemory` row tracks which `Conversation`(s)/`Message`(s) contributed to it; deletion removes only the attributable portion |
| Privacy fit                                | Weakest — a deleted conversation's influence can persist indefinitely in distilled form                             | Strongest — most closely matches parent intent                                                                                                                               | Strong, but only as good as attribution accuracy                                                                                   |
| Product/UX risk                            | May surprise a parent expecting full "forgetting"                                                                   | Leo's memory could shift unexpectedly after an unrelated deletion, a version of the "Leo seems to forget things" concern M4 §13.4 already flagged as a real child-trust risk | Requires much more complex memory-generation architecture; not free                                                                |
| Engineering cost                           | Lowest — no new mechanism                                                                                           | Requires a re-derivation pipeline (AI/LLM concern, Milestone 8 territory)                                                                                                    | Requires attribution tracking at generation time, a Milestone 8/AI-pipeline design question, not decidable here                    |
| Consistency with existing M4 §13.4 concern | —                                                                                                                   | Directly reintroduces the "Leo periodically forgetting" risk the founder's M4 clarification was specifically about, in a different form                                      | —                                                                                                                                  |

This document takes **no position** among these options — per the
founder decision above, the choice is deferred to Milestone 8, not
decided here. Whichever option Milestone 8 eventually adopts, §5.3's
Child/Family-level cascade rules (full deletion of all three memory
classes) are unaffected — this deferred question concerns only the
narrower case of a single `Conversation` being deleted while the
Child/Family otherwise continues.

## 10. Privacy & Child-Safety Considerations

- **Privacy by Default** (ADR-0006 §1) — no `Conversation`, `Message`, or
  `LeoMemory` field defaults to any visibility beyond the owning Family;
  no public or cross-family default exists in this design.
- **Child Safety / Conversation isolation is mandatory** (Constitution
  §8) — directly addressed by §7.3 (cross-family) and §7.4 (cross-child,
  new to this document); no design here permits one family's, or one
  child's, conversation to be visible to another.
- **No advertising/profiling use** (ADR-0006 §28, Constitution §6) —
  `LeoMemory` and `Conversation`/`Message` content is never designed here
  to feed analytics, advertising, or cross-context profiling systems;
  this document introduces no such integration.
- **No unauthorized model training** (ADR-0006 §27, Constitution §6–7) —
  unchanged; this document designs no AI-provider integration and takes
  no position on training-data use, which remains ADR-0006 §26/§27's
  domain and Milestone 8's future scope.
- **Data minimization** (ADR-0006 §2) — addressed by §3.4's distilled-
  content design decision (memory is not a verbatim transcript copy).
- **Correction without silent history-rewriting** (ADR-0006 §20) —
  addressed by §5.1's supersession design.

## 11. Security Review Checklist

Every item in the
[Mandatory Engineering Review Checklist](../engineering/review-checklist.md)
answered for this design, not as a claim that undesigned code satisfies
it:

- **Privacy by Default** — YES. See §10.
- **Child Safety** — YES. Cross-family (§7.3) and cross-child (§7.4)
  isolation are both explicit, mandatory design requirements; no
  public-facing or searchable field exists on any entity here. §7.6
  records an explicit, non-blocking residual-risk callout on the
  strength of cross-child enforcement specifically (single-layer,
  application-only, vs. family isolation's two layers) — flagged, not
  silently accepted as equivalent.
- **Parent Trust** — YES. Every memory correction is attributable and
  preserves history (§5.1); deletion is always ultimately available to
  the owning parent (§5.3, §6.5); the Vault-add permission question is
  now founder-resolved (§6.3: owner-only, unconditional).
- **Secure APIs** — N/A at this design stage; no API surface exists or is
  speculated here.
- **Audit Logging** — Design-supports, does not implement. This document
  identifies the events a future audit schema (Milestone 7) will need to
  cover (conversation/message access, memory view/correct/vault/delete)
  without designing that schema itself.
- **Search Engine Protection** — N/A. No entity here is publicly
  reachable.
- **Encryption** — Tier 3 (§7.1): per-Family DEK, application-layer,
  unchanged from M3 §5.2. §7.5 makes explicit that this same DEK is the
  mechanism M4 §10's crypto-shredding cascade acts on for these three
  entities.
- **Parent Data Ownership** — YES. Every entity is Family/Child-scoped
  and ultimately deletable/exportable by the owning parent (§5.3, §6.4);
  no data here is owned by Natkhat AI.
- **AI Safety** — N/A at this design stage; no AI/Leo behavior (as
  opposed to data shape) is designed here. §9's conversation-deletion-
  vs-memory question is explicitly deferred to Milestone 8 by founder
  decision, not silently assumed safe or resolved here.
- **Product Constitution Compliance** — YES. Directly implements Core
  Principle 4 ("Childhood memories matter," via the unchanged M4 §13.4
  three-class design) and Constitution §8 ("Conversation isolation is
  mandatory," via §7.3–7.4).

No item above is answered "NO"; none blocks this design from proceeding
to review. §6.3 (Vault-add authorization) is now founder-resolved.
§9 (conversation-deletion-vs-memory interaction) is explicitly deferred
to Milestone 8 by founder decision, not resolved here. §7.6 records a
residual risk (child-level isolation enforcement strength) that is
neither blocking nor silently accepted — it is an explicit requirement
on future implementation. None of the three is silently resolved, per
the instruction not to silently resolve founder/legal decision points.

## 12. Consistency Check Against M1–M5

No M1 entity field, M2 authorization rule, M3 classification/RLS design,
M4 lifecycle rule, or M5 consent design is changed by this document.
`Conversation`, `Message`, and `LeoMemory` are new entities that
reference M1's `Family`/`Child`/`Parent` by id only (§3); §7.4's
cross-child scoping is new application-layer scope, not a change to any
existing M2 permission row; §5's cascade rules are direct applications of
M4 §7/§9's already-stated (and, for §13.4's memory classes, already
founder-approved) rules, not new policy; §6, including §6.3's
now-founder-resolved Vault-add decision, maps onto M2 §5's existing
table by extension rather than adding a new row to it; §7.1–7.3 fill in
M3 §7.2's own prospective "Milestone 6" placeholder row exactly as M3
anticipated, introducing no new isolation concept; §7.5 restates M4
§10's existing crypto-shredding mechanism's applicability to three new
entities without amending that mechanism; §7.6 records a residual-risk
observation against the current, unchanged M1/M2 session model — it
does not propose or imply any change to
`docs/architecture/authorization-and-sessions.md`.

## 13. Legal/Founder-Decision Items (Separate from Engineering Decisions)

Items 1–2 below are no longer open; they are recorded here with their
resolution status, per this repository's append-only decision
discipline. Items 3–4 remain unresolved, not assumed, and not silently
ratified by this document:

1. **[RESOLVED — founder decision 2026-08-08]** §6.3 — which
   authorization tier governs adding a memory to the Permanent Vault.
   **Resolved: owner-only, unconditional.**
2. **[DEFERRED TO MILESTONE 8 — founder decision 2026-08-08]** §9 — how
   (or whether) deleting a single `Conversation` should affect
   already-distilled `LeoMemory` content derived in part from it. Not
   resolved here; explicitly scoped to Milestone 8's future
   memory-extraction/AI-pipeline design, which must address
   `Conversation`↔`LeoMemory` provenance as a prerequisite.
3. **[OPEN — inherited from ADR-0006, not new]** Whether any future
   Leo-memory-informed behavior constitutes automated decision-making
   with its own regulatory profile (ties to ADR-0006's existing Legal
   Validation item 5; not addressed by this document since no AI
   behavior is designed here).
4. **[OPEN — inherited from ADR-0006, not new]** General applicability
   of COPPA/GDPR/India's DPDP Act to conversation and memory data
   specifically, once the target-market/age-range determination
   (ADR-0007) is legally reviewed — restated from ADR-0006's existing
   Legal Validation item 6.

Additionally, §7.6 records an open, non-legal, non-founder-blocking
engineering question for future evaluation: whether a child-scoped
session claim or database-level enforcement is ultimately required for
the child-isolation boundary — explicitly left to a future Change
Request, not decided here.

## 14. Explicit Exclusions

No AI/LLM integration, no vector database selection or wiring, no
embedding pipeline, no memory-extraction/summarization algorithm, no
actual conversation or memory data. No database schema, migration, key
management, or RLS policy execution (M3/ADR-0004 gates unchanged). No
audit-log schema (Milestone 7 — only the event surface is identified,
§11). No AI-provider data-boundary design (Milestone 8, which depends on
this document). No change to `docs/architecture/data-lifecycle.md`,
`docs/architecture/data-classification-and-isolation.md`,
`docs/architecture/authorization-and-sessions.md`, or
`docs/modules/identity-family/README.md` — this document fills in
placeholders each of those already reserved for "Milestone 6" (M3 §7.2,
M4 §7.1/§7.2/§9/§10/§13.4) without redesigning any of them. No
resolution of §13's still-open items (3–4) or §7.6's residual-risk
question. No real parent, child, family, conversation, or memory data
anywhere in this document.

## 15. Testing Implications (design-level only)

Per `docs/engineering/testing-strategy.md`'s taxonomy: no code exists
yet. Once implemented (post-ADR-0004 gate clearance, post-Milestone 8 AI
integration design, post-resolution of §13's open items), this design's
minimum bar is **Unit** (`LeoMemory` supersession-not-mutation invariant,
§5.1; cross-child scoping check, §7.4), **Integration** (§5.3's three
cascade flows executed end-to-end; immediate embedding/cache/index
invalidation at soft-delete, §8), and **Security** (a test that no
`Conversation`/`Message`/`LeoMemory` row is ever returned across a
`family_id` boundary, mirroring M3 §7's existing RLS test pattern, **and**
a corresponding test that no row is returned across a `child_id`
boundary within the same family, per §7.4's new requirement). Widget,
End-to-end, Performance, Accessibility, and Regression layers apply to
the features built on top of this design.

## 16. Deployment

Not applicable — documentation-only milestone; nothing is deployed
(`docs/sprints/sprint-02.md`, §2.2).

---

## Constitution Alignment

Traces to:
[Child Privacy & Safety Constitution](../constitution/product/child-privacy-and-safety-constitution.md)
§6 (Leo Memory Protection — encrypted storage, version history, secure
backup, parent-controlled deletion/export, "not for advertising,
profiling, or resale"), §7 (Voice & Image Security — same protection tier
extended to any future voice/image content within a `Message`, not
separately designed here), §8 (AI Conversation Security — "Conversation
isolation is mandatory," §7.3–7.4), §11 (Child Data Minimization — §3.4's
distilled-content decision); [Product Constitution](../constitution/product/natkhat-ai-constitution.md)
Core Principle 4 ("Childhood memories matter") and the Trust-Above-All
amendment; [Engineering Constitution](../constitution/engineering/engineering-constitution.md)'s
Mandatory Engineering Review Gates (Privacy, Parent Trust, Child Safety);
[ADR-0006](../decisions/ADR-0006-data-privacy-compliance.md) §2, §7–9,
§16, §17, §20, §22 (cited throughout); [ADR-0007](../decisions/ADR-0007-target-audience-interim-posture.md)
§D (4–10 target age, informing §4's no-child-session design); [ADR-0008](../decisions/ADR-0008-core-data-model-parent-family-child.md)
(entity shapes, consumed not redesigned); [ADR-0009](../decisions/ADR-0009-authorization-and-session-architecture.md)
(session/family-claim model, reused in §7.2–7.3; permission table
extended by reference in §6); [ADR-0010](../decisions/ADR-0010-encryption-and-tenant-isolation-design.md)
(Tier 3 encryption/RLS model, filled in for this milestone in §7);
`docs/architecture/data-lifecycle.md` §7, §9, §10, §13.4 (deletion
cascades, crypto-shredding mechanism, and the already-founder-approved
three-class memory architecture — all applied, §7.5 restating §10's
applicability, none redesigned); [ADR-0011](../decisions/ADR-0011-consent-architecture.md)
(supersession/append-mostly pattern precedent, §5.1); `docs/sprints/sprint-02.md`,
§3, Milestone 6.

**Status note:** per Milestone 6's Definition of Done, this document's
Status remains **Proposed** pending final founder/product-owner
sign-off at this milestone's stop-and-report checkpoint, notwithstanding
the founder decisions already recorded on 2026-08-08 (§6.3: Vault-add
authorization, resolved; §9: conversation-deletion-vs-memory question,
deferred to Milestone 8). This document does not authorize any
conversation storage, memory storage, embedding pipeline, or AI
integration of any kind. §7.6's residual-risk observation remains open
for future evaluation via Change Request and does not block this
milestone's Definition of Done (design only).
