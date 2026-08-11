# Child-Data Lifecycle Architecture (Retention, Deletion, Export, Backup-Purge)

**Version:** 1.1.0
**Status:** Proposed — Founder Decisions Recorded, Recorded in
[ADR-0015](../decisions/ADR-0015-child-data-lifecycle-architecture.md)
(Sprint 02, Milestone 4 deliverable; `docs/sprints/sprint-02.md`,
§5's decision-maker note applies). **Founder decisions on §13.1
(soft→hard-delete window), §13.2 (backup-purge window), and §13.4
(Leo memory architecture) are APPROVED, 2026-08-05. §13.3
(audit/security-log retention) is APPROVED PROVISIONALLY, 2026-08-05,
and remains subject to change if India legal/privacy review requires a
different period — see §13.3 and §15. These values are formally
recorded in
[ADR-0015](../decisions/ADR-0015-child-data-lifecycle-architecture.md)
(Accepted — Implementation Deferred), authored per
`docs/sprints/sprint-02.md`, §3, M4, now that the founder has ratified
these values.**
**Owner:** Engineering
**Last Updated:** 2026-08-05

> This document is Sprint 02, Milestone 4's deliverable
> (`docs/sprints/sprint-02.md`, §3, M4). It is an architecture-level
> design document only. It designs no deletion job, backup system,
> export pipeline, or database schema — see §16 (Explicit Exclusions).
> It builds on, and does not redesign, the Parent/Family/Child/
> CoParentAssignment/Device/Session entities
> ([`docs/modules/identity-family/README.md`](../modules/identity-family/README.md)/[ADR-0008](../decisions/ADR-0008-core-data-model-parent-family-child.md)),
> the role × family-scope authorization model
> ([`docs/architecture/authorization-and-sessions.md`](./authorization-and-sessions.md)/[ADR-0009](../decisions/ADR-0009-authorization-and-session-architecture.md)),
> and the classification/encryption/isolation design
> ([`docs/architecture/data-classification-and-isolation.md`](./data-classification-and-isolation.md)/[ADR-0010](../decisions/ADR-0010-encryption-and-tenant-isolation-design.md)).
> Every example is fictional; no real parent, child, or family data
> appears here.

---

## 1. Objective

Resolve ADR-0006's other explicitly deferred opens: §17 (retention
windows per category), §18 (deletion — soft/hard delete window), §19
(export completeness), §21 (backup-retention/purge window). Verbatim
from `docs/sprints/sprint-02.md`, §3, M4.

## 2. Scope

Per-category retention **candidate options, not a decision** — proposed
windows for founder review, not a settled policy; a deletion-window
proposal (soft-delete → bounded hard-delete); an export-completeness
checklist tied to the future Privacy Dashboard (Constitution §10); and
backup purge-window candidate options.

Out of scope (`docs/sprints/sprint-02.md`, §2.2 and M4's own Explicit
Exclusions): any cron job, deletion job, backup system, export
pipeline, RLS policy, encryption code, or database schema. No real
deletion of anything — there is no real data yet. No consent mechanism
(Milestone 5). No Leo/conversation implementation (Milestone 6) — this
document designs the lifecycle _boundary_ those future systems must
respect, not the systems themselves.

## 3. Lifecycle States

Seven states, applied consistently across every data category (§4),
not redefined per category:

| State                         | Meaning                                                                                                                                                                                                            |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Active**                    | Normal, currently-in-use data. Fully visible per the M2 authorization model and M3 RLS design.                                                                                                                     |
| **Inactive**                  | Still active/undeleted, but its owning Parent/Family has had no activity for an extended period. Not a deletion trigger by itself — flagged as a possible future product concern, not designed further here (§16). |
| **Soft-deleted**              | Marked deleted by the owning Parent (or system), excluded from normal application views, but the row/content still physically exists and is recoverable within the hard-delete window (§6).                        |
| **Hard-deleted**              | Irrecoverably erased at the application/database layer — content is gone or tombstoned (§7); no application-level recovery path exists past this point.                                                            |
| **Backup copy**               | A physical copy of data (at any state above) that exists in a backup snapshot, governed by its own purge timeline, independent of the live database (§10).                                                         |
| **Audit/security record**     | Tier 5 (ADR-0006 §7) — append-only, never soft/hard-deleted by the parent, governed by its own retention rule (§11).                                                                                               |
| **Derived/AI-generated data** | Content computed _from_ another category (embeddings, summaries, caches, indexes, analytics) — never outlives its source (§9).                                                                                     |

## 4. Data-Category Retention Matrix

Retention _while active_ is scaled by Milestone 3's tiers, per ADR-0006
§17's own text: most categories may lawfully use "retained until the
parent deletes it" with no exact duration required — a duration is
only needed where that pattern doesn't apply.

| Tier (M3)                                                                                    | Retention-while-active policy                                                                             |                    Duration status                     |
| -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | :----------------------------------------------------: |
| 1. Account/Identity                                                                          | Until the Parent deletes their account (§7's "explicit... policy" is sufficient — no exact number needed) |                          N/A                           |
| 2. Child Profile                                                                             | Until the Parent deletes the Child or the Family                                                          |                          N/A                           |
| 3a. Sensitive Child Content — Leo Active Relationship Memory (prospective)                   | Until the Parent deletes it — no fixed expiry, tied to the Child/Family lifecycle                         |          **Resolved — §13.4 D4-A, APPROVED**           |
| 3b. Sensitive Child Content — Memory Version History (prospective)                           | Rolling window: 90-day default, 30-day–1-year parent-configurable range                                   |          **Resolved — §13.4 D4-B, APPROVED**           |
| 3c. Sensitive Child Content — Permanent Parent-Approved Childhood Memory Vault (prospective) | Indefinite, per item, parent-initiated only — see business rule in §13.4                                  |          **Resolved — §13.4 D4-C, APPROVED**           |
| 4. Growth/Progress (prospective)                                                             | Until the Parent deletes it                                                                               |                          N/A                           |
| 5. System/Operational (audit/security)                                                       | Cannot be "until the parent deletes it" — parent cannot delete these (ADR-0006 §22)                       | **Resolved — §13.3, APPROVED PROVISIONALLY (3 years)** |

Two duration-bearing decisions apply uniformly _after_ a deletion is
triggered, regardless of tier: the soft→hard-delete window (§13.1,
**APPROVED — 90 days**) and the backup-purge window (§13.2,
**APPROVED — 90 days, with cryptographic erasure for Tier 3**).

**Implementation-stage gap identified (not fixed here):** computing
any of these durations requires knowing _when_ a row entered its
current state. M1's `Parent`/`Family`/`Child` entities have
`created_at` but no `deleted_at`/status-transition timestamp. This is a
real, necessary addition for a future ADR-0004 implementation — flagged
here as a forward note, not silently added to the M1 module document,
which is out of this milestone's scope to edit.

## 5. Soft-Delete Architecture

Reuses M1's existing `status` fields (`Parent.status`,
`Family.status`, `Child.status`, each already including a `deleted`
value) — no new field is added to any M1 entity by this document. Soft
delete is: `status → deleted`. The row remains, fully intact,
including for the purposes of M3's RLS `family_id`/`parent_id`
partitioning — a soft-deleted `Child` row is still governed by exactly
the same isolation policy as an active one (§14). Two additional,
application-layer effects distinguish soft-deleted from active:

1. **Visibility.** Ordinary application queries exclude
   `status = deleted` rows by default. A separate, still owner-only
   (M2 §5) "view/restore recently deleted" flow can reach them within
   the hard-delete window (§6) — this is an additional authorization
   surface this document identifies but does not itself design in
   detail (§16).
2. **Writability.** A soft-deleted row accepts no further content
   writes (e.g., a soft-deleted Child's profile cannot be edited) —
   only a restore-to-active or a progression-to-hard-delete transition.

## 6. Hard-Delete Architecture

**Design decision: tombstone, not always physical row removal.**
Physical row deletion is used where nothing else in the system
references the row's identifier. Where another table still needs to
resolve the identifier for its own integrity (e.g., an audit-log actor
field, or a `CoParentAssignment.invited_by_parent_id` for a Family that
is not itself being deleted), the row is **tombstoned**: its identifier
is retained, every content/PII field is scrubbed (nulled or replaced
with a fixed erasure marker), and a `deleted`-equivalent state persists
permanently. This is the mechanism that lets audit records remain
structurally resolvable (§11) without ever holding the erased person's
actual data — satisfying both ADR-0006 §18 ("deletion... precisely
defined") and §22 (audit integrity) simultaneously, rather than
choosing one at the expense of the other.

Hard-delete is triggered once a soft-deleted row's bounded window
(§13.1) elapses, without the Parent restoring it first. Past this
point, no application-level recovery path exists — this is the
"irrecoverable" line ADR-0006 §18 requires be precisely defined, and it
is defined here as: **the moment content fields are scrubbed (tombstone)
or the row is physically removed, whichever applies.** What may still
exist in a _backup_ past this point is a distinct, separately-bounded
concern (§10).

## 7. Child/Family/Account Deletion Behavior

Each of the three flows applies M1's existing ownership rules and M2's
existing scoping rules to a new operation — none of them is a new
policy invented by this document.

### 7.1 A Parent deletes one Child profile

Soft-deletes only that `Child` row. Does **not** affect the `Family`,
other `Child` rows in the same Family, `CoParentAssignment`, `Device`,
or `Session` rows. Once Milestone 6 exists, cascades to soft-delete
every Tier 3/4 record keyed to that `Child` (§9).

### 7.2 A Parent deletes an entire Family

Soft-deletes the `Family` row and cascades to: every `Child` in that
Family (soft-deleted); every `CoParentAssignment` for that Family
(revoked — reusing the exact cascade M2 §6.4 already designed for
owner-initiated revocation, not a new mechanism); every active
`Session` currently pinned to that `family_id` (ended,
`end_reason = family_deleted` — only sessions pinned to _this_ family,
per M2 §6.1's one-family-per-session design, not the Parent's other
sessions). Once Milestone 6 exists, cascades to every Tier 3/4 record
with that `family_id`.

**Explicitly does not cascade to `Device` rows** — per M3 §6.1's
existing decision that `Device` is Parent-scoped, not Family-scoped
("a co-parent's device list is theirs to manage, not shared
inventory"). A Family being deleted has no bearing on any Parent's own
device inventory, including the owning Parent's.

### 7.3 A Parent deletes their own account

The broadest cascade — distinguishes ownership from co-parent
membership, per ADR-0008's existing rule that a Parent may hold both
roles across different Families simultaneously:

- **Every Family this Parent solely owns** (`owning_parent_id` = this
  Parent) — cascades exactly as §7.2, since ADR-0006 §4's
  non-transferable-ownership design means there is no other accountable
  owner to leave the Family with.
- **Every Family where this Parent is only a `co_parent`** — the Family
  and its Children are **not** deleted. Only this Parent's
  `CoParentAssignment` for that Family is revoked (same effect,
  reusing M2 §6.4's cascade again — this Parent's sessions for that
  Family end, but the Family, its owning Parent, and its Children are
  unaffected).
- **This Parent's own `Device` inventory** — soft-deleted/removed
  entirely (it is Parent-scoped, and this Parent no longer exists as an
  active principal).
- **This Parent's own `Session` rows** (across every Family) — ended.
- **The `Parent` row itself** — soft-deleted, later hard-deleted per §6
  (tombstoned, since `Child.created_by_parent_id`,
  `CoParentAssignment.invited_by_parent_id`/`revoked_by_parent_id`, and
  future audit-actor fields may still need to resolve this id).

## 8. Export Architecture

**Completeness definition:** an export must include every record
visible to the requesting Parent through the future Privacy Dashboard
(Constitution §10) for every Family they are authorized for (M2 §4) —
i.e., every Tier 1/2/3/4 record scoped to those Families: Child
profile data, growth/progress data, (once modeled) Sensitive Child
Content, their own Device list, their own Session/login history,
active `CoParentAssignment` grants, and shared-link metadata (once
Constitution §4's sharing feature exists).

**Explicitly excluded from export, for security/privacy reasons:**

- Raw authentication credentials or secrets — this system never holds
  them (Supabase Auth's own domain, referenced only via
  `Parent.auth_identity_ref`, per M1 §3.2).
- Tier 5 audit/security-log raw entries — these are the system's own
  accountability record, not user content (ADR-0006 §22, "distinct
  from the user-content deletion/export"). A summarized "your account
  security activity" view is already covered by the Device/Session
  export above, which _is_ included.
- Another Family's data — already structurally prevented by M2/M3, not
  a new export-specific rule.
- **Flagged, not fully resolved:** another co-parent's own `Parent`-row
  fields beyond what the requesting Parent already sees in normal
  product use (e.g., their display name in a `CoParentAssignment`
  context) — full contact details of a _different_ principal are not
  automatically export-safe just because they relate to the same
  Family. This needs a specific rule at implementation time, not
  invented here.

Export requests are audit-logged (ADR-0006 §19, §22) and are an
owner-only action (M2 §5) — unchanged from M2, cited here because §19
requires it.

## 9. Derived/AI-Generated Data: Deletion Propagation

**Rule, not implementation:** derived data never outlives its source.
Any content computed _from_ a Child's or Family's data is deleted or
invalidated no later than that source completes hard-delete — this
generalizes ADR-0006 §9's existing requirement ("parent-initiated
deletion cascades to all derived/cached copies — embeddings,
summaries, indexes") across the full lifecycle timeline, rather than
introducing a new rule. This document does not design any of the
future systems below beyond stating their cascade timing:

| Category (all prospective — Milestone 6+)                         | Cascade timing                                                                                                                                                                                                                                                                                                                                                            |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Leo conversation history                                          | Soft-deletes with source; hard-deletes no later than source's hard-delete (§6).                                                                                                                                                                                                                                                                                           |
| Memories / developmental insights                                 | Split across the three memory classes defined in §13.4: Active Relationship Memory follows the source's lifecycle with no fixed expiry; Memory Version History ages out on its own 90-day-default rolling window regardless of the source's own status; the Permanent Childhood Memory Vault is deleted only by explicit parent action, same as any other source-cascade. |
| Uploaded media (voice, images, drawings)                          | Same as source's lifecycle.                                                                                                                                                                                                                                                                                                                                               |
| Generated content (e.g., Leo's own outputs referencing the child) | Same as source's lifecycle.                                                                                                                                                                                                                                                                                                                                               |
| Analytics                                                         | Same as source's lifecycle — no separate, longer-lived analytics retention is authorized by this design.                                                                                                                                                                                                                                                                  |
| Embeddings / vector representations                               | **Engineering decision (not a founder duration): invalidated immediately at soft-delete**, not held for the full grace window — there is no product reason for a search/recommendation index to keep surfacing soft-deleted content during the recovery window, and doing so would itself be an unstated retention exception.                                             |
| Caches                                                            | Same as embeddings — invalidated at soft-delete, immediately.                                                                                                                                                                                                                                                                                                             |
| Search indexes                                                    | Same as embeddings — invalidated at soft-delete, immediately.                                                                                                                                                                                                                                                                                                             |
| Backups                                                           | Governed by its own, separately-bounded purge window (§10) — not the same timeline as the live system.                                                                                                                                                                                                                                                                    |

## 10. Backup-Purge Architecture

Two complementary mechanisms, not one:

1. **Time-boxed backup-generation expiry.** Backups older than the
   founder-decided purge window (§13.2) are deleted wholesale. This is
   the only mechanism available for Tier 1/2 content, which is not
   field-level encrypted (M3 §5.1) — a backup snapshot cannot be
   selectively edited in place, so full-generation expiry is the
   correct, standard mechanism for that content.
2. **Crypto-shredding for Tier 3 content specifically**, made possible
   by M3 §5.2's per-Family envelope-encryption design: once a Family
   completes hard-delete, its Data Encryption Key is destroyed/rotated
   out. Every copy of that Family's Tier 3 content in _any_ existing
   backup — regardless of the backup's own age — becomes permanently
   unreadable immediately, without waiting for that backup generation
   to expire on its own schedule. This decouples "the backup file
   still physically exists" from "the content in it is still
   readable," and is the direct architectural payoff of Milestone 3's
   per-Family key design feeding into Milestone 4.

Both mechanisms are needed: crypto-shredding does not apply to Tier 1/2
(not field-level encrypted), and generation-expiry alone would mean
Tier 3 content remains recoverable from old backups for the entire
backup-retention window even after key destruction is available sooner.

## 11. Audit/Security-Record Treatment

Tier 5 is deliberately **not** governed by the same "until the parent
deletes it" pattern as Tiers 1–4, for a specific reason worth stating
explicitly: a deletion event itself must be provable to have happened,
which requires the audit record describing that deletion to _outlive_
the content it describes. If Tier 5 followed the same deletion rules as
its subject matter, deleting a Child would also erase the only record
that a deletion occurred — defeating ADR-0006 §22's accountability
purpose entirely. Tier 5 is therefore: append-only; never deletable by
the parent (unchanged from ADR-0006 §22); governed by its own,
independently bounded retention duration (§13.3), not an indefinite
one — ADR-0006 §17's "no indefinite retention without a stated reason"
applies to Tier 5 exactly as it applies to every other tier, so an
exact (if provisional) number is required here, not an unbounded
"forever."

## 12. Deletion-Verification Design

**Concept, not implementation.** Once a hard-delete cascade completes
(§7), the system generates a single Tier 5 "deletion-completion" audit
event referencing: the (now-tombstoned, opaque) identifier deleted;
which cascade targets were addressed (derived-data invalidation,
cache/index purge, backup-purge scheduling) — a checklist-style
completeness marker, not a narrative; and the timestamp each target
completed. This is an internal attestation record. A parent-facing
summary ("deletion completed on [date]") could surface via the future
Privacy Dashboard as a courtesy, consistent with Constitution §10 — not
designed further here. The actual verification job/pipeline that
produces this event is implementation, out of scope for this milestone.

## 13. Founder Decisions — Approved Values and Supporting Analysis

**Decision record.** §13.1, §13.2, and §13.4 (D4-A/B/C) are
**APPROVED**, founder decision recorded 2026-08-05. §13.3 is
**APPROVED PROVISIONALLY**, same date, and remains subject to change if
India legal/privacy review requires a different period (§15). The
original candidate-option tables and evaluation criteria are preserved
below as the supporting rationale for each approved value — per this
repository's append-only decision discipline, analysis is not deleted
once a decision is made, only marked with its outcome.

### 13.1 Soft-delete → hard-delete window

| Option                | A — 30 days                                                                            | B — 90 days                                                           | C — 180 days                                                                                                                       |
| --------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Purpose               | Minimal grace period before irreversible erasure                                       | Meaningful "did I mean to do that" window without extended retention  | Maximal accidental-deletion protection                                                                                             |
| Privacy impact        | Strongest — shortest recoverable-state window                                          | Moderate                                                              | Weakest of the three                                                                                                               |
| Child-safety impact   | Best — least time a deleted child record persists anywhere                             | Acceptable — extra time to reverse a mistake involving a child's data | Debatable — longer "deleted-but-not-really" retention may read as inconsistent with the parent's expectation of immediate deletion |
| Operational impact    | Requires reliable, frequent hard-delete jobs; least buffer for support-driven recovery | More buffer for support cases; less time-pressure on job reliability  | Least operational pressure, largest soft-deleted volume to secure meanwhile                                                        |
| UX impact             | Risk of accidental permanent loss if a parent doesn't notice within 30 days            | Forgiving for parents who don't open the app for weeks                | Best accidental-recovery story                                                                                                     |
| Cost/storage impact   | Lowest                                                                                 | Moderate                                                              | Highest                                                                                                                            |
| Recovery implications | Narrowest recovery window; no recovery past 30 days                                    | Reasonable recovery window                                            | Longest recovery window                                                                                                            |
| Major trade-offs      | Strongest minimization, weakest safety net                                             | Balanced                                                              | Best UX safety net, weakest minimization/cost                                                                                      |

**APPROVED — Option B (90 days), founder decision 2026-08-05.**
Rationale: balances the Trust-Above-All/parent-control principle
(a meaningful undo window) against ADR-0006 §17's "no indefinite
retention without a stated reason," and matches common consumer-product
practice without Option C's weaker privacy posture. _Refinement worth
future consideration, not decided here:_ Tier 3 content (once modeled)
could reasonably use a shorter window than Tier 1/2, given its higher
sensitivity — flagged, not decided here.

### 13.2 Backup-retention/purge window

| Option                | A — 30 days                                                                    | B — 90 days                                                                          | C — 180 days                                     |
| --------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------ |
| Purpose               | Minimize total post-hard-delete exposure tail                                  | Match a typical backup-generation cadence while still bounding the tail to a quarter | Maximal disaster-recovery depth                  |
| Privacy impact        | Strongest                                                                      | Moderate                                                                             | Weakest                                          |
| Child-safety impact   | Strongest — a deleted child's data is gone everywhere soonest                  | Acceptable, especially combined with §10's crypto-shredding for Tier 3               | Weakest of the three                             |
| Operational impact    | May conflict with backup cadences kept for _unrelated_ disaster-recovery needs | Aligns with common backup-cadence practice                                           | Most disaster-recovery headroom                  |
| UX impact             | N/A (invisible to the parent)                                                  | N/A                                                                                  | N/A                                              |
| Cost/storage impact   | Lowest                                                                         | Moderate                                                                             | Highest                                          |
| Recovery implications | Narrowest general disaster-recovery depth                                      | Reasonable general DR depth                                                          | Best DR depth                                    |
| Major trade-offs      | Best deletion guarantee, weakest general DR                                    | Balanced                                                                             | Best DR, weakest deletion-completeness guarantee |

**APPROVED — Option B (90 days), founder decision 2026-08-05, explicitly
paired with §10's crypto-shredding mechanism for highly sensitive
child content wherever technically applicable** so Tier 3 content
becomes cryptographically unreadable without waiting for physical
backup expiry, decoupling "backup file still exists" from "content
still readable" — the 90-day window then mainly bounds Tier 1/2
exposure, where crypto-shredding does not apply.

### 13.3 Audit/security-log retention duration (Tier 5)

The one candidate set with a live legal dependency, not a pure business
trade-off — see §15.

| Option                | A — 1 year                                                                            | B — 3 years                                       | C — 7 years                                                                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Purpose               | Covers most practical incident-investigation windows                                  | Common security-log retention middle ground       | Matches common statutory record-keeping defaults (applicability to Natkhat AI not confirmed)                                                      |
| Privacy impact        | Best                                                                                  | Moderate                                          | Weakest for this category                                                                                                                         |
| Child-safety impact   | Neutral-to-positive (less audit trail to protect over time)                           | Neutral                                           | Neutral, but see trade-off below                                                                                                                  |
| Operational impact    | Lowest storage; may not satisfy an eventual legal minimum                             | Moderate                                          | Highest storage                                                                                                                                   |
| UX impact             | N/A (parent doesn't manage this)                                                      | N/A                                               | N/A                                                                                                                                               |
| Cost/storage impact   | Lowest                                                                                | Moderate                                          | Highest                                                                                                                                           |
| Recovery implications | Sufficient near-term; insufficient for a multi-year-later inquiry                     | Covers a longer investigation/legal-hold scenario | Longest coverage                                                                                                                                  |
| Major trade-offs      | Leanest, most exposed to a future legal-validation finding requiring longer retention | Reasonable provisional default                    | Only justified by a confirmed legal requirement — otherwise risks the same "no stated reason" problem ADR-0006 §17 flags for indefinite retention |

**APPROVED PROVISIONALLY — Option B (3 years), founder decision
2026-08-05, explicitly subject to change if India legal/privacy review
under ADR-0006's open Legal Validation item on regulatory
breach-notification/record-keeping obligations (§30) requires a
different period.**

### 13.4 Leo Memory Architecture — Three Independent Storage Classes (Tier 3, prospective — informs Milestone 6)

**Revised following founder clarification, 2026-08-05.** The original
single-category framing below (superseded, preserved for traceability
at the end of this subsection) applied one retention window to "Leo's
memory" as a whole. That conflated two materially different things —
memory Leo actively uses for relationship continuity, and historical
version snapshots — and omitted a third category the founder
specifically directed be added: parent-curated permanent keepsakes.
This subsection replaces that framing. Per Constitution §6 and
ADR-0006 §9 (encrypted storage, version history, parent-controlled
deletion/export), the corrected design resolves into three
**independent storage classes**: independent meaning each has its own
retention rule and its own deletion trigger, and no data moves between
them except by the explicit business rule stated below.

#### Class 1 — Leo Active Relationship Memory

The current, live memory state Leo uses to maintain relationship
continuity — a distilled understanding of the child (preferences,
ongoing context, relationship history), not an ever-growing raw
transcript.

- **Founder decision D4-A: APPROVED — Option 1, 2026-08-05.** No fixed
  expiry. Retention follows the same "until the Parent deletes it"
  pattern already used for Tiers 1/2/4 (§4) — tied to the `Child`/
  `Family` entity lifecycle (M1), not a standalone duration. A fixed
  expiry here would risk Leo appearing to periodically forget the
  child, which the founder correctly identified as a genuine
  product/child-trust problem, not merely an engineering detail.
- **Parent controls:** view (future Privacy Dashboard), export,
  targeted correction/"forget this fact" (the forget/override
  mechanism ADR-0006 §20 requires for AI-generated memory), full
  deletion.
- **Deletion behavior:** only parent-initiated — directly, or via
  Child/Family/account deletion (§7). Once triggered, follows the
  approved 90-day soft→hard-delete window (§13.1) and crypto-erasure
  (§13.2).
- **Privacy implications:** the highest-exposure class — most actively
  used and queried. Requires the full Tier 3 protection set
  (field-level per-Family encryption, M3 §5.2; tenant isolation, M3
  §7).
- **Child-safety implications:** retaining this long-term, bounded
  only by the active relationship rather than a fixed clock, directly
  serves Core Principle 4 ("Childhood memories matter") — provided it
  is never used for advertising, profiling, or resale (Constitution
  §6, unchanged, explicit prohibition).
- **Minimum data required:** a distilled/summarized memory profile is
  favored over indefinitely retaining raw verbatim transcripts, per
  ADR-0006 §2's minimization principle — an implementation-stage
  design point for Milestone 6, not resolved further here.
- **Cryptographic erasure:** applies — same per-Family DEK as all Tier
  3 content (M3 §5.2).
- **Family/account inactivity:** no automatic effect — memory is not
  purged merely because a family stops using the product for a period
  (§3's "Inactive" state is explicitly not a deletion trigger by
  itself).
- **Child reaches the product age limit (ages out of 4–10):** not an
  automatic deletion trigger. This is a product-lifecycle event that
  should prompt an explicit parent choice (retain, promote specific
  memories into Class 3, or delete) rather than any silent default
  action. **Flagged, not resolved here:** whether Natkhat AI continues
  to serve an aged-out child's account at all is a separate,
  unaddressed product-scope question.
- **Parent deletes the account:** full cascade per §7.3 — deleted
  along with everything else the account owns.

#### Class 2 — Memory Version History

The technical history behind Class 1 — superseded snapshots, rollback
points, the audit trail of how Leo's active memory has changed over
time. This is the category the original (superseded) single-window
proposal was actually describing.

- **Founder decision D4-B: APPROVED — Option B, 2026-08-05.** Default
  90 days, parent-configurable range 30 days–1 year.
- **Parent controls:** optionally view past versions, roll back to an
  earlier version, delete specific versions or all history.
- **Deletion behavior:** each snapshot ages out on the rolling window
  above, independent of Class 1's own (unbounded) retention.
  Child/Family/account deletion cascades to delete all history
  immediately, via the same §13.1/§13.2 mechanism.
- **Privacy implications:** _more_ exposure than Class 1, not less —
  multiple historical copies of sensitive content is a larger surface
  than one current copy. This is the specific reason this class is
  bounded while Class 1 is not.
- **Child-safety implications:** lower stakes than Class 1 — losing an
  old superseded snapshot does not mean Leo forgets the child (Class 1
  is what Leo actually uses); this is a correction/audit safety net,
  not a relationship feature.
- **Minimum data required:** enough depth to make a realistic "undo my
  last change" useful — not indefinite depth.
- **Cryptographic erasure:** applies — same per-Family DEK.
- **Family/account inactivity:** no special treatment — the rolling
  window continues pruning old versions on schedule regardless of
  activity level (routine housekeeping, not a deletion trigger tied to
  inactivity).
- **Child reaches the product age limit:** no automatic deletion —
  same "ask, don't assume" treatment as Class 1.
- **Parent deletes the account:** full cascade, same as Class 1.

#### Class 3 — Permanent Parent-Approved Childhood Memory Vault

A specific, individually-curated set of memories a parent has
deliberately chosen to preserve indefinitely — e.g., a specific
milestone or memory marked as a keepsake. This class does not populate
itself; see the business rule below.

- **Founder decision D4-C: APPROVED, 2026-08-05.** Adopted as a future
  (Milestone 6) design direction.
- **Retention policy:** indefinite, per item — an explicit, narrow
  exception to ADR-0006 §17's "no indefinite retention without a
  stated reason," where the stated reason is the parent's own
  explicit, per-item choice, not a system-wide default or range.
- **Parent controls:** an explicit "preserve as permanent memory"
  action, applied item by item; view; export; delete at any time —
  nothing in this Vault is ever locked away from the owning parent.
- **Deletion behavior:** only ever parent-initiated, no automatic
  expiry under any circumstance. Once triggered, follows the same
  §13.1/§13.2 mechanism as everything else.
- **Privacy implications:** unchanged protection level from Classes
  1/2 — "permanent" does not mean "less protected." Full Tier 3
  controls apply.
- **Child-safety implications:** positive — the cleanest way to serve
  Core Principle 4 without weakening data-minimization discipline,
  since inclusion is specific and parent-chosen rather than an
  ambient, ever-growing pool of everything Leo has processed.
- **Minimum data required:** only the specific memory/content the
  parent chose to preserve — never a bulk copy of unrelated
  surrounding data.
- **Cryptographic erasure:** applies — even Vault content is destroyed
  instantly and irreversibly if the parent deletes the Family/account.
  "Permanent" means "until the parent decides otherwise," never
  "beyond the owning parent's own deletion authority" (consistent with
  ADR-0006 §4's non-transferable-ownership principle).
- **Family/account inactivity:** no effect — Vault content is immune
  to inactivity by definition.
- **Child reaches the product age limit:** no automatic change. Of the
  three classes, the Vault is best suited to survive this event
  unchanged, since it exists specifically as a long-term keepsake.
- **Parent deletes the account:** deleted along with everything else —
  nothing survives against the owning parent's own deletion decision.

#### Architectural business rule: independence of the three classes

**The three classes are independent storage classes. No automatic
promotion is permitted from Class 1 (Active Relationship Memory) into
Class 3 (Permanent Childhood Memory Vault).** Content enters Class 3
**only** via an explicit, per-item parent action — never by any system
process, retention-expiry event, age threshold, significance heuristic,
or default behavior. This is a hard architectural constraint, not a
configurable default: a future Milestone 6 implementation that
auto-promoted "important-seeming" memories into the Vault would violate
this rule and require a new Change Request, not a silent design
choice.

**Rationale:** automatic promotion would functionally turn every
memory into a candidate for indefinite retention, reintroducing the
exact ADR-0006 §17 tension the founder's clarification request already
identified — indefinite retention needs an explicit, individually-
justified reason, and only the owning parent's own deliberate action
can supply that reason for a specific memory. It also keeps Class 1's
own retention story clean: Class 1 stays "active as long as the
relationship is active," full stop, with no implicit side-channel
through which content quietly becomes permanent without the parent
choosing that.

**Historical note (superseded, not deleted — this repository's
append-only decision discipline):** an earlier version of this
subsection proposed a single default/range (90-day–1yr / 180-day–2yr /
1yr–indefinite) applied to "Leo's memory" as one undivided category,
with a recommendation of the 180-day-default/2-year-range option. That
framing is superseded in full by the three-class architecture above,
following the founder's clarification that it risked Leo periodically
forgetting the child — a genuine product/child-trust concern the
original framing failed to separate from the much lower-stakes
question of how much version history to keep.

## 14. Lifecycle Interactions with M3 Tenant Isolation

- Crypto-shredding (§10) ties directly to M3 §5.2's per-Family DEK
  design — this document does not introduce a new key-management
  concept, only a new use for the existing one.
- Deletion cascades (§7) must respect the Family-vs-Parent boundary M3
  §6.1 already established. Getting this wrong in either direction is
  a real failure mode: cascading Family deletion to `Device` would
  wrongly delete a co-parent's personal device inventory over a Family
  they no longer participate in; _failing_ to cascade Parent-account
  deletion to `Device` would leave a departed principal's devices live
  indefinitely.
- RLS's `family_id`/`parent_id` partitioning (M3 §7) remains
  authoritative throughout the soft-deleted window — a soft-deleted
  `Child` row is filtered from normal views at the _application_ layer
  (§5), but is still governed by the same _database_-layer isolation
  policy as an active row. Soft-deleted data does not become
  cross-family-visible merely by being soft-deleted.
- All three Leo memory classes (§13.4) remain within Tier 3's
  per-Family isolation and encryption boundary (M3 §5.2, §7) —
  Class 1, Class 2, and the Class 3 Vault are each `family_id`-scoped
  and individually-DEK-encrypted like any other Tier 3 content; none
  of the three introduces a different isolation or encryption boundary
  from what M3 already established.

## 15. Legal-Validation Items (Separate from Engineering Decisions)

1. Whether the founder-chosen backup-purge and audit-retention windows
   (§13.2, §13.3) satisfy India DPDP Act erasure and record-keeping
   obligations, once legally reviewed — ties to ADR-0006's existing
   open Legal Validation items 1 and 3 (not new items, not resolved
   here).
2. Whether any non-privacy regulatory record-keeping law (e.g.,
   billing/financial/tax) requires retaining specific records longer
   than a child-privacy-driven deletion policy would otherwise permit
   — not evaluated in this document; flagged as unresolved.
3. Whether the soft-delete/hard-delete/tombstone design as specified
   here satisfies DPDP's erasure-equivalent requirement once that
   requirement is legally mapped to Natkhat AI's specific data
   categories — not yet validated.
4. Whether the founder-approved 3-year audit/security-log retention
   period (§13.3) is consistent with any confirmed regulatory
   record-keeping minimum or maximum under India's DPDP Act — this is
   the specific reason §13.3 is recorded as **provisional**, not final,
   and must be changeable if legal review requires a different period.

None of the four items above are resolved, assumed, or silently
ratified by this document.

## 16. Explicit Exclusions

No cron job, deletion job, export pipeline, or backup-system
implementation. No RLS policy execution, no field-level encryption
code, no key destruction/rotation code. No database schema or
migration. No consent mechanism (Milestone 5). No Leo/conversation
entity or implementation (Milestone 6) — only the lifecycle boundary
those future systems must respect. No "inactive account" auto-deletion
policy is designed — flagged in §3 as a possible future product
concern, intentionally not expanded into a fifth candidate-option set,
since ADR-0006 §17 does not require one (an account may be retained
indefinitely while active, with "the parent hasn't deleted it" as the
stated reason). No real parent, child, or family data anywhere in this
document.

## 17. Consistency Check Against M1/M2/M3

No M1 entity field, M2 authorization rule, or M3 classification/RLS
design is changed by this document. Where a genuine implementation gap
was found (the missing `deleted_at`/status-transition timestamp, §4),
it is flagged as a forward note for the future ADR-0004 implementation,
not silently patched into the M1 document. Every deletion-cascade rule
in §7 is an application of an M1 ownership rule or an M2 scoping/
revocation rule already on record — none is new policy. The §13.4
three-class Leo memory architecture and its no-automatic-promotion
business rule are new Tier 3 sub-structure within M3's existing
classification and isolation design (§14) — prospective, informing
Milestone 6 — and do not alter any M1, M2, or M3 entity, rule, or
boundary already on record.

## 18. Testing Implications (design-level only)

Per `docs/engineering/testing-strategy.md`'s taxonomy: no code exists
yet. Once implemented (post-ADR-0004 gate clearance, and post-founder
ratification of §13's windows), this design's minimum bar is **Unit**
(soft→hard state-transition correctness, tombstone field-scrubbing
completeness), **Integration** (the three §7 deletion-cascade flows,
executed end-to-end against every referencing table), and **Security**
(a test that hard-deleted Tier 3 content is provably unreadable after
DEK destruction, independent of whether the backup file itself has
expired). Widget, End-to-end, Performance, Accessibility, and
Regression layers apply to the features built on top of this design.

## 19. Deployment

Not applicable — documentation-only milestone; nothing is deployed
(`docs/sprints/sprint-02.md`, §2.2).

---

## Constitution Alignment

Traces to:
[Child Privacy & Safety Constitution](../constitution/product/child-privacy-and-safety-constitution.md)
§2 (Parent Owns the Child's Data — export/delete/correct), §6 (Leo
Memory Protection — parent-controlled deletion, version history), §10
(Privacy Dashboard — export completeness, §8), §12 (Secure Development
Standards — audit logging); [Product Constitution](../constitution/product/natkhat-ai-constitution.md)
Core Principle 2 ("Parent partnership") and Core Principle 4
("Childhood memories matter," directly weighed in §13.4's three-class
memory architecture — most directly in Class 1's unbounded,
relationship-tied retention and Class 3's Permanent Childhood Memory
Vault) and the Trust-Above-All amendment; [Engineering Constitution](../constitution/engineering/engineering-constitution.md)
Mandatory Engineering Review Gates (Privacy, Parent Trust);
[ADR-0006](../decisions/ADR-0006-data-privacy-compliance.md) §17, §18,
§19, §21, §22 (directly resolved or bounded, cited throughout);
[ADR-0008](../decisions/ADR-0008-core-data-model-parent-family-child.md)
(entity shapes and ownership rules, applied not redesigned);
[ADR-0009](../decisions/ADR-0009-authorization-and-session-architecture.md)
(owner-only action list, revocation cascade, reused for §7);
[ADR-0010](../decisions/ADR-0010-encryption-and-tenant-isolation-design.md)
(per-Family encryption, reused for §10's crypto-shredding mechanism);
`docs/sprints/sprint-02.md`, §3, Milestone 4.

**Status note:** the founder has reviewed and approved §13.1, §13.2,
and §13.4 (D4-A/B/C), and provisionally approved §13.3, all recorded
2026-08-05. This document's own Status remains **Proposed** rather than
"Accepted," because per Milestone 4's own text ("Founder approval
required first... then Yes, a new ADR recording the ratified
windows"), formal ADR authorship recording these now-ratified values is
a distinct next step, not yet performed in this milestone. §13.3's
"provisional" qualifier is carried forward into that future ADR
unchanged — it does not become unconditionally final merely by this
document being reviewed.
