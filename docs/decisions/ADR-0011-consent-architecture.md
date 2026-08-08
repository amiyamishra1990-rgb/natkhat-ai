# ADR-0011: Consent Architecture (Framework-Level)

**Version:** 1.1.0
**Status:** Proposed — Founder Decisions Recorded 2026-08-06 (retention-
survival direction and mechanism-shortlist direction; see Decision
items 6/7 below), and **still cannot advance to "Accepted" in Sprint
02** (`docs/sprints/sprint-02.md`, §3, M5: blocked from "Accepted"
status until (a) the founder makes a final mechanism selection and (b)
India DPDP Act legal validation confirms that mechanism's sufficiency
as "verifiable parental consent," and the §7 retention duration's own
defensibility — ADR-0007 §C.6/§D.3). This is a deliberate departure
from ADR-0008/0009/0010's pattern of flipping to "Accepted —
Implementation Deferred" once founder review is recorded — that review
has now occurred (2026-08-06) and this ADR remains Proposed regardless,
by design.
**Owner:** Engineering
**Last Updated:** 2026-08-06

## Context

`docs/sprints/sprint-02.md`, §3, Milestone 5 (Consent Architecture)
requires designing the consent-event/audit-trail architecture per
[ADR-0006](./ADR-0006-data-privacy-compliance.md) §5 — explicitly not
the specific verifiable-parental-consent mechanism, which
[ADR-0007](./ADR-0007-target-audience-interim-posture.md) §C.6/§D.3
gates on legal validation. Milestone 5's own text names this as
requiring a new ADR, authored in Sprint 02 but left at **Proposed**
status rather than "Accepted," numbered sequentially after ADR-0010.

This ADR depends on, and does not redesign,
[ADR-0008](./ADR-0008-core-data-model-parent-family-child.md) (Core
Data Model), [ADR-0009](./ADR-0009-authorization-and-session-architecture.md)
(Authorization & Session Architecture — specifically the owner-only
"consent-of-record changes" action), and
[ADR-0010](./ADR-0010-encryption-and-tenant-isolation-design.md)
(Encryption & Tenant-Isolation Design), each of which this ADR consumes
as given.

## Decision

Adopt the consent-event architecture documented in full at
[`docs/architecture/consent-architecture.md`](../architecture/consent-architecture.md)
as Natkhat AI's consent-tracking framework. The binding design
decisions:

1. **A new `ConsentEvent` entity records every consent action as an
   append-only, immutable event** — who consented (`consenting_parent_id`),
   when (`created_at`), what was consented to (`consent_type`), which
   privacy-terms version was in effect (`privacy_terms_version`), and
   which verification method was used (`verification_method`,
   `verification_reference`). This directly implements ADR-0006 §5's
   "consent must be captured as an auditable event" requirement.
2. **A `Child` row and its founding `ConsentEvent` are created
   atomically, as a single operation** — there is no data-model state
   in which a `Child` exists without a corresponding consent record,
   and no new "pending child" status is added to M1's `Child` entity to
   achieve this.
3. **Consent withdrawal reuses the existing M4 Child soft-delete
   cascade** (`docs/architecture/data-lifecycle.md`, §7.1) rather than
   defining a second deletion pathway — withdrawing consent for a
   Child's data and deleting that Child's data are architecturally the
   same operation.
4. **`ConsentEvent` is classified as Tier 1 content sensitivity with
   Tier 5 lifecycle behavior** — encrypted at rest/transit per the
   Tier 1 baseline (no additional field-level encryption required),
   family-scoped for Row-Level Security isolation (M3), but append-only
   and never deletable by the parent, for the same reason M4 assigns
   that property to Tier 5 audit/security records: the record's purpose
   is to outlive the possibility of being erased by the party whose
   action it documents.
5. **Verification-evidence artifacts (e.g., a signed form, an ID scan)
   are never stored directly on `ConsentEvent`.** Only an opaque
   `verification_reference` pointer is retained; if Natkhat AI's own
   infrastructure ever stores such an artifact, it must be classified
   Tier 3-or-higher and field-level encrypted, per M3 §5 — not designed
   further by this ADR, since no mechanism is yet selected.
6. **A three-option, non-binding consent-verification mechanism
   shortlist is produced** (payment-card verification, signed consent
   form, government-ID-linked verification via a third-party provider)
   for founder/legal review. **Founder decision recorded 2026-08-06:**
   primary candidate for legal review is signed/e-signed consent form;
   fallback candidate is payment-card verification; government-ID
   verification is deprioritized (not eliminated) due to its added
   sensitive-data and third-party burden. This is a direction for legal
   review only — no option is selected, implemented, or asserted
   legally sufficient by this ADR.
7. **`ConsentEvent`'s own retention behavior after Child/Family
   deletion — specifically, whether it is exempted from M4's
   crypto-shredding cascade — was presented as founder-decision
   candidates.** **Founder decision recorded 2026-08-06:** the
   Option-B direction is approved — ConsentEvent may survive Family
   crypto-shredding under its own strictly bounded retention lifecycle,
   retaining only the minimum metadata necessary to demonstrate the
   consent event (never child conversations, memories, photos, content,
   or other deleted Family data). The exact duration is explicitly
   **not** approved and remains open pending India DPDP legal
   validation; once that duration is legally validated and expires for
   a given record, that record itself becomes eligible for deletion.
   This ADR does not modify `docs/architecture/data-lifecycle.md` —
   implementing the actual crypto-shredding exception is separate,
   follow-on Change Request work to that document.

## Consequences

- Clears the consent-architecture design prerequisite for a future
  Milestone 6 (Leo memory/conversation isolation), to the extent any
  future consent-gated AI interaction needs the same event pattern —
  not designed further here.
- Does **not** authorize any consent-capture UI, API, storage of a real
  consent record, or implementation of any verification mechanism, even
  though a shortlist direction is now founder-approved (Decision item
  6). Does not authorize any claim that Natkhat AI's consent design
  satisfies India's DPDP Act or any other regime — that determination
  remains entirely with qualified legal counsel (ADR-0006 Legal
  Validation item 1; ADR-0007 §C.3/§C.6).
- Records a founder-approved **direction** (Option B, Decision item 7)
  for the previously-unresolved gap against
  [`docs/architecture/data-lifecycle.md`](../architecture/data-lifecycle.md)
  §7/§10 — but implements no change to that document. The exact
  retention duration remains open, pending legal validation; the actual
  crypto-shredding exception is separate, follow-on Change Request work
  to that document, not made here.
- **Founder-confirmed 2026-08-06:** this ADR's Proposed status, and
  Milestone 5's acceptance, are independent of the still-outstanding M4
  data-lifecycle ADR — `docs/architecture/data-lifecycle.md`'s own
  founder-ratified retention values (2026-08-05) are not yet recorded
  in a formal ADR. That gap is not a blocker on this ADR or on
  Milestone 5; it remains explicitly tracked as open governance work
  and must be completed/indexed no later than Sprint 02's Milestone 11
  close-out.
- Unlike ADR-0008/0009/0010, **this ADR is not eligible to flip to
  "Accepted — Implementation Deferred" at the next milestone's
  stop-and-report checkpoint** merely because founder review occurred —
  founder review has now occurred (2026-08-06) and this ADR remains
  Proposed regardless, because it still requires the two additional
  conditions in the Status line above (final mechanism selection, legal
  validation). Any future ADR or Sprint Document text that describes
  this ADR as "Accepted" without both conditions having been separately
  recorded is itself in error.
- Contains no real parent, child, or family data; all examples in the
  accompanying architecture document are fictional.

## Constitution Alignment

Directly implements
[Child Privacy & Safety Constitution](../constitution/product/child-privacy-and-safety-constitution.md)
§2 (Parent Owns the Child's Data) and §11 (Child Data Minimization —
the `verification_reference`-not-raw-artifact design). Implements
[ADR-0006](./ADR-0006-data-privacy-compliance.md) §5 (Parental Consent
Boundaries) at the framework level only — the mechanism-sufficiency
question §5 itself flags as **[LEGAL VALIDATION REQUIRED]** remains
open. Extends, and does not contradict,
[ADR-0007](./ADR-0007-target-audience-interim-posture.md) (India,
single market, ages 4–10 — the operative context for whichever
mechanism is eventually chosen from this ADR's shortlist). Consumes,
and does not redesign,
[ADR-0008](./ADR-0008-core-data-model-parent-family-child.md)'s entity
model, [ADR-0009](./ADR-0009-authorization-and-session-architecture.md)'s
authorization model, and
[ADR-0010](./ADR-0010-encryption-and-tenant-isolation-design.md)'s
classification/encryption model. Aligned with the
[Product Constitution](../constitution/product/natkhat-ai-constitution.md)
Core Principle 2 ("Parent partnership") and the Trust-Above-All
amendment, and the
[Engineering Constitution](../constitution/engineering/engineering-constitution.md)'s
Mandatory Engineering Review Gates (Privacy, Parent Trust, Child
Safety). Nothing in this ADR amends the Product Constitution, Child
Privacy & Safety Constitution, or any other accepted ADR.
