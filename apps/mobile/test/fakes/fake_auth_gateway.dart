import 'dart:async';

import 'package:mobile/services/auth_gateway.dart';

// M28 (docs/sprints/sprint-06.md, §7) — test-only stand-in for
// AuthGateway. Pure Dart, no firebase_auth involved at all, so widget
// tests can run in `flutter test`'s VM target (which has no platform
// channels for firebase_auth's real plugin) while still exercising the
// real SignInScreen/HomeScreen/NatkhatApp code — only the identity
// backend is swapped.
class FakeAuthGateway implements AuthGateway {
  FakeAuthGateway({bool startSignedIn = false, this.signInError}) : _signedIn = startSignedIn;

  bool _signedIn;
  String? _email;

  /// Set to make the next signInWithEmailAndPassword call throw.
  String? signInError;

  final _controller = StreamController<bool>.broadcast();

  @override
  Stream<bool> authStateChanges() async* {
    yield _signedIn;
    yield* _controller.stream;
  }

  @override
  bool get isSignedIn => _signedIn;

  @override
  String? get currentUserEmail => _email;

  @override
  Future<void> signInWithEmailAndPassword({required String email, required String password}) async {
    if (signInError != null) {
      throw AuthGatewayException(signInError!);
    }
    _email = email;
    _signedIn = true;
    _controller.add(true);
  }

  @override
  Future<void> signOut() async {
    _email = null;
    _signedIn = false;
    _controller.add(false);
  }

  @override
  Future<String?> getIdToken() async => _signedIn ? 'fake-id-token' : null;
}
