# Security Checklist

**Version:** 1.0.0
**Status:** Active
**Owner:** Engineering
**Last Updated:** 2026-07-30

Applied to any change touching authentication, authorization, data
storage, an external integration, or child/parent data. Implements
[`security-by-design.md`](../security-by-design.md) and the Child
Privacy & Safety Constitution's Mandatory Security Review Checklist.

- [ ] Least privilege applied to any new service account, role, or
      permission scope.
- [ ] Secrets are never committed; they live in GCP Secret Manager (or
      the equivalent local `.env`, excluded via `.gitignore`).
- [ ] Encryption at rest and in transit confirmed for any new data
      path.
- [ ] Every new PII or child-data field has a documented justification
      (Data Minimization — Child Privacy & Safety Constitution, item
      11).
- [ ] Dependencies reviewed for known vulnerabilities (manually until
      automated scanning/SBOM tooling exists — no such tooling is
      implemented in Sprint 01).
- [ ] Audit logging present for every sensitive action (login,
      export, delete, sharing, permission change).
- [ ] The Engineering Constitution's Mandatory Engineering Review
      Gates (Privacy, Security, Parent Trust, Child Safety) are all
      answered YES — see
      [`review-checklist.md`](../review-checklist.md).
- [ ] The Child Privacy & Safety Constitution's Mandatory Security
      Review Checklist (nine items, see
      `docs/constitution/product/child-privacy-and-safety-constitution.md`)
      is fully answered YES.
- [ ] Rate limiting applied to any new public-facing endpoint.
- [ ] No AI-mediated feature merges without a `content-safety` package
      or equivalent ADR (`docs/sprints/sprint-01.md`, §26).

**Any "NO" blocks the change from proceeding past design.**
