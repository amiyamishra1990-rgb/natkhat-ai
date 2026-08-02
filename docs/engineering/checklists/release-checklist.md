# Release Checklist

**Version:** 1.0.0
**Status:** Active
**Owner:** Engineering
**Last Updated:** 2026-07-30

Applied before any release is cut, per the Engineering Constitution's
Release strategy standard and
[`versioning.md`](../versioning.md).

- [ ] [`review-checklist.md`](../review-checklist.md) — the mandatory
      Privacy/Security/Parent Trust/Child Safety gates plus Search
      Engine Protection, Encryption, Parent Data Ownership, AI Safety,
      and Product Constitution Compliance — is fully answered YES for
      every feature included in this release.
- [ ] [`security-checklist.md`](./security-checklist.md) is fully
      answered YES.
- [ ] Version bumped correctly across every applicable layer in
      [`versioning.md`](../versioning.md) (repository, API, mobile, as
      applicable to this release).
- [ ] `docs/decisions/decision-log.md` and/or the relevant ADR is
      updated for any decision this release embodies.
- [ ] `PROJECT.md` reflects the release in Current Release, Build
      Status, and Change Log.
- [ ] CI is green on the release branch/tag (lint, typecheck, test,
      build — `docs/sprints/sprint-01.md`, §16).
- [ ] A rollback plan is documented for this release.
- [ ] No feature flag is left permanently wrapping code that is now
      fully and stably rolled out — either the flag is removed or its
      continued existence is justified in
      [`feature-flags.md`](../feature-flags.md).

**Any unchecked item blocks the release.**
