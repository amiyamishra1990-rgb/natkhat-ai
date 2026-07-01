import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import LeoFace from '@/src/components/LeoFace';
import { colors, font, radius, spacing } from '@/src/theme';
import { api } from '@/src/lib/api';
import { saveChild, saveParent } from '@/src/lib/session';

export default function Login() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const sendOtp = async () => {
    setErr(null);
    if (!/^\d{10}$/.test(mobile.trim())) {
      setErr('Enter a 10-digit mobile number');
      return;
    }
    try {
      setLoading(true);
      const r = await api.sendOtp(mobile.trim());
      setDevOtp(r.dev_otp);
      setStep('otp');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    } catch (e: any) {
      setErr(e.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    setErr(null);
    if (otp.length !== 6) {
      setErr('Enter the 6-digit code');
      return;
    }
    try {
      setLoading(true);
      const r = await api.verifyOtp(mobile.trim(), otp.trim(), name.trim(), email.trim());
      await saveParent(r.parent);
      if (r.child) {
        await saveChild(r.child);
        router.replace(r.child.has_seen_intro ? '/home' : '/leo-intro');
      } else {
        router.replace('/child-profile');
      }
    } catch (e: any) {
      setErr(e.message || 'Invalid OTP');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <LeoFace size={110} emotion="happy" bob />
            <Text style={styles.title}>Namaste, Parent!</Text>
            <Text style={styles.subtitle}>
              {step === 'form'
                ? 'Enter your details to bring Leo home 🦁'
                : `We sent a code to +91 ${mobile}`}
            </Text>
          </View>

          {step === 'form' ? (
            <View style={styles.form}>
              <Field
                label="Your Name"
                value={name}
                onChangeText={setName}
                placeholder="Ravi Sharma"
                testID="login-name"
              />
              <Field
                label="Mobile Number"
                value={mobile}
                onChangeText={(t) => setMobile(t.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit mobile"
                keyboardType="phone-pad"
                testID="login-mobile"
              />
              <Field
                label="Email (optional)"
                value={email}
                onChangeText={setEmail}
                placeholder="ravi@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                testID="login-email"
              />

              {err && <Text style={styles.err}>{err}</Text>}

              <GradientButton
                label={loading ? 'Sending…' : 'Send OTP'}
                onPress={sendOtp}
                disabled={loading}
                testID="login-send-otp"
              />
            </View>
          ) : (
            <View style={styles.form}>
              <Field
                label="6-digit Code"
                value={otp}
                onChangeText={(t) => setOtp(t.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                keyboardType="number-pad"
                testID="login-otp"
              />
              {devOtp && (
                <Text style={styles.devHint}>
                  Dev preview: use <Text style={styles.devCode}>{devOtp}</Text>
                </Text>
              )}
              {err && <Text style={styles.err}>{err}</Text>}

              <GradientButton
                label={loading ? 'Verifying…' : 'Verify & Continue'}
                onPress={verify}
                disabled={loading}
                testID="login-verify-otp"
              />

              <Pressable
                onPress={() => {
                  setStep('form');
                  setOtp('');
                }}
                style={styles.linkBtn}
                testID="login-change-mobile"
              >
                <Text style={styles.link}>Change mobile number</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field(props: React.ComponentProps<typeof TextInput> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.onSurfaceFaint}
        style={styles.input}
        {...rest}
      />
    </View>
  );
}

function GradientButton({
  label,
  onPress,
  disabled,
  testID,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btnWrap,
        { opacity: disabled ? 0.6 : pressed ? 0.9 : 1 },
      ]}
      testID={testID}
    >
      <LinearGradient
        colors={[colors.brand, colors.pink]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.btn}
      >
        {disabled ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>{label}</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  scroll: { padding: spacing.xl, paddingBottom: spacing.xl2 },
  hero: { alignItems: 'center', marginTop: spacing.md, marginBottom: spacing.xl },
  title: {
    color: colors.onSurface,
    fontFamily: font.display,
    fontSize: 30,
    marginTop: spacing.lg,
  },
  subtitle: {
    color: colors.onSurfaceMuted,
    fontFamily: font.body,
    fontSize: 14,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  form: { gap: spacing.md },
  fieldWrap: { gap: 6 },
  fieldLabel: { color: colors.onSurfaceMuted, fontFamily: font.bodyBold, fontSize: 12, letterSpacing: 0.4 },
  input: {
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.border,
    borderWidth: 1,
    color: colors.onSurface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    fontFamily: font.body,
    fontSize: 16,
  },
  btnWrap: { marginTop: spacing.md },
  btn: {
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontFamily: font.bodyBold,
    fontSize: 16,
    letterSpacing: 0.5,
  },
  err: { color: colors.danger, fontFamily: font.bodyBold, fontSize: 13 },
  devHint: { color: colors.onSurfaceMuted, fontFamily: font.body, fontSize: 12, textAlign: 'center' },
  devCode: { color: colors.brand, fontFamily: font.bodyBold },
  linkBtn: { alignSelf: 'center', padding: spacing.sm },
  link: { color: colors.onSurfaceMuted, fontFamily: font.bodyBold, fontSize: 13 },
});
