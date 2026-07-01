import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, font, radius, spacing } from '@/src/theme';

type Props = {
  xp: number;
  levelInfo?: {
    level: number;
    title: string;
    emoji: string;
    current_level_xp: number;
    next_level_xp: number;
  };
};

export default function XPBar({ xp, levelInfo }: Props) {
  const currentXp = levelInfo?.current_level_xp ?? 0;
  const nextXp = levelInfo?.next_level_xp ?? Math.max(xp + 100, 150);
  const range = Math.max(1, nextXp - currentXp);
  const progress = Math.min(1, Math.max(0, (xp - currentXp) / range));
  const remaining = Math.max(0, nextXp - xp);

  return (
    <View style={styles.wrap} testID="xp-bar">
      <View style={styles.top}>
        <Text style={styles.levelLabel} numberOfLines={1}>
          {levelInfo?.emoji ?? '🐣'} Level {levelInfo?.level ?? 1} · {levelInfo?.title ?? 'Baby Explorer'}
        </Text>
        <Text style={styles.xpLabel}>{xp} XP</Text>
      </View>
      <View style={styles.track}>
        <LinearGradient
          colors={[colors.brand, colors.pink]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: `${Math.max(4, progress * 100)}%` }]}
        />
      </View>
      <Text style={styles.hint}>
        {remaining > 0 ? `${remaining} XP to next level` : `Max level unlocked!`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  levelLabel: {
    color: colors.onSurface,
    fontFamily: font.bodyBold,
    fontSize: 15,
    flex: 1,
    marginRight: spacing.md,
  },
  xpLabel: {
    color: colors.brand,
    fontFamily: font.bodyBold,
    fontSize: 15,
  },
  track: {
    height: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.xpTrack,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  hint: {
    marginTop: spacing.xs,
    color: colors.onSurfaceMuted,
    fontFamily: font.body,
    fontSize: 12,
  },
});
