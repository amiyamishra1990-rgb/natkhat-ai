import 'package:flutter/material.dart';
import '../services/auth_gateway.dart';
import '../services/backend_api_client.dart';

// M28 (docs/sprints/sprint-06.md, §7) — the "simple authenticated home
// placeholder screen proving the session persists" the milestone asks
// for. Deliberately generic (H.3's placeholder-first precedent): no
// Leo character content, no art, no child-facing UI — that is M29,
// not yet authorized, and out of this milestone's scope.
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key, required this.authGateway, required this.backendApiClient});

  final AuthGateway authGateway;
  final BackendApiClient backendApiClient;

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
              const SizedBox(height: 8),
              const Text(
                'This is a placeholder home screen. Leo has no experience here yet.',
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
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
