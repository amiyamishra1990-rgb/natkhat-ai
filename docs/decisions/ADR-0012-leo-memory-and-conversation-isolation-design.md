# ADR-0012: Leo Memory & Conversation Isolation Design

**Version:** 1.1.0
**Status:** Accepted — Implementation Deferred (Founder/Product-Owner
approval recorded 2026-08-08, per `docs/sprints/sprint-02.md`, §5's
decision-maker note and the Sprint 02 Milestone 6 stop-and-report
checkpoint; mirrors ADR-0004/ADR-0005/ADR-0008/ADR-0009/ADR-0010's
"Accepted — Implementation Deferred" pattern, consistent with
`docs/sprints/sprint-02.md` §5's "New ADRs Anticipated" table, which
lists this ADR's trigger — Milestone 6 — as eligible for "Accepted,
Implementation Deferred" in Sprint 02, unlike Milestone 4's and
Milestone 5's ADRs. **This ADR alone does not authorize any
`Conversation`/`Message`/`LeoMemory` schema, migration, embedding
pipeline, vector-database wiring, RLS policy execution, or AI-provider
integration** — see Consequences. Of the two design points the
companion architecture document originally left open: the Vault-add
authorization tier (§6.3) is **resolved** by founder decision below
(owner-only, unconditional); the conversation-deletion-vs-memory
question (§9) is **explicitly deferred to Milestone 8**, not resolved
by this ADR. A residual-risk observation on child-level isolation
enforcement strength (§7.6) is recorded, not resolved, and does not
block this Status.)
**Owner:** Engineering
**Last Updated:** 2026-08-08

## Context

`docs/sprints/sprint-02.md`, §3, Milestone 6 (Leo Memory & Conversation
Isolation Architecture) requires designing the memory-versioning/
deletion-cascade model and conversation tenant-isolation approach
(ADR-0006 §8–§9, §16). Milestone 6's own text names this as requiring a
new ADR, extending ADR-0004/ADR-0006, numbered sequentially after
ADR-0011.

This ADR depends on, and does not redesign, [ADR-0008](./ADR-0008-core-data-model-parent-family-child.md)
(Core Data Model), [ADR-0009](./ADR-0009-authorization-and-session-architecture.md)
(Authorization & Session Architecture), and [ADR-0010](./ADR-0010-encryption-and-tenant-isolation-design.md)
(Encryption & Tenant-Isolation Design), each of which this ADR consumes
as given. It also depends on, and does not redesign, the Leo memory
architecture `docs/architecture/data-lifecycle.md` §13.4 already
designed and the founder already approved on 2026-08-05 (three
independent storage classes: Active Relationship Memory, Memory Version
History, Permanent Parent-Approved Childhood Memory Vault) — this ADR
supplies the concrete entity/isolation design that architecture requires,
it does not reopen the classes, their retention rules, or the
no-automatic-promotion business rule §13.4 already settled.

## Decision

Adopt the memory-versioning and conversation-isolation architecture
documented in full at
[`docs/architecture/ai-memory-isolation.md`](../architecture/ai-memory-isolation.md)
and summarized at
[`docs/modules/leo-companion/README.md`](../modules/leo-companion/README.md)
as Natkhat AI's Leo memory and conversation framework. The binding
design decisions:

1. **Two new entities, `Conversation` and `Message`, record Leo–child
   interaction history** — family/child-tenant-scoped
   (`family_id`/`child_id` on every row), Tier 3 Sensitive Child Content,
   with `Message.content` encrypted per the existing per-Family DEK model
   (ADR-0010). No principal-authored session model is introduced for the
   Child — `sender` (`child` \| `leo`) describes which side of the
   exchange produced a message, not an authorization actor, consistent
   with M1's explicit non-decision on child-initiated sessions.
2. **A new entity, `LeoMemory`, implements the three independent memory
   classes `data-lifecycle.md` §13.4 already designed and the founder
   already approved** — `memory_class` discriminates Active Relationship
   Memory, Memory Version History, and the Permanent Vault; each class
   retains its own already-approved retention/deletion trigger (no fixed
   expiry; 90-day-default/30-day–1-year-configurable rolling window;
   indefinite-per-item-until-parent-deletes, respectively). Correction of
   an active memory item is a **new row** (`supersedes_memory_id`),
   never an in-place mutation, implementing ADR-0006 §20's forget/
   override requirement without disturbing history.
3. **Entry into the Permanent Vault class is never automatic** — a
   `permanent_vault` row is always created by an explicit, per-item
   parent action (`vaulted_by_parent_id`, `vaulted_at`), reusing
   `data-lifecycle.md` §13.4's already-founder-approved
   no-automatic-promotion business rule verbatim; this ADR does not
   reopen that rule.
4. **Deletion cascades extend, and do not replace, M4 §7's existing
   Child/Family/account deletion flows and M4 §9's derived-data
   propagation table.** Deleting one Child cascades to that Child's
   `Conversation`/`Message`/`LeoMemory` rows (all three classes,
   including the Vault); deleting a Family or an account cascades
   identically at the `family_id` level — the Permanent Vault's
   "permanent" retention is explicitly bounded by the owning parent's own
   deletion authority, never beyond it.
5. **Embeddings, summaries, caches, and search indexes derived from any
   of the above are invalidated immediately at their source's
   soft-delete** — not held for the 90-day soft-delete grace window. This
   restates, and does not redecide, M4 §9's existing engineering
   decision. Whatever storage technology is eventually chosen for these
   derived artifacts must partition by `family_id` at minimum; no shared,
   cross-family index or cache is authorized by this design.
6. **Family isolation (RLS, `family_id = current_family_claim`) fills in
   the exact placeholder ADR-0010/M3 §7.2 already reserved for "Tier 3/4
   tables (prospective, Milestone 6)"** — no new isolation concept is
   introduced at the family level.
7. **Cross-child isolation is established as a new, narrower,
   application-layer boundary within an already-authorized family
   context.** A Leo session operating on behalf of one Child must be
   structurally unable to read or write another Child's
   `Conversation`/`Message`/`LeoMemory` rows within the same Family, even
   though both pass the same `family_id` RLS predicate. This is new scope
   this ADR establishes — no prior milestone needed it, since no Tier 3/4
   entity existed before this one — and is additive to, not a
   replacement of, M2/M3's existing RLS-as-coarse-backstop /
   application-layer-as-fine-grained-scope division of labor.
8. **Leo-memory/conversation actions are mapped onto M2's existing
   Parent-Only vs. Shared Actions categories by extension, not by adding
   a new row to that table.** Viewing and correcting map to the existing
   "view/update child profile" category (shared if scoped); exporting
   maps to the existing, already owner-only-unconditional "Data export"
   row. **Founder decision, 2026-08-08: adding a memory to the
   Permanent Vault is owner-only, unconditional.** Only the Family's
   Owner Parent may create a `permanent_vault` `LeoMemory` row
   (`vaulted_by_parent_id` must resolve to `owning_parent_id`); a
   scoped/shared Co-Parent may not, regardless of `permission_scope`
   (companion architecture document, §6.3). This decision joins M2 §5's
   five existing owner-only-unconditional actions by extension — it
   does not add a literal new row to that table, which remains
   unmodified (a Milestone 2 redesign would be required for that, and is
   out of scope here).
9. **How per-Conversation deletion should affect already-distilled
   `LeoMemory` content is explicitly deferred to Milestone 8 by founder
   decision, 2026-08-08 — not resolved by this ADR, and not decidable
   by founder direction alone, since it depends on Milestone 8's not-yet-
   designed memory-extraction/AI pipeline** (companion architecture
   document, §9). Milestone 8's design must address provenance between
   `Conversation`/`Message` and derived `LeoMemory` as a prerequisite to
   resolving this question. This is distinct from, and does not affect,
   item 4's Child/Family-level cascade rules, which are fully specified
   and binding regardless of how this deferred question is eventually
   resolved.
10. **A residual-risk observation is recorded, not resolved, for
    child-level isolation enforcement strength** (companion architecture
    document, §7.6): family isolation has two independent layers
    (application + database RLS); child isolation currently has one
    (application-layer `child_id` check only), because no child-scoped
    session claim exists in the current M1/M2 model. This ADR does not
    redesign M1 or M2 to close this gap — it records the gap as a
    requirement on future implementation (independent child-boundary
    enforcement on every read/write/retrieval path; cross-child leakage
    treated as a security/privacy failure) and as a candidate for a
    future Change Request, not resolved here.

## Consequences

- Clears the conversation/memory-isolation design prerequisite Milestone
  8 (AI-Provider Data-Boundary Architecture) depends on
  (`docs/sprints/sprint-02.md` §4: "M8 — depends on M6") — to the extent
  a future AI-provider integration needs a stable data shape and
  isolation boundary to integrate against. Does not itself begin, scope,
  or authorize any Milestone 8 work.
- Does **not** authorize any conversation-persistence code, memory
  storage, embedding pipeline, vector-database selection or wiring,
  AI/LLM integration, database schema, migration, or RLS policy
  execution. ADR-0004's and ADR-0010's implementation gates are
  unchanged and remain deferred.
- Item 8's authorization-tier question is **resolved** by this ADR
  (owner-only, unconditional). Item 9's conversation-deletion-vs-memory
  question is **explicitly deferred to Milestone 8**, not resolved here
  — Milestone 8's design must address `Conversation`↔`LeoMemory`
  provenance as a prerequisite before that question can be answered.
  Item 10's residual-risk observation (child-level isolation enforcement
  strength) remains open for a future Change Request against
  `docs/architecture/authorization-and-sessions.md` and/or
  `docs/architecture/data-classification-and-isolation.md` — not
  resolved, and no such Change Request is opened by this ADR.
- **Explicit crypto-shredding traceability, not a redesign of M4:**
  `Conversation`, `Message`, and `LeoMemory` are Tier 3, per-Family-DEK-
  protected content (companion document §7.1/§7.5) and are therefore
  subject to M4 §10's Family-level DEK crypto-shredding cascade —
  destruction of the applicable Family DEK irreversibly destroys this
  content, including `permanent_vault` rows, per M4's already-approved
  lifecycle. This restates M4 §10's applicability to three new entities;
  it does not amend M4 §10 itself.
- Introduces no change to `docs/architecture/data-lifecycle.md`,
  `docs/architecture/data-classification-and-isolation.md`,
  `docs/architecture/authorization-and-sessions.md`, or
  `docs/modules/identity-family/README.md`. Each of those documents
  already reserved a specific, named placeholder for this milestone (M3
  §7.2's RLS row; M4 §7.1/§7.2's cascade notes; M4 §9's category table;
  M4 §13.4's memory-class architecture) — this ADR and its companion
  architecture document fill those placeholders in, they do not amend
  the documents that reserved them.
- Contains no real parent, child, family, conversation, or memory data;
  all examples in the accompanying architecture and module documents are
  fictional.
- Unlike [ADR-0011](./ADR-0011-consent-architecture.md), this ADR carries
  no India-DPDP-legal-validation blocker of its own — it designs no
  consent mechanism and asserts no legal-compliance claim. It does
  inherit ADR-0006's general, not-yet-resolved Legal Validation items
  (e.g., item 5, automated-decision-making applicability; item 6, general
  regime applicability pending ADR-0007) to the same extent every other
  Sprint 02 ADR does — not a new or Milestone-6-specific legal gate.

## Constitution Alignment

Directly implements
[Child Privacy & Safety Constitution](../constitution/product/child-privacy-and-safety-constitution.md)
§6 (Leo Memory Protection — encrypted storage, version history,
parent-controlled deletion/export, "not for advertising, profiling, or
resale"), §7 (Voice & Image Security, extended to future `Message`
content of that kind), §8 (AI Conversation Security — "Conversation
isolation is mandatory," addressed for both cross-family and, newly,
cross-child scope), and §11 (Child Data Minimization — the distilled,
non-verbatim `LeoMemory.content` design). Implements
[ADR-0006](./ADR-0006-data-privacy-compliance.md) §7–9 (Sensitive Child
Content classification for Conversations and Leo Memories), §16 (tenant
isolation), §17 (bounded retention — satisfied per class by §13.4's
already-approved rules), §20 (correction without silently rewriting
history), §22 (auditability, design-supported not implemented). Extends,
and does not contradict, [ADR-0007](./ADR-0007-target-audience-interim-posture.md)
§D (India, single market, ages 4–10 — the operative context for the
no-child-session design decision). Consumes, and does not redesign,
[ADR-0008](./ADR-0008-core-data-model-parent-family-child.md)'s entity
model, [ADR-0009](./ADR-0009-authorization-and-session-architecture.md)'s
authorization and session-claim model, and
[ADR-0010](./ADR-0010-encryption-and-tenant-isolation-design.md)'s
classification/encryption/RLS model — this ADR fills in ADR-0010's own
prospective "Milestone 6" placeholder rather than amending it. Builds
directly on `docs/architecture/data-lifecycle.md` §7, §9, §10, and
(specifically) §13.4's founder-approved three-class Leo memory
architecture, applying and — for §10's crypto-shredding cascade —
explicitly restating its applicability, rather than reopening any of
it. Aligned with the
[Product Constitution](../constitution/product/natkhat-ai-constitution.md)
Core Principle 2 ("Parent partnership") and Core Principle 4 ("Childhood
memories matter"), and the
[Engineering Constitution](../constitution/engineering/engineering-constitution.md)'s
Mandatory Engineering Review Gates (Privacy, Parent Trust, Child Safety).
Nothing in this ADR amends the Product Constitution, Child Privacy &
Safety Constitution, or any other accepted ADR.
