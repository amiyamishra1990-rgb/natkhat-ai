import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { colors, font, radius, spacing } from '@/src/theme';

export type Portal = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  tagline: string;
  free: boolean;
  xp: number;
};

type Props = {
  portal: Portal;
  unlocked: boolean;
  onPress: () => void;
};

function darken(hex: string, amount = 0.35): string {
  const h = hex.replace('#', '');
  const r = Math.max(0, Math.floor(parseInt(h.slice(0, 2), 16) * (1 - amount)));
  const g = Math.max(0, Math.floor(parseInt(h.slice(2, 4), 16) * (1 - amount)));
  const b = Math.max(0, Math.floor(parseInt(h.slice(4, 6), 16) * (1 - amount)));
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

export default function PortalCard({ portal, unlocked, onPress }: Props) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 10 });
    Haptics.impactAsync(
      unlocked ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium,
    ).catch(() => undefined);
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10 });
  };

  return (
    <Animated.View style={[styles.wrap, animStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        testID={`portal-card-${portal.id}`}
        style={styles.pressable}
      >
        <LinearGradient
          colors={[portal.color, darken(portal.color, 0.55)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* subtle overlay tint */}
          <View style={styles.tint} pointerEvents="none" />

          <View style={styles.header}>
            <View
              style={[
                styles.badge,
                { backgroundColor: portal.free ? 'rgba(16,185,129,0.9)' : 'rgba(0,0,0,0.55)' },
              ]}
            >
              <Text style={styles.badgeText}>{portal.free ? 'FREE' : 'PAID'}</Text>
            </View>
            <Text style={styles.xpChip}>+{portal.xp} XP</Text>
          </View>

          <Text style={styles.emoji}>{portal.emoji}</Text>
          <Text style={styles.name} numberOfLines={1}>
            {portal.name}
          </Text>
          <Text style={styles.tagline} numberOfLines={2}>
            {portal.tagline}
          </Text>

          {!unlocked && (
            <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFillObject}>
              <View style={styles.lockOverlay}>
                <Text style={styles.lockEmoji}>🔒</Text>
                <Text style={styles.lockText}>Tap to unlock</Text>
              </View>
            </BlurView>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  pressable: { flex: 1 },
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    minHeight: 170,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8,8,15,0.15)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  badgeText: {
    color: '#fff',
    fontFamily: font.bodyBold,
    fontSize: 10,
    letterSpacing: 1,
  },
  xpChip: {
    color: '#fff',
    fontFamily: font.bodyBold,
    fontSize: 12,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  emoji: {
    fontSize: 40,
    marginTop: spacing.md,
  },
  name: {
    color: '#fff',
    fontFamily: font.bodyBold,
    fontSize: 16,
    marginTop: spacing.sm,
  },
  tagline: {
    color: 'rgba(255,255,255,0.85)',
    fontFamily: font.body,
    fontSize: 12,
    marginTop: 2,
  },
  lockOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8,8,15,0.35)',
  },
  lockEmoji: { fontSize: 36 },
  lockText: {
    marginTop: spacing.xs,
    color: '#fff',
    fontFamily: font.bodyBold,
    fontSize: 12,
    letterSpacing: 0.5,
  },
});
