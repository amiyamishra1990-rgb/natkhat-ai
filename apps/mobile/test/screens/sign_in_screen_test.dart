import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/screens/sign_in_screen.dart';

import '../fakes/fake_auth_gateway.dart';

void main() {
  group('SignInScreen', () {
    testWidgets('successful sign-in calls the auth gateway and clears any error', (tester) async {
      final gateway = FakeAuthGateway();

      await tester.pumpWidget(MaterialApp(home: SignInScreen(authGateway: gateway)));

      await tester.enterText(find.byKey(const Key('signInEmailField')), 'parent@example.com');
      await tester.enterText(find.byKey(const Key('signInPasswordField')), 'correct-password');
      await tester.tap(find.byKey(const Key('signInSubmitButton')));
      await tester.pumpAndSettle();

      expect(gateway.isSignedIn, isTrue);
      expect(gateway.currentUserEmail, 'parent@example.com');
      expect(find.byKey(const Key('signInErrorText')), findsNothing);
    });

    testWidgets('failed sign-in shows an error message and does not sign in', (tester) async {
      final gateway = FakeAuthGateway(signInError: 'Incorrect email or password.');

      await tester.pumpWidget(MaterialApp(home: SignInScreen(authGateway: gateway)));

      await tester.enterText(find.byKey(const Key('signInEmailField')), 'parent@example.com');
      await tester.enterText(find.byKey(const Key('signInPasswordField')), 'wrong-password');
      await tester.tap(find.byKey(const Key('signInSubmitButton')));
      await tester.pumpAndSettle();

      expect(gateway.isSignedIn, isFalse);
      expect(find.byKey(const Key('signInErrorText')), findsOneWidget);
      expect(find.text('Incorrect email or password.'), findsOneWidget);
    });

    testWidgets('empty fields are rejected client-side without calling the gateway', (tester) async {
      final gateway = FakeAuthGateway();

      await tester.pumpWidget(MaterialApp(home: SignInScreen(authGateway: gateway)));

      await tester.tap(find.byKey(const Key('signInSubmitButton')));
      await tester.pumpAndSettle();

      expect(gateway.isSignedIn, isFalse);
      expect(find.text('Email is required'), findsOneWidget);
      expect(find.text('Password is required'), findsOneWidget);
    });
  });
}
