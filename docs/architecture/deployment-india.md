# India-First Deployment & Data-Residency Architecture

**Version:** 1.0.0
**Status:** Proposed — Pending Founder/Product-Owner Review (Sprint 02,
Milestone 9 deliverable, reviewed at the Sprint 02 per-milestone
stop-and-report checkpoint; `docs/sprints/sprint-02.md`, §5's
decision-maker note applies — not a standalone engineering/AI-agent
self-certification)
**Owner:** Engineering
**Last Updated:** 2026-08-09

> This document is Sprint 02, Milestone 9's deliverable
> (`docs/sprints/sprint-02.md`, §3, M9). It is an architecture-level
> design document only. **No GCP project, no Supabase project, and no
> infrastructure of any kind is provisioned by this document** — see
> §10 (Explicit Exclusions). It does not claim India DPDP Act
> data-localization compliance anywhere. It builds on, and does not
> redesign, the classification/encryption/isolation model
> ([`docs/architecture/data-classification-and-isolation.md`](./data-classification-and-isolation.md)/[ADR-0010](../decisions/ADR-0010-encryption-and-tenant-isolation-design.md)),
> the database decision
> ([ADR-0004](../decisions/ADR-0004-database.md)), the target-market
> posture
> ([ADR-0007](../decisions/ADR-0007-target-audience-interim-posture.md)),
> and the AI-provider boundary
> ([`docs/architecture/ai-provider-boundary.md`](./ai-provider-boundary.md)/[ADR-0013](../decisions/ADR-0013-ai-provider-abstraction-and-multi-provider-compatibility.md)),
> which this document cross-references but does not modify. Every
> example is fictional; no real parent, child, or family data appears
> here. **This document does not select, recommend, or require any AI
> provider, and does not narrow the future AI-provider candidate list**
> — see §6.

---

## 1. Objective

Design the GCP/Supabase deployment architecture consistent with a
single-market (India) launch, informed by — but not asserting legal
compliance with — India's DPDP Act data-localization considerations
(per `docs/sprints/sprint-02.md`'s own citation,
[ADR-0007](../decisions/ADR-0007-target-audience-interim-posture.md)
§D.3; the substantive text underlying that citation is §B.3's flag that
"if India is a target market, DPDP Act data-localization implications
require legal validation before finalizing Supabase's region
selection," made operative by §D.1's founder-ratified India launch).
Verbatim objective from `docs/sprints/sprint-02.md`, §3, M9.

## 2. Scope

- Candidate Supabase/GCP region selection rationale (§3).
- Environment topology — dev/staging/production — design (§4).
- How the design would change if a future market is added, per
  ADR-0007's "additive, not a rebuild" posture (§5).

Out of scope (per `docs/sprints/sprint-02.md` §2.2 and M9's own Explicit
Exclusions, §10): any Terraform/IaC, any real cloud resource creation,
any production environment; AI-provider selection or region requirement
(§6); a new ADR (M9's own Definition of Done: "Not in Sprint 02" — "the
region decision itself only becomes ADR-worthy once India DPDP legal
validation confirms it").

## 3. Candidate Region Rationale (Supabase/GCP)

**Candidate, explicitly provisional pending legal confirmation (per
this milestone's own acceptance criterion) — not a final selection:**
Mumbai — GCP `asia-south1` for compute (backend, admin, website) and
Supabase's `ap-south-1` (Mumbai) region for the managed Postgres/Auth/
Storage layer (ADR-0004, ADR-0005).

**Rationale:**

- **Latency to the ratified primary market.** ADR-0007 §D.1 ratifies
  India as the single launch market; co-locating compute and database
  in a Mumbai region minimizes latency for the product's actual user
  base, independent of any legal requirement.
- **Reasonable-faith alignment with anticipated data-residency
  expectations**, not a confirmed legal mandate. This document does not
  assert that India's DPDP Act requires blanket data localization —
  that determination remains
  [ADR-0006](../decisions/ADR-0006-data-privacy-compliance.md)'s Legal
  Validation item 4, unresolved. Candidating an India-based region is a
  reasonable starting point for that future legal review to evaluate,
  not a substitute for it.
- **Compute/database co-location.** GCP and Supabase are separate
  providers (`PROJECT.md`'s Approved Tech Stack: Cloud = GCP, Database
  = Supabase) — this document candidates matching regions for both so
  that inter-service latency (backend ↔ database) is minimized, rather
  than treating the two providers' region choices as independent
  decisions.
- **Single-region simplicity for initial launch.** No multi-region
  active/active topology is proposed — consistent with a single-market
  launch and with not over-building infrastructure ahead of real
  traffic or a legally confirmed requirement.

**Explicitly not decided here:** whether this candidate is legally
sufficient, whether a different region would be legally required, and
whether GCP's own technology-stack choice needs its own ADR (`PROJECT.md`
already records GCP as "Not yet recorded" — a pre-existing gap this
document does not attempt to close, since authoring that ADR is not
part of M9's scope).

## 4. Environment Topology (Dev / Staging / Production)

Three environments, each with its **own** Supabase project and its own
GCP project/environment — no shared credentials or shared database
across environments, per the existing least-privilege standard
(`docs/engineering/security-by-design.md`, "Least privilege"; ADR-0006
§29).

| Environment | Region                                                                               | Data                                                                                                                             |
| ----------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Development | Any convenient region — not required to match production                             | **Never real child/family data** — fictional/test data only, consistent with the same rule every M1–M8 document already follows. |
| Staging     | Mirrors the production candidate region (§3), for realistic latency/behavior testing | **Never real child/family data** — fictional/test data only, same rule.                                                          |
| Production  | The candidate region (§3), once legally confirmed                                    | Real data, once ADR-0006's Legal Validation items and this document's own provisional-region caveat are cleared — not before.    |

This table is a topology **design**, not a provisioning plan — no
project, of any kind, in any environment, is created by this document
(§10).

## 5. Additive, Not a Rebuild — Future Market Addition

Per [ADR-0007](../decisions/ADR-0007-target-audience-interim-posture.md)'s
existing posture (COPPA/GDPR-K "deferred, not closed" — §C.4/§C.5), a
future market addition is designed here as **additive**: a second,
independently region-scoped environment set (its own Supabase project,
its own GCP region) provisioned for the new market, rather than
migrating or re-architecting the India environment.

**Explicitly flagged as a future design question, not resolved here:**
which family's data lives in which region once more than one market
exists — a per-family or per-market data-residency assignment rule —
requires its own future architecture work once a second market is
actually ratified (mirroring ADR-0007 §C.4/§C.5's own "not currently
operative" treatment of COPPA/GDPR-K). This document does not invent
that rule; it only confirms the topology it would attach to (a new,
additional environment, not a rebuild of the existing one) does not
require redesigning M1's Family/Child model.

## 6. AI-Provider Data Residency — Explicitly Out of Scope, Cross-Referenced to M8

**This document's region candidate (§3) covers only Natkhat AI's own
database/compute infrastructure. It says nothing about, and does not
resolve, where a future AI provider processes a request.**
[`ai-provider-boundary.md`](./ai-provider-boundary.md) (M8) already
reserved that question: no provider is selected (M8 §18), and provider
data residency is one of the nine contract-term categories M8 §15
requires legal review for, restated in M8's own Legal Validation
Register (§23).

**This document does not**: select or recommend an AI provider; require
that AI processing occur within India or any other specific location;
narrow the set of AI providers a future selection could consider; or
modify `ai-provider-boundary.md` or ADR-0013 in any way. §7 below names
the resulting compound legal question explicitly, without duplicating
M8's own analysis.

## 7. Legal Validation Register

Nothing in this section is resolved by this document — every item
requires formal legal review before a production region (or an AI
provider, per item 3) is finalized:

1. **[LEGAL VALIDATION REQUIRED — ADR-0006 Legal Validation item 4,
   restated]** Data-localization requirements under India's DPDP Act,
   affecting the Supabase/GCP region selection (§3).
2. **[LEGAL VALIDATION REQUIRED — ADR-0007 §B.3, restated]** Whether
   India being the ratified target market (§D.1) creates a specific
   localization obligation, and if so, whether the candidate region
   (§3) satisfies it — not determined by this document.
3. **[NEW — Option B, founder decision 2026-08-09]** **DPDP
   data-localization sufficiency is a compound question, not answered
   by this document alone.** It depends on **both**: (a) the database/
   infrastructure region this document candidates (§3), **and** (b)
   wherever the eventual AI provider processes data when handling a Leo
   interaction, which remains entirely open per
   [`ai-provider-boundary.md`](./ai-provider-boundary.md) §23 (Legal
   Validation Register item 1) and §15 (the "Data residency"
   provider-contract-term category). **Neither half of this question is
   resolved until an AI provider is selected and its own data-residency/
   contract terms clear legal review.** This item does not duplicate M8
   §23's analysis — it only names the dependency between this
   document's residency question and that one, so a future legal
   reviewer reading either document sees the full, combined shape of
   the question. This item does not require, recommend, or imply
   India-local AI processing, and does not narrow the candidate provider
   list (§6).

**No DPDP-compliance claim, or compliance claim under any other regime,
is made anywhere in this document.**

## 8. Privacy & Security Considerations

- **No new isolation model.** This document deploys, but does not
  redesign, M3's per-Family tenant isolation and encryption model
  (`data-classification-and-isolation.md` §6–§7) — regional deployment
  is an infrastructure-placement question, not a data-model question.
- **Least privilege across environments** (§4) — no environment shares
  credentials or database access with another, consistent with
  `docs/engineering/security-by-design.md`.
- **No real data outside production** — dev/staging never hold real
  child/family data, the same rule already established for every
  fictional example in M1–M8's documents, applied here to environments
  rather than document examples.

## 9. Consistency Check Against M1–M8

No M1 entity field, M2 authorization rule, M3 classification/encryption
decision, M4 lifecycle rule, M5 consent design, M6 entity/isolation
design, M7 audit schema, or M8 provider-boundary design is changed by
this document. Specifically:

- This document **fills in** the placeholder
  `data-classification-and-isolation.md` §11 already reserved: "Data-
  localization (ADR-0007 §D.3) remains Milestone 9's concern" — it does
  not amend that document's own encryption/isolation decisions.
- [ADR-0004](../decisions/ADR-0004-database.md) (Supabase/Postgres
  locked, implementation deferred) is consumed as given, not amended —
  this document adds a candidate region, not a database engine change.
- [ADR-0007](../decisions/ADR-0007-target-audience-interim-posture.md)
  §B.3/§D is restated, not reopened.
- [`ai-provider-boundary.md`](./ai-provider-boundary.md) and ADR-0013
  are cross-referenced (§6–§7) and **not modified**.
- No `PROJECT.md` or `docs/sprints/sprint-02.md` change.

## 10. Explicit Exclusions

No Terraform, Pulumi, or other Infrastructure-as-Code of any kind. No
GCP project, Supabase project, or any real cloud resource created. No
production environment. No claim of DPDP, GDPR, or COPPA compliance
anywhere in this document. No AI provider selected, recommended, or
required to process data within India or any other specific location
(§6). No narrowing of the future AI-provider candidate list. No new ADR
— per this milestone's own Definition of Done, the region decision
becomes ADR-worthy only once legal validation confirms it, which has
not happened in Sprint 02. No modification to
[`data-classification-and-isolation.md`](./data-classification-and-isolation.md),
[ADR-0004](../decisions/ADR-0004-database.md),
[ADR-0007](../decisions/ADR-0007-target-audience-interim-posture.md),
[`ai-provider-boundary.md`](./ai-provider-boundary.md), ADR-0013, or any
other M1–M8 document. No modification to `PROJECT.md` or
`docs/sprints/sprint-02.md`. No real parent, child, or family data
anywhere in this document.

## 11. Testing Implications (design-level only)

Per `docs/engineering/testing-strategy.md`'s taxonomy: no infrastructure
or code exists yet. Once implemented (post-legal-validation of §7's
items), the minimum bar this design implies is **Integration**
(environment-isolation verification — no dev/staging credential can
reach a production resource) and a deployment-specific check that the
provisioned region matches whatever region legal review ultimately
confirms, not necessarily this document's candidate. No Unit, Widget,
End-to-end, Performance, Accessibility, Regression, or Security testing
layer is designed here, since no application code or infrastructure is
in scope for this milestone.

## 12. Deployment

Not applicable — documentation-only milestone; nothing is deployed
(`docs/sprints/sprint-02.md`, §2.2).

---

## Constitution Alignment

Traces to:
[Engineering Constitution](../constitution/engineering/engineering-constitution.md)'s
Mandatory Engineering Review Gates (Security — least privilege across
environments, §4, §8) and Engineering Standards (Environment management,
Security by design); [ADR-0004](../decisions/ADR-0004-database.md)
(Supabase/Postgres, consumed as given); [ADR-0006](../decisions/ADR-0006-data-privacy-compliance.md)
Legal Validation item 4 (restated, §7); [ADR-0007](../decisions/ADR-0007-target-audience-interim-posture.md)
§B.3, §D (India/4–10 ratification and its residency implication,
restated not reopened, §3, §7);
[`data-classification-and-isolation.md`](./data-classification-and-isolation.md)
§6–§7, §11 (isolation/encryption model consumed unchanged, §8; the
Milestone 9 placeholder that document reserved, filled in here, §9);
[`ai-provider-boundary.md`](./ai-provider-boundary.md) §15, §18, §23 and
ADR-0013 (AI-provider residency question, cross-referenced not
duplicated, §6–§7); `docs/sprints/sprint-02.md`, §3, Milestone 9.

**Status note:** per Milestone 9's Definition of Done, this document's
Status remains **Proposed** — not "Approved" — until the founder/
product owner reviews it at the Sprint 02 stop-and-report checkpoint.
No GCP project, Supabase project, or infrastructure of any kind is
provisioned by this document. §7 item 3 records the founder-approved
(2026-08-09, Option B) cross-referenced Legal Validation Register line
connecting this document's region question to
[`ai-provider-boundary.md`](./ai-provider-boundary.md) §23's still-open
AI-provider residency question — neither is resolved here, and this
document selects no AI provider and requires no India-local AI
processing.
