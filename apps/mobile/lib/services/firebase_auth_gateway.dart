import 'package:firebase_auth/firebase_auth.dart';
import 'auth_gateway.dart';

// M28 (docs/sprints/sprint-06.md, §7; ADR-0016). Real implementation
// of AuthGateway, backed by the Firebase project this app was
// registered against (see lib/config/env.dart, lib/main.dart) — the
// same Firebase Authentication apps/admin (M25) and apps/backend
// (M15) already use. Email/password only, consistent with how
// apps/admin/app/sign-in/page.tsx signs an admin principal in.
//
// Maps every FirebaseAuthException to a generic AuthGatewayException
// with a short, user-facing message — this milestone is authentication
// plumbing, not building a full per-error-code UX.
class FirebaseAuthGateway implements AuthGateway {
  FirebaseAuthGateway({FirebaseAuth? firebaseAuth}) : _auth = firebaseAuth ?? FirebaseAuth.instance;

  final FirebaseAuth _auth;

  @override
  Stream<bool> authStateChanges() => _auth.authStateChanges().map((user) => user != null);

  @override
  bool get isSignedIn => _auth.currentUser != null;

  @override
  String? get currentUserEmail => _auth.currentUser?.email;

  @override
  Future<void> signInWithEmailAndPassword({required String email, required String password}) async {
    try {
      await _auth.signInWithEmailAndPassword(email: email, password: password);
    } on FirebaseAuthException catch (error) {
      throw AuthGatewayException(_messageFor(error));
    }
  }

  @override
  Future<void> signOut() => _auth.signOut();

  @override
  Future<String?> getIdToken() => _auth.currentUser?.getIdToken() ?? Future.value(null);

  String _messageFor(FirebaseAuthException error) {
    switch (error.code) {
      case 'user-not-found':
      case 'wrong-password':
      case 'invalid-credential':
        return 'Incorrect email or password.';
      case 'invalid-email':
        return 'That email address is not valid.';
      case 'user-disabled':
        return 'This account has been disabled.';
      case 'too-many-requests':
        return 'Too many attempts. Please try again later.';
      default:
        return 'Could not sign in: ${error.message ?? error.code}';
    }
  }
}
