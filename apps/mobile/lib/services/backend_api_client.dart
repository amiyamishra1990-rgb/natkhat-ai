import 'package:http/http.dart' as http;

// M28 (docs/sprints/sprint-06.md, §7). Minimal HTTP wiring to
// apps/backend — this milestone adds no new backend endpoint, so the
// only call made today is a plain, unauthenticated GET / (AppController,
// apps/backend/src/app.controller.ts) as a "can this app reach the
// backend at all" smoke check, surfaced on HomeScreen. Calling any
// parent-authenticated route (e.g. leo-chat.controller.ts's
// /leo/conversations) requires a real Parent row tied to the signed-in
// Firebase uid, which — per README.md's "Parent accounts" section —
// this milestone provisions out-of-band, not through a mobile sign-up
// flow, so it is intentionally not exercised here.
class BackendApiClient {
  BackendApiClient({required this.baseUrl, http.Client? httpClient}) : _client = httpClient ?? http.Client();

  final String baseUrl;
  final http.Client _client;

  Future<bool> checkConnection() async {
    try {
      final response = await _client.get(Uri.parse(baseUrl)).timeout(const Duration(seconds: 5));
      return response.statusCode >= 200 && response.statusCode < 300;
    } catch (_) {
      return false;
    }
  }
}
