import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:mobile/screens/chat_screen.dart';
import 'package:mobile/services/leo_chat_api_client.dart';

import '../fakes/fake_auth_gateway.dart';

/// Routes by URL path/method, mirroring leo-chat.controller.ts's two
/// endpoints — good enough to drive ChatScreen without a real backend.
class _FakeLeoChatHttpClient extends http.BaseClient {
  _FakeLeoChatHttpClient({this.sendMessageStatusCode = 200});

  final int sendMessageStatusCode;

  @override
  Future<http.StreamedResponse> send(http.BaseRequest request) async {
    if (request.url.path.endsWith('/messages')) {
      final body = jsonEncode({
        'childMessage': {'id': 'msg-child', 'sender': 'child', 'content': 'hi leo'},
        'leoMessage': {'id': 'msg-leo', 'sender': 'leo', 'content': 'Ooh, tell me more!'},
      });
      return http.StreamedResponse(
        Stream.value(utf8.encode(body)),
        sendMessageStatusCode,
      );
    }

    // POST /leo/conversations (start).
    final body = jsonEncode({'id': 'conv-1'});
    return http.StreamedResponse(Stream.value(utf8.encode(body)), 200);
  }
}

void main() {
  group('ChatScreen', () {
    testWidgets('starts a conversation, then lets the child send a message and see Leo\'s reply', (
      tester,
    ) async {
      final gateway = FakeAuthGateway(startSignedIn: true);
      final apiClient = LeoChatApiClient(baseUrl: 'http://backend.test', httpClient: _FakeLeoChatHttpClient());

      await tester.pumpWidget(
        MaterialApp(
          home: ChatScreen(
            authGateway: gateway,
            leoChatApiClient: apiClient,
            familyId: 'family-1',
            childId: 'child-1',
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.byKey(const Key('chatEmptyStateText')), findsOneWidget);

      await tester.enterText(find.byKey(const Key('chatMessageField')), 'hi leo');
      await tester.tap(find.byKey(const Key('chatSendButton')));
      await tester.pumpAndSettle();

      expect(find.text('hi leo'), findsOneWidget);
      expect(find.text('Ooh, tell me more!'), findsOneWidget);
      expect(find.byKey(const Key('chatEmptyStateText')), findsNothing);
    });

    testWidgets('shows a warm error message when sending fails', (tester) async {
      final gateway = FakeAuthGateway(startSignedIn: true);
      final apiClient = LeoChatApiClient(
        baseUrl: 'http://backend.test',
        httpClient: _FakeLeoChatHttpClient(sendMessageStatusCode: 500),
      );

      await tester.pumpWidget(
        MaterialApp(
          home: ChatScreen(
            authGateway: gateway,
            leoChatApiClient: apiClient,
            familyId: 'family-1',
            childId: 'child-1',
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.enterText(find.byKey(const Key('chatMessageField')), 'hi leo');
      await tester.tap(find.byKey(const Key('chatSendButton')));
      await tester.pumpAndSettle();

      expect(find.byKey(const Key('chatErrorText')), findsOneWidget);
    });
  });
}
