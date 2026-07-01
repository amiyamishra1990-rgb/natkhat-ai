# Natkhat AI — Product Requirements (Iteration 1)

## Vision
Natkhat AI is a phygital educational mobile app for Indian children (4–10, optimised for 4–6). Leo the Caretaker is a warm, maternal AI persona who responds with a funny cartoon analogy + a real-world physical mission the child must complete to earn XP.

## Iteration 1 scope (delivered)
Step 1 (Backend + all API routes) and Step 2 (Onboarding flow + Home shell) from the master spec.

### Backend (FastAPI + MongoDB)
Routes under `/api`:
- `GET  /` – health check
- `GET  /portals` – portal metadata, levels, bhashas
- `POST /auth/otp/send` – mock OTP (accepts any 10-digit mobile, returns 123456)
- `POST /auth/otp/verify` – creates/loads parent, returns parent + existing child
- `POST /child/profile` – creates child profile (unlocks 3 free portals)
- `GET  /child/{id}` – fetches child + level_info + streak refresh
- `POST /child/seen-intro` – marks Leo intro seen
- `POST /leo` – **Claude Sonnet 4.5 via Emergent LLM key**, Anthropic-shape response, safety pre-gate blocks dangerous keywords before hitting the LLM
- `POST /tts`, `POST /stt`, `POST /vision`, `POST /safety/camera`, `POST /emotion` – provider adapters (stubbed until keys arrive)
- `POST /session/log`, `POST /mood/log`, `POST /safety/alert`, `POST /mission/verify`
- `POST /payment/create`, `POST /payment/verify` – Razorpay stubs; verify unlocks portals in DB
- `GET  /dashboard/{child_id}` – parent dashboard aggregate

Collections: `parents`, `child_profiles`, `session_logs`, `mood_diary`, `safety_alerts`, `mission_verifications`, `badges`, `otp_codes`.

### Frontend (Expo Router, dark theme)
Screens:
- `index.tsx` – auth-state router (parent → child → intro → home)
- `splash.tsx` – 2.6 s animated Leo splash with tagline
- `login.tsx` – parent name / mobile / email → OTP verify
- `child-profile.tsx` – name input, age bubbles (4–10), 12-language bhasha grid
- `leo-intro.tsx` – "Leo aa gaya!!" tap-nose interaction with confetti
- `home.tsx` – sticky header (name, streak, XP bar, level title), 2-col portal grid with FREE / PAID / 🔒 states

Components:
- `LeoFace` – circular animated face, 5 emotion states, floating bob, rotating sparkle ring, press-scale
- `XPBar` – gradient fill with next-level hint
- `PortalCard` – gradient card, badge, XP chip, blurred lock overlay

## Integrations
- **LLM:** Emergent Universal Key → Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`) for Leo's brain
- **Auth:** Mock OTP (dev). Firebase Phone OTP planned for native build.
- **TTS / STT / Vision / Rekognition / Hume / Razorpay / R2:** adapter stubs behind env vars — swap in real calls the moment keys are provided

## Iteration 2 additions (delivered)
- **Portal 1 (Question Portal) session UI** — chat-style Leo interaction with animated bobbing Leo, emotion state changes (excited→thinking→happy→proud), suggested prompts, real Claude Sonnet 4.5 responses via `/api/leo`, "I did the mission!" CTA that logs the session, awards XP, and triggers a **+XP burst animation**
- **Payment popup sheet** — blurred bottom-sheet with 3 plans (portal_70 / all_399 / sixmonth_1999), BEST VALUE badge, calls `/api/payment/create` + `/api/payment/verify` and instantly unlocks the portal
- **Level-up modal** — full-screen celebration with confetti, proud Leo, gradient card, fires automatically when XP crosses the level threshold
- **Splash timing fix** — extended to 3.4 s so tagline "Screen time? Nahi beta — Room time!" reads cleanly
- New route: `/portal/[id]` (dynamic portal session for question / toystory / glitch)
- Reusable components: `PaymentSheet`, `LevelUpModal`

## What's next (deferred)
- Portal-specific mechanics for Toy Story (camera scan) and Story Machine (glitch alarm + counting)
- Voice mic input + Sarvam TTS playback (needs SARVAM_API_KEY)
- Bottom-tab navigation shell (Home / Portals / Bhasha / Parent)
- Parent Dashboard (activity feed, mood heatmap, radar, verification inbox, badges, safety alerts)
- FCM push notifications (Emergent-managed)
- Feeling Finder + mood diary UI
- Camera pipelines (Rekognition → Vision) — needs AWS + Google keys
- Real Firebase Phone OTP at native build time
- Razorpay live checkout
