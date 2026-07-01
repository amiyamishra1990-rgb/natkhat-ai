import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, font, radius, spacing } from '@/src/theme';

const TOYS = [
  { label: 'Teddy Bear', emoji: '🧸' },
  { label: 'Red Car', emoji: '🚗' },
  { label: 'Doll', emoji: '🪆' },
  { label: 'Robot', emoji: '🤖' },
  { label: 'Dinosaur', emoji: '🦖' },
  { label: 'Ball', emoji: '⚽' },
  { label: 'Blocks', emoji: '🧱' },
  { label: 'Airplane', emoji: '✈️' },
  { label: 'Elephant', emoji: '🐘' },
];

type Props = {
  onPick: (toy: string) => void;
  onCameraScan?: () => void;
};

export default function ToyPrimer({ onPick, onCameraScan }: Props) {
  const scanPulse = useSharedValue(1);

  useEffect(() => {
    scanPulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 900, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, []);

  const scanAnim = useAnimatedStyle(() => ({ transform: [{ scale: scanPulse.value }] }));

  return (
    <View style={styles.wrap} testID="toy-primer">
      <Text style={styles.headline}>
        Show me your most FORGOTTEN toy! 🧸
      </Text>
      <Text style={styles.sub}>Point the camera at it OR tap the toy below!</Text>

      <Animated.View style={[styles.scanCardWrap, scanAnim]}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
            onCameraScan?.();
          }}
          testID="toy-camera-scan"
          style={styles.scanCardPress}
        >
          <LinearGradient
            colors={[colors.pink, '#7C2D5A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scanCard}
          >
            <Text style={styles.scanEmoji}>📷</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.scanTitle}>Camera scan</Text>
              <Text style={styles.scanSub}>Coming when Vision AI is wired up!</Text>
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>

      <Text style={styles.orLabel}>Or pick a toy!</Text>
      <View style={styles.grid}>
        {TOYS.map((t) => (
          <Pressable
            key={t.label}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
              onPick(t.label);
            }}
            testID={`toy-chip-${t.label.replace(/\s/g, '')}`}
            style={({ pressed }) => [
              styles.chip,
              pressed && { transform: [{ scale: 0.96 }], borderColor: colors.pink },
            ]}
          >
            <Text style={styles.chipEmoji}>{t.emoji}</Text>
            <Text style={styles.chipLabel}>{t.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: spacing.md, gap: spacing.md },
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
  },
  scanCardWrap: { marginTop: spacing.sm, borderRadius: radius.lg, overflow: 'hidden' },
  scanCardPress: { borderRadius: radius.lg, overflow: 'hidden' },
  scanCard: {
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  scanEmoji: { fontSize: 34 },
  scanTitle: { color: '#fff', fontFamily: font.bodyBold, fontSize: 16 },
  scanSub: { color: 'rgba(255,255,255,0.85)', fontFamily: font.body, fontSize: 12, marginTop: 2 },

  orLabel: {
    color: colors.onSurfaceMuted,
    fontFamily: font.bodyBold,
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  chip: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    gap: 4,
  },
  chipEmoji: { fontSize: 34 },
  chipLabel: { color: colors.onSurface, fontFamily: font.bodyBold, fontSize: 12, textAlign: 'center' },
});
