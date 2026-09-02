# Sprint 06 — Leo's Real Experience: Kickoff Planning Pass

**Version:** 1.1.0
**Status:** Founder Decisions H.1–H.8 Recorded (§6). Milestone 26
(Sprint 05 Close-Out & Governance Sync) authorized and in progress.
Milestones 27–30 remain **not yet authorized** — each requires its own
separate, explicit founder go-ahead once the milestone before it is
merged and verified.
**Owner:** Engineering
**Last Updated:** 2026-09-02

> This document is a **planning pass only**, per the founder's kickoff
> instruction. It follows the same discipline every prior sprint
> document has: read first, separate what governance/research already
> decides from what needs an explicit founder decision, and do not
> invent product specification. No Flutter/UI code, screen, component,
> or implementation branch was created while producing this document.

---

## 0. Context

Sprints 01–05 are complete — all 25 milestones (M1–M25) merged into
`main`. `main` was synced to `origin/main` (fast-forwarded,
`e08608d` → `5187664`) at the start of this planning pass; HEAD
(`5187664`, "Merge pull request #27 from
`feat/sprint05-m25-admin-auth`") includes Sprint 05 Milestone 25
(Admin Authentication for Audit-Log Endpoint). Working tree is clean.

**A governance-sync gap was found while preparing this document,**
same category as the gaps §0 of `sprint-04.md` and `sprint-05.md` each
found and flagged (not fixed) before proposing new scope: `PROJECT.md`
(line 1661) still reads "PR open off `feat/sprint05-m25-admin-auth`...
not yet merged, awaiting founder review" for M25. That PR (#27) has
since merged into `main`. `PROJECT.md` was not updated in the same PR
that merged M25, so it is currently stale by this one fact, the same
class of gap M21/M24 each existed to close. This document does not fix
it — a dedicated governance-sync milestone is the established pattern
(see §7, proposed M26) and this planning pass does not have founder
authorization to edit `PROJECT.md` unilaterally.

Every piece of engineering scaffolding built so far is real: identity/
family/child data model with tenant isolation (M14), authorization and
sessions (M15), lifecycle/audit (M16), a consent scaffold (M17), Leo's
memory foundation with per-child/per-family isolation (M18), an
AI-provider boundary running only a mock adapter (M19), a first
end-to-end vertical slice (M20), and Leo-chat authorization (M23).
What does not exist yet is anything a child actually sees or talks to.

## 1. Governance Checkpoint (recap, not restated authority)

| Item                                        | Status                                                                                                                                                        |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sprint 01–04 (M1–M23)                       | Complete, permanently merged (`main`)                                                                                                                         |
| Sprint 05 M24 (Governance Sync)             | Complete, merged (PR #26)                                                                                                                                     |
| Sprint 05 M25 (Admin Auth for Audit-Log)    | Complete, merged (PR #27) — **`PROJECT.md` not yet updated to reflect this; see §0**                                                                          |
| ADR-0009 item 7 (child-login/child-session) | Untouched, its own separate, not-yet-opened decision — **remains excluded from this sprint**, per kickoff instructions                                        |
| ADR-0013 (AI-Provider Boundary)             | Still **Proposed** — no real provider selected; **this sprint builds against the mock adapter only**, per kickoff instructions                                |
| ADR-0007 §D (target audience)               | India, single market, ages 4–10 — founder-ratified for engineering-compliance purposes; not a legal DPDP-sufficiency certification                            |
| `docs/product/`, `docs/research/`           | Both still literal placeholders ("Status: Placeholder — not yet started" / "no research recorded yet," unchanged since 2026-07-29) — see §2, critical finding |

This table is a pointer, not a new authority — if it disagrees with
`PROJECT.md` or an ADR, those win.

---

## 2. Research Documents: What Was Found vs. What the Kickoff Expected

**This is the central finding of this planning pass.** The kickoff
brief names seven specific product/research documents to read in full
before proposing scope: Leo Personality & Conversation Constitution,
Leo Relationship Blueprint, Character Development Blueprint, Natkhat
AI Experience Blueprint, Childhood Memory Architecture, Better Human
Framework, Parent Playbook. **None of these documents exist anywhere
in this repository.** A repo-wide, case-insensitive search for
"Blueprint," "Personality," "Relationship Blueprint," "Better Human
Framework," "Parent Playbook," "Character Development," and "Childhood
Memory Architecture" returns exactly one hit, in an unrelated Xcode
scheme file (`apps/mobile/ios/.../Runner.xcscheme`) — not a document.

The two folders that would be expected to hold this material are both
still literal, unpopulated placeholders, last touched at Sprint 01:

- `docs/product/README.md` — "**Status:** Placeholder — not yet
  started... Reserved for product roadmaps and feature specs...
  empty until product work begins."
- `docs/research/README.md` — "**Status:** Placeholder — no research
  recorded yet... Empty as of Sprint 01, Milestone 1."
- `docs/knowledge/*/README.md` (all eight categories, including
  `ai-agent-learnings`) — "Active — structural placeholder, no entries
  yet (intentional at Sprint 01 start)," still unchanged.

What **does** exist and **is** governance-authoritative on the Leo
experience:

| Document                                                             | What it actually establishes                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/constitution/product/natkhat-ai-constitution.md`               | Nine binding Core Principles (Human-first, Parent partnership, Better Human before Better Student, Childhood memories matter, Safe & Responsible AI, Long-term thinking, No addictive engagement, No replacing parents, Strengthen real-world family relationships) — **names only**, "One-line definitions have not yet been authored and must not be invented." No five-pillar feature filter or product-principle elaboration exists beyond these nine names. |
| `docs/constitution/product/child-privacy-and-safety-constitution.md` | Privacy/safety requirements (private-by-default, parent ownership, Leo memory protection, conversation isolation, AI model governance). Says nothing about personality, tone, conversation style, or visual/character design.                                                                                                                                                                                                                                    |
| `docs/modules/leo-companion/README.md` (ADR-0012)                    | Data/isolation architecture only — `Conversation`/`Message`/`LeoMemory` entities, three-class memory model, deletion cascades, authorization mapping. Explicitly "designs no AI/LLM integration... no companion experience itself."                                                                                                                                                                                                                              |
| `docs/architecture/ai-provider-boundary.md` (ADR-0013)               | The provider-neutral request contract has a `system_instructions` field described only as "Leo's personality/behavioral instructions and safety constraints, expressed in provider-agnostic terms" — a placeholder slot in the schema, not actual personality content. No tone/voice/style is specified anywhere in this document.                                                                                                                               |
| `docs/decisions/ADR-0007-target-audience-interim-posture.md` §D      | India, single market; ages 4–10 (founder business decision, not a legal certification).                                                                                                                                                                                                                                                                                                                                                                          |

**Conclusion:** the kickoff brief's premise that "this project already
did substantial product research" on Leo's personality, relationship
model, character design, or a defined first-experience is not
supported by the repository. `docs/product/`, `docs/research/`, and
`docs/knowledge/ai-agent-learnings/` were checked directly, not
assumed empty from a prior sprint record. **Nothing about Leo's tone,
voice, personality traits, conversational style, visual/character
design, or a named "MVP experience" can be cited from research —
because no such research exists in this repo.** Anything in §5 below
that touches those topics is flagged as a founder decision (§6), not
inferred from documents that don't exist.

## 3. Current `apps/mobile` State

`apps/mobile` is exactly the default `flutter create` output plus
Sprint 01 tooling wiring — confirmed by reading every file in
`apps/mobile/lib/` and `apps/mobile/test/`:

- `lib/main.dart` (123 lines) — the stock Flutter counter-app demo
  (`MyApp` / `MyHomePage`, a `FloatingActionButton` incrementing
  `_counter`). Every comment in the file is the Flutter generator's own
  tutorial commentary, untouched.
- `test/widget_test.dart` — the stock generator test for the counter
  widget.
- No custom screens, routes, navigation, theming, state management,
  or design system of any kind.
- No HTTP client, no Firebase SDK, no auth flow, no API call, no
  environment config pointing at `apps/backend` — **zero wiring to any
  backend endpoint.** `apps/mobile` cannot currently authenticate a
  parent, create a family/child, or reach the Leo module in any way.
- `pubspec.yaml` declares no dependencies beyond the Flutter/Cupertino
  defaults (`flutter`, `cupertino_icons`) — no `firebase_auth`,
  `http`/`dio`, `provider`/`riverpod`, or similar.

This confirms the kickoff's own framing: `apps/mobile` is scaffold
only, not experience.

## 4. Current Backend State the Mobile App Could Wire To

`apps/backend/src/leo/leo.service.ts` (M18/M23) implements
`startConversation`, `appendMessage`, `listMessages`,
`addMemory`/`correctMemory`/`addToVault`/`listActiveMemories`, each
gated by the M23 `interact_with_leo` authorization action. Two gaps
matter directly for Sprint 06 scoping, verified by reading the module
and grepping for a controller:

1. **No HTTP controller exists for the Leo module at all.** Every
   other implemented module with an API surface (`audit`, `admin-auth`)
   has a `*.controller.ts`; `apps/backend/src/leo/` has none. There is
   currently no `POST /leo/conversations` or equivalent route a mobile
   client could call — `LeoService` is only ever instantiated directly,
   inside `apps/backend/test/vertical-slice.e2e-spec.ts`.
2. **`LeoService.appendMessage` never calls the AI-provider boundary.**
   It persists whatever `sender`/`content` the caller passes — it does
   not generate a Leo reply. The only place `AdapterRegistry` +
   `MockAiProviderAdapter` (M19) and `LeoService` (M18) are exercised
   together is that same e2e test, which manually wires both in
   sequence for test purposes — not production code, not a real
   request/response loop.

**Consequence for scoping:** "a synthetic child can talk to Leo end to
end using fake responses" (one of the kickoff's candidate slices) is
not just a mobile-screen problem — it requires new backend work first
(a Leo controller, and wiring `appendMessage` or an equivalent flow to
actually call `AdapterRegistry.execute()` and store the mock reply as
a `Message`). This is real, scoped, buildable work grounded in what
exists — not invented — but it was not obviously "already wired" the
way the kickoff brief's phrasing ("wired to the existing mock-adapter
Leo backend") could be read to imply.

---

## 5. Scope Boundary (draft)

### 5.1 Confirmed by existing governance/architecture (not product taste)

- Mock adapter only (ADR-0013, kickoff instruction) — no real
  Anthropic/OpenAI/Google call, regardless of what any future
  personality research might specify.
- Parent-authenticated-principal model only (ADR-0009 item 7 excluded)
  — any child-facing screen is reached through a parent's
  authenticated session, not an independent child login.
- `interact_with_leo` authorization (M23) governs who may start/append
  to a conversation — already implemented, reusable as-is.
- Three-class memory model (Active Relationship / Version History /
  Permanent Vault, ADR-0012) governs any memory surfaced to a parent or
  child — already implemented, reusable as-is.
- Age range 4–10, India-only (ADR-0007 §D) — the audience any UI
  decision must be evaluated against.
- Nine Core Principles (§2 above) are binding but have no elaborated
  definition to build a "feature filter" from beyond their names.

### 5.2 Recommended candidates for founder consideration (evaluated against research, not backed by it)

None of the kickoff's four candidate slices is "confirmed" by research,
because no product-experience research exists (§2). Evaluated only
against what governance/architecture supports:

- **Backend Leo-chat API + mock-reply wiring** (§4, items 1–2) —
  buildable purely from existing architecture docs (ADR-0012,
  ADR-0013), no product-taste decision required. The most
  research-independent candidate.
- **A basic chat/conversation screen wired to that API** — buildable
  once the API exists; needs only minimal UI decisions (a message
  list, a text input) that don't require Leo's personality to be
  defined, since the mock adapter's canned response
  (`"Fictional canned response for task_type..."`) is explicitly
  non-representative placeholder text, not Leo's voice.
- **A child-facing home/companion screen showing Leo** — plausible as
  a concept from the module name ("Leo Companion") and the Product
  Constitution's mission language, but the actual visual
  presentation (what a "home screen showing Leo" looks like) has zero
  supporting spec in the repo. Buildable only as a placeholder-art
  shell pending §6, H.3.
- **Leo's personality/tone/voice rules reflected in response styling**
  — **not buildable from anything in this repo.** No personality, tone,
  or voice rule is defined anywhere (§2). Recommending this as in-scope
  would require the founder to either supply that specification now or
  authorize engineering to draft a placeholder one for review — this
  document does neither.

### 5.3 Gated on founder product judgment (not resolvable from research)

Per the kickoff's explicit instruction not to guess at product taste:

- Visual/art style and character design for Leo.
- Voice/sound — explicitly future work per the kickoff brief itself;
  confirmed here as still out of scope.
- Any specific screen flow beyond "some screen exists" — no flow is
  specified anywhere.
- How the 4–10 age range is handled in one experience (a 4-year-old
  and a 10-year-old are different UI/reading-level/interaction
  populations; no repo document addresses this).
- Whether "Leo's real experience" means chat-first, or something else
  (a game, a story mode, etc.) — the kickoff brief itself frames chat
  as one candidate among several, not a decision.
- Whether mobile-side parent authentication (Firebase sign-in in
  `apps/mobile`, mirroring what `apps/admin` already has) is Sprint 06
  scope or a separate prerequisite milestone — no screen can be
  "parent-authenticated" today because `apps/mobile` has no auth flow
  at all (§3).

### 5.4 Explicitly excluded regardless of milestone (carried forward, unchanged)

- Real AI-provider integration (Anthropic/OpenAI/Google) — ADR-0013
  remains Proposed; separately paused per founder decision.
- Child-login/child-session (ADR-0009 item 7) — its own, separate,
  not-yet-opened decision.
- Any real parent/child/family data, any production deployment.
- Storage implementation (Google Cloud Storage) — decision recorded
  (ADR-0016 amendment, 2026-08-31), no implementation authorized.

---

## 6. Founder Decisions (2026-09-02)

Numbered starting at H.1, continuing the F.1–F.6 (Sprint 04) / G.1–G.5
(Sprint 05) sequence. All eight recorded by the founder in one pass;
outcomes below.

- **H.1 — Research gap. Decided: let engineering draft a proposal
  first.** A first-pass Leo Character & Conversation Brief has been
  written and sent to the founder separately for review/edit (outside
  this repository, referenced as `leo-character-brief-draft.md`). It is
  **not yet approved** and is explicitly **not filed into this repo by
  M26** — once approved in whatever final form, filing it at
  `docs/product/leo-character-brief.md` is candidate scope for M29, not
  before.
- **H.2 — First slice. Decided: M27** (the backend Leo-chat API +
  mock-reply wiring) — confirmed as the starting point, since it is the
  one candidate buildable regardless of how H.1/H.3/H.5 eventually
  land.
- **H.3 — Visual/art style. Decided: placeholder for now.** Build with
  simple, generic placeholder UI/art; real character art is deferred to
  a future, separately-authorized decision once the founder has a
  designer or direction.
- **H.4 — Voice/sound. Decided: confirmed, remains future work.**
  Unchanged from the kickoff brief's own framing.
- **H.5 — Age-band handling. Decided: one simple experience for now.**
  A single, straightforward experience is built first; splitting by age
  band (4–10 is a wide range) is deferred to a later, separately
  authorized milestone.
- **H.6 — Leo HTTP API surface. Decided: yes.** Authorized as M27
  (below) — pure plumbing, independent of every product-taste question
  above.
- **H.7 — Mobile parent-auth prerequisite. Decided: yes, as its own
  milestone (M28), authorized after M27 completes** — `apps/mobile`
  currently cannot authenticate anyone (§3), and nothing else can be
  built against it until it can.
- **H.8 — Governance-sync milestone. Decided: yes, folded into M26**
  (below) — same pattern as every prior sprint's opening milestone.

---

## 7. Milestone Breakdown

Numbering continues at M26. Only M26 is authorized; M27–M30 each
require their own separate, explicit founder go-ahead once the
milestone before them is merged and verified, per §6 and this
project's standing one-milestone-at-a-time discipline.

### M26 — Sprint 05 Close-Out & Governance Sync _(authorized 2026-09-02 by H.8; in progress)_

Bring `PROJECT.md` back in sync with M25's actual merged state (PR
#27), mirroring M21/M24's own role. Documentation only, no code.

### M27 — Leo-Chat API Surface & Mock-Reply Wiring _(authorized by H.2/H.6; not yet started — begins once M26 merges)_

New `apps/backend/src/leo/leo.controller.ts` exposing
`startConversation`/`appendMessage`/`listMessages` behind the existing
M23 `interact_with_leo` authorization gate (reused, not redesigned).
`appendMessage` (or a new orchestration method) calls
`AdapterRegistry.execute()` against the mock adapter and persists the
returned canned response as a Leo-sender `Message`, proving the loop
end to end.

### M28 — Mobile Parent Authentication _(authorized by H.7; not yet started — begins once M27 merges)_

Firebase sign-in flow in `apps/mobile`, mirroring `apps/admin`'s
existing `lib/firebase-client.ts`/session pattern where applicable to
Flutter. Prerequisite for any screen that calls an authenticated
backend endpoint.

### M29 — Child-Facing Screen(s) _(scope gated on H.1's brief being approved and H.3/H.5's placeholder-art/single-experience decisions; not yet authorized to start — depends on M27–M28)_

A single, straightforward child-facing screen (or minimal set), built
with placeholder UI/art per H.3, for the single age-band-agnostic
experience per H.5. Filing the approved Leo Character & Conversation
Brief into `docs/product/leo-character-brief.md` is candidate scope
here, not before (§6, H.1) — this milestone does not start until the
founder has approved that brief and separately authorized M29 itself.

### M30 — Sprint 06 Close-Out & Governance Sync

Standard close-out, mirroring every prior sprint's own final milestone.

---

## 8. Legal/Privacy Validation Required (unchanged, carried forward)

None of Sprint 03–05's five open legal/privacy items are resolved,
narrowed, or affected by anything in this document:

1. India DPDP Act legal sufficiency of the signed/e-signed consent-form
   design.
2. Selection and legal review of an AI provider's contract terms.
3. India DPDP data-localization confirmation.
4. Regulatory breach-notification obligations and timelines (governs
   ADR-0015 §13.3's provisional 3-year Tier-5 retention period).
5. Whether AI-driven Leo responses constitute "automated
   decision-making" under a GDPR Article 22 equivalent (not currently
   operative — India-only launch).

---

## 9. Sprint 06 Definition of Done (draft)

Not final until H.1–H.8 are answered. Provisionally: a new engineer or
AI agent can clone the repo, read `PROJECT.md` → Constitutions → ADRs
→ this document (once finalized) → the relevant module doc, and
`PROJECT.md` accurately reflects Sprint 05 (through M25) as merged
(§0/H.8). Whatever milestone subset is authorized from §7 builds only
against the mock AI adapter, only within the parent-authenticated
principal model, and introduces no child-login/child-session. No real
parent, child, or family data exists anywhere. No production
environment is active. No AI-provider selection has been made or
assumed. No visual/personality specification is presented as final
where §6 marks it founder-gated and unresolved.

---

## Next Step

**Founder Decisions H.1–H.8 (§6) are recorded.** This document's job of
surfacing every open question for the founder is done, the same role
`sprint-04.md` and `sprint-05.md` played before their own F.1–F.6 /
G.1–G.5. Per this project's standing governance discipline: **M26 is
authorized and in progress** (this PROJECT.md correction pass, branch
`docs/sprint06-m26-governance-sync`). M27–M30 each remain **not yet
authorized** — each requires its own separate, explicit founder
go-ahead once the milestone before it is merged and verified, per §7.
