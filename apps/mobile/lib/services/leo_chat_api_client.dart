import 'dart:convert';
import 'package:http/http.dart' as http;

/// One turn of Leo conversation, as returned by
/// `leo-chat.controller.ts`'s message endpoints. `content` is whatever
/// the M27 mock AI adapter (or, for the child's own message, the child
/// themself) produced — never hand-written here.
class LeoMessage {
  const LeoMessage({required this.sender, required this.content});

  final String sender;
  final String content;
}

class LeoChatApiException implements Exception {
  LeoChatApiException(this.message);

  final String message;

  @override
  String toString() => message;
}

/// M29 (docs/sprints/sprint-06.md, §7) — thin HTTP client for the M27
/// Leo-chat surface (`apps/backend/src/leo-chat/leo-chat.controller.ts`),
/// the chat-screen counterpart to `BackendApiClient`'s connectivity
/// check. Every request carries the signed-in parent's Firebase ID
/// token as `Authorization: Bearer <token>` (`ParentAuthGuard`'s exact
/// expectation) — this app has no child-session concept, so every
/// message is sent as the parent-relayed child message, per M27's own
/// scope.
class LeoChatApiClient {
  LeoChatApiClient({required this.baseUrl, http.Client? httpClient}) : _client = httpClient ?? http.Client();

  final String baseUrl;
  final http.Client _client;

  Future<String> startConversation({
    required String idToken,
    required String familyId,
    required String childId,
  }) async {
    final response = await _client.post(
      Uri.parse('$baseUrl/leo/conversations'),
      headers: _headers(idToken),
      body: jsonEncode({'familyId': familyId, 'childId': childId}),
    );
    _throwIfError(response);

    final body = jsonDecode(response.body) as Map<String, dynamic>;
    return body['id'] as String;
  }

  Future<LeoMessage> sendMessage({
    required String idToken,
    required String conversationId,
    required String familyId,
    required String childId,
    required String content,
  }) async {
    final response = await _client.post(
      Uri.parse('$baseUrl/leo/conversations/$conversationId/messages'),
      headers: _headers(idToken),
      body: jsonEncode({'familyId': familyId, 'childId': childId, 'content': content}),
    );
    _throwIfError(response);

    final body = jsonDecode(response.body) as Map<String, dynamic>;
    final leoMessage = body['leoMessage'] as Map<String, dynamic>;
    return LeoMessage(sender: leoMessage['sender'] as String, content: leoMessage['content'] as String);
  }

  Map<String, String> _headers(String idToken) => {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $idToken',
  };

  void _throwIfError(http.Response response) {
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw LeoChatApiException('Leo chat request failed (HTTP ${response.statusCode})');
    }
  }
}
