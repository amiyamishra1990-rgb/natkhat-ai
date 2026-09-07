import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:mobile/app.dart';
import 'package:mobile/services/backend_api_client.dart';

import 'fakes/fake_auth_gateway.dart';

class _UnreachableHttpClient extends http.BaseClient {
  @override
  Future<http.StreamedResponse> send(http.BaseRequest request) {
    throw Exception('no network in tests');
  }
}

BackendApiClient _testApiClient() =>
    BackendApiClient(baseUrl: 'http://backend.test', httpClient: _UnreachableHttpClient());

void main() {
  group('NatkhatApp', () {
    testWidgets('a persisted (already-signed-in) session opens straight to HomeScreen', (
      tester,
    ) async {
      final gateway = FakeAuthGateway(startSignedIn: true);

      await tester.pumpWidget(NatkhatApp(authGateway: gateway, backendApiClient: _testApiClient()));
      await tester.pumpAndSettle();

      expect(find.byKey(const Key('signedInAsText')), findsOneWidget);
      expect(find.byKey(const Key('signInSubmitButton')), findsNothing);
    });

    testWidgets('a signed-out session shows SignInScreen', (tester) async {
      final gateway = FakeAuthGateway();

      await tester.pumpWidget(NatkhatApp(authGateway: gateway, backendApiClient: _testApiClient()));
      await tester.pumpAndSettle();

      expect(find.byKey(const Key('signInSubmitButton')), findsOneWidget);
      expect(find.byKey(const Key('signedInAsText')), findsNothing);
    });

    testWidgets('signing in from the sign-in screen navigates to HomeScreen', (tester) async {
      final gateway = FakeAuthGateway();

      await tester.pumpWidget(NatkhatApp(authGateway: gateway, backendApiClient: _testApiClient()));
      await tester.enterText(find.byKey(const Key('signInEmailField')), 'parent@example.com');
      await tester.enterText(find.byKey(const Key('signInPasswordField')), 'correct-password');
      await tester.tap(find.byKey(const Key('signInSubmitButton')));
      await tester.pumpAndSettle();

      expect(find.byKey(const Key('signedInAsText')), findsOneWidget);
      expect(find.text('Signed in as parent@example.com'), findsOneWidget);
    });

    testWidgets('signing out from HomeScreen returns to SignInScreen', (tester) async {
      final gateway = FakeAuthGateway(startSignedIn: true);

      await tester.pumpWidget(NatkhatApp(authGateway: gateway, backendApiClient: _testApiClient()));
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('signOutButton')));
      await tester.pumpAndSettle();

      expect(find.byKey(const Key('signInSubmitButton')), findsOneWidget);
    });
  });
}
