import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'app.dart';
import 'config/env.dart';
import 'services/backend_api_client.dart';
import 'services/firebase_auth_gateway.dart';

// M28 (docs/sprints/sprint-06.md, §7; ADR-0016). Replaces the stock
// `flutter create` counter-app demo. Firebase is initialized
// programmatically from lib/config/env.dart's dart-define values
// rather than a generated firebase_options.dart — no `flutterfire
// configure` run against a real project happened in this milestone
// (see README.md). If those values are missing, this fails clearly
// with a visible error screen rather than silently running with no
// authentication, the same "fail clearly, not silently" convention
// apps/admin's lib/firebase-client.ts and apps/backend's
// auth/firebase-admin.provider.ts already use.
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  if (!Env.isFirebaseConfigured) {
    runApp(const _ConfigurationErrorApp());
    return;
  }

  await Firebase.initializeApp(
    options: FirebaseOptions(
      apiKey: Env.firebaseApiKey,
      appId: Env.firebaseAppId,
      messagingSenderId: Env.firebaseMessagingSenderId,
      projectId: Env.firebaseProjectId,
    ),
  );

  runApp(
    NatkhatApp(
      authGateway: FirebaseAuthGateway(),
      backendApiClient: BackendApiClient(baseUrl: Env.backendApiUrl),
    ),
  );
}

class _ConfigurationErrorApp extends StatelessWidget {
  const _ConfigurationErrorApp();

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Text(
              'Firebase is not configured. Pass FIREBASE_API_KEY, FIREBASE_APP_ID, '
              'and FIREBASE_MESSAGING_SENDER_ID via --dart-define (see README.md).',
              textAlign: TextAlign.center,
              key: const Key('firebaseConfigErrorText'),
            ),
          ),
        ),
      ),
    );
  }
}
