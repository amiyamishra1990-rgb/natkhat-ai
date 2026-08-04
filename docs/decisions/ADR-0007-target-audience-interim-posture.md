# ADR-0007: Interim Target-Audience Engineering Compliance Posture

**Version:** 1.1.0
**Status:** Accepted — Target Market and Age Range Founder-Ratified
(§D); India DPDP Act Legal Validation and Consent-Mechanism Selection
Still Required Before Real Child Data Collection
**Owner:** Engineering, with §D ratified by the Product Owner (founder)
**Last Updated:** 2026-08-04

## Context

The
[Product Constitution](../constitution/product/natkhat-ai-constitution.md)'s
Target Audience section states: "**Not yet ratified.** No age range,
demographic, or user classification has been formally decided... must
be resolved via a dedicated ADR before any user data model,
authentication, or COPPA-relevant feature is designed or implemented."
`docs/sprints/sprint-01.md`, §26 (Risk Register, Compliance row) tracks
this as an open risk.

**As originally accepted (2026-08-03), this ADR did not ratify a target
audience.** Repository evidence was insufficient to do so: no ratified
Natkhat AI document stated a minimum or maximum age, a specific country
or region of operation, or a target-market list. Inventing one would
have been exactly the "invented legal/product conclusion" that
remediation phase was explicitly told not to produce. Instead, it did
two narrower things: (A) restated what the repository had actually
already ratified about who Natkhat AI is for, and (B) defined a
conservative engineering posture that let database/authentication
design proceed safely without waiting for the exact age/market decision
— because that posture is the strictest one under consideration and
cannot be invalidated by whatever the eventual narrower ratification
turns out to be.

**Update (2026-08-04, governance close-out):** the founder has now
explicitly ratified the initial target market and age range directly
(see §D). This is a **founder business decision, not a legal
certification** — it does not by itself determine India DPDP Act
applicability or sufficiency; that remains a separate, still-open legal
item (§D.3, formerly part of §C).

## Decision

### A. Product decision (already ratified — cited, not invented)

- Natkhat AI is a children-facing product with parent-managed accounts.
  Mission: "Help parents raise kind, confident, curious, emotionally
  strong and future-ready children..."
  ([Product Constitution](../constitution/product/natkhat-ai-constitution.md)).
- Core Principle 2, "Parent partnership," and the Trust-Above-All
  amendment establish parents as the account owners/controllers; the
  [Child Privacy & Safety Constitution](../constitution/product/child-privacy-and-safety-constitution.md)
  §2 and §9 establish children as the protected data subjects, not
  independent account holders with unrestricted control.
- **Not ratified anywhere in the repository:** a specific minimum or
  maximum child age, a specific target country or region, or a
  specific launch-market list.

### B. Engineering requirement (what this ADR does decide)

Until a specific age range and target market are founder-ratified, all
engineering design **must** treat every child user as falling under the
strictest child-data-protection posture among the frameworks under
consideration — India's Digital Personal Data Protection Act (defines
"child" as under 18 — the strictest of the three thresholds considered
here), GDPR-K (under 16 by default, 13–16 varies by EU/EEA member
state), and COPPA (under 13, United States). Concretely:

1. Verifiable parental consent (per
   [ADR-0006](./ADR-0006-data-privacy-compliance.md), §5) is required
   before collecting any data from any user presenting as a minor,
   regardless of their exact age — built unconditionally, not as an
   age-gated conditional feature.
2. No feature may assume a jurisdiction-specific lighter-touch rule
   (e.g., "COPPA only requires consent under 13, so a 14–17-year-old
   can self-register") without a specific founder decision ratifying
   that lighter posture for a specific, legally-validated target
   market.
3. No data-residency or infrastructure-region decision is made by this
   ADR. If India is a target market, DPDP Act data-localization
   implications require legal validation before finalizing Supabase's
   region selection (ties to ADR-0004).
4. This posture applies to design and architecture work. It does not
   itself authorize collecting real user data — that remains gated by
   [ADR-0006](./ADR-0006-data-privacy-compliance.md)'s unresolved Legal
   Validation items and by ADR-0004/ADR-0005's own "no implementation"
   clauses.

### C. Legal/compliance validation and founder decisions still required (not resolved by this ADR)

The following required an explicit founder decision, in several cases
followed by legal validation, before Natkhat AI could move past the
interim posture in §B. As of the 2026-08-04 governance close-out,
items 1, 2, and 7 are **founder-ratified — see §D**; items 3, 4, 5, and
6 remain open.

1. ~~**Exact age range**~~ — **RATIFIED, §D.1.**
2. ~~**Exact target market list**~~ — **RATIFIED, §D.1** (India, single
   market at launch).
3. **India DPDP Act applicability** — now the operative, sole
   applicable regime given §D.1's market ratification. The Act's
   child-specific provisions (verifiable parental consent, and
   restrictions on tracking, behavioral monitoring, and targeted
   advertising directed at children) still require legal interpretation
   and an engineering translation beyond what §B/§D provide. **Still
   open — see §D.3.**
4. **COPPA applicability** — not currently operative (India-only launch
   per §D.1), but retained here for when/if a future U.S. expansion is
   ratified; would then require its own "directed to children" /
   actual-knowledge legal determination.
5. **GDPR/GDPR-K applicability** — not currently operative (India-only
   launch per §D.1), retained for a possible future EU/EEA expansion.
6. **Verifiable parental consent method** — the specific mechanism
   (e.g., payment-card verification, signed form, government ID, DigiLocker/
   Aadhaar-linked verification, or another method) has not been chosen,
   and its legal sufficiency under India's DPDP Act specifically has not
   been validated. **Still open.**
7. ~~**International availability**~~ — **RATIFIED, §D.1** (single
   market — India — at launch; future international expansion
   explicitly preserved as a later, separate ratification, not
   foreclosed).

Items 3 and 6 above are the specific remaining blockers before real
child data may be collected — see §D.3 and Known Risk #10 in
`PROJECT.md`.

### D. Founder Ratification — Target Market and Age Range (2026-08-04)

1. **Ratified decision.** The founder has explicitly ratified, via this
   governance close-out session: Natkhat AI's initial product direction
   is a parent-managed childhood companion designed for children aged
   **4–10**, launching initially in a **single target market — India**
   — with future international expansion explicitly preserved as a
   later, separate decision, not foreclosed by this one. This resolves
   §C items 1, 2, and 7.
2. **What this is, and is not.** This is a founder business/product
   decision. **It is not a legal certification** that Natkhat AI
   complies with India's DPDP Act, or any other regime, for the 4–10 age
   range. Per this session's explicit instruction, this statement is not
   to be interpreted as legal approval.
3. **Consequence for §C.3/§C.6.** Because India is now the sole ratified
   launch market, India's DPDP Act (which defines "child" as under 18)
   is the operative legal regime — not a hypothetical strictest-case
   comparison. §B's "design to the strictest of the three regimes"
   posture already satisfies DPDP's under-18 threshold by construction,
   so **no re-architecture is required** by this ratification. What
   remains open, and is not resolved by this decision, is: (a) formal
   legal review confirming Natkhat AI's actual consent-capture design
   meets DPDP's "verifiable parental consent" standard once that design
   exists, and (b) selecting the specific consent-verification mechanism
   (§C.6). Both require qualified legal counsel, not engineering
   judgment, before real child data collection may begin (ADR-0006 §5,
   "Legal Validation Required").
4. **COPPA/GDPR-K (§C.4/§C.5) are deferred, not closed.** They remain
   recorded in §C for the day a future U.S. or EU/EEA expansion is
   ratified; nothing here re-opens or forecloses that possibility.

## Consequences

- Clears the Product Constitution's textual gate ("must be resolved via
  a dedicated ADR before any user data model... is designed") to the
  extent that design work may proceed under the conservative posture in
  §B — a dedicated ADR now exists and directly addresses target
  audience for engineering purposes.
- **Target market and age range are now founder-ratified (§D)** — India,
  single market at launch, ages 4–10. This is a business decision, not a
  legal certification (§D.2).
- Does **not** by itself authorize real child data collection. §C.3 and
  §C.6 (India DPDP Act legal-sufficiency review of the actual
  consent-capture design, and the specific consent-verification
  mechanism) remain open and must be resolved before any user-facing
  launch or real user data collection begins (see
  [ADR-0006](./ADR-0006-data-privacy-compliance.md)'s Legal Validation
  section, item 6, now specifically scoped to India's DPDP Act by §D.3).
- If the founder later ratifies a broader posture (e.g., a second
  market), this ADR is superseded by a new ADR, not silently edited —
  per this repository's append-only ADR discipline.

## Constitution Alignment

Directly addresses the
[Product Constitution](../constitution/product/natkhat-ai-constitution.md)'s
Target Audience section (quoted in Context above), which itself
delegates resolution to "a dedicated ADR" — §D now supplies that
resolution (target market and age range) via explicit founder
ratification, exactly as the Product Constitution's own text
anticipated; the Product Constitution's own wording is left unedited
per the Governance Hierarchy (only an explicit Constitution-layer
amendment may change its text, not a lower-layer ADR), but is no longer
in tension with this ADR now that §D exists. Aligned with the
[Child Privacy & Safety Constitution](../constitution/product/child-privacy-and-safety-constitution.md)'s
overall directive to "exceed current industry standards for privacy,
safety, and parental trust" — adopting the strictest considered posture
by default is a direct application of that directive under genuine
uncertainty about the final target market. Aligned with
[ADR-0006](./ADR-0006-data-privacy-compliance.md), §5–§6 (parental
consent and authorization boundaries), which this ADR's §B makes
unconditional pending final ratification.
