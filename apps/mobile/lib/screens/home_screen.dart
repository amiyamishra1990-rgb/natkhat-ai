import 'package:flutter/material.dart';
import '../services/auth_gateway.dart';
import '../services/backend_api_client.dart';
import '../services/leo_chat_api_client.dart';
import 'chat_screen.dart';

// M28 (docs/sprints/sprint-06.md, §7) originally shipped this as a
// generic authenticated placeholder — no Leo content, per H.3's
// placeholder-first precedent and M29 not yet being authorized. M29
// adds the actual "home/companion screen showing Leo" here (placeholder
// icon, per H.3 — no real character art) plus a "Talk to Leo" entry
// point into ChatScreen, wired to the M27 backend only when a
// FAMILY_ID/CHILD_ID pair is configured (lib/config/env.dart) — this
// app still has no way to create/look one up itself (README.md's
// "Parent accounts" section). The M28 "check backend connection" smoke
// check is left in place unchanged, below the Leo section.
class HomeScreen extends StatefulWidget {
  const HomeScreen({
    super.key,
    required this.authGateway,
    required this.backendApiClient,
    this.leoChatApiClient,
    this.familyId,
    this.childId,
  });

  final AuthGateway authGateway;
  final BackendApiClient backendApiClient;

  /// Null (along with [familyId]/[childId]) when Leo chat isn't
  /// configured (FAMILY_ID/CHILD_ID unset). HomeScreen shows a warm
  /// "not ready yet" message instead of the "Talk to Leo" button in
  /// that case, rather than crashing or silently hiding the section.
  final LeoChatApiClient? leoChatApiClient;
  final String? familyId;
  final String? childId;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String _connectionStatus = 'Not checked yet';
  bool _checking = false;

  Future<void> _checkConnection() async {
    setState(() {
      _checking = true;
      _connectionStatus = 'Checking…';
    });

    final reachable = await widget.backendApiClient.checkConnection();

    if (!mounted) return;
    setState(() {
      _checking = false;
      _connectionStatus = reachable ? 'Backend reachable' : 'Backend unreachable';
    });
  }

  bool get _leoChatConfigured =>
      widget.leoChatApiClient != null &&
      (widget.familyId?.isNotEmpty ?? false) &&
      (widget.childId?.isNotEmpty ?? false);

  void _openChat() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => ChatScreen(
          authGateway: widget.authGateway,
          leoChatApiClient: widget.leoChatApiClient!,
          familyId: widget.familyId!,
          childId: widget.childId!,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final email = widget.authGateway.currentUserEmail ?? 'unknown parent';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Natkhat AI'),
        actions: [
          IconButton(
            key: const Key('signOutButton'),
            icon: const Icon(Icons.logout),
            tooltip: 'Sign out',
            onPressed: widget.authGateway.signOut,
          ),
        ],
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Signed in as $email', key: const Key('signedInAsText')),
              const SizedBox(height: 24),
              const CircleAvatar(
                key: Key('leoAvatar'),
                radius: 48,
                child: Icon(Icons.auto_awesome, size: 48),
              ),
              const SizedBox(height: 12),
              const Text(
                "Hi! I'm Leo.",
                key: Key('leoGreetingText'),
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 24),
              if (_leoChatConfigured)
                ElevatedButton(
                  key: const Key('talkToLeoButton'),
                  onPressed: _openChat,
                  child: const Text('Talk to Leo'),
                )
              else
                const Text(
                  "Leo's still getting ready here — ask a grown-up to check the app setup.",
                  key: Key('leoNotReadyText'),
                  textAlign: TextAlign.center,
                ),
              const SizedBox(height: 32),
              const Divider(),
              const SizedBox(height: 8),
              ElevatedButton(
                key: const Key('checkConnectionButton'),
                onPressed: _checking ? null : _checkConnection,
                child: const Text('Check backend connection'),
              ),
              const SizedBox(height: 8),
              Text(_connectionStatus, key: const Key('connectionStatusText')),
            ],
          ),
        ),
      ),
    );
  }
}
