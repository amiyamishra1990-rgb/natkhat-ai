# ADR-0006: Data Privacy & Compliance Engineering Requirements

**Version:** 1.0.0
**Status:** Accepted — Engineering Requirements Ratified; Legal/Compliance
Validation Required Before Implementation Proceeds Past Design
**Owner:** Engineering (with Product Owner co-authority, per the Child
Privacy & Safety Constitution's binding weight)
**Last Updated:** 2026-08-03

## Context

`ADR-0004` (database) and `ADR-0005` (authentication) each state that no
implementation may begin "until a dedicated data-privacy/compliance ADR
exists and is accepted." `docs/sprints/sprint-01.md`, §26 (Risk
Register, Privacy and Compliance rows) names this ADR as a hard
prerequisite. The
[Child Privacy & Safety Constitution](../constitution/product/child-privacy-and-safety-constitution.md)
(Tier-1 Product Constitution Amendment) already ratifies the binding
_principles_ Natkhat AI must follow — this ADR does not restate,
weaken, reinterpret, or replace any of them. It exists solely to
translate those principles into concrete, engineering-actionable
requirements that a future database schema, authentication system,
storage layer, and AI-memory system must satisfy, so that ADR-0004 and
ADR-0005 have something specific to implement against.

This ADR is silent on, and does not resolve, the Product Constitution's
Target Audience gap (exact age range, target markets). That is handled
separately in
[ADR-0007](./ADR-0007-target-audience-interim-posture.md), because it
is a distinct kind of decision (who the product is for) from this one
(how data must be engineered once collected).

**This ADR does not constitute legal advice or legal certification of
compliance with any law or regulation.** Every requirement below is an
engineering constraint derived from the ratified Constitution and
general knowledge of child-data-protection regimes (COPPA, GDPR/GDPR-K,
India's Digital Personal Data Protection Act). Where a requirement's
legal sufficiency has not been independently validated by qualified
legal counsel, it is explicitly marked **[LEGAL VALIDATION REQUIRED]**.
Documenting a requirement here is not equivalent to certifying that
Natkhat AI complies with any specific law.

## Decision

Every future database, authentication, storage, or AI-memory
implementation for Natkhat AI **must** satisfy the following
engineering requirements. Where a requirement conflicts with something
in this ADR, the
[Child Privacy & Safety Constitution](../constitution/product/child-privacy-and-safety-constitution.md)
controls — this ADR is subordinate to it, not a substitute for it.

### 1. Privacy by Default

Every record's default visibility/scope is private to the owning
family. No table, API response, or storage object may default to
public, shared, or cross-family visibility. Constitution §1.

### 2. Child-Data Minimization

Every field in every schema must have a documented purpose at the time
it is added (schema-level comment or accompanying module doc, per
`docs/modules/TEMPLATE.md`). Fields collected "for future use" without
a current, stated purpose are not permitted. Constitution §11.

### 3. Purpose Limitation

Data collected for one stated purpose (e.g., Leo's memory of a child's
interests) must not be reused for a different purpose (e.g.,
advertising, cross-product analytics, model training) without a new,
separately reviewed purpose declaration and, where the data is
child-derived, renewed parental consent. See §26–28 (model-provider
handling, training prohibition, advertising prohibition) for the
specific application of this rule to AI.

### 4. Parent Ownership / Control

The data model must have a first-class **Parent/Guardian** principal
type holding non-transferable ownership references to every **Child**
record it governs. Only the owning parent (or an explicitly authorized
co-parent) may read, write, export, or delete a child's records.
Natkhat AI itself never holds ownership of user-generated content.
Constitution §2.

### 5. Parental Consent Boundaries

A child identity cannot be created, and no child data may be collected,
without a preceding, verified parent account taking an explicit
consent action. Consent must be captured as an auditable event (who
consented, when, what was consented to, and which version of the
privacy terms was in effect). **[LEGAL VALIDATION REQUIRED]** — the
specific consent-capture mechanism's legal sufficiency as "verifiable
parental consent" under any applicable regime is not determined by
this ADR (see ADR-0007, §C).

### 6. Parent/Child Authorization Boundaries

Parent and Child are distinct principal types with distinct
capabilities. If a child ever has any session of their own, it must be
scoped so it cannot reach parent-only actions (billing, account
deletion, data export, sharing, consent changes). Every authorization
check must also be tenant/family-scoped (§17), not role-scoped alone —
a valid child-role token must still be rejected outside its own family.

### 7. Data Classification

All Natkhat AI data must be classified into at least these tiers, with
controls scaled to sensitivity:

| Tier                    | Examples                                                    | Baseline controls                                                                                 |
| ----------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Account/Identity        | parent email, auth credentials                              | Encrypted at rest/transit, standard access control                                                |
| Child Profile           | name, date of birth, avatar                                 | Encrypted at rest/transit, parent-only write                                                      |
| Sensitive Child Content | conversations, Leo memories, voice, images/photos, drawings | Encryption, tenant isolation, access logging, no third-party sharing, no model-training use (§27) |
| Growth/Progress         | achievements, growth reports                                | Private by default, parent export/correct                                                         |
| System/Operational      | audit logs, security logs                                   | Append-only, retained independently of user-content deletion (§22)                                |

### 8–13. Sensitive Child Content — per-category requirements

- **8. Conversations** — every row/record must carry a family/tenant
  identifier; isolation enforced at the data layer, not only in
  application code (§17). Constitution §8 ("mandatory").
- **9. Leo Memories** — encrypted at rest; version history retained per
  a parent-configurable window; parent-initiated deletion cascades to
  all derived/cached copies (embeddings, summaries, indexes); never
  used to train any shared or third-party model (§27). Constitution §6.
- **10. Voice** — encrypted at rest and in transit; access restricted
  to the owning family plus explicitly authorized processing (e.g.,
  transcription); raw-audio retention window minimized and
  configurable; no biometric identification use beyond the product's
  own declared feature scope without separate consent. Constitution §7.
- **11. Images/Photos** — same protection tier as voice; no permanent
  public CDN URLs — only signed, expiring, revocable access tokens
  (ties to §25 Safe Sharing); derived assets (thumbnails) inherit the
  source's access control. Constitution §7.
- **12. Drawings** — treated as child-generated creative content;
  private by default (§1); same protection tier as images.
- **13. Growth information** — private by default; never used for
  public leaderboards or cross-family comparison; exportable and
  correctable by the parent (§20, §19). Constitution §2, §10.

### 14. Encryption at Rest

All Sensitive Child Content data (Tier 3 above) must be encrypted at
rest, at minimum via the hosting provider's managed encryption
(Supabase/PostgreSQL at-rest encryption). Whether field-level or
application-level encryption is additionally required for the
highest-sensitivity fields (voice, images, Leo memory content) is an
open engineering design question to be resolved during Sprint 02
architecture design, not by this ADR. Constitution §12.

### 15. Encryption in Transit

TLS is mandatory for every client-to-API, API-to-database, and
API-to-storage connection. No unencrypted internal service-to-service
traffic once the architecture has more than one backend service.
Constitution §12.

### 16. Tenant/Family Isolation

Every table containing child or family data must carry a family/tenant
identifier, and isolation must be enforced at the database layer (e.g.,
PostgreSQL Row-Level Security), not solely in application-layer query
filters — so a single application bug cannot leak data across families.
This is a hard requirement for ADR-0004 implementation, not an
optimization to be added later. Constitution §8 ("Conversation
isolation is mandatory").

### 17. Retention

Every data category in the classification table (§7) must have a
documented retention period, or an explicit "retained until the parent
deletes it" policy. No data category may have indefinite retention
without a stated reason. System/operational logs (Tier 5) have their
own, typically longer, append-only retention distinct from user
content.

### 18. Deletion

Parent-initiated deletion must be supported per data category (§4,
Constitution §2, §6). "Deleted" must be precisely defined — e.g.,
immediate soft-delete followed by a bounded hard-delete window (exact
window to be set during Sprint 02 design, not fixed by this ADR).
Deletion requests are themselves audit-logged (§22).

### 19. Export

Parent-initiated export must produce a complete, portable copy of every
data category visible in the Privacy Dashboard (Constitution §10).
Export requests are audit-logged (§22).

### 20. Correction

Parents must be able to correct child profile and growth data directly.
Correction of AI-generated memory content (Leo memories) needs a
defined mechanism — e.g., a forget/override entry rather than silently
rewriting history — so the audit trail (§22) remains intact.

### 21. Backups and Deletion Propagation

Backups containing data a parent has since deleted must not defeat that
deletion indefinitely. A maximum backup-retention/purge window, after
which deleted data no longer exists in any backup, must be defined and
enforced. **This ADR flags the requirement but does not set the exact
window** — that is an open engineering decision for Sprint 02 backup
architecture design.

### 22. Auditability

Every access (read, write, delete, export, share) to Sensitive Child
Content data must be logged: who, what, when, which record. Audit logs
are append-only and are not deletable by the parent — they are the
system's record, distinct from the user-content deletion in §18.
Constitution §12.

### 23. Access Logging

Specifically for the Privacy Dashboard (Constitution §10): every access
to a shared link must be logged and visible to the parent who created
it. This is a specific instance of §22, called out because the
Constitution names it explicitly.

### 24. Safe Sharing

Per Constitution §4, every sharing feature must implement all six of:
preview before sharing, expiration date, optional password protection,
optional one-time links, link revocation, and access logging. These are
mandatory, not optional, before any sharing feature ships.

### 25. Search-Engine Non-Indexing

Every shared or otherwise public-facing URL must set `noindex`/
`nofollow` (or the equivalent) by default. A page becomes indexable
only through an explicit, separate "publish" workflow, distinct from
"share." Default sharing must never be crawlable. Constitution §5.

### 26. Model-Provider Data Handling

Per Constitution §14 (multi-provider architecture) and §13 (AI Model
Governance): any third-party AI/model provider integration must be
evaluated for its own data-handling, retention, and training-use terms
before integration. Provider selection must not create a technical
dependency that would block switching providers to meet a future
privacy requirement. **[LEGAL VALIDATION REQUIRED]** — provider
contracts/API terms must be reviewed to confirm they do not permit
using Natkhat AI's inputs to train the provider's own models, or that a
provider-level opt-out exists; this review has not been performed.

### 27. Prohibition on Unauthorized Model Training

Sensitive Child Content data (§8–12) must never be used to train any
shared, cross-customer, or third-party model. This is the default
posture and applies unless and until a separate, explicit, opt-in
parental consent mechanism is designed and legally validated — no such
mechanism exists today. Constitution §6, §7, §13.

### 28. Advertising / Profiling Prohibition

Leo memory and other child data must never feed advertising systems or
cross-context behavioral profiling (Constitution §6, explicit). No
analytics or advertising SDK may receive raw child content. If
aggregate or anonymized analytics are ever proposed, they require a
separate ADR demonstrating genuine anonymization, not merely
aggregation.

### 29. Secrets and Credentials

No secret is ever committed to the repository (already enforced by
`.env.example` convention and `.gitignore`). Production secrets are
managed via a dedicated secrets manager (GCP Secret Manager, per
`docs/sprints/sprint-01.md`, §26 Risk Register recommendation) — not
plain environment variables in CI configuration. A rotation policy must
be defined before production credentials exist.

### 30. Incident-Response Considerations

Before production launch, an incident-response plan must exist
covering: child-data breach detection, parent notification procedure
and timeline, a defined severity classification for privacy incidents,
and regulatory-notification triggers. **[LEGAL VALIDATION REQUIRED]** —
regulatory notification obligations and timelines differ by
jurisdiction (COPPA, GDPR, India's DPDP Act each impose different
requirements) and have not been determined. This ADR flags the
requirement; the plan itself is a later deliverable, not authored here.

## Legal Validation Required

The following items are explicitly **not** resolved by this ADR and
require formal legal review before Natkhat AI can claim compliance with
any specific regime:

1. Sufficiency of the consent-capture mechanism (§5) as "verifiable
   parental consent" under COPPA, GDPR-K, and India's DPDP Act — each
   regime's accepted methods differ.
2. Third-party AI/model provider data-handling and training-use terms
   (§26).
3. Regulatory breach-notification obligations and timelines by
   jurisdiction (§30).
4. Data-localization requirements under India's DPDP Act, if India is a
   target market (affects Supabase region selection for ADR-0004).
5. Whether any AI-driven feature (e.g., Leo's responses) constitutes
   "automated decision-making" triggering additional obligations under
   GDPR Article 22 or equivalents.
6. General applicability determination of COPPA, GDPR/GDPR-K, and
   India's DPDP Act to Natkhat AI — this depends on the target
   market/age-range decision in
   [ADR-0007](./ADR-0007-target-audience-interim-posture.md), which is
   itself not yet founder-ratified.

## Consequences

- This ADR satisfies ADR-0004's and ADR-0005's stated textual
  prerequisite ("until a dedicated data-privacy/compliance ADR exists
  and is accepted") — that specific blocker is cleared.
- It does **not** by itself authorize writing schema, migration, or
  authentication code. Implementation still requires: the Legal
  Validation items above to be addressed (or explicitly risk-accepted
  by the founder with legal input), and
  [ADR-0007](./ADR-0007-target-audience-interim-posture.md)'s open
  items resolved to the extent they affect the specific feature being
  built.
- Establishes binding engineering constraints that all future
  schema/API/infrastructure design must satisfy. Any deviation requires
  an amendment to this ADR (a new ADR that supersedes it), not a silent
  workaround at a lower layer.
- Introduces new open items to track in `PROJECT.md`'s Known Risks (see
  governance traceability update in the same change).

## Constitution Alignment

Directly implements the
[Child Privacy & Safety Constitution](../constitution/product/child-privacy-and-safety-constitution.md)
§1–§14 (cited by section throughout this ADR) and its Mandatory Security
Review Checklist. Aligned with the
[Product Constitution](../constitution/product/natkhat-ai-constitution.md)'s
"Safe & Responsible AI" principle and the Trust-Above-All amendment.
Aligned with the
[Engineering Constitution](../constitution/engineering/engineering-constitution.md)'s
Mandatory Engineering Review Gates (Privacy, Security, Parent Trust,
Child Safety) and Security-by-design standard. Nothing in this ADR
weakens, reinterprets, or supersedes any of the above — where this ADR
is silent or ambiguous, the Constitution controls.
