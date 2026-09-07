import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:mobile/screens/chat_screen.dart';
import 'package:mobile/screens/home_screen.dart';
import 'package:mobile/services/backend_api_client.dart';
import 'package:mobile/services/leo_chat_api_client.dart';

import '../fakes/fake_auth_gateway.dart';

class _FakeHttpClient extends http.BaseClient {
  _FakeHttpClient(this._response);

  final http.Response _response;

  @override
  Future<http.StreamedResponse> send(http.BaseRequest request) async {
    return http.StreamedResponse(Stream.value(_response.bodyBytes), _response.statusCode);
  }
}

void main() {
  group('HomeScreen', () {
    testWidgets('shows the signed-in parent email and a Leo greeting', (tester) async {
      final gateway = FakeAuthGateway(startSignedIn: true);
      await gateway.signInWithEmailAndPassword(email: 'parent@example.com', password: 'x');
      final apiClient = BackendApiClient(
        baseUrl: 'http://backend.test',
        httpClient: _FakeHttpClient(http.Response('ok', 200)),
      );

      await tester.pumpWidget(
        MaterialApp(home: HomeScreen(authGateway: gateway, backendApiClient: apiClient)),
      );

      expect(find.text('Signed in as parent@example.com'), findsOneWidget);
      expect(find.byKey(const Key('leoGreetingText')), findsOneWidget);
    });

    testWidgets('shows a warm not-ready message when Leo chat is not configured', (tester) async {
      final gateway = FakeAuthGateway(startSignedIn: true);
      final apiClient = BackendApiClient(
        baseUrl: 'http://backend.test',
        httpClient: _FakeHttpClient(http.Response('ok', 200)),
      );

      await tester.pumpWidget(
        MaterialApp(home: HomeScreen(authGateway: gateway, backendApiClient: apiClient)),
      );

      expect(find.byKey(const Key('leoNotReadyText')), findsOneWidget);
      expect(find.byKey(const Key('talkToLeoButton')), findsNothing);
    });

    testWidgets('"Talk to Leo" navigates to ChatScreen when configured', (tester) async {
      final gateway = FakeAuthGateway(startSignedIn: true);
      final apiClient = BackendApiClient(
        baseUrl: 'http://backend.test',
        httpClient: _FakeHttpClient(http.Response('ok', 200)),
      );
      final leoChatApiClient = LeoChatApiClient(
        baseUrl: 'http://backend.test',
        httpClient: _FakeHttpClient(http.Response('{"id": "conv-1"}', 200)),
      );

      await tester.pumpWidget(
        MaterialApp(
          home: HomeScreen(
            authGateway: gateway,
            backendApiClient: apiClient,
            leoChatApiClient: leoChatApiClient,
            familyId: 'family-1',
            childId: 'child-1',
          ),
        ),
      );

      expect(find.byKey(const Key('talkToLeoButton')), findsOneWidget);
      expect(find.byKey(const Key('leoNotReadyText')), findsNothing);

      await tester.tap(find.byKey(const Key('talkToLeoButton')));
      await tester.pumpAndSettle();

      expect(find.byType(ChatScreen), findsOneWidget);
    });

    testWidgets('sign-out button calls the auth gateway', (tester) async {
      final gateway = FakeAuthGateway(startSignedIn: true);
      await gateway.signInWithEmailAndPassword(email: 'parent@example.com', password: 'x');
      final apiClient = BackendApiClient(
        baseUrl: 'http://backend.test',
        httpClient: _FakeHttpClient(http.Response('ok', 200)),
      );

      await tester.pumpWidget(
        MaterialApp(home: HomeScreen(authGateway: gateway, backendApiClient: apiClient)),
      );

      await tester.tap(find.byKey(const Key('signOutButton')));
      await tester.pumpAndSettle();

      expect(gateway.isSignedIn, isFalse);
    });

    testWidgets('check-connection button reports backend reachability', (tester) async {
      final gateway = FakeAuthGateway(startSignedIn: true);
      final apiClient = BackendApiClient(
        baseUrl: 'http://backend.test',
        httpClient: _FakeHttpClient(http.Response('ok', 200)),
      );

      await tester.pumpWidget(
        MaterialApp(home: HomeScreen(authGateway: gateway, backendApiClient: apiClient)),
      );

      expect(find.text('Not checked yet'), findsOneWidget);

      await tester.tap(find.byKey(const Key('checkConnectionButton')));
      await tester.pumpAndSettle();

      expect(find.text('Backend reachable'), findsOneWidget);
    });
  });
}
