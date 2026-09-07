import 'package:flutter/material.dart';
import '../services/auth_gateway.dart';
import '../services/leo_chat_api_client.dart';

/// One message shown in the transcript. `LeoMessage.sender` from the
/// API is either `'child'` or `'leo'`; this mirrors that, plus a
/// client-only entry for a failed send.
class _TranscriptEntry {
  const _TranscriptEntry({required this.sender, required this.content});

  final String sender;
  final String content;
}

/// M29 (docs/sprints/sprint-06.md, §7) — the child's chat screen with
/// Leo, wired to the real M27 backend (mock-adapter reply content,
/// unmodified — this screen never writes Leo's words itself, only the
/// static labels/framing around them, per docs/product/leo-character-brief.md
/// §3). Reached from HomeScreen's "Talk to Leo" button, only once a
/// FAMILY_ID/CHILD_ID pair is configured (see lib/config/env.dart) —
/// there is still no child-login/child-session; this is the parent's
/// device, mid parent-authenticated session.
class ChatScreen extends StatefulWidget {
  const ChatScreen({
    super.key,
    required this.authGateway,
    required this.leoChatApiClient,
    required this.familyId,
    required this.childId,
  });

  final AuthGateway authGateway;
  final LeoChatApiClient leoChatApiClient;
  final String familyId;
  final String childId;

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _messageController = TextEditingController();
  final _transcript = <_TranscriptEntry>[];

  String? _conversationId;
  bool _starting = true;
  bool _sending = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _startConversation();
  }

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _startConversation() async {
    try {
      final idToken = await widget.authGateway.getIdToken();
      if (idToken == null) {
        throw LeoChatApiException('Not signed in');
      }
      final conversationId = await widget.leoChatApiClient.startConversation(
        idToken: idToken,
        familyId: widget.familyId,
        childId: widget.childId,
      );
      if (!mounted) return;
      setState(() {
        _conversationId = conversationId;
        _starting = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _starting = false;
        _errorMessage = "Leo can't come to the phone right now. Try again in a bit!";
      });
    }
  }

  Future<void> _send() async {
    final content = _messageController.text.trim();
    final conversationId = _conversationId;
    if (content.isEmpty || conversationId == null || _sending) {
      return;
    }

    setState(() {
      _sending = true;
      _errorMessage = null;
      _transcript.add(_TranscriptEntry(sender: 'child', content: content));
    });
    _messageController.clear();

    try {
      final idToken = await widget.authGateway.getIdToken();
      if (idToken == null) {
        throw LeoChatApiException('Not signed in');
      }
      final leoReply = await widget.leoChatApiClient.sendMessage(
        idToken: idToken,
        conversationId: conversationId,
        familyId: widget.familyId,
        childId: widget.childId,
        content: content,
      );
      if (!mounted) return;
      setState(() {
        _sending = false;
        _transcript.add(_TranscriptEntry(sender: leoReply.sender, content: leoReply.content));
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _sending = false;
        _errorMessage = "Hmm, that message didn't get to Leo. Want to try again?";
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Chat with Leo')),
      body: Column(
        children: [
          Expanded(child: _buildBody()),
          if (_errorMessage != null)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Text(
                _errorMessage!,
                key: const Key('chatErrorText'),
                style: const TextStyle(color: Colors.red),
              ),
            ),
          SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      key: const Key('chatMessageField'),
                      controller: _messageController,
                      enabled: _conversationId != null && !_sending,
                      decoration: const InputDecoration(hintText: 'Say hi to Leo!'),
                      onSubmitted: (_) => _send(),
                    ),
                  ),
                  IconButton(
                    key: const Key('chatSendButton'),
                    icon: const Icon(Icons.send),
                    onPressed: (_conversationId != null && !_sending) ? _send : null,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBody() {
    if (_starting) {
      return const Center(child: CircularProgressIndicator(key: Key('chatStartingIndicator')));
    }

    if (_conversationId == null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(_errorMessage ?? "Leo can't come to the phone right now.", textAlign: TextAlign.center),
        ),
      );
    }

    if (_transcript.isEmpty) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Text('Say hi to Leo!', key: Key('chatEmptyStateText'), textAlign: TextAlign.center),
        ),
      );
    }

    return ListView.builder(
      key: const Key('chatTranscriptList'),
      padding: const EdgeInsets.all(16),
      itemCount: _transcript.length,
      itemBuilder: (context, index) {
        final entry = _transcript[index];
        final isChild = entry.sender == 'child';
        return Align(
          alignment: isChild ? Alignment.centerRight : Alignment.centerLeft,
          child: Container(
            margin: const EdgeInsets.symmetric(vertical: 4),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: isChild ? Colors.deepPurple.shade100 : Colors.orange.shade100,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(entry.content),
          ),
        );
      },
    );
  }
}
