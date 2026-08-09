# ADR-0013: AI Provider Abstraction & Multi-Provider Compatibility

**Version:** 1.0.0
**Status:** Proposed — **cannot advance to "Accepted" in Sprint 02**
(`docs/sprints/sprint-02.md`, §3, M8: "Cannot be fully Accepted until at
least one candidate provider's contract terms clear legal review
[ADR-0006 §26]; drafted as Proposed in Sprint 02"). No provider has been
selected, evaluated comparatively, or contracted. This ADR alone does
not authorize any AI/LLM SDK integration, API call, prompt pipeline,
model-routing code, provider credential, or Leo implementation of any
kind — see Consequences. Of the design points the companion
architecture document explicitly leaves open: the M6 §9 memory-
provenance question is **not resolved** — this ADR establishes only a
structural traceability requirement, keeping all three of M6 §9's
options open (Decision item 8); the `ai-memory-isolation.md` §7.6
residual cross-child-isolation risk is inherited, not resolved (Decision
item 5); and no ASPOVO "Technology Watch" capability is asserted to
exist in this repository (Decision item 9). **M8's child-personalization
data-crossing question is resolved by founder decision, 2026-08-09:
Option C** — a narrow, task-enumerated Personalization Data Allowlist,
not a blanket "first name if justified" default (Decision item 3).
**Owner:** Engineering
**Last Updated:** 2026-08-09

## Context

`docs/sprints/sprint-02.md`, §3, Milestone 8 (AI-Provider Data-Boundary
& Multi-Provider/Self-Hosted Compatibility Architecture) requires
designing the abstraction boundary required by
[Constitution](../constitution/product/child-privacy-and-safety-constitution.md)
§13–§14 (no single-provider dependency) and the technical enforcement of
[ADR-0006](./ADR-0006-data-privacy-compliance.md) §26–§28 (no training-
use, no advertising/profiling use). Milestone 8's own text names this as
requiring a new ADR, numbered sequentially after ADR-0012, drafted as
**Proposed** rather than "Accepted — Implementation Deferred" — unlike
ADR-0008/0009/0010/0012's pattern, this ADR is explicitly blocked from
"Accepted" until a candidate provider's contract terms clear legal
review (ADR-0006 §26), the same deliberate departure ADR-0011 already
established for consent architecture.

This ADR depends on, and does not redesign,
[ADR-0008](./ADR-0008-core-data-model-parent-family-child.md) (Core Data
Model), [ADR-0009](./ADR-0009-authorization-and-session-architecture.md)
(Authorization & Session Architecture),
[ADR-0010](./ADR-0010-encryption-and-tenant-isolation-design.md)
(Encryption & Tenant-Isolation Design), and
[ADR-0012](./ADR-0012-leo-memory-and-conversation-isolation-design.md)
(Leo Memory & Conversation Isolation Design), each of which this ADR
consumes as given. It also depends on the audit-event schema in
[`audit-logging.md`](../architecture/audit-logging.md) (M7), referenced
but not modified.

## Decision

Adopt the AI-provider boundary architecture documented in full at
[`docs/architecture/ai-provider-boundary.md`](../architecture/ai-provider-boundary.md)
as Natkhat AI's provider-abstraction framework. The binding design
decisions:

1. **A hard architectural boundary separates Natkhat AI's core domain
   model from any AI provider.** No provider-specific concept (SDK type,
   model identifier, provider-specific message format) may ever appear
   in a core-domain entity (Parent, Family, Child, Leo, Memory,
   Conversation, Consent, Authorization, Audit) — the provider must
   never become part of Natkhat AI's core domain model (companion
   document §3).
2. **A provider-neutral request/response contract and a per-provider
   adapter model are adopted.** Provider-specific translation logic
   lives exclusively inside an adapter; core-domain logic interacts only
   with the neutral contract. This makes replacing one provider with
   another an adapter swap, not a redesign of any M1–M7 entity or
   document (companion document §4–§6).
3. **The data boundary reuses ADR-0006 §7's five classification tiers
   and `data-classification-and-isolation.md` §3's table verbatim,
   adding a crossing rule per category — no conflicting classification
   system is introduced.** Parent identity, internal identifiers
   (`family_id`/`child_id`/database keys), authentication/session
   material, consent records, audit information, and Natkhat AI's own
   secrets must never cross the boundary. Conversation content, memory,
   and other Sensitive Child Content may cross **only in minimized,
   task-specific form**. **Child Profile data (Tier 2) is prohibited by
   default — founder decision, 2026-08-09, Option C.** `first_name` is
   the only Tier 2 field ever eligible to cross, and only via an
   explicit, documented, task-specific entry on a Personalization Data
   Allowlist (no entry exists yet); `date_of_birth`, `avatar_ref`,
   location, school information, contact information, and any other
   child-identifying field remain prohibited unless separately approved
   through the appropriate governance process, beyond this ADR's own
   scope (companion document §8–§9.1).
4. **Provider credentials are conceptually owned by the adapter layer
   alone**, never part of the neutral contract's business payload and
   never logged — a direct application of ADR-0006 §29's existing
   secrets-management standard, not a new one. No credential is created
   by this ADR or its companion document (companion document §16).
5. **Cross-family and cross-child isolation at this boundary is
   inherited from M2/M6, not re-implemented.** This ADR does not modify
   `authorization-and-sessions.md` or `ai-memory-isolation.md`. It
   explicitly restates, and does not resolve, `ai-memory-isolation.md`
   §7.6's residual risk (cross-child isolation currently enforced at the
   application layer only, no database-layer backstop) as directly
   relevant to any future implementation of this boundary — a future
   Change Request against `authorization-and-sessions.md` remains the
   correct venue to close that gap, not this ADR (companion document
   §10).
6. **Provider-side logging/telemetry must be content-free on Natkhat
   AI's side** (request metadata only, never raw request/response
   content — mirroring `audit-logging.md`'s existing content-free
   pattern for audit records), **and provider-side retention/logging
   behavior is never assumed** — it must be confirmed via contract
   review before any provider is selected (companion document §14–§15).
   A gap in `audit-logging.md`'s current actor-typing (no "system"/AI-
   pipeline actor) is recorded as a future Change Request against that
   document — not resolved or implemented by this ADR.
7. **Nine provider-contract-term categories require legal/privacy review
   before any provider is selected**: data processing terms, retention
   terms, training/use-of-data terms, subprocessors, breach obligations,
   data residency, deletion guarantees, confidentiality, and security
   obligations. None is reviewed, resolved, or assumed favorable by this
   ADR (companion document §15, §23).
8. **The `ai-memory-isolation.md` §9 memory-provenance question is not
   resolved by this ADR.** A structural requirement is established
   instead: any future memory-derivation mechanism must be able to
   trace a derived `LeoMemory` row back to the `Conversation`/`Message`
   row(s) that contributed to it. All three of M6 §9's candidate
   options (no automatic effect; full re-derivation; source-attributed
   targeted removal) **remain explicitly open** — this ADR does not
   choose among them, and does not modify ADR-0012 or
   `ai-memory-isolation.md` §9 (companion document §12).
9. **No claim is made that an ASPOVO "Technology Watch" or equivalent
   provider-evaluation capability exists in this repository.** The
   architecture is designed to be **compatible** with a future external
   evaluation/approval process recommending a provider — engineering
   impact bounded to one new adapter — without asserting such a process
   is documented, ratified, or in use today. The Knowledge Vault
   (`docs/knowledge/README.md`) is referenced only to clarify it is not
   that capability; it is not modified by this ADR (companion document
   §19).
10. **No provider is selected, evaluated comparatively, or contracted.**
    This ADR designs the boundary a future selection would plug into,
    not the selection itself (companion document §18).

## Consequences

- Clears the AI-provider-boundary design prerequisite named in
  `docs/sprints/sprint-02.md` §4 dependency graph ("M8 — depends on
  M6") and referenced forward by `ai-memory-isolation.md` §9/§14 and
  `docs/modules/leo-companion/README.md` — to the extent a future AI
  integration needs a stable boundary contract to build against. Does
  not itself begin, scope, or authorize any Milestone 9 work.
- Does **not** authorize any AI/LLM provider integration, SDK, API call,
  prompt pipeline, model-routing code, database schema, migration,
  storage, authentication code, RLS policy execution, production API,
  or Leo implementation. ADR-0004's and ADR-0005's implementation gates
  are unchanged and remain deferred.
- **This ADR cannot reach "Accepted" status in Sprint 02**, regardless
  of founder/product-owner review of the architecture itself, because
  ADR-0006 §26's provider contract-terms legal review has not been
  performed and no provider has been selected — the same two-condition
  block ADR-0011 established for consent architecture, applied here for
  an analogous reason (a business/legal gate, not an engineering one).
- Item 5's residual cross-child-isolation risk and item 8's memory-
  provenance question remain **open**, unresolved by this ADR, and are
  **not** newly created here — both were already recorded by ADR-0012/
  `ai-memory-isolation.md` §7.6 and §9 respectively; this ADR restates
  their relevance to the AI-provider boundary without amending either.
- **Item 3's child-personalization question is resolved by founder
  decision, 2026-08-09 (Option C)** — a narrow, task-enumerated
  Personalization Data Allowlist, not a blanket default. No allowlist
  entry is created, approved, or implied by this ADR; populating the
  allowlist with any real `task_type` remains a separate future action
  requiring its own founder/product-owner approval (companion document
  §9.1, §24).
- Introduces no change to `data-classification-and-isolation.md`,
  `data-lifecycle.md`, `authorization-and-sessions.md`,
  `ai-memory-isolation.md`, `audit-logging.md`, `docs/knowledge/README.md`,
  `PROJECT.md`, or `docs/sprints/sprint-02.md`. Each of the M1–M7
  documents this ADR depends on is consumed as given, not amended.
- Contains no real parent, child, family, conversation, or memory data;
  all examples in the accompanying architecture document are fictional.
- Inherits ADR-0006's general, not-yet-resolved Legal Validation items
  (specifically items 2 and 5 — provider data-handling/training-use
  terms, and whether AI-driven Leo responses constitute automated
  decision-making under GDPR Article 22 equivalents) to the same extent
  every other Sprint 02 ADR does, plus the nine new provider-contract-
  term categories this ADR's companion document names (§15/§23 there) —
  none resolved here.

## Constitution Alignment

Directly implements
[Child Privacy & Safety Constitution](../constitution/product/child-privacy-and-safety-constitution.md)
§13 (AI Model Governance — no cross-child data exposure, no internal-
prompt disclosure, no unsafe outputs, mandatory safety filters) and §14
(Future AI Architecture — multi-provider, self-hosted, and local-
inference compatibility; no single-provider dependency; provider
replacement without a product rewrite — this ADR's central purpose).
Implements [ADR-0006](./ADR-0006-data-privacy-compliance.md) §26 (Model-
Provider Data Handling — the legal-validation gate this ADR remains
blocked on), §27 (Prohibition on Unauthorized Model Training — the
minimization discipline in the companion document §9 is this ADR's
technical enforcement mechanism, not a claim of compliance), and §28
(Advertising/Profiling Prohibition — no analytics/advertising
integration is designed). Extends, and does not contradict,
[ADR-0007](./ADR-0007-target-audience-interim-posture.md) (India,
single market, ages 4–10 — the operative context for the data-residency
legal-validation item this ADR names, §23 item 5 of the companion
document, forward-relevant to a future Milestone 9). Consumes, and does
not redesign, [ADR-0008](./ADR-0008-core-data-model-parent-family-child.md)'s
entity model, [ADR-0009](./ADR-0009-authorization-and-session-architecture.md)'s
authorization model, [ADR-0010](./ADR-0010-encryption-and-tenant-isolation-design.md)'s
classification/encryption model, and
[ADR-0012](./ADR-0012-leo-memory-and-conversation-isolation-design.md)'s
memory/conversation isolation design — this ADR fills in the boundary
`ai-memory-isolation.md` explicitly deferred to Milestone 8 (its own §9
and §14) rather than amending that document. Aligned with the
[Product Constitution](../constitution/product/natkhat-ai-constitution.md)
Core Principle 2 ("Parent partnership") and Core Principle 4 ("Childhood
memories matter" — protected by this ADR's prohibition on provider-side
memory as a system of record, companion document §20), and the
[Engineering Constitution](../constitution/engineering/engineering-constitution.md)'s
Mandatory Engineering Review Gates (Privacy, Security, Parent Trust,
Child Safety). Nothing in this ADR amends the Product Constitution,
Child Privacy & Safety Constitution, or any other accepted ADR.
