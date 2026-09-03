# Module: Leo Companion

**Version:** 1.1.0
**Status:** Proposed — Pending Founder/Product-Owner Review (Sprint 02,
Milestone 6 deliverable, reviewed together with
[ADR-0012](../../decisions/ADR-0012-leo-memory-and-conversation-isolation-design.md)
at the Sprint 02 per-milestone stop-and-report checkpoint;
`docs/sprints/sprint-02.md`, §5's decision-maker note applies — not a
standalone engineering/AI-agent self-certification)
**Owner:** Engineering
**Last Updated:** 2026-08-08

> This document is Sprint 02, Milestone 6's deliverable
> (`docs/sprints/sprint-02.md`, §3, M6), copied from
> [`TEMPLATE.md`](../TEMPLATE.md). It is an architecture-level design
> document only. It designs no AI/LLM integration, no vector database
> selection or wiring, no embedding pipeline, no conversation-persistence
> code, and stores no real conversation or memory data. The detailed
> entity design, deletion-cascade mapping, and isolation model this
> module relies on live in the companion document
> [`docs/architecture/ai-memory-isolation.md`](../../architecture/ai-memory-isolation.md) —
> this README does not duplicate that content, only summarizes it at the
> module level. It builds on, and does not redesign, the Parent/Family/
> Child entity model
> ([`docs/modules/identity-family/README.md`](../identity-family/README.md)),
> the authorization model
> ([`docs/architecture/authorization-and-sessions.md`](../../architecture/authorization-and-sessions.md)),
> and the already founder-approved three-class Leo memory architecture in
> [`docs/architecture/data-lifecycle.md`](../../architecture/data-lifecycle.md),
> §13.4.

---

## 1. Vision

Leo Companion is Natkhat AI's child-facing AI companion module — the
part of the product that carries on conversations with a child and
maintains a memory of the relationship over time. It advances the
[Product Constitution](../../constitution/product/natkhat-ai-constitution.md)'s
Core Principle 4 ("Childhood memories matter") by giving Leo a durable,
parent-controlled memory rather than a stateless or ungoverned one, and
Core Principle 2 ("Parent partnership") by keeping every memory and
conversation record inside the same parent-owned, parent-exportable,
parent-deletable model the rest of the product already uses (M1–M5).
This milestone designs the module's **data and isolation architecture
only** — it does not build, ship, or authorize the companion experience
itself.

## 2. Requirements

### In scope (this version — architecture/design only)

- A `Conversation`/`Message` data model for Leo–child interaction
  history, family/child-tenant-scoped (`docs/architecture/ai-memory-isolation.md`
  §3.1–3.2).
- A `LeoMemory` data model implementing the three independent memory
  classes `docs/architecture/data-lifecycle.md` §13.4 already designed
  and the founder already approved (2026-08-05): Active Relationship
  Memory, Memory Version History, Permanent Parent-Approved Childhood
  Memory Vault (`docs/architecture/ai-memory-isolation.md` §3.3, §5.4).
- Deletion-cascade design naming every derived-data location a memory
  could exist in (embeddings, summaries, caches, indexes) and confirming
  each is covered (`docs/architecture/ai-memory-isolation.md` §8), per
  this milestone's acceptance criteria.
- Cross-child isolation within a multi-child Family, in addition to
  cross-family isolation (`docs/architecture/ai-memory-isolation.md`
  §7.4) — new to this milestone, since no Tier 3/4 entity existed
  before it. §7.6 there records an explicit, non-blocking residual-risk
  observation on this boundary's current enforcement strength.
- Mapping of memory/conversation actions onto the existing M2
  authorization model. **Founder decision, 2026-08-08:** adding a
  memory to the Permanent Vault is owner-only, unconditional — only the
  Owner Parent may do so, a scoped/shared Co-Parent may not
  (`docs/architecture/ai-memory-isolation.md` §6.3).
- Explicit crypto-shredding traceability (`docs/architecture/ai-memory-isolation.md`
  §7.5): `Conversation`, `Message`, and `LeoMemory` are Tier 3,
  per-Family-DEK-protected, and therefore subject to M4 §10's
  Family-level DEK crypto-shredding cascade.

### Explicitly out of scope (this version)

- Any AI/LLM integration or provider selection (Milestone 8).
- Any vector database selection, embedding pipeline, or
  memory-extraction/summarization algorithm.
- Any actual conversation or memory data, real or synthetic-but-stored.
- Any database schema, migration, key-management, or RLS policy
  execution (ADR-0004/M3 gates unchanged).
- Any audit-log schema for conversation/memory access events (Milestone
  7 — this module only identifies that such events exist).
- The conversation-deletion-vs-derived-memory interaction question
  (`docs/architecture/ai-memory-isolation.md` §9) — **explicitly
  deferred to Milestone 8** by founder decision, 2026-08-08, not
  resolved or invented here; Milestone 8's design must address
  `Conversation`↔`LeoMemory` provenance as a prerequisite.

## 3. Architecture

Leo Companion introduces three new entities — `Conversation`, `Message`,
`LeoMemory` — full design in
[`docs/architecture/ai-memory-isolation.md`](../../architecture/ai-memory-isolation.md).
Summary:

- **Tenant/subject scoping:** every entity carries `family_id` (tenant
  boundary, ADR-0006 §16) and `child_id` (subject, and — new to this
  milestone — an additional application-layer isolation dimension
  between siblings in the same Family; see §7.4 of the companion
  document).
- **Classification:** Tier 3 — Sensitive Child Content (ADR-0006 §7–9),
  same per-Family envelope-encryption and RLS treatment M3 already
  designed for Tier 3, filled in here for these specific tables (M3 §7.2
  already reserved a placeholder row for this).
- **Memory architecture:** three independent storage classes per M4
  §13.4 (already founder-approved), each with its own retention rule and
  deletion trigger; no automatic promotion between classes.
- **Deletion cascades:** extend M4 §7's existing Child/Family/account
  deletion flows and M4 §9's derived-data propagation table — no new
  cascade policy invented, only the Milestone-6-shaped gap those
  documents already named filled in.

This module lives conceptually alongside `identity-family` in the
monorepo's future application layer (`docs/architecture/overview.md`,
ADR-0001) — no specific app/package assignment is made by this document,
since no code exists yet.

## 4. APIs

**M27 (docs/sprints/sprint-06.md, §7; founder decisions H.2/H.6) adds
the first real HTTP API surface**, per `TEMPLATE.md`'s own instruction
to document request/response shapes "only once they are real."
`apps/backend/src/leo-chat/leo-chat.controller.ts` — deliberately a
separate module from `src/leo/` (the AI-provider-boundary import rule,
`ai-provider-boundary.md` §3/§6, forbids `src/leo/` from importing
anything from `src/ai-provider/`; `leo-chat` is the boundary-crossing
orchestration layer, not a core-domain module) — exposes three routes,
every one behind `ParentAuthGuard` (a real Firebase ID token resolving
to a `Parent`, mirroring `AdminAuthGuard`) and the existing M23
`interact_with_leo` two-gate authorization check (reused as-is, not
redesigned):

| Route                                              | Purpose                                                                                                                                                                                                                                                                                         |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /leo/conversations`                          | Starts a `Conversation` — calls `LeoService.startConversation` unmodified.                                                                                                                                                                                                                      |
| `POST /leo/conversations/:conversationId/messages` | Persists the parent-relayed child message, then calls `AdapterRegistry.execute()` against the **mock adapter only** and persists the canned reply as a Leo-sender `Message` — proving the request/reply loop end to end with fake data. No real AI provider is called, ever, in this milestone. |
| `GET /leo/conversations/:conversationId/messages`  | Returns the decrypted transcript — calls `LeoService.listMessages` unmodified.                                                                                                                                                                                                                  |

Every request is parent-authenticated; no child-login/child-session
exists (ADR-0009 Decision item 7 remains untouched). The mock adapter's
response content is the same placeholder canned text
(`mock.adapter.ts`, unchanged) — this milestone does not style, tone,
or personality-shape it, per H.1's still-open Leo Character &
Conversation Brief status.

## 5. Database

No schema, migration, or database of any kind exists as a result of this
module (ADR-0004 implementation remains deferred). The entity shapes
`Conversation`, `Message`, and `LeoMemory` — and their retention/deletion
paths — are fully specified at the design level in
[`docs/architecture/ai-memory-isolation.md`](../../architecture/ai-memory-isolation.md)
§3, §5. Every field has a documented purpose (ADR-0006 §2); every
category has either a bounded retention window or an explicit,
parent-controlled indefinite-retention justification (M4 §13.4, Class 3),
consistent with ADR-0006 §17's "no indefinite retention without a stated
reason."

## 6. Security

Every item in the
[Mandatory Engineering Review Checklist](../../engineering/review-checklist.md)
is answered in full in
[`docs/architecture/ai-memory-isolation.md`](../../architecture/ai-memory-isolation.md)
§11. Summary: no item is answered "NO." The Vault-add authorization
question (§6.3 there) is now founder-resolved (owner-only,
unconditional). The conversation-deletion-vs-memory question (§9 there)
is explicitly deferred to Milestone 8 by founder decision, not resolved
here. A residual-risk observation on child-level isolation enforcement
strength (§7.6 there) is recorded explicitly, not silently accepted,
and is non-blocking for this milestone's design.

## 7. Testing

Per [`docs/engineering/testing-strategy.md`](../../engineering/testing-strategy.md)'s
taxonomy: no code exists yet. Once implemented, this module's minimum
bar — detailed in
[`docs/architecture/ai-memory-isolation.md`](../../architecture/ai-memory-isolation.md)
§15 — is **Unit** (memory supersession-not-mutation invariant,
cross-child scoping check), **Integration** (deletion-cascade flows,
immediate derived-data invalidation at soft-delete), and **Security**
(cross-family **and** cross-child RLS/application-layer isolation tests).
Widget, End-to-end, Performance, Accessibility, and Regression layers
apply to the features eventually built on top of this design.

## 8. Deployment

Not applicable at this stage — documentation-only milestone; nothing is
deployed (`docs/sprints/sprint-02.md`, §2.2). When this module eventually
ships code, it is subject to
[`docs/engineering/feature-flags.md`](../../engineering/feature-flags.md)'s
"unfinished functionality ships behind a flag" rule, same as every other
module.

---

## Constitution Alignment

Traces to: [Child Privacy & Safety Constitution](../../constitution/product/child-privacy-and-safety-constitution.md)
§6 (Leo Memory Protection), §7 (Voice & Image Security), §8 (AI
Conversation Security — "Conversation isolation is mandatory"), §11
(Child Data Minimization); [Product Constitution](../../constitution/product/natkhat-ai-constitution.md)
Core Principle 2 ("Parent partnership") and Core Principle 4 ("Childhood
memories matter"); [Engineering Constitution](../../constitution/engineering/engineering-constitution.md)'s
Mandatory Engineering Review Gates; [ADR-0006](../../decisions/ADR-0006-data-privacy-compliance.md)
§2, §7–9, §16–17, §20, §22; [ADR-0007](../../decisions/ADR-0007-target-audience-interim-posture.md)
§D; [ADR-0008](../../decisions/ADR-0008-core-data-model-parent-family-child.md),
[ADR-0009](../../decisions/ADR-0009-authorization-and-session-architecture.md),
[ADR-0010](../../decisions/ADR-0010-encryption-and-tenant-isolation-design.md)
(consumed, not redesigned); `docs/architecture/data-lifecycle.md` §7,
§9, §10, §13.4 (deletion cascades, crypto-shredding mechanism, and the
already-approved three-class memory architecture, applied not
redesigned); [ADR-0012](../../decisions/ADR-0012-leo-memory-and-conversation-isolation-design.md);
`docs/sprints/sprint-02.md`, §3, Milestone 6. A module with no traceable
authorization above it does not proceed to implementation
(`docs/sprints/sprint-01.md`, §1, §10).
