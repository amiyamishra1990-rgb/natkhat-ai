import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
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
import { getParent, saveChild } from '@/src/lib/session';

const AGES = [4, 5, 6, 7, 8, 9, 10];
const BHASHAS = [
  { code: 'Hindi', label: 'हिंदी', emoji: '🌸' },
  { code: 'Tamil', label: 'தமிழ்', emoji: '🌴' },
  { code: 'Telugu', label: 'తెలుగు', emoji: '🌾' },
  { code: 'Malayalam', label: 'മലയാളം', emoji: '🥥' },
  { code: 'Punjabi', label: 'ਪੰਜਾਬੀ', emoji: '🌻' },
  { code: 'Bengali', label: 'বাংলা', emoji: '🐟' },
  { code: 'Marathi', label: 'मराठी', emoji: '🎭' },
  { code: 'Kannada', label: 'ಕನ್ನಡ', emoji: '🌺' },
  { code: 'Gujarati', label: 'ગુજરાતી', emoji: '🪁' },
  { code: 'Odia', label: 'ଓଡ଼ିଆ', emoji: '🐘' },
  { code: 'Assamese', label: 'অসমীয়া', emoji: '🍵' },
  { code: 'Maithili', label: 'मैथिली', emoji: '🎨' },
];

export default function ChildProfile() {
  const router = useRouter();
  const [parentId, setParentId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | null>(null);
  const [bhasha, setBhasha] = useState<string>('Hindi');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const p = await getParent();
      if (!p) router.replace('/login');
      else setParentId(p.id);
    })();
  }, []);

  const canSave = useMemo(
    () => name.trim().length >= 1 && age != null && !!bhasha && !!parentId,
    [name, age, bhasha, parentId],
  );

  const submit = async () => {
    if (!canSave || !parentId) {
      setErr('Please fill in name, age and language');
      return;
    }
    try {
      setLoading(true);
      setErr(null);
      const r = await api.createChild(parentId, name.trim(), age!, bhasha);
      await saveChild(r.child);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      router.replace('/leo-intro');
    } catch (e: any) {
      setErr(e.message || 'Could not save profile');
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
            <LeoFace size={90} emotion="thinking" bob />
            <Text style={styles.title}>Leo wants to meet you!</Text>
            <Text style={styles.subtitle}>Bata na apna profile 🦁</Text>
          </View>

          {/* Name */}
          <View style={styles.section}>
            <Text style={styles.q}>Aapka Naam? · What&apos;s your name?</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Aarav"
              placeholderTextColor={colors.onSurfaceFaint}
              style={styles.input}
              testID="child-name-input"
              maxLength={30}
            />
          </View>

          {/* Age bubbles */}
          <View style={styles.section}>
            <Text style={styles.q}>Aapki Age? · How old are you?</Text>
            <View style={styles.ageRow}>
              {AGES.map((a) => {
                const selected = age === a;
                return (
                  <Pressable
                    key={a}
                    onPress={() => {
                      setAge(a);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
                    }}
                    testID={`age-${a}`}
                    style={[
                      styles.ageBubble,
                      selected && styles.ageBubbleActive,
                    ]}
                  >
                    <Text style={[styles.ageText, selected && styles.ageTextActive]}>{a}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Bhasha */}
          <View style={styles.section}>
            <Text style={styles.q}>Ghar ki Bhasha? · Home language</Text>
            <View style={styles.bhashaGrid}>
              {BHASHAS.map((b) => {
                const selected = bhasha === b.code;
                return (
                  <Pressable
                    key={b.code}
                    onPress={() => {
                      setBhasha(b.code);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
                    }}
                    testID={`bhasha-${b.code}`}
                    style={[styles.bhashaCard, selected && styles.bhashaCardActive]}
                  >
                    <Text style={styles.bhashaEmoji}>{b.emoji}</Text>
                    <Text style={[styles.bhashaLabel, selected && styles.bhashaLabelActive]}>
                      {b.label}
                    </Text>
                    <Text style={styles.bhashaCode}>{b.code}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {err && <Text style={styles.err}>{err}</Text>}

          <Pressable
            onPress={submit}
            disabled={!canSave || loading}
            style={({ pressed }) => [
              styles.btnWrap,
              { opacity: !canSave || loading ? 0.5 : pressed ? 0.9 : 1 },
            ]}
            testID="save-child-profile"
          >
            <LinearGradient
              colors={[colors.brand, colors.pink]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.btn}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Meet Leo →</Text>}
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  scroll: { padding: spacing.xl, paddingBottom: spacing.xl2 },
  hero: { alignItems: 'center', marginBottom: spacing.xl },
  title: {
    color: colors.onSurface,
    fontFamily: font.display,
    fontSize: 26,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  subtitle: { color: colors.onSurfaceMuted, fontFamily: font.body, fontSize: 14, marginTop: spacing.xs },

  section: { marginBottom: spacing.xl },
  q: { color: colors.onSurface, fontFamily: font.bodyBold, fontSize: 16, marginBottom: spacing.md },
  input: {
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.border,
    borderWidth: 1,
    color: colors.onSurface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 16,
    fontFamily: font.body,
    fontSize: 18,
  },

  ageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  ageBubble: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ageBubbleActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  ageText: { color: colors.onSurface, fontFamily: font.bodyBold, fontSize: 20 },
  ageTextActive: { color: '#000' },

  bhashaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  bhashaCard: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  bhashaCardActive: {
    borderColor: colors.pink,
    backgroundColor: 'rgba(236,72,153,0.15)',
  },
  bhashaEmoji: { fontSize: 26 },
  bhashaLabel: { color: colors.onSurface, fontFamily: font.bodyBold, fontSize: 14, marginTop: 2 },
  bhashaLabelActive: { color: colors.pink },
  bhashaCode: { color: colors.onSurfaceFaint, fontFamily: font.body, fontSize: 10, marginTop: 2 },

  err: { color: colors.danger, fontFamily: font.bodyBold, fontSize: 13, marginBottom: spacing.sm },

  btnWrap: { marginTop: spacing.md },
  btn: { borderRadius: radius.md, paddingVertical: 18, alignItems: 'center' },
  btnText: { color: '#fff', fontFamily: font.bodyBold, fontSize: 17, letterSpacing: 0.5 },
});
