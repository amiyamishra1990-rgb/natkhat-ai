import 'package:flutter/material.dart';
import '../services/auth_gateway.dart';

// M28 (docs/sprints/sprint-06.md, §7; ADR-0016) — sign-in for the
// parent principal only, mirroring apps/admin/app/sign-in/page.tsx's
// email/password shape. Deliberately no sign-up form here: see
// README.md's "Parent accounts" section for why (M14/M15 never built
// an HTTP parent/family-creation flow — apps/admin's AdminUser
// provisioning is the exact same "out-of-band, test/synthetic
// accounts only" precedent this follows). Not reused by, and does not
// assume, any child-facing flow (ADR-0009 item 7 stays untouched).
class SignInScreen extends StatefulWidget {
  const SignInScreen({super.key, required this.authGateway});

  final AuthGateway authGateway;

  @override
  State<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends State<SignInScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  String? _errorMessage;
  bool _submitting = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _submitting = true;
      _errorMessage = null;
    });

    try {
      await widget.authGateway.signInWithEmailAndPassword(
        email: _emailController.text.trim(),
        password: _passwordController.text,
      );
      // No navigation call here: the root AuthGate widget listens to
      // authGateway.authStateChanges() and swaps to HomeScreen itself
      // once this completes, the same "one source of truth for
      // signed-in state" shape as apps/admin's session cookie.
    } on AuthGatewayException catch (error) {
      setState(() => _errorMessage = error.message);
    } finally {
      if (mounted) {
        setState(() => _submitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Natkhat AI — Parent sign-in')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('Test/synthetic parent accounts only. Synthetic data only.'),
              const SizedBox(height: 24),
              TextFormField(
                key: const Key('signInEmailField'),
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(labelText: 'Email'),
                validator: (value) =>
                    (value == null || value.trim().isEmpty) ? 'Email is required' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                key: const Key('signInPasswordField'),
                controller: _passwordController,
                obscureText: true,
                decoration: const InputDecoration(labelText: 'Password'),
                validator: (value) =>
                    (value == null || value.isEmpty) ? 'Password is required' : null,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                key: const Key('signInSubmitButton'),
                onPressed: _submitting ? null : _submit,
                child: Text(_submitting ? 'Signing in…' : 'Sign in'),
              ),
              if (_errorMessage != null) ...[
                const SizedBox(height: 16),
                Text(
                  _errorMessage!,
                  key: const Key('signInErrorText'),
                  style: const TextStyle(color: Colors.red),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
