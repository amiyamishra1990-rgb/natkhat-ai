// M28 (docs/sprints/sprint-06.md, §7; ADR-0016). Compile-time
// configuration via `--dart-define`/`--dart-define-from-file`, the
// same pattern apps/admin uses at runtime with NEXT_PUBLIC_* env vars
// (lib/firebase-client.ts) — no new config-loading package added for
// a handful of values. See env.example.json for the dart-define-file
// template; real values are never committed (env.json is gitignored).
//
// FIREBASE_PROJECT_ID defaults to the same non-production dev project
// (`natkhat-ai-dev`) apps/backend and apps/admin already point at
// (ADR-0016) — test/synthetic parent accounts only. The other Firebase
// fields have no safe default (they are per-platform app registration
// values) and are left blank so `isFirebaseConfigured` fails clearly
// rather than silently pointing at a project this app was never
// registered against.
class Env {
  const Env._();

  static const String firebaseApiKey = String.fromEnvironment('FIREBASE_API_KEY');
  static const String firebaseAppId = String.fromEnvironment('FIREBASE_APP_ID');
  static const String firebaseMessagingSenderId = String.fromEnvironment(
    'FIREBASE_MESSAGING_SENDER_ID',
  );
  static const String firebaseProjectId = String.fromEnvironment(
    'FIREBASE_PROJECT_ID',
    defaultValue: 'natkhat-ai-dev',
  );

  // Where apps/mobile reaches apps/backend. Defaults to the same
  // localhost:3000 apps/admin's BACKEND_API_URL defaults to
  // (apps/admin/.env.example) — an Android emulator must override this
  // to http://10.0.2.2:3000 (documented in README.md), a physical
  // device to the host machine's LAN address.
  static const String backendApiUrl = String.fromEnvironment(
    'BACKEND_API_URL',
    defaultValue: 'http://localhost:3000',
  );

  static bool get isFirebaseConfigured =>
      firebaseApiKey.isNotEmpty &&
      firebaseAppId.isNotEmpty &&
      firebaseMessagingSenderId.isNotEmpty &&
      firebaseProjectId.isNotEmpty;
}
