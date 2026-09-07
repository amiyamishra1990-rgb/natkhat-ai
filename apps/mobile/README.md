# mobile

Natkhat AI's Flutter mobile application. As of M28 (Sprint 06,
`docs/sprints/sprint-06.md`, §7), this app can authenticate a parent
via Firebase Authentication and shows a placeholder authenticated home
screen — there is still no child-facing UI (that's M29, not yet
authorized).

## Firebase configuration

This app initializes Firebase programmatically (`lib/main.dart`) from
compile-time `--dart-define` values rather than a generated
`firebase_options.dart` — no `flutterfire configure` has been run
against a real Firebase project for this app yet. Copy
`env.example.json` to `env.json` (gitignored, never commit real
values) and fill in the values for a Flutter app registered against
the same non-production dev Firebase project (`natkhat-ai-dev`,
ADR-0016) `apps/admin` and `apps/backend` already use:

```bash
flutter run --dart-define-from-file=env.json
```

| Key                            | Required | Notes                                                                 |
| ------------------------------- | -------- | ---------------------------------------------------------------------- |
| `FIREBASE_API_KEY`               | yes      | Per-platform Firebase app registration value.                          |
| `FIREBASE_APP_ID`                | yes      | Per-platform (Android/iOS have different app IDs).                     |
| `FIREBASE_MESSAGING_SENDER_ID`   | yes      | Shared across platforms within one Firebase project.                   |
| `FIREBASE_PROJECT_ID`            | no       | Defaults to `natkhat-ai-dev`.                                          |
| `BACKEND_API_URL`                | no       | Defaults to `http://localhost:3000`. Android emulator: use `http://10.0.2.2:3000` instead of `localhost` (documented Android-emulator networking quirk, not a Natkhat-specific choice). |

If the three required Firebase values are missing, the app fails
clearly with a visible configuration-error screen instead of silently
running with no authentication (same convention as
`apps/admin/lib/firebase-client.ts` and
`apps/backend/src/auth/firebase-admin.provider.ts`).

## Parent accounts

There is **no sign-up screen in this app**, deliberately. `apps/backend`
has never had an HTTP endpoint to create a `Parent`/`Family`/`Child` —
`identity-family.module.ts` (M14) and `firebase-auth.service.ts` (M15)
both say so explicitly ("no controller, no HTTP surface" / "Does not
create Parent records — that remains an identity-family concern
outside this milestone's scope"). Building one was out of this
milestone's scope (M28's kickoff explicitly excludes new backend
endpoints), so parent accounts are provisioned out-of-band for
test/synthetic use only — the exact same pattern `apps/admin`'s README
already documents for `AdminUser` rows ("provisioned out-of-band,
test/synthetic accounts only ... not an admin-invite/management flow").
A Firebase user with no matching `Parent.authIdentityRef` row can sign
in here successfully (Firebase has no concept of a Parent) but every
subsequent authenticated backend call will be rejected by
`ParentAuthGuard` (`UnknownParentIdentityError` → 401) until a `Parent`
row is created for that Firebase uid — currently only possible via
`ParentRepository.create(...)` directly (as `test/vertical-slice.e2e-spec.ts`
already does), not through any mobile flow.

## Testing

`test/` uses widget/unit tests only, run via `flutter test` (also run
in CI's `mobile` job, gated on `apps/mobile/**` changes). Screens never
call `package:firebase_auth` directly — they depend on the
`AuthGateway` interface (`lib/services/auth_gateway.dart`), and tests
substitute `test/fakes/fake_auth_gateway.dart`, a pure-Dart fake, so
these tests run in `flutter test`'s VM target without touching
firebase_auth's platform channels (which don't exist there).

No device-based Firebase integration test was added this milestone.
Two reasons: (1) the actual security-sensitive step — verifying a
Firebase ID token — already has a real-Firebase integration test on
the backend (`apps/backend/src/auth/firebase-auth.integration.spec.ts`,
`describeIfConfigured`-skipped without credentials); this app only
obtains and forwards a token, it never verifies one. (2) unlike that
backend pattern (a skipped-but-present Jest test that still executes,
and skips, inside the normal `pnpm test` run), a Flutter test that
signs in against a real Firebase project needs the `integration_test`
package plus a connected device/emulator — a fundamentally different
invocation from `flutter test`'s VM target, and CI's `mobile` job
(`.github/workflows/ci.yml`) runs only `flutter analyze`/`flutter test`
with no device. Adding one now would be inert scaffolding nothing
actually runs. Flagged here rather than silently omitted; revisit if a
device/emulator lane is ever added to CI.

## Development

```bash
pnpm --filter backend dev   # optional, for the home screen's "check backend connection" button
flutter run --dart-define-from-file=env.json
```

## Getting Started (Flutter scaffold docs, unchanged)

This project is a starting point for a Flutter application.

A few resources to get you started if this is your first Flutter project:

- [Learn Flutter](https://docs.flutter.dev/get-started/learn-flutter)
- [Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Flutter learning resources](https://docs.flutter.dev/reference/learning-resources)

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples, guidance on mobile development, and a full API reference.
