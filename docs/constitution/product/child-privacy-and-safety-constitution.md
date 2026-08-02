# Child Privacy & Safety Constitution (Trust-by-Design)

**Version:** 1.0
**Status:** APPROVED
**Priority:** CRITICAL
**Authority:** Product Constitution Amendment
**Owner:** Product Owner
**Last Updated:** 2026-07-29
**Position in Governance Hierarchy:** Tier-1 — a Product Constitution
Amendment. Sits at the same authority level as
`docs/constitution/product/natkhat-ai-constitution.md`: below the
ASPOVO Constitution, above the Engineering Constitution, ADRs,
PROJECT.md, and Sprint Documents. See `docs/sprints/sprint-01.md`, §1,
for the full hierarchy. Effective immediately; applies to all
engineering work.

---

Natkhat AI is fundamentally different from general AI assistants. It
is a trusted childhood companion. Parents entrust Natkhat AI with
their child's conversations, memories, emotions, drawings, voice
recordings, achievements, and personal growth. Therefore, Natkhat AI
must exceed current industry standards for privacy, safety, and
parental trust. This directive is effective immediately and applies to
all engineering work.

## Engineering Principle

**Every feature must preserve parental trust.** If a feature improves
engagement but weakens privacy, child safety, or parental confidence,
**the feature must not be shipped until redesigned.**

## Mandatory Engineering Requirements

### 1. Privacy by Default

Everything created inside Natkhat AI is private. Default state:

- Private conversations
- Private memories
- Private drawings
- Private stories
- Private voice recordings
- Private photos
- Private growth reports

Nothing is public automatically.

### 2. Parent Owns the Child's Data

Parents remain the owners of their child's information. Parents can:

- View stored information
- Export information
- Correct information
- Delete information
- Control sharing permissions

Natkhat AI never assumes ownership of user-generated content.

### 3. No Public Profiles

Natkhat AI must never create:

- Public child profiles
- Searchable child pages
- Public activity feeds
- Public achievements
- Public AI conversations

### 4. Safe Sharing System

If parents intentionally share content, the system must support:

- Preview before sharing
- Expiration date
- Password protection (optional)
- One-time links (optional)
- Link revocation
- Access logging

### 5. Search Engine Protection

Every shared page must be protected against indexing by default.
Shared content must never become searchable on Google or other search
engines unless the parent explicitly publishes it through a dedicated
publishing workflow.

### 6. Leo Memory Protection

Leo's memory system is one of Natkhat AI's most valuable assets.
Requirements:

- Encrypted storage
- Version history
- Secure backup
- Parent-controlled deletion
- Parent-controlled export

Leo remembers only for the benefit of the child—not for advertising,
profiling, or resale.

### 7. Voice & Image Security

Children's voice and image data require enhanced protection.
Requirements:

- Encryption
- Strict access controls
- Secure deletion
- No unauthorized AI training
- No public exposure

### 8. AI Conversation Security

Conversations must never leak across:

- Users
- Families
- Devices
- Organizations

Conversation isolation is mandatory.

### 9. Session & Device Security

Parents can:

- View active devices
- Remove devices
- End sessions remotely
- Review login history

### 10. Privacy Dashboard

Every parent should have access to a Privacy Dashboard showing:

- Stored data
- Shared links
- Connected devices
- Permissions
- Download options
- Delete options
- Account security status

### 11. Child Data Minimization

Collect only the minimum information required to deliver the intended
experience. Every additional field must have a documented
justification.

### 12. Secure Development Standards

The engineering team shall implement:

- Secure authentication
- Authorization checks
- Encryption at rest
- Encryption in transit
- Audit logging
- Secret management
- Rate limiting
- Secure API design
- Regular security reviews

Security is part of the architecture—not an afterthought.

### 13. AI Model Governance

AI models used by Natkhat AI must never:

- Expose another child's data
- Reveal internal prompts
- Leak confidential information
- Store unnecessary personal information
- Generate unsafe outputs for children

Safety filters are mandatory.

### 14. Future AI Architecture

The architecture must remain compatible with:

- Multiple AI providers
- Self-hosted models
- Local inference where appropriate
- Model replacement without rewriting the product

Natkhat AI must never become dependent on a single AI provider.

## Mandatory Security Review Checklist

Every new feature must answer "YES" before release:

- ✓ Does this strengthen parental trust?
- ✓ Is the child's information protected?
- ✓ Is the feature private by default?
- ✓ Can parents fully control the data?
- ✓ Can access be revoked immediately?
- ✓ Is search engine indexing prevented?
- ✓ Is every API secure?
- ✓ Is every sensitive action audited?
- ✓ Does this comply with Natkhat AI's Product Constitution?

If any answer is **NO**, the feature returns to design and is not
released. The full engineering-facing version of this checklist,
covering every release (not only features touching children directly),
is `docs/engineering/review-checklist.md`.

## Product Constitution Amendment

The following principle is permanently added to the Natkhat AI
Constitution (see
`docs/constitution/product/natkhat-ai-constitution.md`):

> Parents trust Natkhat AI with what they value most—their child.
> Every technical, product, and business decision must protect that
> trust above growth, engagement, convenience, or revenue. Trust is
> our competitive advantage and must never be compromised.

## Amendment

This is a Tier-1 Product Constitution Amendment. Further changes
follow the same Change Request Process as the Product Constitution
(Proposal → Review → Decision → ADR or Decision Log → PROJECT.md
update → Implementation). No principle, requirement, or checklist item
here may be weakened by a lower layer (an ADR, PROJECT.md, or a Sprint
Document) — only by an explicit amendment at this layer.
