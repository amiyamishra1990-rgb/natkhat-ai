// M28 (docs/sprints/sprint-06.md, §7). Screens depend on this
// interface, never on `package:firebase_auth` directly — the same
// "guard the real SDK behind a narrow seam" shape
// apps/backend/src/auth/firebase-auth.service.ts already uses, applied
// here so widget tests can substitute FakeAuthGateway (test/fakes/)
// without touching firebase_auth's platform channels (which don't
// exist in `flutter test`'s VM target).
//
// Deliberately minimal: email/password sign-in/out and the signed-in
// parent's Firebase ID token, nothing else. No sign-up method exists
// here — see README.md's "Parent accounts" section for why.
abstract class AuthGateway {
  /// Emits the current signed-in state, starting with whatever session
  /// Firebase already has persisted (or the fake's seeded state in
  /// tests) — this is what proves session persistence to the app's UI,
  /// not a one-shot check made only at launch.
  Stream<bool> authStateChanges();

  bool get isSignedIn;

  /// The signed-in parent's email, or null if signed out.
  String? get currentUserEmail;

  Future<void> signInWithEmailAndPassword({required String email, required String password});

  Future<void> signOut();

  /// The current Firebase ID token, for calling apps/backend's
  /// parent-authenticated endpoints (ParentAuthGuard). Null if signed out.
  Future<String?> getIdToken();
}

class AuthGatewayException implements Exception {
  AuthGatewayException(this.message);

  final String message;

  @override
  String toString() => message;
}
