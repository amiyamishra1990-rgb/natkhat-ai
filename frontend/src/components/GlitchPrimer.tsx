import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, font, radius, spacing } from '@/src/theme';

const COMBOS = [
  { text: 'Dadi flying on a samosa!', emoji: '🥟' },
  { text: 'An elephant playing cricket on the moon!', emoji: '🐘' },
  { text: 'A tomato singing in school!', emoji: '🍅' },
  { text: 'Papa driving a rocket to the bathroom!', emoji: '🚀' },
  { text: 'My teddy bear eating dosa in the fridge!', emoji: '🧸' },
  { text: 'A cow doing yoga on the ceiling!', emoji: '🐄' },
];

type Props = {
  onSubmit: (combo: string) => void;
};

export default function GlitchPrimer({ onSubmit }: Props) {
  const [text, setText] = useState('');
  const [showAlarm, setShowAlarm] = useState(true);

  const shake = useSharedValue(0);
  const flash = useSharedValue(0);
  const alarmScale = useSharedValue(0.4);
  const alarmOp = useSharedValue(1);

  useEffect(() => {
    // Alarm intro sequence
    alarmScale.value = withSequence(
      withTiming(1.15, { duration: 300, easing: Easing.out(Easing.back(2)) }),
      withTiming(1, { duration: 200 }),
    );
    shake.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 60 }),
        withTiming(8, { duration: 60 }),
        withTiming(-6, { duration: 60 }),
        withTiming(6, { duration: 60 }),
        withTiming(0, { duration: 60 }),
      ),
      3,
      false,
    );
    flash.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 250 }),
        withTiming(0.15, { duration: 250 }),
      ),
      4,
      false,
    );
    // fade out alarm after intro
    alarmOp.value = withDelay(2000, withTiming(0, { duration: 500 }));
    const t = setTimeout(() => setShowAlarm(false), 2600);
    return () => clearTimeout(t);
  }, []);

  const shakeAnim = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));
  const flashAnim = useAnimatedStyle(() => ({ opacity: flash.value }));
  const alarmAnim = useAnimatedStyle(() => ({
    opacity: alarmOp.value,
    transform: [{ scale: alarmScale.value }],
  }));

  const submit = (combo: string) => {
    const value = combo.trim();
    if (!value) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
    onSubmit(value);
  };

  return (
    <View style={styles.wrap} testID="glitch-primer">
      {showAlarm && (
        <Animated.View style={[styles.alarm, alarmAnim, shakeAnim]} pointerEvents="none">
          <Animated.View style={[styles.flashLayer, flashAnim]} />
          <Text style={styles.siren}>🚨</Text>
          <Text style={styles.alarmTitle}>REALITY GLITCH!!</Text>
          <Text style={styles.alarmSub}>Quick — give me an IMPOSSIBLE combo!</Text>
        </Animated.View>
      )}

      <Text style={styles.headline}>⚡ Impossible Combo Time!</Text>
      <Text style={styles.sub}>
        Tell Leo something that can NEVER happen — Leo will PANIC and give you a math mission to save reality!
      </Text>

      <View style={styles.customWrap}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Make up your own..."
          placeholderTextColor={colors.onSurfaceFaint}
          style={styles.input}
          testID="glitch-custom-input"
          returnKeyType="send"
          onSubmitEditing={() => submit(text)}
          maxLength={80}
        />
        <Pressable
          onPress={() => submit(text)}
          disabled={!text.trim()}
          style={({ pressed }) => [
            styles.submitWrap,
            { opacity: !text.trim() ? 0.5 : pressed ? 0.85 : 1 },
          ]}
          testID="glitch-submit-custom"
        >
          <LinearGradient
            colors={['#8B5CF6', '#5B21B6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.submitBtn}
          >
            <Text style={styles.submitText}>GLITCH IT!</Text>
          </LinearGradient>
        </Pressable>
      </View>

      <Text style={styles.orLabel}>Or pick a wild combo!</Text>
      <View style={styles.combos}>
        {COMBOS.map((c) => (
          <Pressable
            key={c.text}
            onPress={() => submit(c.text)}
            testID={`glitch-combo-${c.text.slice(0, 10)}`}
            style={({ pressed }) => [
              styles.combo,
              pressed && { transform: [{ scale: 0.97 }], borderColor: '#8B5CF6' },
            ]}
          >
            <Text style={styles.comboEmoji}>{c.emoji}</Text>
            <Text style={styles.comboText}>{c.text}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: spacing.md, gap: spacing.md, position: 'relative' },
  alarm: {
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    alignItems: 'center',
    padding: spacing.xl,
    zIndex: 10,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(220,38,38,0.25)',
    borderWidth: 2,
    borderColor: colors.danger,
    overflow: 'hidden',
  },
  flashLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.danger,
  },
  siren: { fontSize: 56 },
  alarmTitle: {
    color: colors.onSurface,
    fontFamily: font.display,
    fontSize: 28,
    marginTop: spacing.sm,
    textShadowColor: 'rgba(239,68,68,0.9)',
    textShadowRadius: 8,
    letterSpacing: 1,
  },
  alarmSub: {
    color: '#fff',
    fontFamily: font.bodyBold,
    fontSize: 14,
    marginTop: 4,
  },

  headline: {
    color: colors.onSurface,
    fontFamily: font.display,
    fontSize: 22,
    textAlign: 'center',
  },
  sub: {
    color: colors.onSurfaceMuted,
    fontFamily: font.body,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },

  customWrap: { gap: spacing.sm, marginTop: spacing.sm },
  input: {
    backgroundColor: colors.surfaceSecondary,
    borderColor: '#8B5CF6',
    borderWidth: 1,
    color: colors.onSurface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    fontFamily: font.body,
    fontSize: 15,
  },
  submitWrap: { borderRadius: radius.md, overflow: 'hidden' },
  submitBtn: { paddingVertical: 14, alignItems: 'center' },
  submitText: { color: '#fff', fontFamily: font.bodyBold, fontSize: 15, letterSpacing: 1.2 },

  orLabel: {
    color: colors.onSurfaceMuted,
    fontFamily: font.bodyBold,
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  combos: { gap: spacing.sm },
  combo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  comboEmoji: { fontSize: 26 },
  comboText: { flex: 1, color: colors.onSurface, fontFamily: font.body, fontSize: 14 },
});
