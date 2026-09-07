import 'package:flutter/material.dart';
import 'screens/home_screen.dart';
import 'screens/sign_in_screen.dart';
import 'services/auth_gateway.dart';
import 'services/backend_api_client.dart';
import 'services/leo_chat_api_client.dart';

// M28 (docs/sprints/sprint-06.md, §7). Root widget: a single
// StreamBuilder over AuthGateway.authStateChanges() decides
// SignInScreen vs HomeScreen — the one place that decision is made, so
// a persisted Firebase session (or, in tests, a FakeAuthGateway seeded
// as already-signed-in) lands the parent straight on HomeScreen
// without ever showing sign-in, which is what "the session persists"
// means for this milestone. M29 adds leoChatApiClient/familyId/childId,
// threaded straight through to HomeScreen — see that file for why they
// are nullable.
class NatkhatApp extends StatelessWidget {
  const NatkhatApp({
    super.key,
    required this.authGateway,
    required this.backendApiClient,
    this.leoChatApiClient,
    this.familyId,
    this.childId,
  });

  final AuthGateway authGateway;
  final BackendApiClient backendApiClient;
  final LeoChatApiClient? leoChatApiClient;
  final String? familyId;
  final String? childId;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Natkhat AI',
      theme: ThemeData(colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple)),
      home: StreamBuilder<bool>(
        stream: authGateway.authStateChanges(),
        initialData: authGateway.isSignedIn,
        builder: (context, snapshot) {
          final signedIn = snapshot.data ?? false;
          if (signedIn) {
            return HomeScreen(
              authGateway: authGateway,
              backendApiClient: backendApiClient,
              leoChatApiClient: leoChatApiClient,
              familyId: familyId,
              childId: childId,
            );
          }
          return SignInScreen(authGateway: authGateway);
        },
      ),
    );
  }
}
