# AI-Provider Boundary & Multi-Provider/Self-Hosted Compatibility Architecture

**Version:** 1.0.0
**Status:** Proposed — Pending Founder/Product-Owner Review (Sprint 02,
Milestone 8 deliverable, reviewed at the Sprint 02 per-milestone
stop-and-report checkpoint; `docs/sprints/sprint-02.md`, §5's
decision-maker note applies — not a standalone engineering/AI-agent
self-certification)
**Owner:** Engineering
**Last Updated:** 2026-08-09

> This document is Sprint 02, Milestone 8's deliverable
> (`docs/sprints/sprint-02.md`, §3, M8). It is an architecture-level
> design document only. **No AI/LLM provider is selected, contracted,
> or integrated by this document.** It designs no SDK integration, no
> API call, no prompt pipeline, no model-routing code, no database
> schema, migration, or storage, no authentication code, no Row-Level
> Security policy, no production API, no Leo implementation, and
> handles no real child/family data — see §26 (Explicit Exclusions). It
> builds on, and does not redesign, the Parent/Family/Child entity model
> ([`docs/modules/identity-family/README.md`](../modules/identity-family/README.md)/[ADR-0008](../decisions/ADR-0008-core-data-model-parent-family-child.md)),
> the authorization model
> ([`authorization-and-sessions.md`](./authorization-and-sessions.md)/[ADR-0009](../decisions/ADR-0009-authorization-and-session-architecture.md)),
> the classification/encryption/RLS design
> ([`data-classification-and-isolation.md`](./data-classification-and-isolation.md)/[ADR-0010](../decisions/ADR-0010-encryption-and-tenant-isolation-design.md)),
> the data-lifecycle design
> ([`data-lifecycle.md`](./data-lifecycle.md)), the consent architecture
> ([`consent-architecture.md`](./consent-architecture.md)/[ADR-0011](../decisions/ADR-0011-consent-architecture.md)),
> the Leo memory/conversation isolation design
> ([`ai-memory-isolation.md`](./ai-memory-isolation.md)/[ADR-0012](../decisions/ADR-0012-leo-memory-and-conversation-isolation-design.md)),
> and the audit-event schema
> ([`audit-logging.md`](./audit-logging.md)). Every example is
> fictional; no real parent, child, or family data appears here. **This
> document does not choose among M6 §9's three provenance options
> (§12), does not redesign M1/M2/M3's isolation model (§10), and does
> not claim that any "Technology Watch" capability exists in this
> repository** (§19).

---

## 1. Objective

Design the abstraction boundary required by
[Constitution](../constitution/product/child-privacy-and-safety-constitution.md)
§13–§14 (no single-provider dependency; must support multiple
providers, self-hosted models, local inference, and provider
replacement without a product rewrite) and the **technical**
enforcement — not merely a policy statement — of
[ADR-0006](../decisions/ADR-0006-data-privacy-compliance.md) §26–§28
(no training-use, no advertising/profiling use). Verbatim from
`docs/sprints/sprint-02.md`, §3, M8.

## 2. Scope

Per `docs/sprints/sprint-02.md` §3, M8: provider-abstraction interface
design (what data crosses the boundary, what never does); provider-
evaluation criteria (data-handling, retention, training-use terms) for
**future legal review — not an actual provider selection**.

Out of scope (per `docs/sprints/sprint-02.md` §2.2 and M8's own
Explicit Exclusions, §26): any provider selected or contracted; any
contract-terms legal review actually performed (ADR-0006 §26 remains
**[LEGAL VALIDATION REQUIRED]**); any prompt/response code; any
provider account, API key, or integration code of any kind.

## 3. The AI-Provider Boundary

```
Natkhat AI core/product logic
   (Parent, Family, Child, Leo, Memory, Conversation,
    Consent, Authorization, Audit — M1–M7, unchanged)
        │
        ▼
  AI-Provider Boundary
   (neutral contract, §4 · adapters, §5 · minimization
    checkpoint, §9 · isolation inherited from M2/M6, §10)
        │
        ▼
External AI provider  /  self-hosted or local model
```

**Design principle — the boundary is the only place a provider-specific
concept may exist.** No M1–M7 entity, and no future core-domain entity,
may ever reference a provider name, a provider-specific message format,
a model identifier, or a provider SDK type directly. This is the direct
architectural reading of Constitution §14's "Natkhat AI must never
become dependent on a single AI provider" — not a policy aspiration but
a structural rule this document enforces on every section below: **the
provider is never permitted to become part of Natkhat AI's core domain
model.**

## 4. Provider-Neutral Request/Response Contract

A conceptual shape, not a schema, type definition, or library. No SDK is
implied or required.

**Request (conceptual fields):**

| Field                 | Purpose                                                                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `request_id`          | Opaque, Natkhat-AI-generated correlation identifier — never derived from or containing `family_id`/`child_id`/`parent_id` (§8, §10).       |
| `task_type`           | A closed, provider-agnostic enum (e.g. a conversational turn, a future memory-derivation task) — never a provider-specific operation name. |
| `system_instructions` | Leo's personality/behavioral instructions and safety constraints, expressed in provider-agnostic terms — never child-identifying (§9).     |
| `context`             | Minimized conversation/memory context for this specific task only (§9, §12–§13) — never a full record dump.                                |
| `task_input`          | The specific content this task requires (e.g. the child's current utterance).                                                              |
| `constraints`         | Conceptual output constraints (e.g. safety level, length) — not a provider-specific parameter name.                                        |

**Response (conceptual fields):** `output_content`, `safety_flags` (if
any), `error` (if any), and an opaque `provider_metadata` bag that stays
**inside the adapter** (§5) and never propagates into core-domain logic
or storage.

## 5. Provider Adapter Model

Every provider — commercial or self-hosted — is integrated behind its
own adapter that (a) translates a neutral request (§4) into that
provider's specific call shape, and (b) translates that provider's
specific response back into the neutral response shape. Provider-
specific concerns — API endpoint, authentication header format, model
identifier, prompt-formatting conventions, token limits — live **only**
inside the adapter. This mirrors the division-of-labor discipline
`data-classification-and-isolation.md` §7.1 already established
elsewhere in this repository (one authoritative check, one place
provider-specific logic may live) applied here to a new boundary, not a
new pattern invented from nothing.

## 6. Provider Independence

Because no M1–M7 entity or domain concept (Child, Family, Parent, Leo,
Memory, `LeoMemory`, `Conversation`, `ConsentEvent`, the authorization
model, or the audit-event schema) ever references a provider-specific
concept — only the neutral contract (§4) — replacing Provider A with
Provider B is structurally an **adapter swap**: write a new adapter
implementing §4's contract; retire the old one. No M1–M7 document is
touched by that change. This is the direct technical enforcement
Constitution §14 requires ("model replacement without rewriting the
product") and the acceptance criterion this milestone's Privacy/security
requirements name explicitly ("switching providers is additive, not a
rewrite").

## 7. Multi-Provider and Self-Hosted Compatibility

The adapter model (§5) inherently supports more than one adapter
existing simultaneously. This document names the **conceptual roles** a
future implementation may assign to a given adapter — primary,
secondary, fallback, specialized (e.g. a task-specific model), and
self-hosted/local — without deciding which commercial provider fills
any role, and without designing the actual routing/selection algorithm
between them (that is implementation, out of scope per §26).

**Self-hosted/local inference is not a structurally different case.** A
self-hosted or local model is simply another adapter behind the same
boundary (§3), subject to the same neutral contract (§4) and the same
data-boundary rules (§9). It may have materially different retention/
data-residency characteristics (§14–§15) — potentially more favorable,
since data may never leave Natkhat AI's own infrastructure — but this
document does not assert or decide that self-hosting is preferred; that
is a future provider-evaluation and cost/operations question (§24),
compatible with, not decided by, this architecture.

## 8. Data Boundary — What May and Must Not Cross

This section reuses [ADR-0006](../decisions/ADR-0006-data-privacy-compliance.md)
§7's five classification tiers and
[`data-classification-and-isolation.md`](./data-classification-and-isolation.md)
§3's tier table **verbatim** — no conflicting classification system is
introduced. It adds one new column: whether, and under what condition,
a category may cross the AI-provider boundary (§3).

| Category                                                                                                                         | Tier (per M3 §3)                          | May cross the boundary?                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Child identity (`first_name`, `date_of_birth`, `avatar_ref`, and similar child-identifying fields, e.g. location/school/contact) | 2 — Child Profile                         | **Prohibited by default.** Only `first_name` is ever eligible to cross, and only via an explicit, documented, task-specific entry on the Personalization Data Allowlist (§9.1) — never automatically. `date_of_birth`, `avatar_ref`, location, school information, contact information, and any other child-identifying field remain prohibited unless separately approved through the appropriate governance process (§9.1). |
| Parent identity (any `Parent` field)                                                                                             | 1 — Account/Identity                      | **MUST NOT cross.** No AI task in this design requires a parent's identity.                                                                                                                                                                                                                                                                                                                                                   |
| Family/Child internal identifiers (`family_id`, `child_id`, database keys)                                                       | 1 — structural                            | **MUST NOT cross**, not even in opaque form — see §10. Only `request_id` (§4), generated independently, crosses.                                                                                                                                                                                                                                                                                                              |
| Conversation content (`Message.content`)                                                                                         | 3 — Sensitive Child Content               | **Minimized only** — the current task's relevant excerpt (§9, §13), never the full persisted history.                                                                                                                                                                                                                                                                                                                         |
| Memory (`LeoMemory.content`)                                                                                                     | 3 — Sensitive Child Content               | **Minimized only** — see §12's class-specific rule; Version History and Vault classes are not included by default.                                                                                                                                                                                                                                                                                                            |
| Other Sensitive Child Content (voice, images, drawings)                                                                          | 3 — Sensitive Child Content               | **Minimized only**, task-specific, same rule as conversation content.                                                                                                                                                                                                                                                                                                                                                         |
| Authentication/session information (tokens, `Session`, `principal_id`)                                                           | 1 — Account/Identity (M3 §3 note)         | **MUST NOT cross, ever.** The provider never receives any Natkhat AI authentication material.                                                                                                                                                                                                                                                                                                                                 |
| Consent records (`ConsentEvent`)                                                                                                 | 1 (content) / 5 (lifecycle), per ADR-0011 | **MUST NOT cross.** Consent gates whether a request is made at all (pre-boundary, §10) — it is never transmitted.                                                                                                                                                                                                                                                                                                             |
| Audit information (Tier 5 events, per M7)                                                                                        | 5 — System/Operational                    | **MUST NOT cross.** The boundary-crossing event itself may generate a new internal audit record (§14) — never sent to the provider.                                                                                                                                                                                                                                                                                           |
| Internal identifiers generally                                                                                                   | —                                         | **MUST NOT cross** except the single opaque, non-reversible `request_id` (§4).                                                                                                                                                                                                                                                                                                                                                |
| Natkhat AI's own secrets (DB credentials, KMS keys)                                                                              | —                                         | **MUST NOT cross.** Not applicable to a provider request in any direction.                                                                                                                                                                                                                                                                                                                                                    |
| Provider credentials (API keys)                                                                                                  | —                                         | Flow **Natkhat AI → provider only**, to authenticate Natkhat AI's own requests — never part of the business payload, never logged (§14, §16).                                                                                                                                                                                                                                                                                 |

This directly satisfies this milestone's acceptance criterion
(`docs/sprints/sprint-02.md` §3, M8): "Document names specific data
categories that may/may not cross the provider boundary, referencing
ADR-0006's classification tiers."

## 9. Data Minimization at the Boundary

**Principle:** the provider receives only what a specific `task_type`
(§4) requires — never a full record, never "just in case" context. This
directly implements ADR-0006 §2's minimization principle and
Constitution §11 (Child Data Minimization) applied to a new boundary,
not a new principle.

- Conversation context: the minimal recent-turn window a task needs
  (§13), not the full `Conversation` thread.
- Memory context: the minimal relevant subset of Active Relationship
  Memory (M6 §3.3, Class 1) needed for continuity — never an automatic
  dump of all `LeoMemory` rows (§12).

### 9.1 Child personalization — the Personalization Data Allowlist (Option C, founder decision 2026-08-09)

**This document's earlier default — "a first name may cross if a task
genuinely requires personalized address" — is superseded by an explicit
founder decision, recorded 2026-08-09: Tier 2 child-identifying data
does not cross the boundary merely because a task seems to benefit from
it.** Instead, any crossing requires a narrow, task-enumerated allowlist
entry, per the following design rules:

| Allowlist element                                          | Design rule                                                                                                                                                                                                                                                                                                                 |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default state                                              | **Empty.** No `task_type` is pre-approved to receive any Tier 2 field by this document. Populating the allowlist is a separate, future, founder-governed action (§24), not performed here.                                                                                                                                  |
| Eligible field                                             | `first_name` **only.** No other Tier 2 field (`date_of_birth`, `avatar_ref`, or any future Tier 2 field) may ever be added to this allowlist by this document.                                                                                                                                                              |
| Entry requirement                                          | Each allowlist entry must name the specific `task_type`, the specific field (`first_name`), and a written minimization/necessity justification for why that task cannot function without it.                                                                                                                                |
| Provider neutrality                                        | The allowlist is defined at the boundary/core-domain policy layer (§3), evaluated **before** request assembly, identically regardless of which adapter/provider ultimately serves the request. No adapter may define, extend, or bypass its own allowlist.                                                                  |
| Permanently prohibited absent separate governance approval | `date_of_birth`, `avatar_ref`/photo, location, school information, contact information, and any other child-identifying field. None may be added to this allowlist by this document — each would require its own separate founder/governance decision beyond the allowlist mechanism itself, not merely an allowlist entry. |
| Approval authority                                         | Founder/product-owner approval, following this Sprint's existing stop-and-report governance pattern — not an engineering-only decision once a specific `task_type` is proposed for the allowlist.                                                                                                                           |

**No `task_type` is populated into the allowlist by this document.**
Enumerating real task types is itself implementation-adjacent — out of
scope here (§26) — and no provider or task pipeline exists yet to
populate it against. This section establishes the **mechanism and its
constraints**, not a first entry.

- **Future implementation requirement, not designed here:** a
  minimization-enforcement checkpoint at the boundary that validates
  every outbound request against the current Personalization Data
  Allowlist (and, more generally, the current `task_type`'s minimization
  requirements) and rejects/strips anything not explicitly allowlisted —
  named as a requirement (§24), not implemented.

## 10. Identity Isolation Across the Boundary

**A provider must never receive, in a single request, context mixed
from more than one family or more than one child.** This document does
**not** redesign M1/M2/M3's isolation model to guarantee this — it
states a dependency:

- Isolation up to the boundary is entirely inherited from
  [`authorization-and-sessions.md`](./authorization-and-sessions.md)
  §4's tenant-scope gate and
  [`ai-memory-isolation.md`](./ai-memory-isolation.md) §7.4's cross-
  child, application-layer scoping. The AI-provider boundary does not
  re-implement either check — it assumes whatever context-assembly step
  produces a request has already correctly scoped it to exactly one
  `family_id`/`child_id` pair, the same "coarse tenant backstop /
  fine-grained application-layer scope" division of labor
  `data-classification-and-isolation.md` §7.1 already established.
- **`ai-memory-isolation.md` §7.6's residual-risk observation is
  inherited unchanged, not resolved or worsened, by this document.**
  M6 already recorded that cross-child isolation currently has one
  enforcement layer (application-layer `child_id` check), not two
  (unlike family isolation's application + RLS layers), because no
  child-scoped session claim exists in the current M1/M2 model. The
  AI-provider boundary sits **downstream** of that same context-
  assembly step — if it is compromised, a request built from mixed-
  child context would carry that error across the provider boundary.
  This document does not close that gap (doing so would be an M1/M2
  redesign, out of scope for M8) — it records the gap as directly
  relevant to this boundary and reiterates M6 §7.6's own requirement:
  a future child-scoped enforcement mechanism (session claim or
  equivalent) remains a candidate for a future Change Request against
  `authorization-and-sessions.md`, not decided here.
- **New risk this document adds, distinct from M6 §7.6:** even with
  perfect pre-boundary isolation, a **misbehaving or compromised
  provider** could itself mix context across customers on its own
  infrastructure (e.g. a shared caching or fine-tuning feature). This is
  not a Natkhat AI architectural gap — it is a provider-contract
  requirement (§15, §21) that must be confirmed via legal/security
  review before any provider is selected, not something this
  architecture can enforce technically.

## 11. Prompt/Context Boundary

Conceptual categories only — **no prompt pipeline is implemented or
designed at the implementation level** (§26):

- **System instructions** — Leo's personality and safety constraints;
  static, provider-agnostic, never child-identifying.
- **Conversation context** — minimized recent-turn excerpt (§9, §13).
- **Memory context** — minimized Active Relationship Memory excerpt
  (§9, §12).
- **Task-specific context** — whatever a given `task_type` additionally
  requires; not enumerated exhaustively here, since no task types are
  implemented yet.
- **Provider-specific formatting** — lives exclusively inside the
  adapter (§5), never in core-domain logic, never persisted as part of
  any M1–M7 entity.

## 12. Memory Boundary (M6 is the authority)

This document does not redesign
[`ai-memory-isolation.md`](./ai-memory-isolation.md)'s three-class
memory architecture (`active_relationship`, `version_history`,
`permanent_vault` — M6 §3.3, `data-lifecycle.md` §13.4). It adds two
boundary-specific rules:

- **Proposed M8 design decision:** only `active_relationship` (Class 1)
  memory is, by default, eligible to cross the boundary as task context
  (§9). `version_history` (Class 2) and `permanent_vault` (Class 3) are
  **not** included merely because they exist — inclusion of either
  would need explicit, task-specific justification this document does
  not provide, consistent with minimization (§9). This is a new
  decision M8 makes (M6 was silent on AI-boundary crossing — it was
  explicitly out of M6's scope, deferred here).
- **The M6 §9 provenance requirement — established here, not resolved
  by choosing an option.** `ai-memory-isolation.md` §9 explicitly
  deferred "how deleting a `Conversation` should affect already-
  distilled `LeoMemory`" to Milestone 8, naming three candidate
  directions (Option A — no automatic effect; Option B — full
  re-derivation; Option C — source-attributed targeted removal) and
  requiring that "whichever direction Milestone 8 eventually adopts,
  its design must address provenance between `Conversation`/`Message`
  and derived `LeoMemory` as a prerequisite." **This document
  establishes only the structural requirement, not the choice:** any
  future memory-derivation mechanism — which, being an AI/LLM
  extraction task, necessarily operates through this boundary — **must
  be able to trace a derived `LeoMemory` row back to the specific
  `Conversation`/`Message` row(s) that contributed to it.** Without this
  traceability, none of M6 §9's three options is actually
  implementable: Option A implicitly assumes deletion cannot silently
  corrupt provenance bookkeeping elsewhere; Options B and C explicitly
  require attribution to function at all. **All three options remain
  open.** This document does not choose among them, does not invent a
  fourth, and does not modify `ai-memory-isolation.md` §9 or ADR-0012.

## 13. Conversation Boundary (M6 is the authority)

This document does not redesign
[`ai-memory-isolation.md`](./ai-memory-isolation.md)'s `Conversation`/
`Message` entities. Only a minimized, task-relevant excerpt of a
`Conversation`'s message history may cross the boundary per request
(§9) — never the full persisted thread by default. Cross-family/cross-
child isolation (§10) applies identically here: context assembly must
already respect M6 §7.3 (family) and §7.4 (child) before a request ever
reaches this boundary.

**No new conversation-adjacent entity is introduced by this document**
— e.g. no "PromptLog" or similar record that would duplicate
conversation content. If a future implementation wants to persist what
was actually sent to a provider for debugging purposes, that need is
flagged here as a future design question requiring its own
minimization/retention review (§24) — not designed, and not silently
authorized, by this document. This mirrors the same "no second copy of
sensitive content" discipline `audit-logging.md` §10 already applies to
audit records.

## 14. Provider Logging, Telemetry, and Retention

### 14.1 What Natkhat AI logs about a provider call

`request_id`, timestamp, which adapter/provider handled the request,
`task_type`, success/failure, latency — standard operational telemetry
consistent with [`observability.md`](./observability.md)'s four golden
signals. **Never the raw request or response content** — logging the
actual payload would create a second copy of Tier 3 content, the exact
risk `audit-logging.md` §10 already prohibits for audit records, applied
here to provider-call logging for the same reason.

**Dependency on M7, not a change to it:** a boundary crossing is itself
an accountability-relevant event under ADR-0006 §22 ("every access...
to Sensitive Child Content"). `audit-logging.md`'s current schema (§3)
supports only `parent`/`child` (reserved) actor types — it has no
"system" or "AI-pipeline" actor for an event Leo's own infrastructure
initiates on a child's behalf, not a principal directly. **This document
does not modify `audit-logging.md`.** It records this as a future
Change Request against that document: a new event type (e.g. an
"AI-provider request" event, following the exact content-free
`metadata` pattern `audit-logging.md` §3/§10 already establish) would be
needed before real provider-call auditing could be implemented.

### 14.2 What the provider may log — unknown by default, not assumed

This document makes **no claim** about what any provider logs,
retains, or does with a request on their own infrastructure. That is
precisely why §15 (Provider Contracts) and §23 (Legal Validation
Register) exist. The product-side requirement this document establishes
is: **a provider's logging and retention behavior must be confirmed via
its contract/documentation and reviewed before that provider is
selected** — never assumed favorable, never asserted compliant with any
specific regime.

## 15. Provider Contracts — Legal Review Items

Per this document's own scope (§2: "provider-evaluation criteria... for
future legal review — not an actual provider selection") and directly
extending [ADR-0006](../decisions/ADR-0006-data-privacy-compliance.md)
§26 (**[LEGAL VALIDATION REQUIRED]**, already so-marked, not newly
flagged here), the following contract-term categories must be reviewed
before any provider is selected. **None is resolved, assumed, or
claimed compliant by this document:**

| Term category              | Why it matters here                                                                                            |
| -------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Data processing terms      | What the provider is contractually permitted to do with a request.                                             |
| Retention terms            | How long the provider retains request/response data — informs §14.2.                                           |
| Training/use-of-data terms | Whether inputs may train the provider's own models — the exact question ADR-0006 §27 prohibits by default.     |
| Subprocessors              | Which third parties the provider itself relies on — extends the trust boundary further than expected.          |
| Breach obligations         | Notification timelines/scope if the provider itself is compromised — ties to ADR-0006 §30.                     |
| Data residency             | Where a request is processed/stored — relevant to a future M9 India-residency design.                          |
| Deletion guarantees        | Whether/how the provider actually deletes data on request — cannot be assumed from §14.1's minimization alone. |
| Confidentiality            | Standard contractual confidentiality obligations.                                                              |
| Security obligations       | The provider's own security posture/certifications.                                                            |

## 16. Provider Credentials and Secrets — Conceptual Ownership Boundary

**No secret or credential is created by this document.** Conceptually,
provider API keys/credentials belong exclusively to the adapter layer
(§5) — never to core-domain logic, never part of the neutral contract's
business payload (§4), never logged (§14.1). This is a direct
application of the already-ratified standard in
[ADR-0006](../decisions/ADR-0006-data-privacy-compliance.md) §29 and
`docs/engineering/security-by-design.md` ("Secrets management" — GCP
Secret Manager, never committed, rotation policy required before
production credentials exist) — not a new secrets-management model.
**Future implementation requirement, not designed here:** which team/
role administratively owns provider credentials once real ones exist is
an operational question for a future sprint.

## 17. Failure Handling (conceptual — no fallback logic implemented)

| Failure mode                | Required behavior (conceptual, not implemented)                                                                                                     |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Timeout                     | Must not silently retry with an expanded (less-minimized) payload; must not fabricate a response.                                                   |
| Provider unavailable        | Must fail in a way the product layer can distinguish from "no valid response for safety reasons" (below).                                           |
| Malformed provider response | Must not surface raw provider error text (which may contain provider-internal debug detail) directly to a child.                                    |
| Rate limit                  | A conceptual condition the adapter must be able to report distinctly — no retry/backoff algorithm is designed here.                                 |
| Safety refusal              | Must be treated as a **valid outcome**, not an error — Leo's product-side response to a refusal is a UX/product design question, not resolved here. |
| Provider policy conflict    | Must be distinguishable from a technical failure — surfaced, not silently swallowed.                                                                |
| Provider model unavailable  | Same category as "provider unavailable" — no automatic silent substitution of a different model/provider is designed here.                          |

No retry, backoff, circuit-breaker, or multi-provider failover
**algorithm** is designed or implemented by this document — only the
requirement that each failure mode be distinguishable and handled
without silently violating the data boundary (§8–§9). Algorithm design
is future implementation (§24).

## 18. Provider Selection — Explicitly Out of Scope

**No provider — OpenAI, Anthropic, Google, an open-source/self-hosted
model, or any other — is selected, evaluated comparatively, or
recommended by this document.** M8 designs the boundary a future
selection would plug into, not the selection itself
(`docs/sprints/sprint-02.md` §3, M8's own text: "not an actual provider
selection").

## 19. External Evaluation / Future "Technology Watch" Compatibility

**This repository documents no "Technology Watch" capability today.**
The closest existing structure is the
[Knowledge Vault](../knowledge/README.md) (`docs/knowledge/`,
established Sprint 01 §7) — a general durable-knowledge store for
lessons learned, not a provider-evaluation or vendor-approval pipeline.
**This document does not modify the Knowledge Vault and does not assert
that any ASPOVO-level "Technology Watch / Intelligence" process is
already ratified or documented anywhere in this repository.**

The compatibility property this document does establish: because
provider adoption is entirely encapsulated behind the adapter model
(§5) and the neutral contract (§4), **whatever external evaluation/
approval process eventually exists** — at ASPOVO's discretion, outside
this repository's governance — can recommend or select a provider, and
the resulting engineering work is bounded to writing one new adapter.
No core-domain redesign, and no change to M1–M7, is required by that
future decision. This is a structural property of the architecture, not
a claim that a specific external process exists or has been consulted.

## 20. Vendor Lock-In Analysis

Architectural choices that **would** create lock-in, and how this
design avoids each:

| Lock-in risk                                                                   | How this design avoids it                                                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Embedding a provider SDK type in a core-domain entity                          | Prohibited structurally (§3, §6) — core-domain entities interact only with the neutral contract (§4).                                                                                                                                                                                          |
| Storing conversation/memory content in a provider-specific format              | Prohibited — M6's `Conversation`/`Message`/`LeoMemory` remain the sole source of truth; provider payloads are derived/ephemeral, not stored (§12–§13).                                                                                                                                         |
| Relying on a provider-side "memory"/persistent-context feature                 | **Explicitly prohibited.** Natkhat AI's own `LeoMemory` (M6) is the sole system of record; a provider-side memory feature would undermine Parent Data Ownership (Constitution §2) and M4's deletion/export guarantees, since Natkhat AI cannot guarantee deletion of data it does not control. |
| Treating a provider's safety filter as Natkhat AI's own safety guarantee       | Avoided by keeping child-safety a Natkhat-AI-side responsibility (Constitution §13) independent of any one provider's filter — a future implementation requirement, not designed further here (§24).                                                                                           |
| Provider-specific fine-tuned/custom model artifacts only that provider can run | **Flagged, not fully preventable architecturally.** Named explicitly so a future ADR evaluating a specific provider is aware of this risk before committing to it.                                                                                                                             |

## 21. Security Review

Design-level only — no code exists to audit.

| Concern                                   | Design-level mitigation / disposition                                                                                         |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Cross-family leakage                      | Inherited from M2/M6's pre-boundary scoping; not re-implemented here — §10.                                                   |
| Provider-side data exposure               | Bounded by minimization (§9) — a compromised/misbehaving provider only ever had the minimized payload, never the full record. |
| Secrets                                   | Adapter-only, never in the business payload or logs — §14, §16.                                                               |
| Logging                                   | Content-free by design — §14.1.                                                                                               |
| Prompt/context leakage                    | Bounded by §11's category discipline and §9's minimization.                                                                   |
| Memory leakage                            | Class-restricted by default (Active Relationship only) — §12.                                                                 |
| Conversation leakage                      | Excerpt-only, never full history — §13.                                                                                       |
| Unauthorized provider access              | Credentials scoped to the adapter, never exposed to core-domain logic — §16.                                                  |
| Provider compromise                       | Blast radius bounded by minimization, not by trust in the provider — §9, §21 general principle.                               |
| Malicious/misbehaving provider            | Same bound as above; contractual obligations are the complementary, non-technical control — §15.                              |
| Accidental sensitive-data transmission    | Requires a future minimization-enforcement checkpoint at the boundary — named as a requirement, not implemented — §9, §24.    |
| Cross-child leakage (residual, inherited) | Not resolved by this document — M6 §7.6's single-layer application-only enforcement is inherited unchanged — §10.             |

## 22. Privacy & Child-Safety Review

- **Privacy by Default** (ADR-0006 §1) — no category defaults to
  crossing the boundary; every crossing is minimized and task-specific
  (§8–§9).
- **Child Safety / AI Model Governance** (Constitution §13) — "must
  never expose another child's data, reveal internal prompts, leak
  confidential information, store unnecessary personal information, or
  generate unsafe outputs for children" — directly addressed by §10
  (isolation), §11 (prompt/context discipline), §9 (minimization), and
  the explicit statement that safety filtering remains a Natkhat-AI-side
  responsibility (§20), not merely inherited from a provider.
- **No unauthorized model training** (ADR-0006 §27) — the technical
  enforcement this milestone requires is minimization itself (§9): a
  provider that receives only a minimized, task-specific payload has
  structurally less to train on than one receiving full records, even
  before any contractual prohibition (§15) is confirmed. This document
  does not claim minimization alone satisfies §27 — the contractual
  confirmation remains **[LEGAL VALIDATION REQUIRED]** (§23).
- **No advertising/profiling use** (ADR-0006 §28) — no analytics or
  advertising integration is designed or implied anywhere in this
  document.
- **Parent Data Ownership** (Constitution §2) — directly protected by
  §20's prohibition on provider-side memory/persistent context as a
  system of record.

## 23. Legal Validation Register

Consolidated — nothing here is resolved by this document; every row
requires formal legal/privacy review before any provider is selected or
contracted:

1. **[LEGAL VALIDATION REQUIRED — ADR-0006 §26, restated]** Provider
   data-handling, retention, and training-use terms.
2. **[LEGAL VALIDATION REQUIRED — ADR-0006 Legal Validation item 5,
   restated]** Whether any AI-driven feature (e.g. Leo's responses)
   constitutes "automated decision-making" under GDPR Article 22 or
   equivalents.
3. **[NEW — this document, §15]** The nine provider-contract term
   categories in §15 (data processing, retention, training/use-of-data,
   subprocessors, breach obligations, data residency, deletion
   guarantees, confidentiality, security obligations) — new because no
   prior Sprint 02 milestone named this specific checklist, though each
   item traces to an existing ADR-0006 concern.
4. **[OPEN — inherited from ADR-0006 §30, restated]** Regulatory
   breach-notification obligations, to the extent a provider-side
   incident triggers them.
5. **[OPEN — inherited from ADR-0006, general applicability]** General
   COPPA/GDPR/India DPDP Act applicability to AI-provider data handling
   specifically, pending ADR-0007's broader legal-validation gates.

**No DPDP-compliance claim, or compliance claim under any other regime,
is made anywhere in this document.**

## 24. Future Implementation Boundary

**A future engineering sprint may, once this design is approved,**
implement: the neutral contract (§4) as real types/interfaces (no
core-domain change); a single adapter (§5) for a provider that has
already cleared §23's legal review; the minimization-enforcement
checkpoint (§9, §21); operational telemetry (§14.1) following the
content-free pattern.

**Still requires founder and/or legal approval before implementation:**
actual provider selection (§18 — a founder decision, not an engineering
one); sign-off on any specific provider's contract terms (§23); the
actual mechanism resolving M6 §9's provenance question (§12 — once a
memory-extraction pipeline is actually designed, likely a future
milestone); any policy permitting Version History or Vault memory
classes to cross the boundary (§12, a departure from this document's
default); any addition to the Personalization Data Allowlist (§9.1) —
each entry requires its own founder/product-owner approval, per the
founder decision recorded 2026-08-09; any self-hosted/local-inference
infrastructure decision (cost/ops, separate from this architecture); the
audit-schema Change Request named in §14.1.

## 25. Consistency Check Against M1–M7

No M1 entity field, M2 authorization rule, M3 classification/RLS
decision, M4 lifecycle rule, M5 consent design, M6 entity/isolation
design, or M7 audit schema is changed by this document. Specifically:

- `ai-memory-isolation.md` §9 remains fully open across all three
  options (§12) — not narrowed, not amended.
- `ai-memory-isolation.md` §7.6's residual risk is restated as directly
  relevant to this boundary (§10), not resolved or altered.
- `data-classification-and-isolation.md` §3's five-tier model is reused
  verbatim (§8) — no sixth tier or conflicting system is introduced.
- `audit-logging.md`'s schema and event catalog are **not modified** —
  §14.1 records a gap (no "system"/AI-pipeline actor type) as a future
  Change Request against that document, not a change made here.
- `docs/knowledge/README.md` (Knowledge Vault) is **not modified** —
  §19 references it only to clarify what it is not.
- No `PROJECT.md` or `docs/sprints/sprint-02.md` change.

## 26. Explicit Exclusions

No AI/LLM provider integration, SDK, or API call of any kind. No prompt
pipeline or model-routing code. No database schema, migration, or
storage. No authentication code or Row-Level Security policy execution.
No production API endpoint. No Leo implementation. No real child,
parent, or family data anywhere in this document. No provider selected,
compared, or contracted. No ADR reaching "Accepted" status (ADR-0013 is
Proposed only). No creation of, or claim that, an ASPOVO "Technology
Watch" capability exists (§19). No entry populated on the
Personalization Data Allowlist (§9.1) — the mechanism and its
constraints are established, not a first task_type. No modification to
the Knowledge Vault, `PROJECT.md`, `docs/sprints/sprint-02.md`, or any
M1–M7 document.

## 27. Testing Implications (design-level only)

Per `docs/engineering/testing-strategy.md`'s taxonomy: no code exists
yet. Once implemented (post-§23 legal review, post-provider selection,
post-ADR-0013 reaching "Accepted"), this design's minimum bar is
**Unit** (adapter translation correctness against the neutral contract,
§4–§5), **Integration** (minimization-checkpoint enforcement, §9, §21;
failure-mode handling, §17), and **Security** (a test that no request
ever carries a raw `family_id`/`child_id`/internal identifier across
the boundary, §8; a test that no full conversation/memory record is
ever transmitted where a minimized excerpt was required, §9). Widget,
End-to-end, Performance, Accessibility, and Regression layers apply to
the features built on top of this design.

## 28. Deployment

Not applicable — documentation-only milestone; nothing is deployed
(`docs/sprints/sprint-02.md`, §2.2).

---

## Constitution Alignment

Traces to:
[Child Privacy & Safety Constitution](../constitution/product/child-privacy-and-safety-constitution.md)
§2 (Parent Owns the Child's Data — §20), §6–§7 (Leo Memory/Voice-Image
Protection, extended to the boundary — §12–§13), §11 (Child Data
Minimization — §9), §13 (AI Model Governance — §22), §14 (Future AI
Architecture — §6–§7, §20, the document's central objective);
[Engineering Constitution](../constitution/engineering/engineering-constitution.md)'s
Mandatory Engineering Review Gates (Privacy, Security, Parent Trust,
Child Safety); [ADR-0006](../decisions/ADR-0006-data-privacy-compliance.md)
§1–§2, §7–9, §16, §22, §26–§29 (cited throughout, none redecided);
[ADR-0007](../decisions/ADR-0007-target-audience-interim-posture.md)
(India/4–10 context, informing §23 item 5's forward relevance to a
future M9); [`data-classification-and-isolation.md`](./data-classification-and-isolation.md)
§3, §7.1 (five-tier model reused verbatim, §8; division-of-labor
pattern reused, §5); [`ai-memory-isolation.md`](./ai-memory-isolation.md)
§7.4, §7.6, §9 (cross-child scoping and residual risk inherited
unchanged, §10; provenance requirement established without choosing an
option, §12); [`audit-logging.md`](./audit-logging.md) §3, §10 (content-
free logging pattern reused, §14.1; gap recorded as a future Change
Request, not a change made here); `docs/knowledge/README.md` (referenced
only to clarify scope, §19, not modified); `docs/sprints/sprint-02.md`,
§3, Milestone 8.

**Status note:** per Milestone 8's Definition of Done, this document's
Status remains **Proposed** — not "Approved" — until the founder/
product owner reviews it at the Sprint 02 stop-and-report checkpoint.
This document selects no provider, performs no legal review, and
authorizes no implementation beyond what §24 explicitly permits. §12's
provenance requirement is established without choosing among M6 §9's
three options; §19 does not assert that any ASPOVO "Technology Watch"
capability exists in this repository; §10 inherits, and does not
resolve, `ai-memory-isolation.md` §7.6's residual isolation risk. §9.1's
Personalization Data Allowlist reflects the founder decision (Option C)
recorded 2026-08-09, resolving what this document originally proposed
as a redirectable engineering default — no allowlist entry is created,
approved, or implied by this document.
